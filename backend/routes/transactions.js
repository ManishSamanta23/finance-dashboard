const express = require('express');
const router = express.Router();
const Transaction = require('../models/Transaction');
const { isConnected } = require('../config/db');
const { adminOnly } = require('../middleware/auth');

// Mock data fallback
const mockTransactions = require('../config/mockData');
const mockStoreByUser = new Map();

const getUserId = (req) => req.user?.id || 'guest';

const buildMockTransactionsForUser = (userId) =>
  mockTransactions.map((transaction, index) => ({
    ...transaction,
    _id: `${userId}-mock-${index + 1}`,
    createdBy: userId,
  }));

const getMockStoreForUser = (req) => {
  const userId = getUserId(req);
  if (!mockStoreByUser.has(userId)) {
    mockStoreByUser.set(userId, buildMockTransactionsForUser(userId));
  }
  return mockStoreByUser.get(userId);
};

const seedDatabaseForUser = async (userId) => {
  const existingCount = await Transaction.countDocuments({ createdBy: userId });
  if (existingCount === 0) {
    const seededTransactions = mockTransactions.map((transaction) => ({
      ...transaction,
      createdBy: userId,
    }));
    await Transaction.insertMany(seededTransactions);
  }
};

// Validation middleware for transaction creation/update
const validateTransaction = (req, res, next) => {
  const errors = {};
  const { title, amount, type, category, date, note, paymentMethod, tags, isRecurring, recurringFrequency } = req.body;

  if (!title || title.trim().length < 2) {
    errors.title = 'Title is required (minimum 2 characters)';
  }
  if (!amount || isNaN(amount) || Number(amount) <= 0) {
    errors.amount = 'Amount must be a positive number';
  }
  if (!type || !['income', 'expense'].includes(type)) {
    errors.type = 'Type must be either "income" or "expense"';
  }
  if (!category) {
    errors.category = 'Category is required';
  }
  if (!date) {
    errors.date = 'Date is required';
  }
  if (note && note.length > 200) {
    errors.note = 'Note must be 200 characters or less';
  }
  if (paymentMethod && !['', 'cash', 'card', 'bank transfer', 'upi', 'other'].includes(paymentMethod)) {
    errors.paymentMethod = 'Invalid payment method';
  }
  if (isRecurring && !recurringFrequency) {
    errors.recurringFrequency = 'Frequency is required for recurring transactions';
  }
  if (recurringFrequency && !['daily', 'weekly', 'monthly', 'yearly'].includes(recurringFrequency)) {
    errors.recurringFrequency = 'Invalid recurring frequency';
  }
  if (tags && (!Array.isArray(tags) || tags.length > 5)) {
    errors.tags = 'Tags must be an array with maximum 5 items';
  }

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({ success: false, errors });
  }
  next();
};

// GET all transactions with filters
router.get('/', async (req, res) => {
  try {
    const userId = getUserId(req);
    const { type, category, search, sortBy = 'date', order = 'desc', startDate, endDate } = req.query;

    // Check if MongoDB is connected
    if (!isConnected()) {
      // Use mock mode when not connected
      let results = [...getMockStoreForUser(req)];

      // Apply filters
      if (type) results = results.filter(t => t.type === type);
      if (category) results = results.filter(t => t.category === category);
      if (search) results = results.filter(t => t.title.toLowerCase().includes(search.toLowerCase()));
      if (startDate || endDate) {
        results = results.filter(t => {
          const txDate = new Date(t.date);
          if (startDate && txDate < new Date(startDate)) return false;
          if (endDate && txDate > new Date(endDate)) return false;
          return true;
        });
      }

      // Apply sorting
      const sortKey = sortBy === 'date' ? 'date' : sortBy;
      results.sort((a, b) => {
        const aVal = a[sortKey];
        const bVal = b[sortKey];
        if (aVal < bVal) return order === 'asc' ? -1 : 1;
        if (aVal > bVal) return order === 'asc' ? 1 : -1;
        return 0;
      });

      return res.json({ success: true, data: results, mode: 'mock' });
    }

    // MongoDB mode
    await seedDatabaseForUser(userId);
    let query = { createdBy: userId };
    if (type) query.type = type;
    if (category) query.category = category;
    if (search) query.title = { $regex: search, $options: 'i' };
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }
    const sort = { [sortBy]: order === 'asc' ? 1 : -1 };
    const transactions = await Transaction.find(query).sort(sort);
    res.json({ success: true, data: transactions, mode: 'database' });
  } catch (err) {
    // Fallback to mock store on error
    res.json({ success: true, data: getMockStoreForUser(req), mode: 'mock', error: 'Using mock data due to DB error' });
  }
});

