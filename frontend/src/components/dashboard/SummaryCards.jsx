import React from 'react';

const fmt = (n) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);

export default function SummaryCards({ insights }) {
  const { totalBalance, totalIncome, totalExpenses, savingsRate, transactionCount } = insights;

  return (
    <div className="summary-grid">
      <div className="card summary-card balance animate-in">
        <div className="summary-icon">💰</div>
        <div className="summary-label">Net Balance</div>
        <div className="summary-amount">{fmt(totalBalance)}</div>
        <div className="summary-sub">{transactionCount} total transactions</div>
      </div>

      <div className="card summary-card income animate-in" style={{ animationDelay: '0.05s' }}>
        <div className="summary-icon" style={{ color: 'var(--income)' }}>↑</div>
        <div className="summary-label">Total Income</div>
        <div className="summary-amount">{fmt(totalIncome)}</div>
        <div className="summary-sub">All time earnings</div>
      </div>

      <div className="card summary-card expense animate-in" style={{ animationDelay: '0.1s' }}>
        <div className="summary-icon" style={{ color: 'var(--expense)' }}>↓</div>
        <div className="summary-label">Total Expenses</div>
        <div className="summary-amount">{fmt(totalExpenses)}</div>
        <div className="summary-sub">All time spending</div>
      </div>

      <div className="card summary-card savings animate-in" style={{ animationDelay: '0.15s' }}>
        <div className="summary-icon" style={{ color: 'var(--accent)' }}>%</div>
        <div className="summary-label">Savings Rate</div>
        <div className="summary-amount">{savingsRate}%</div>
        <div className="summary-sub">
          <div className="progress-bar" style={{ marginTop: 6 }}>
            <div className="progress-fill" style={{ width: `${Math.max(0, Math.min(100, savingsRate))}%`, background: 'var(--accent)' }} />
          </div>
        </div>
      </div>
    </div>
  );
}
