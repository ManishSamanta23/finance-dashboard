import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { CATEGORIES } from '../../data/mockData';

const INCOME_CATEGORIES = ['Salary', 'Freelance', 'Investment', 'Business', 'Gift', 'Bonus', 'Other Income'];

export default function QuickAdd({ role }) {
  const { dispatch, showToast } = useApp();
  const [form, setForm] = useState({
    type: 'expense',
    title: '',
    amount: '',
    category: 'Food',
    date: new Date().toISOString().split('T')[0]
  });
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!form.title.trim()) e.title = 'Title required';
    if (!form.amount || isNaN(form.amount) || Number(form.amount) <= 0) e.amount = 'Valid amount required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    const transaction = {
      _id: Date.now().toString(),
      ...form,
      amount: Number(form.amount),
      paymentMethod: '',
      tags: [],
      isRecurring: false,
      recurringFrequency: ''
    };

    dispatch({ type: 'ADD_TRANSACTION', payload: transaction });
    showToast('success', 'Transaction added successfully!');
    
    // Reset form
    setForm({
      type: 'expense',
      title: '',
      amount: '',
      category: 'Food',
      date: new Date().toISOString().split('T')[0]
    });
    setErrors({});
  };

  const cats = form.type === 'income' ? INCOME_CATEGORIES : CATEGORIES.filter(c => !INCOME_CATEGORIES.includes(c));

  if (role !== 'admin') return null;

  return (
    <div className="quick-add-bar">
      <form onSubmit={handleSubmit} className="quick-add-form">
        <div className="quick-add-group">
          <select 
            className="quick-add-select" 
            value={form.type}
            onChange={(e) => {
              const type = e.target.value;
              setForm(f => ({ ...f, type, category: type === 'income' ? 'Salary' : 'Food' }));
            }}
          >
            <option value="expense">Expense</option>
            <option value="income">Income</option>
          </select>
        </div>

        <div className="quick-add-group">
          <input
            type="text"
            className="quick-add-input"
            placeholder="What's the transaction?"
            value={form.title}
            onChange={(e) => setForm(f => ({ ...f, title: e.target.value }))}
            onKeyPress={(e) => e.key === 'Enter' && handleSubmit(e)}
          />
          {errors.title && <span className="quick-add-error">{errors.title}</span>}
        </div>

        <div className="quick-add-group">
          <input
            type="number"
            className="quick-add-input"
            placeholder="Amount"
            value={form.amount}
            onChange={(e) => setForm(f => ({ ...f, amount: e.target.value }))}
            onKeyPress={(e) => e.key === 'Enter' && handleSubmit(e)}
          />
          {errors.amount && <span className="quick-add-error">{errors.amount}</span>}
        </div>

        <div className="quick-add-group">
          <select 
            className="quick-add-select" 
            value={form.category}
            onChange={(e) => setForm(f => ({ ...f, category: e.target.value }))}
          >
            {cats.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        <div className="quick-add-group">
          <input
            type="date"
            className="quick-add-input"
            value={form.date}
            onChange={(e) => setForm(f => ({ ...f, date: e.target.value }))}
          />
        </div>

        <button type="submit" className="btn btn-primary btn-sm">
          + Add
        </button>
      </form>
    </div>
  );
}
