import React, { useState } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { CATEGORY_COLORS } from '../../data/mockData';

const fmt = (n) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0];
  return (
    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, padding: '10px 14px', boxShadow: 'var(--shadow-lg)' }}>
      <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 4 }}>{d.name}</div>
      <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>{fmt(d.value)} ({d.payload.pct}%)</div>
    </div>
  );
};

export default function SpendingPie({ data }) {
  const [activeIdx, setActiveIdx] = useState(null);
  const total = data.reduce((s, d) => s + d.amount, 0);
  const chartData = data.slice(0, 7).map(d => ({
    ...d,
    name: d.category,
    value: d.amount,
    pct: total > 0 ? ((d.amount / total) * 100).toFixed(1) : 0,
    color: CATEGORY_COLORS[d.category] || '#94a3b8',
  }));

  return (
    <div className="card chart-container">
      <div className="card-header" style={{ marginBottom: 8 }}>
        <h3 className="card-title">Spending Breakdown</h3>
        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>By category</span>
      </div>
      {chartData.length > 0 ? (
        <>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%" cy="50%"
                innerRadius={55} outerRadius={80}
                paddingAngle={3}
                dataKey="value"
                onMouseEnter={(_, i) => setActiveIdx(i)}
                onMouseLeave={() => setActiveIdx(null)}
              >
                {chartData.map((entry, i) => (
                  <Cell
                    key={entry.category}
                    fill={entry.color}
                    opacity={activeIdx === null || activeIdx === i ? 1 : 0.5}
                    stroke="none"
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          <div className="legend-list" style={{ paddingTop: 4 }}>
            {chartData.map((d, i) => (
              <div
                key={d.category}
                className="legend-item"
                onMouseEnter={() => setActiveIdx(i)}
                onMouseLeave={() => setActiveIdx(null)}
                style={{ opacity: activeIdx === null || activeIdx === i ? 1 : 0.5, transition: 'opacity 0.2s', cursor: 'default' }}
              >
                <div className="legend-dot" style={{ background: d.color }} />
                <span className="legend-label">{d.category}</span>
                <span className="legend-pct">{d.pct}%</span>
                <span className="legend-amount">{fmt(d.amount)}</span>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="empty-state"><div className="empty-icon">🍩</div><div className="empty-title">No expense data</div></div>
      )}
    </div>
  );
}
