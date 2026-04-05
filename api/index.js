const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

// Import routes
const authRoutes = require('../backend/routes/auth');
const transactionRoutes = require('../backend/routes/transactions');
const insightsRoutes = require('../backend/routes/insights');
const adminRoutes = require('../backend/routes/admin');

// Middleware
const authMiddleware = require('../backend/middleware/auth');

const app = express();

// CORS Configuration
app.use(cors({
  origin: '*',
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect to MongoDB - use MONGO_URI or MONGODB_URI
const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;
if (mongoUri) {
  mongoose.connect(mongoUri, {
    maxPoolSize: 1,
    serverSelectionTimeoutMS: 5000,
  }).catch(err => console.error('MongoDB connection error:', err));
}

// API Routes - Vercel routes /api/* to this handler
app.use('/api/auth', authRoutes);
app.use('/api/transactions', authMiddleware, transactionRoutes);
app.use('/api/insights', authMiddleware, insightsRoutes);
app.use('/api/admin', adminRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Error handler middleware
app.use((err, req, res, next) => {
  console.error('API Error:', err);
  res.status(err.status || 500).json({ 
    message: err.message || 'Server error',
    success: false
  });
});

// Export for Vercel
module.exports = app;
