import React from 'react';
import { useApp } from '../../context/AppContext';
import { CATEGORY_COLORS } from '../../data/mockData';

const fmt = (n) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);

const getCategoryEmoji = (cat) => {
  const map = { Housing: '🏠', Food: '🍔', Transport: '🚗', Health: '💊', Entertainment: '🎬', Shopping: '🛍️', Utilities: '⚡', Travel: '✈️', Salary: '💼', Freelance: '💻', Investment: '📈', Business: '🏢', Education: '📚', Gift: '🎁', Bonus: '🎉', 'Personal Care': '💅', Insurance: '🛡️', EMI: '📋', Subscription: '📺', 'Other Income': '💰', Other: '💳' };
  return map[cat] || '💳';
};

const getPaymentIcon = (method) => {
  const map = { cash: '💵', card: '💳', 'bank transfer': '🏦', upi: '📱', other: '💱' };
  return map[method] || '';
};

function TransactionCard({ transaction, onEdit, onDelete, role }) {
  const date = new Date(transaction.date);
  const dateStr = date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  const notePreview = transaction.note ? transaction.note.substring(0, 50) + (transaction.note.length > 50 ? '...' : '') : '';

  return (
    <div className="transaction-card">
      <div className="transaction-card-header">
        <div className="transaction-card-emoji" style={{ background: (CATEGORY_COLORS[transaction.category] || '#94a3b8') + '30' }}>
          {getCategoryEmoji(transaction.category)}
        </div>
        <div className="transaction-card-title">
          <div className="transaction-card-name">{transaction.title}</div>
          {notePreview && <div className="transaction-card-note">{notePreview}</div>}
        </div>
        <div className={`transaction-card-amount amount-${transaction.type}`}>
          {transaction.type === 'income' ? '+' : '-'}{fmt(transaction.amount)}
        </div>
      </div>

      <div className="transaction-card-meta">
        <span className="transaction-card-date">{dateStr}</span>
        <span className="category-badge">
          <span className="category-dot" style={{ background: CATEGORY_COLORS[transaction.category] }} />
          {transaction.category}
        </span>
      </div>

      {transaction.paymentMethod && (
        <div className="payment-badge">
          {getPaymentIcon(transaction.paymentMethod)} {transaction.paymentMethod}
        </div>
      )}

      {transaction.tags && transaction.tags.length > 0 && (
        <div className="transaction-card-tags">
          {transaction.tags.map((tag, i) => (
            <span key={i} className="tag-chip">{tag}</span>
          ))}
        </div>
      )}

      {role === 'admin' && (
        <div className="transaction-card-actions">
          <button className="btn btn-ghost btn-sm" onClick={() => onEdit(transaction)}>✏️ Edit</button>
          <button className="btn btn-danger btn-sm" onClick={() => onDelete(transaction._id)}>🗑️ Delete</button>
        </div>
      )}
    </div>
  );
}

export default function TransactionCards({ transactions, onEdit, onDelete, role }) {
  return (
    <div className="transaction-cards-grid">
      {transactions.map(tx => (
        <TransactionCard
          key={tx._id}
          transaction={tx}
          onEdit={onEdit}
          onDelete={onDelete}
          role={role}
        />
      ))}
    </div>
  );
}