// POST create transaction
router.post('/', adminOnly, validateTransaction, async (req, res) => {
  try {
    const userId = getUserId(req);

    // Check if MongoDB is connected
    if (!isConnected()) {
      // Mock mode - create in-memory transaction
      const newMockTransaction = {
        _id: `${userId}-tx-${Date.now()}`,
        ...req.body,
        amount: Number(req.body.amount),
        createdBy: userId,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      getMockStoreForUser(req).unshift(newMockTransaction);
      return res.status(201).json({
        success: true,
        data: newMockTransaction,
        mode: 'mock',
        message: 'Transaction saved locally (database unavailable)'
      });
    }

    // MongoDB mode
    const transaction = new Transaction({
      ...req.body,
      amount: Number(req.body.amount),
      createdBy: userId,
    });
    await transaction.save();
    res.status(201).json({ success: true, data: transaction, mode: 'database' });
  } catch (err) {
    // If DB error, try mock mode as fallback
    if (!isConnected()) {
      const userId = getUserId(req);
      const newMockTransaction = {
        _id: `${userId}-tx-${Date.now()}`,
        ...req.body,
        amount: Number(req.body.amount),
        createdBy: userId,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      getMockStoreForUser(req).unshift(newMockTransaction);
      return res.status(201).json({
        success: true,
        data: newMockTransaction,
        mode: 'mock',
        message: 'Transaction saved locally (database error)'
      });
    }
    res.status(400).json({ success: false, error: err.message });
  }
});

// PUT update transaction
router.put('/:id', adminOnly, validateTransaction, async (req, res) => {
  try {
    const userId = getUserId(req);

    // Check if MongoDB is connected
    if (!isConnected()) {
      // Mock mode - update in mockStore
      const mockStore = getMockStoreForUser(req);
      const index = mockStore.findIndex(t => t._id === req.params.id);
      if (index === -1) {
        return res.status(404).json({ success: false, error: 'Transaction not found' });
      }

      const updated = {
        ...mockStore[index],
        ...req.body,
        amount: Number(req.body.amount),
        _id: mockStore[index]._id,
        createdBy: mockStore[index].createdBy,
        createdAt: mockStore[index].createdAt,
        updatedAt: new Date()
      };
      mockStore[index] = updated;
      return res.json({ success: true, data: updated, mode: 'mock' });
    }

    // MongoDB mode
    const transaction = await Transaction.findOneAndUpdate(
      { _id: req.params.id, createdBy: userId },
      { ...req.body, amount: Number(req.body.amount), createdBy: userId },
      { new: true }
    );
    if (!transaction) return res.status(404).json({ success: false, error: 'Not found' });
    res.json({ success: true, data: transaction, mode: 'database' });
  } catch (err) {
    // Fallback to mock mode if DB fails
    if (!isConnected()) {
      const mockStore = getMockStoreForUser(req);
      const index = mockStore.findIndex(t => t._id === req.params.id);
      if (index === -1) {
        return res.status(404).json({ success: false, error: 'Transaction not found' });
      }

      const updated = {
        ...mockStore[index],
        ...req.body,
        amount: Number(req.body.amount),
        _id: mockStore[index]._id,
        createdBy: mockStore[index].createdBy,
        createdAt: mockStore[index].createdAt,
        updatedAt: new Date()
      };
      mockStore[index] = updated;
      return res.json({ success: true, data: updated, mode: 'mock' });
    }
    res.status(400).json({ success: false, error: err.message });
  }
});

// DELETE transaction
router.delete('/:id', adminOnly, async (req, res) => {
  try {
    const userId = getUserId(req);

    // Check if MongoDB is connected
    if (!isConnected()) {
      // Mock mode - remove from mockStore
      const mockStore = getMockStoreForUser(req);
      const index = mockStore.findIndex(t => t._id === req.params.id);
      if (index === -1) {
        return res.status(404).json({ success: false, error: 'Transaction not found' });
      }
      mockStore.splice(index, 1);
      return res.json({ success: true, message: 'Deleted', mode: 'mock' });
    }

    // MongoDB mode
    const result = await Transaction.findOneAndDelete({ _id: req.params.id, createdBy: userId });
    if (!result) return res.status(404).json({ success: false, error: 'Not found' });
    res.json({ success: true, message: 'Deleted', mode: 'database' });
  } catch (err) {
    // Fallback to mock mode if DB fails
    if (!isConnected()) {
      const mockStore = getMockStoreForUser(req);
      const index = mockStore.findIndex(t => t._id === req.params.id);
      if (index === -1) {
        return res.status(404).json({ success: false, error: 'Transaction not found' });
      }
      mockStore.splice(index, 1);
      return res.json({ success: true, message: 'Deleted', mode: 'mock' });
    }
    res.status(400).json({ success: false, error: err.message });
  }
});

module.exports = router;
