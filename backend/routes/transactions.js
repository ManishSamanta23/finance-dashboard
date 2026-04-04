const express = require('express');
const router = express.Router();
const Transaction = require('../models/Transaction');

// Mock data fallback
const mockTransactions = require('../config/mockData');
let useMock = false;

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
    const { type, category, search, sortBy = 'date', order = 'desc', startDate, endDate } = req.query;
    let query = {};
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
    res.json({ success: true, data: transactions });
  } catch (err) {
    res.json({ success: true, data: mockTransactions });
  }
});

// POST create transaction
router.post('/', validateTransaction, async (req, res) => {
  try {
    const transaction = new Transaction(req.body);
    await transaction.save();
    res.status(201).json({ success: true, data: transaction });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// PUT update transaction
router.put('/:id', validateTransaction, async (req, res) => {
  try {
    const transaction = await Transaction.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!transaction) return res.status(404).json({ success: false, error: 'Not found' });
    res.json({ success: true, data: transaction });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// DELETE transaction
router.delete('/:id', async (req, res) => {
  try {
    await Transaction.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Deleted' });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

module.exports = router;
