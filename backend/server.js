const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/transactions', require('./routes/transactions'));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/insights', require('./routes/insights'));

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'OK', message: 'Finance Dashboard API Running' }));

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/finance_dashboard';

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB Connected');
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  })
  .catch(err => {
    console.log('⚠️  MongoDB not available, running in mock mode');
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT} (mock mode)`));
  });

module.exports = app;
