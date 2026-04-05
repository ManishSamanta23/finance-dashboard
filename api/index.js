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
  origin: process.env.FRONTEND_URL || '*',
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect to MongoDB
if (process.env.MONGODB_URI) {
  mongoose.connect(process.env.MONGODB_URI)
    .catch(err => console.error('MongoDB connection error:', err));
}

// API Routes
app.use('/auth', authRoutes);
app.use('/transactions', authMiddleware, transactionRoutes);
app.use('/insights', authMiddleware, insightsRoutes);
app.use('/admin', adminRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Export handler for Vercel
module.exports = (req, res) => {
  app(req, res);
};
