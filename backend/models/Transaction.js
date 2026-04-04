const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  title: { type: String, required: true, minlength: 2 },
  amount: { type: Number, required: true, min: 0.01 },
  type: { type: String, enum: ['income', 'expense'], required: true },
  category: { type: String, required: true },
  date: { type: Date, default: Date.now },
  note: { type: String, maxlength: 200 },
  paymentMethod: { type: String, enum: ['', 'cash', 'card', 'bank transfer', 'upi', 'other'], default: '' },
  tags: { type: [String], default: [] },
  isRecurring: { type: Boolean, default: false },
  recurringFrequency: { type: String, enum: ['', 'daily', 'weekly', 'monthly', 'yearly'], default: '' },
  createdBy: { type: String, default: 'admin' }
}, { timestamps: true });

module.exports = mongoose.model('Transaction', transactionSchema);
