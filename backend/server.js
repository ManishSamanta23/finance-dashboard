const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Track MongoDB connection state
let isMongoConnected = false;

// Disable Mongoose query buffering to fail fast instead of timeout
mongoose.set('bufferCommands', false);
mongoose.set('bufferTimeoutMS', 0);

// Routes
app.use('/api/transactions', require('./routes/transactions'));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/insights', require('./routes/insights'));

// Health check endpoint - includes MongoDB status
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Finance Dashboard API Running',
    mongodb: isMongoConnected ? 'connected' : 'disconnected',
    mode: isMongoConnected ? 'database' : 'mock'
  });
});

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/finance_dashboard';

// MongoDB Connection with timeout and buffer protection
mongoose.connect(MONGO_URI, {
  serverSelectionTimeoutMS: 3000,
  connectTimeoutMS: 3000,
  socketTimeoutMS: 3000,
  bufferCommands: false,
})
  .then(() => {
    isMongoConnected = true;
    console.log('✅ MongoDB Connected');
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  })
  .catch(err => {
    isMongoConnected = false;
    console.log('⚠️  MongoDB not available, running in mock mode');
    console.log('    MongoDB Connection Troubleshooting:');
    console.log('    1. Make sure MongoDB is running:');
    console.log('       - Windows: net start MongoDB');
    console.log('       - Mac/Linux: brew services start mongodb-community');
    console.log('       - Or: sudo systemctl start mongod');
    console.log('    2. Or use MongoDB Atlas (cloud) - update MONGO_URI in .env');
    console.log('    3. App works without MongoDB using in-memory mock data');
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT} (mock mode)`));
  });

// Listen for MongoDB connection state changes
mongoose.connection.on('disconnected', () => {
  isMongoConnected = false;
  console.log('⚠️  MongoDB disconnected - switching to mock mode');
});

mongoose.connection.on('reconnected', () => {
  isMongoConnected = true;
  console.log('✅ MongoDB reconnected');
});

// Export for use in routes
module.exports = { app, getMongoStatus: () => isMongoConnected };
