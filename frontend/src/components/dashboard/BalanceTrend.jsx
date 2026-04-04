import React from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

const fmt = (n) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: 'var(--bg-card)', border: '1px solid var(--border)',
      borderRadius: 10, padding: '12px 16px', boxShadow: 'var(--shadow-lg)'
    }}>
      <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</p>
      {payload.map(p => (
        <div key={p.name} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: p.color }} />
          <span style={{ fontSize: 13, color: 'var(--text-muted)', textTransform: 'capitalize' }}>{p.name}:</span>
          <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', fontFamily: 'Syne, sans-serif' }}>{fmt(p.value)}</span>
        </div>
      ))}
    </div>
  );
};

export default function BalanceTrend({ data }) {
  return (
    <div className="card chart-container">
      <div className="card-header" style={{ marginBottom: 20 }}>
        <h3 className="card-title">Monthly Cash Flow</h3>
        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Income vs Expenses</span>
      </div>
      {data && data.length > 0 ? (
        <ResponsiveContainer width="100%" height={240}>
          <AreaChart data={data} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0.02} />
              </linearGradient>
              <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
            <XAxis dataKey="month" tick={{ fontSize: 12, fill: 'var(--text-muted)', fontFamily: 'DM Sans' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)', fontFamily: 'DM Sans' }} axisLine={false} tickLine={false} tickFormatter={v => `₹${v >= 1000 ? (v / 1000).toFixed(0) + 'k' : v}`} />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: 12, paddingTop: 16, fontFamily: 'DM Sans' }} />
            <Area type="monotone" dataKey="income" stroke="#10b981" strokeWidth={2.5} fill="url(#incomeGrad)" dot={{ fill: '#10b981', r: 4, strokeWidth: 0 }} activeDot={{ r: 6 }} name="Income" />
            <Area type="monotone" dataKey="expense" stroke="#ef4444" strokeWidth={2.5} fill="url(#expenseGrad)" dot={{ fill: '#ef4444', r: 4, strokeWidth: 0 }} activeDot={{ r: 6 }} name="Expense" />
          </AreaChart>
        </ResponsiveContainer>
      ) : (
        <div className="empty-state"><div className="empty-icon">📊</div><div className="empty-title">No trend data yet</div></div>
      )}
    </div>
  );
}
