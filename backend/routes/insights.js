const express = require('express');
const router = express.Router();
const Transaction = require('../models/Transaction');
const mockTransactions = require('../config/mockData');
const { isConnected } = require('../config/db');

router.get('/', async (req, res) => {
  try {
    let transactions;

    // Check if MongoDB is connected
    if (!isConnected()) {
      // Mock mode - use mock transactions
      transactions = mockTransactions;
    } else {
      // MongoDB mode - try to fetch from database
      try {
        transactions = await Transaction.find();
        if (!transactions || transactions.length === 0) {
          // If empty, use mock data for demo
          transactions = mockTransactions;
        }
      } catch (err) {
        // On DB error, fall back to mock data
        console.log('Error fetching transactions from DB, using mock data:', err.message);
        transactions = mockTransactions;
      }
    }

    // Compute insights from transactions (same logic works for mock or DB data)
    const income = transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const expenses = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);

    // Category breakdown
    const categoryMap = {};
    transactions.filter(t => t.type === 'expense').forEach(t => {
      categoryMap[t.category] = (categoryMap[t.category] || 0) + t.amount;
    });
    const categoryBreakdown = Object.entries(categoryMap)
      .map(([category, amount]) => ({ category, amount }))
      .sort((a, b) => b.amount - a.amount);

    // Monthly trend
    const monthlyMap = {};
    transactions.forEach(t => {
      const month = new Date(t.date).toLocaleString('default', { month: 'short', year: '2-digit' });
      if (!monthlyMap[month]) monthlyMap[month] = { income: 0, expense: 0 };
      monthlyMap[month][t.type] += t.amount;
    });
    const monthlyTrend = Object.entries(monthlyMap).map(([month, data]) => ({ month, ...data }));

    res.json({
      success: true,
      data: {
        totalBalance: income - expenses,
        totalIncome: income,
        totalExpenses: expenses,
        categoryBreakdown,
        monthlyTrend,
        highestCategory: categoryBreakdown[0] || null,
        savingsRate: income > 0 ? (((income - expenses) / income) * 100).toFixed(1) : 0,
        transactionCount: transactions.length,
      },
      mode: isConnected() ? 'database' : 'mock'
    });
  } catch (err) {
    console.error('Insights error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
