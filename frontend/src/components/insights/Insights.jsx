import React from 'react';
import { useApp } from '../../context/AppContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { CATEGORY_COLORS } from '../../data/mockData';

const fmt = (n) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);

const CustomBarTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, padding: '10px 14px', boxShadow: 'var(--shadow-lg)' }}>
      <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6 }}>{label}</p>
      {payload.map(p => (
        <div key={p.name} style={{ fontSize: 13, fontWeight: 700, color: p.fill }}>{p.name}: {fmt(p.value)}</div>
      ))}
    </div>
  );
};

export default function Insights() {
  const { state } = useApp();
  const { insights, transactions } = state;

  if (!insights) return <div className="empty-state"><div className="empty-icon">⏳</div><div className="empty-title">Loading...</div></div>;

  const { totalBalance, totalIncome, totalExpenses, categoryBreakdown, monthlyTrend, highestCategory, savingsRate } = insights;

  // Monthly comparison: last 2 months
  const last2 = monthlyTrend.slice(-2);
  const prevMonth = last2[0];
  const currMonth = last2[1];
  const expenseDiff = currMonth && prevMonth ? ((currMonth.expense - prevMonth.expense) / (prevMonth.expense || 1) * 100).toFixed(1) : null;
  const incomeDiff = currMonth && prevMonth ? ((currMonth.income - prevMonth.income) / (prevMonth.income || 1) * 100).toFixed(1) : null;

  // Per-category avg
  const avgMonthlyExpense = monthlyTrend.length > 0
    ? (totalExpenses / monthlyTrend.length).toFixed(0)
    : 0;

  return (
    <div>
      {/* Key insight cards */}
      <div className="insights-grid">
        <div className="card insight-card" style={{ borderLeft: '4px solid var(--accent)' }}>
          <div className="insight-icon">🏆</div>
          <div className="insight-title">Top Spending Category</div>
          <div className="insight-value" style={{ color: 'var(--accent)' }}>{highestCategory?.category || '—'}</div>
          <div className="insight-desc">{highestCategory ? fmt(highestCategory.amount) + ' spent' : 'No expenses recorded'}</div>
          {highestCategory && (
            <div className="progress-bar" style={{ marginTop: 10 }}>
              <div className="progress-fill" style={{
                width: `${(highestCategory.amount / totalExpenses * 100).toFixed(0)}%`,
                background: CATEGORY_COLORS[highestCategory.category] || 'var(--accent)'
              }} />
            </div>
          )}
        </div>

        <div className="card insight-card" style={{ borderLeft: `4px solid ${Number(savingsRate) >= 20 ? 'var(--income)' : Number(savingsRate) >= 0 ? '#f59e0b' : 'var(--expense)'}` }}>
          <div className="insight-icon">{Number(savingsRate) >= 20 ? '💚' : Number(savingsRate) >= 0 ? '🟡' : '🔴'}</div>
          <div className="insight-title">Savings Rate</div>
          <div className="insight-value" style={{ color: Number(savingsRate) >= 20 ? 'var(--income)' : Number(savingsRate) >= 0 ? '#f59e0b' : 'var(--expense)' }}>
            {savingsRate}%
          </div>
          <div className="insight-desc">
            {Number(savingsRate) >= 30 ? 'Excellent! Keep it up 🎉' : Number(savingsRate) >= 20 ? 'Good savings discipline' : Number(savingsRate) >= 10 ? 'Room for improvement' : 'Consider reducing expenses'}
          </div>
        </div>

        <div className="card insight-card" style={{ borderLeft: '4px solid var(--income)' }}>
          <div className="insight-icon">📅</div>
          <div className="insight-title">Avg Monthly Expense</div>
          <div className="insight-value" style={{ color: 'var(--expense)' }}>{fmt(Number(avgMonthlyExpense))}</div>
          <div className="insight-desc">Across {monthlyTrend.length} month{monthlyTrend.length !== 1 ? 's' : ''}</div>
        </div>
      </div>

      {/* Monthly comparison */}
      {currMonth && prevMonth && (
        <div className="card" style={{ padding: '20px 24px', marginBottom: 16 }}>
          <h3 className="card-title" style={{ marginBottom: 20 }}>Monthly Comparison</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div style={{ padding: '16px', background: 'var(--bg-input)', borderRadius: 12 }}>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>Income</div>
              <div style={{ fontFamily: "'JetBrains Mono', 'Fira Code', monospace", fontSize: 20, fontWeight: 600, letterSpacing: '-0.03em', color: 'var(--income)', marginBottom: 4 }}>{fmt(currMonth.income)}</div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                vs {fmt(prevMonth.income)} last month
                <span style={{ marginLeft: 6, color: Number(incomeDiff) >= 0 ? 'var(--income)' : 'var(--expense)', fontWeight: 600 }}>
                  {Number(incomeDiff) >= 0 ? '↑' : '↓'} {Math.abs(incomeDiff)}%
                </span>
              </div>
            </div>
            <div style={{ padding: '16px', background: 'var(--bg-input)', borderRadius: 12 }}>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>Expenses</div>
              <div style={{ fontFamily: "'JetBrains Mono', 'Fira Code', monospace", fontSize: 20, fontWeight: 600, letterSpacing: '-0.03em', color: 'var(--expense)', marginBottom: 4 }}>{fmt(currMonth.expense)}</div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                vs {fmt(prevMonth.expense)} last month
                <span style={{ marginLeft: 6, color: Number(expenseDiff) <= 0 ? 'var(--income)' : 'var(--expense)', fontWeight: 600 }}>
                  {Number(expenseDiff) >= 0 ? '↑' : '↓'} {Math.abs(expenseDiff)}%
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Monthly bar chart */}
      <div className="card" style={{ padding: '20px 24px', marginBottom: 16 }}>
        <h3 className="card-title" style={{ marginBottom: 20 }}>Monthly Income vs Expenses</h3>
        {monthlyTrend.length > 0 ? (
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={monthlyTrend} margin={{ top: 4, right: 4, left: 0, bottom: 0 }} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: 'var(--text-muted)', fontFamily: 'Inter' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)', fontFamily: 'Inter' }} axisLine={false} tickLine={false} tickFormatter={v => `₹${v >= 1000 ? (v / 1000).toFixed(0) + 'k' : v}`} />
              <Tooltip content={<CustomBarTooltip />} />
              <Bar dataKey="income" name="Income" fill="#10b981" radius={[6, 6, 0, 0]} maxBarSize={40} />
              <Bar dataKey="expense" name="Expense" fill="#ef4444" radius={[6, 6, 0, 0]} maxBarSize={40} />
            </BarChart>
          </ResponsiveContainer>
        ) : <div className="empty-state"><div className="empty-icon">📊</div><div className="empty-title">No monthly data</div></div>}
      </div>

      {/* Category breakdown table */}
      <div className="card" style={{ padding: '20px 24px' }}>
        <h3 className="card-title" style={{ marginBottom: 20 }}>Expense Category Breakdown</h3>
        {categoryBreakdown.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {categoryBreakdown.map(cat => {
              const pct = totalExpenses > 0 ? ((cat.amount / totalExpenses) * 100).toFixed(1) : 0;
              const color = CATEGORY_COLORS[cat.category] || '#94a3b8';
              return (
                <div key={cat.category}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: 10, height: 10, borderRadius: 3, background: color }} />
                      <span style={{ fontSize: 14, fontWeight: 500 }}>{cat.category}</span>
                    </div>
                    <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                      <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{pct}%</span>
                      <span style={{ fontFamily: "'JetBrains Mono', 'Fira Code', monospace", fontWeight: 600, fontSize: 14, letterSpacing: '-0.03em' }}>{fmt(cat.amount)}</span>
                    </div>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${pct}%`, background: color }} />
                  </div>
                </div>
              );
            })}
          </div>
        ) : <div className="empty-state"><div className="empty-icon">📂</div><div className="empty-title">No expense categories</div></div>}
      </div>
    </div>
  );
}
