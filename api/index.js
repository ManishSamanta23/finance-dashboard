const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

// Import routes
const authRoutes = require('../backend/routes/auth');
const transactionRoutes = require('../backend/routes/transactions');
const insightsRoutes = require('../backend/routes/insights');
const adminRoutes = require('../backend/routes/admin');

// Middleware
const { protect } = require('../backend/middleware/auth');

const app = express();

// Reuse MongoDB connection across Vercel function invocations.
const cached = global.mongooseCache || { conn: null, promise: null };
global.mongooseCache = cached;

const connectToDatabase = async () => {
  if (cached.conn && mongoose.connection.readyState === 1) {
    return cached.conn;
  }

  // Drop stale connection reference if connection is no longer active.
  if (mongoose.connection.readyState !== 1) {
    cached.conn = null;
  }

  const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;
  if (!mongoUri) {
    throw new Error('Missing MONGO_URI environment variable');
  }

  if (!cached.promise) {
    mongoose.set('bufferCommands', false);
    cached.promise = mongoose.connect(mongoUri, {
      maxPoolSize: 5,
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 20000,
      bufferCommands: false,
    }).catch((err) => {
      // Allow future retries after a failed connection attempt.
      cached.promise = null;
      cached.conn = null;
      throw err;
    });
  }

  cached.conn = await cached.promise;
  return cached.conn;
};

// CORS Configuration
app.use(cors({
  origin: '*',
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check (no auth, no DB write)
app.get('/api/health', async (req, res) => {
  try {
    await connectToDatabase();
    res.json({ status: 'ok', db: 'connected' });
  } catch (err) {
    res.status(503).json({ status: 'error', db: 'disconnected', message: err.message });
  }
});

app.get('/health', async (req, res) => {
  try {
    await connectToDatabase();
    res.json({ status: 'ok', db: 'connected' });
  } catch (err) {
    res.status(503).json({ status: 'error', db: 'disconnected', message: err.message });
  }
});

// Ensure DB connection for all API routes before hitting route handlers.
app.use(async (req, res, next) => {
  try {
    await connectToDatabase();
    next();
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    res.status(503).json({
      success: false,
      message: 'Database unavailable. Please try again shortly.',
      error: err.message,
    });
  }
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/auth', authRoutes);
app.use('/api/transactions', protect, transactionRoutes);
app.use('/transactions', protect, transactionRoutes);
app.use('/api/insights', protect, insightsRoutes);
app.use('/insights', protect, insightsRoutes);
app.use('/api/admin', adminRoutes);
app.use('/admin', adminRoutes);

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
