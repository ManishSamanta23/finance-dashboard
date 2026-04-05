const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const Transaction = require('../models/Transaction');

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/finance_dashboard');
    
    // Initialize database for per-account isolated transactions
    // Mock transactions are served from mockData.js, not stored in DB
    // Only account-specific modifications (personal txns, edits, deletions) are stored
    
    console.log('📝 Setting up database indexes for optimal performance...');
    
    // Create indexes
    await Transaction.collection.createIndex({ owner: 1 });
    await Transaction.collection.createIndex({ isMock: 1 });
    await Transaction.collection.createIndex({ owner: 1, isMock: 1 });
    
    console.log('✅ Database initialized successfully');
    console.log('📊 Per-account isolation is ready');
    console.log('💾 Mock data is served from code, personal transactions stored in DB');
    process.exit(0);
  } catch (err) {
    console.error('❌ Database setup failed:', err.message);
    process.exit(1);
  }
};

seed();
