import React, { useMemo } from 'react';
import { useApp } from '../../context/AppContext';

const fmt = (n) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);

export default function TransactionSummary() {
  const { state } = useApp();
  const { transactions, filters } = state;

  const summary = useMemo(() => {
    let txs = [...transactions];
    if (filters.type) txs = txs.filter(x => x.type === filters.type);
    if (filters.category) txs = txs.filter(x => x.category === filters.category);
    if (filters.search) txs = txs.filter(x => x.title.toLowerCase().includes(filters.search.toLowerCase()));

    const income = txs.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const expenses = txs.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
    const net = income - expenses;

    return { income, expenses, net };
  }, [transactions, filters]);

  return (
    <div className="summary-bar">
      <div className="summary-stat">
        <div className="summary-label">↑ Total Income</div>
        <div className="summary-value income">{fmt(summary.income)}</div>
      </div>
      <div className="summary-stat">
        <div className="summary-label">↓ Total Expenses</div>
        <div className="summary-value expense">{fmt(summary.expenses)}</div>
      </div>
      <div className="summary-stat">
        <div className="summary-label">Net Balance</div>
        <div className={`summary-value ${summary.net >= 0 ? 'income' : 'expense'}`}>
          {summary.net >= 0 ? '+' : '-'}{fmt(Math.abs(summary.net))}
        </div>
      </div>
    </div>
  );
}
