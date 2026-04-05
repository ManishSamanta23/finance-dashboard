import React from 'react';
import { useApp } from '../../context/AppContext';
import { CATEGORY_COLORS } from '../../data/mockData';

const fmt = (n) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);

export default function RecentTransactions() {
  const { state, dispatch } = useApp();
  const recent = [...state.transactions]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 6);

  return (
    <div className="card" style={{ padding: '20px 24px' }}>
      <div className="card-header" style={{ marginBottom: 16, padding: 0 }}>
        <h3 className="card-title">Recent Transactions</h3>
        <button
          className="btn btn-ghost btn-sm"
          onClick={() => dispatch({ type: 'SET_TAB', payload: 'transactions' })}
        >
          View All →
        </button>
      </div>
      {recent.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">💸</div>
          <div className="empty-title">No transactions yet</div>
          <div className="empty-desc">Add your first transaction to get started</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {recent.map(tx => (
            <div key={tx._id} style={{
              display: 'flex', alignItems: 'center', gap: 14,
              padding: '12px 8px', borderRadius: 10, transition: 'background 0.15s',
              cursor: 'default',
            }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-input)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <div style={{
                width: 40, height: 40, borderRadius: 10, flexShrink: 0,
                background: (CATEGORY_COLORS[tx.category] || '#94a3b8') + '20',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18
              }}>
                {getCategoryEmoji(tx.category)}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: "'Inter', sans-serif", fontWeight: 500, fontSize: 14, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{tx.title}</div>
                <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                  {tx.category} · {new Date(tx.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                </div>
              </div>
              <div style={{
                fontFamily: "'JetBrains Mono', 'Fira Code', monospace", fontWeight: 600, fontSize: 15, letterSpacing: '-0.03em',
                color: tx.type === 'income' ? 'var(--income)' : 'var(--expense)',
                flexShrink: 0,
              }}>
                {tx.type === 'income' ? '+' : '-'}{fmt(tx.amount)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function getCategoryEmoji(cat) {
  const map = {
    Housing: '🏠', Food: '🍔', Transport: '🚗', Health: '💊', Entertainment: '🎬',
    Shopping: '🛍️', Utilities: '⚡', Travel: '✈️', Salary: '💼', Freelance: '💻',
    Investment: '📈', Business: '🏢', Education: '📚',
  };
  return map[cat] || '💳';
}
