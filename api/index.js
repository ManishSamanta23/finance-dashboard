const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

// Load environment variables
dotenv.config();

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
app.use('/api/auth', authRoutes);
app.use('/api/transactions', authMiddleware, transactionRoutes);
app.use('/api/insights', authMiddleware, insightsRoutes);
app.use('/api/admin', adminRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Export for Vercel
module.exports = app;
