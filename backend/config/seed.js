const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const Transaction = require('../models/Transaction');
const mockTransactions = require('./mockData');

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/finance_dashboard');
    await Transaction.deleteMany({});
    await Transaction.insertMany(mockTransactions.map(({ _id, ...t }) => t));
    console.log('✅ Database seeded successfully');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seed failed:', err.message);
    process.exit(1);
  }
};

seed();
