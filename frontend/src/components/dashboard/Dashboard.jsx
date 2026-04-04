import React from 'react';
import { useApp } from '../../context/AppContext';
import SummaryCards from './SummaryCards';
import BalanceTrend from './BalanceTrend';
import SpendingPie from './SpendingPie';
import RecentTransactions from './RecentTransactions';

export default function Dashboard() {
  const { state } = useApp();
  const { insights } = state;

  if (!insights) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300 }}>
      <div style={{ color: 'var(--text-muted)', fontSize: 16 }}>Loading dashboard...</div>
    </div>
  );

  return (
    <div>
      <SummaryCards insights={insights} />
      <div className="charts-grid">
        <BalanceTrend data={insights.monthlyTrend} />
        <SpendingPie data={insights.categoryBreakdown} />
      </div>
      <RecentTransactions />
    </div>
  );
}
