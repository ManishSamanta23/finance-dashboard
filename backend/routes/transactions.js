const express = require('express');
const router = express.Router();
const Transaction = require('../models/Transaction');
const User = require('../models/User');
const { isConnected } = require('../config/db');
const { protect, adminOnly } = require('../middleware/auth');
const fileStore = require('../config/fileStore');

// Mock data - shared by all users
const mockTransactions = require('../config/mockData');

const getUserId = (req) => req.user?.id || 'guest';

// Build account's transaction view (mock + personal + edits)
const buildUserTransactionView = async (userId) => {
  let user;
  
  // Skip database query if user is "guest" (not authenticated)
  const isGuest = userId === 'guest';
  
  if (isConnected() && !isGuest) {
    // Try database first for authenticated users
    user = await User.findById(userId);
  } else {
    // Fall back to file store for guests or if DB unavailable
    user = fileStore.getUserData(userId);
  }
  
  const deletedMockIds = new Set(user?.deletedMockIds || []);
  const editedMockMap = new Map(Object.entries(user?.editedMockIds || {}));

  let personalTransactions = [];
  if (isConnected() && !isGuest) {
    // Get user's personal transactions from database
    personalTransactions = await Transaction.find({
      owner: userId,
      isMock: false
    });
  } else {
    // Get personal transactions from file store for guests
    const allTransactions = fileStore.readTransactions();
    personalTransactions = allTransactions.filter(
      t => t.owner === userId && !t.isMock
    );
  }

  // Build combined view
  const result = [];

  // 1. Add mock transactions (minus deleted, with edits applied)
  mockTransactions.forEach(mockTx => {
    // Skip if user deleted this mock
    if (deletedMockIds.has(mockTx._id)) {
      return;
    }

    // Check if user edited this mock
    if (editedMockMap.has(mockTx._id)) {
      // Use edited version
      result.push({
        ...editedMockMap.get(mockTx._id),
        isMock: false
      });
    } else {
      // Use original mock
      result.push({
        ...mockTx,
        owner: userId,
        isMock: true
      });
    }
  });

  // 2. Add user's personal transactions
  personalTransactions.forEach(tx => {
    result.push(typeof tx.toObject === 'function' ? tx.toObject() : tx);
  });

  return result;
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
router.get('/', protect, async (req, res) => {
  try {
    const userId = getUserId(req);
    const { type, category, search, sortBy = 'date', order = 'desc', startDate, endDate } = req.query;

    // Get merged view (uses database or fileStore based on connection)
    let results = await buildUserTransactionView(userId);

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

    const mode = isConnected() ? 'database' : 'filestore';
    res.json({ success: true, data: results, mode });
  } catch (err) {
    console.error('GET transactions error:', err);
    // Additional fallback - return just mock data
    const userId = getUserId(req);
    let results = mockTransactions.map((transaction) => ({
      ...transaction,
      owner: userId,
      isMock: true
    }));
    res.json({ success: true, data: results, mode: 'mock', error: 'Error loading transactions, showing mock data' });
  }
});

// POST create transaction
router.post('/', protect, validateTransaction, async (req, res) => {
  try {
    const userId = getUserId(req);
    const newTransactionData = {
      ...req.body,
      amount: Number(req.body.amount),
      owner: userId,
      isMock: false,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    if (isConnected()) {
      // Database mode - create new personal transaction
      const transaction = new Transaction(newTransactionData);
      await transaction.save();
      return res.status(201).json({ success: true, data: transaction, mode: 'database' });
    } else {
      // File store mode - save to JSON file
      const transactions = fileStore.readTransactions();
      const newTx = {
        _id: `${userId}-tx-${Date.now()}`,
        ...newTransactionData
      };
      transactions.push(newTx);
      fileStore.writeTransactions(transactions);
      return res.status(201).json({
        success: true,
        data: newTx,
        mode: 'filestore',
        message: 'Transaction saved to file (database unavailable)'
      });
    }
  } catch (err) {
    console.error('POST transaction error:', err);
    // Try file store as fallback even if DB error occurs
    try {
      const userId = getUserId(req);
      const transactions = fileStore.readTransactions();
      const newTx = {
        _id: `${userId}-tx-${Date.now()}`,
        ...req.body,
        amount: Number(req.body.amount),
        owner: userId,
        isMock: false,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      transactions.push(newTx);
      fileStore.writeTransactions(transactions);
      return res.status(201).json({
        success: true,
        data: newTx,
        mode: 'filestore',
        message: 'Transaction saved to file (fallback)'
      });
    } catch (fallbackErr) {
      console.error('Fallback save error:', fallbackErr);
      res.status(400).json({ success: false, error: err.message });
    }
  }
});

// PUT update transaction
router.put('/:id', protect, validateTransaction, async (req, res) => {
  try {
    const userId = getUserId(req);
    const transactionId = req.params.id;
    const isGuest = userId === 'guest';

    if (isConnected() && !isGuest) {
      // Database mode
      // Check if this is a personal transaction
      const personalTx = await Transaction.findOne({
        _id: transactionId,
        owner: userId,
        isMock: false
      });

      if (personalTx) {
        // Update personal transaction
        const updated = await Transaction.findByIdAndUpdate(
          transactionId,
          { ...req.body, amount: Number(req.body.amount), owner: userId, isMock: false },
          { new: true }
        );
        return res.json({ success: true, data: updated, mode: 'database' });
      }

      // Check if this is a mock transaction (editing for first time)
      const mockId = transactionId;
      const mockExists = mockTransactions.find(m => m._id === mockId);

      if (mockExists) {
        // Save edit to user's editedMockIds
        const user = await User.findById(userId);
        if (!user) {
          return res.status(404).json({ success: false, error: 'User not found' });
        }

        const editedData = {
          ...mockExists,
          ...req.body,
          amount: Number(req.body.amount),
          owner: userId,
          _id: mockId
        };

        user.editedMockIds.set(mockId, editedData);
        await user.save();

        return res.json({
          success: true,
          data: editedData,
          mode: 'database',
          message: 'Mock transaction edited (saved to your account)'
        });
      }
    } else {
      // File store mode (guest or DB unavailable)
      // Check if personal transaction exists in file store
      const transactions = fileStore.readTransactions();
      const personalTxIdx = transactions.findIndex(
        t => t._id === transactionId && t.owner === userId && !t.isMock
      );

      if (personalTxIdx !== -1) {
        // Update personal transaction in file store
        transactions[personalTxIdx] = {
          ...transactions[personalTxIdx],
          ...req.body,
          amount: Number(req.body.amount),
          updatedAt: new Date()
        };
        fileStore.writeTransactions(transactions);
        return res.json({ success: true, data: transactions[personalTxIdx], mode: 'filestore' });
      }

      // Check if this is a mock transaction
      const mockExists = mockTransactions.find(m => m._id === transactionId);
      if (mockExists) {
        // Save edit to user's edits in file store
        const userData = fileStore.getUserData(userId);
        const editedData = {
          ...mockExists,
          ...req.body,
          amount: Number(req.body.amount),
          owner: userId,
          _id: transactionId
        };
        userData.editedMockIds[transactionId] = editedData;
        fileStore.saveUserData(userId, userData);

        return res.json({
          success: true,
          data: editedData,
          mode: 'filestore',
          message: 'Mock transaction edited (saved to your account)'
        });
      }
    }

    res.status(404).json({ success: false, error: 'Transaction not found' });
  } catch (err) {
    console.error('PUT transaction error:', err);
    res.status(400).json({ success: false, error: err.message });
  }
});

// DELETE transaction
router.delete('/:id', protect, async (req, res) => {
  try {
    const userId = getUserId(req);
    const transactionId = req.params.id;
    const isGuest = userId === 'guest';

    if (isConnected() && !isGuest) {
      // Database mode
      // Check if this is a personal transaction
      const personalTx = await Transaction.findOne({
        _id: transactionId,
        owner: userId,
        isMock: false
      });

      if (personalTx) {
        // Delete personal transaction
        await Transaction.findByIdAndDelete(transactionId);
        return res.json({ success: true, message: 'Personal transaction deleted', mode: 'database' });
      }

      // Check if this is a mock transaction (deleting for first time or already edited)
      const mockId = transactionId;
      const mockExists = mockTransactions.find(m => m._id === mockId);

      if (mockExists) {
        // Mark mock as deleted for this user
        const user = await User.findById(userId);
        if (!user) {
          return res.status(404).json({ success: false, error: 'User not found' });
        }

        // Add to deleted list if not already there
        if (!user.deletedMockIds.includes(mockId)) {
          user.deletedMockIds.push(mockId);
          await user.save();
        }

        // Also remove from edited if it was edited
        if (user.editedMockIds.has(mockId)) {
          user.editedMockIds.delete(mockId);
          await user.save();
        }

        return res.json({
          success: true,
          message: 'Mock transaction deleted (marked as deleted for your account)',
          mode: 'database'
        });
      }
    } else {
      // File store mode (guest or DB unavailable)
      // Check if personal transaction exists in file store
      const transactions = fileStore.readTransactions();
      const personalTxIdx = transactions.findIndex(
        t => t._id === transactionId && t.owner === userId && !t.isMock
      );

      if (personalTxIdx !== -1) {
        // Delete personal transaction from file store
        transactions.splice(personalTxIdx, 1);
        fileStore.writeTransactions(transactions);
        return res.json({ success: true, message: 'Personal transaction deleted', mode: 'filestore' });
      }

      // Check if this is a mock transaction
      const mockExists = mockTransactions.find(m => m._id === transactionId);
      if (mockExists) {
        // Mark mock as deleted for this user in file store
        const userData = fileStore.getUserData(userId);
        if (!userData.deletedMockIds.includes(transactionId)) {
          userData.deletedMockIds.push(transactionId);
        }
        // Also remove from edited if it was edited
        if (userData.editedMockIds[transactionId]) {
          delete userData.editedMockIds[transactionId];
        }
        fileStore.saveUserData(userId, userData);

        return res.json({
          success: true,
          message: 'Mock transaction deleted (marked as deleted for your account)',
          mode: 'filestore'
        });
      }
    }

    res.status(404).json({ success: false, error: 'Transaction not found' });
  } catch (err) {
    console.error('DELETE transaction error:', err);
    res.status(400).json({ success: false, error: err.message });
  }
});

module.exports = router;
