import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { CATEGORIES } from '../../data/mockData';

const INCOME_CATEGORIES = ['Salary', 'Freelance', 'Investment', 'Business', 'Gift', 'Bonus', 'Other Income'];
const EXPENSE_CATEGORIES = ['Housing', 'Food', 'Transport', 'Health', 'Entertainment', 'Shopping', 'Utilities', 'Travel', 'Education', 'Personal Care', 'Insurance', 'EMI', 'Subscription', 'Other'];

export default function TransactionModal() {
  const { state, dispatch, showToast } = useApp();
  const isEdit = !!state.editTransaction;
  const tx = state.editTransaction;

  const [form, setForm] = useState({
    title: '',
    amount: '',
    type: 'expense',
    category: 'Food',
    date: new Date().toISOString().split('T')[0],
    note: '',
    paymentMethod: '',
    tags: [],
    isRecurring: false,
    recurringFrequency: ''
  });
  const [tagInput, setTagInput] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const amountInputRef = useRef(null);

  useEffect(() => {
    if (tx) {
      setForm({
        title: tx.title || '',
        amount: tx.amount || '',
        type: tx.type || 'expense',
        category: tx.category || 'Food',
        date: tx.date ? tx.date.split('T')[0] : new Date().toISOString().split('T')[0],
        note: tx.note || '',
        paymentMethod: tx.paymentMethod || '',
        tags: tx.tags || [],
        isRecurring: tx.isRecurring || false,
        recurringFrequency: tx.recurringFrequency || ''
      });
    } else {
      // Auto-focus amount field when modal opens for new transaction
      setTimeout(() => amountInputRef.current?.focus(), 100);
    }
  }, [tx]);

  const validate = () => {
    const e = {};
    if (!form.title.trim()) e.title = 'Title is required (min 2 chars)';
    else if (form.title.trim().length < 2) e.title = 'Title must be at least 2 characters';
    if (!form.amount || isNaN(form.amount) || Number(form.amount) <= 0) e.amount = 'Positive amount required';
    if (!form.date) e.date = 'Date is required';
    if (!form.category) e.category = 'Category is required';
    if (form.note && form.note.length > 200) e.note = 'Note must be 200 characters or less';
    if (form.isRecurring && !form.recurringFrequency) e.recurringFrequency = 'Frequency required for recurring';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) {
      showToast('error', 'Please fix the errors below');
      return;
    }

    setLoading(true);
    try {
      const data = { ...form, amount: Number(form.amount) };
      const url = isEdit ? `http://localhost:5000/api/transactions/${tx._id}` : 'http://localhost:5000/api/transactions';
      const method = isEdit ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      const result = await response.json();
      
      if (!response.ok) {
        if (result.errors) {
          const errorMsg = Object.values(result.errors)[0];
          showToast('error', errorMsg || 'Failed to save transaction');
        } else {
          showToast('error', result.error || 'Failed to save transaction');
        }
        setLoading(false);
        return;
      }

      if (isEdit) {
        dispatch({ type: 'UPDATE_TRANSACTION', payload: result.data });
        showToast('success', 'Transaction updated!');
      } else {
        dispatch({ type: 'ADD_TRANSACTION', payload: result.data });
        showToast('success', 'Transaction added successfully!');
      }
      
      setShowSuccess(true);
      setLoading(false);
      setTimeout(() => {
        dispatch({ type: 'SET_MODAL', payload: false });
      }, 800);
    } catch (err) {
      console.error('Error:', err);
      showToast('error', 'Error connecting to server. Saving locally...');
      // Fallback to local storage
      const data = { ...form, amount: Number(form.amount) };
      if (isEdit) {
        dispatch({ type: 'UPDATE_TRANSACTION', payload: { ...tx, ...data } });
      } else {
        dispatch({ type: 'ADD_TRANSACTION', payload: { ...data, _id: Date.now().toString() } });
      }
      setShowSuccess(true);
      setLoading(false);
      setTimeout(() => {
        dispatch({ type: 'SET_MODAL', payload: false });
      }, 800);
    }
  };

  const close = () => dispatch({ type: 'SET_MODAL', payload: false });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleAddTag = () => {
    if (tagInput.trim() && form.tags.length < 5 && !form.tags.includes(tagInput.trim())) {
      setForm(f => ({ ...f, tags: [...f.tags, tagInput.trim()] }));
      setTagInput('');
    }
  };

  const handleRemoveTag = (idx) => {
    setForm(f => ({ ...f, tags: f.tags.filter((_, i) => i !== idx) }));
  };

  const handleTypeChange = (newType) => {
    const defaultCat = newType === 'income' ? 'Salary' : 'Food';
    set('type', newType);
    set('category', defaultCat);
  };

  const catList = form.type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && close()}>
      <div className="modal modal-large">
        <div className="modal-header">
          <h2 className="modal-title">{isEdit ? 'Edit Transaction' : 'Add Transaction'}</h2>
          <button className="modal-close" onClick={close}>✕</button>
        </div>

        {showSuccess && (
          <div className="modal-success-banner">
            <span>✓ Saved!</span>
          </div>
        )}

        <div className="modal-body">
          {/* Type Toggle */}
          <div className="form-section">
            <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
              {['expense', 'income'].map(t => (
                <button
                  key={t}
                  type="button"
                  className="type-toggle"
                  onClick={() => handleTypeChange(t)}
                  style={{
                    flex: 1,
                    background: form.type === t ? (t === 'income' ? 'var(--income)' : 'var(--expense)') : 'var(--bg-input)',
                    color: form.type === t ? 'white' : 'var(--text-muted)',
                    borderColor: form.type === t ? (t === 'income' ? 'var(--income)' : 'var(--expense)') : 'var(--border)',
                  }}
                >
                  {t === 'income' ? '↑ Income' : '↓ Expense'}
                </button>
              ))}
            </div>

            {/* Basic Fields */}
            <div className="form-grid">
              <div className="form-group full">
                <label className="form-label">Title *</label>
                <input
                  className={`form-input ${errors.title ? 'form-input-error' : ''}`}
                  placeholder={form.type === 'income' ? 'e.g. Monthly Salary, Freelance Payment' : 'e.g. Grocery Shopping, Electricity Bill'}
                  value={form.title}
                  onChange={e => set('title', e.target.value)}
                />
                {errors.title && <span className="form-error">{errors.title}</span>}
              </div>

              <div className="form-group full">
                <label className="form-label">Amount (₹) *</label>
                <input
                  ref={amountInputRef}
                  className={`form-input form-input-amount ${errors.amount ? 'form-input-error' : ''}`}
                  type="number"
                  placeholder="Enter amount (required)"
                  value={form.amount}
                  onChange={e => set('amount', e.target.value)}
                  min="0"
                  step="0.01"
                />
                {errors.amount && <span className="form-error">{errors.amount}</span>}
              </div>

              <div className="form-group">
                <label className="form-label">Date *</label>
                <input
                  className={`form-input ${errors.date ? 'form-input-error' : ''}`}
                  type="date"
                  value={form.date}
                  onChange={e => set('date', e.target.value)}
                />
                {errors.date && <span className="form-error">{errors.date}</span>}
              </div>

              <div className="form-group">
                <label className="form-label">Category *</label>
                <select
                  className={`form-input ${errors.category ? 'form-input-error' : ''}`}
                  value={form.category}
                  onChange={e => set('category', e.target.value)}
                >
                  {catList.map(c => (
                    <option key={c} value={c}>
                      ● {c}
                    </option>
                  ))}
                </select>
                {errors.category && <span className="form-error">{errors.category}</span>}
              </div>
            </div>
          </div>

          {/* Additional Details Section */}
          <details className="form-section form-details">
            <summary className="form-summary">+ Additional Details</summary>
            <div style={{ paddingTop: 16 }}>
              <div className="form-group full">
                <label className="form-label">Note (optional)</label>
                <textarea
                  className={`form-input ${errors.note ? 'form-input-error' : ''}`}
                  placeholder="Add a note..."
                  value={form.note}
                  onChange={e => set('note', e.target.value)}
                  maxLength="200"
                  rows="3"
                />
                <div className="char-count">{form.note.length}/200</div>
                {errors.note && <span className="form-error">{errors.note}</span>}
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Payment Method</label>
                  <select
                    className="form-input"
                    value={form.paymentMethod}
                    onChange={e => set('paymentMethod', e.target.value)}
                  >
                    <option value="">Select method</option>
                    <option value="cash">💵 Cash</option>
                    <option value="card">💳 Card</option>
                    <option value="bank transfer">🏦 Bank Transfer</option>
                    <option value="upi">📱 UPI</option>
                    <option value="other">💱 Other</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">
                    <input
                      type="checkbox"
                      checked={form.isRecurring}
                      onChange={e => set('isRecurring', e.target.checked)}
                    />
                    Is Recurring?
                  </label>
                </div>

                {form.isRecurring && (
                  <div className="form-group">
                    <label className="form-label">Frequency *</label>
                    <select
                      className={`form-input ${errors.recurringFrequency ? 'form-input-error' : ''}`}
                      value={form.recurringFrequency}
                      onChange={e => set('recurringFrequency', e.target.value)}
                    >
                      <option value="">Select frequency</option>
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                      <option value="yearly">Yearly</option>
                    </select>
                    {errors.recurringFrequency && <span className="form-error">{errors.recurringFrequency}</span>}
                  </div>
                )}
              </div>

              {/* Tags */}
              <div className="form-group full">
                <label className="form-label">Tags (max 5)</label>
                <div className="tags-input-wrapper">
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Add tags (press Enter or comma)"
                    value={tagInput}
                    onChange={e => setTagInput(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' || e.key === ',') {
                        e.preventDefault();
                        handleAddTag();
                      }
                    }}
                  />
                </div>
                {form.tags.length > 0 && (
                  <div className="tags-container">
                    {form.tags.map((tag, i) => (
                      <span key={i} className="tag-chip">
                        {tag}
                        <button type="button" className="tag-remove" onClick={() => handleRemoveTag(i)}>×</button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </details>
        </div>

        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={close} disabled={loading}>Cancel</button>
          <button
            className="btn btn-ghost"
            onClick={() => { setForm({
              title: '',
              amount: '',
              type: 'expense',
              category: 'Food',
              date: new Date().toISOString().split('T')[0],
              note: '',
              paymentMethod: '',
              tags: [],
              isRecurring: false,
              recurringFrequency: ''
            }); }}
            disabled={loading}
          >
            Clear Form
          </button>
          <button
            className={`btn btn-primary ${form.type === 'income' ? 'btn-income' : 'btn-expense'}`}
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? '⏳ Saving...' : (isEdit ? '✓ Update' : `+ Add ${form.type === 'income' ? 'Income' : 'Expense'}`)}
          </button>
        </div>
      </div>
    </div>
  );
}
