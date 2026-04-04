import React, { useMemo, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { CATEGORIES, CATEGORY_COLORS } from '../../data/mockData';
import TransactionModal from './TransactionModal';
import QuickAdd from './QuickAdd';
import TransactionSummary from './TransactionSummary';
import TransactionCards from './TransactionCard';

const fmt = (n) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);

const SORT_COLS = { date: 'Date', amount: 'Amount', title: 'Title' };

function getCategoryEmoji(cat) {
  const map = { Housing: '🏠', Food: '🍔', Transport: '🚗', Health: '💊', Entertainment: '🎬', Shopping: '🛍️', Utilities: '⚡', Travel: '✈️', Salary: '💼', Freelance: '💻', Investment: '📈', Business: '🏢', Education: '📚', Gift: '🎁', Bonus: '🎉', 'Personal Care': '💅', Insurance: '🛡️', EMI: '📋', Subscription: '📺', 'Other Income': '💰', Other: '💳' };
  return map[cat] || '💳';
}

export default function Transactions() {
  const { state, dispatch, showToast } = useApp();
  const { user } = useAuth();
  const { transactions, filters, showModal, viewMode, selectedTransactions } = state;
  const role = user?.role || 'viewer';
  const [page, setPage] = useState(1);
  const PER_PAGE = 10;

  const filtered = useMemo(() => {
    let t = [...transactions];
    if (filters.type) t = t.filter(x => x.type === filters.type);
    if (filters.category) t = t.filter(x => x.category === filters.category);
    if (filters.search) t = t.filter(x => x.title.toLowerCase().includes(filters.search.toLowerCase()) || (x.note || '').toLowerCase().includes(filters.search.toLowerCase()));
    t.sort((a, b) => {
      let va = a[filters.sortBy], vb = b[filters.sortBy];
      if (filters.sortBy === 'date') { va = new Date(va); vb = new Date(vb); }
      if (filters.sortBy === 'amount') { va = Number(va); vb = Number(vb); }
      if (va < vb) return filters.order === 'asc' ? -1 : 1;
      if (va > vb) return filters.order === 'asc' ? 1 : -1;
      return 0;
    });
    return t;
  }, [transactions, filters]);

  const paginated = viewMode === 'table' ? filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE) : filtered;
  const totalPages = Math.ceil(filtered.length / PER_PAGE);

  const setFilter = (key, val) => { dispatch({ type: 'SET_FILTER', payload: { [key]: val } }); setPage(1); dispatch({ type: 'CLEAR_SELECTED' }); };

  const toggleSort = (col) => {
    if (filters.sortBy === col) setFilter('order', filters.order === 'asc' ? 'desc' : 'asc');
    else { dispatch({ type: 'SET_FILTER', payload: { sortBy: col, order: 'desc' } }); setPage(1); }
  };

  const deleteTransaction = async (id) => {
    if (window.confirm('Delete this transaction?')) {
      try {
        const response = await fetch(`http://localhost:5000/api/transactions/${id}`, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' }
        });
        
        if (response.ok) {
          dispatch({ type: 'DELETE_TRANSACTION', payload: id });
          showToast('success', 'Transaction deleted!');
        } else {
          showToast('error', 'Failed to delete transaction');
          // Fallback to local
          dispatch({ type: 'DELETE_TRANSACTION', payload: id });
        }
      } catch (err) {
        console.error('Delete error:', err);
        showToast('error', 'Error connecting to server. Deleting locally...');
        dispatch({ type: 'DELETE_TRANSACTION', payload: id });
      }
    }
  };

  const deleteSelectedTransactions = async () => {
    if (window.confirm(`Delete ${selectedTransactions.length} transaction(s)?`)) {
      let successCount = 0;
      for (const id of selectedTransactions) {
        try {
          const response = await fetch(`http://localhost:5000/api/transactions/${id}`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' }
          });
          
          if (response.ok) {
            dispatch({ type: 'DELETE_TRANSACTION', payload: id });
            successCount++;
          }
        } catch (err) {
          console.error('Delete error:', err);
          dispatch({ type: 'DELETE_TRANSACTION', payload: id });
          successCount++;
        }
      }
      dispatch({ type: 'CLEAR_SELECTED' });
      showToast('success', `${successCount} transaction(s) deleted!`);
    }
  };

  const exportCSV = () => {
    const rows = [['Date', 'Title', 'Category', 'Type', 'Amount', 'Note']];
    const toExport = selectedTransactions.length > 0 
      ? filtered.filter(t => selectedTransactions.includes(t._id))
      : filtered;
    toExport.forEach(t => rows.push([new Date(t.date).toLocaleDateString(), t.title, t.category, t.type, t.amount, t.note || '']));
    const csv = rows.map(r => r.map(v => `"${v}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transactions-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    showToast('success', 'Exported to CSV!');
  };

  const sortIcon = (col) => filters.sortBy === col ? (filters.order === 'asc' ? ' ↑' : ' ↓') : ' ⇅';

  const allCategories = [...new Set(transactions.map(t => t.category))].sort();

  return (
    <div>
      {showModal && <TransactionModal />}

      <QuickAdd role={role} />
      
      <TransactionSummary />

      {/* Toolbar */}
      <div className="card" style={{ padding: '16px 20px', marginBottom: 16 }}>
        <div className="transactions-toolbar">
          <div className="search-box">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Search transactions..."
              value={filters.search}
              onChange={e => setFilter('search', e.target.value)}
            />
          </div>

          <select className="filter-select" value={filters.type} onChange={e => setFilter('type', e.target.value)}>
            <option value="">All Types</option>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>

          <select className="filter-select" value={filters.category} onChange={e => setFilter('category', e.target.value)}>
            <option value="">All Categories</option>
            {allCategories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>

          {(filters.type || filters.category || filters.search) && (
            <button className="btn btn-ghost btn-sm" onClick={() => { dispatch({ type: 'RESET_FILTERS' }); setPage(1); dispatch({ type: 'CLEAR_SELECTED' }); }}>
              ✕ Clear
            </button>
          )}

          <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
            <button className="btn btn-primary" onClick={() => {
              if (!showModal) dispatch({ type: 'SET_MODAL', payload: true });
            }}>
              + Add Transaction
            </button>
            
            <div className="view-toggle">
              <button
                className={`btn btn-icon ${viewMode === 'table' ? 'active' : ''}`}
                onClick={() => dispatch({ type: 'SET_VIEW_MODE', payload: 'table' })}
                title="Table view"
              >
                ☰ Table
              </button>
              <button
                className={`btn btn-icon ${viewMode === 'card' ? 'active' : ''}`}
                onClick={() => dispatch({ type: 'SET_VIEW_MODE', payload: 'card' })}
                title="Card view"
              >
                ⊞ Card
              </button>
            </div>

            <button className="btn btn-ghost btn-sm" onClick={exportCSV}>
              ⬇ {selectedTransactions.length > 0 ? `Export (${selectedTransactions.length})` : 'Export CSV'}
            </button>
          </div>
        </div>

        <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
          Showing <strong style={{ color: 'var(--text)' }}>{filtered.length}</strong> of {transactions.length} transactions
        </div>
      </div>

      {/* Bulk Actions Bar */}
      {selectedTransactions.length > 0 && role === 'admin' && (
        <div className="bulk-action-bar">
          <span>{selectedTransactions.length} transaction(s) selected</span>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
            <button className="btn btn-ghost btn-sm" onClick={() => dispatch({ type: 'CLEAR_SELECTED' })}>
              ✕ Deselect
            </button>
            <button className="btn btn-danger btn-sm" onClick={deleteSelectedTransactions}>
              🗑️ Delete Selected
            </button>
          </div>
        </div>
      )}

      {/* Content View */}
      <div className="card">
        {paginated.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🔍</div>
            <div className="empty-title">No transactions found</div>
            <div className="empty-desc">Try adjusting your filters or search term</div>
          </div>
        ) : viewMode === 'table' ? (
          <div style={{ overflowX: 'auto' }}>
            <table className="transaction-table">
              <thead>
                <tr>
                  {role === 'admin' && (
                    <th>
                      <input
                        type="checkbox"
                        checked={selectedTransactions.length === filtered.length && filtered.length > 0}
                        onChange={(e) => dispatch({ type: 'SELECT_ALL_TRANSACTIONS', payload: e.target.checked })}
                      />
                    </th>
                  )}
                  <th onClick={() => toggleSort('date')}>Date{sortIcon('date')}</th>
                  <th onClick={() => toggleSort('title')}>Transaction{sortIcon('title')}</th>
                  <th>Category</th>
                  <th>Type</th>
                  <th onClick={() => toggleSort('amount')} style={{ textAlign: 'right' }}>Amount{sortIcon('amount')}</th>
                  {role === 'admin' && <th>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {paginated.map(tx => (
                  <tr key={tx._id} className={selectedTransactions.includes(tx._id) ? 'selected' : ''}>
                    {role === 'admin' && (
                      <td>
                        <input
                          type="checkbox"
                          checked={selectedTransactions.includes(tx._id)}
                          onChange={() => dispatch({ type: 'TOGGLE_TRANSACTION_SELECT', payload: tx._id })}
                        />
                      </td>
                    )}
                    <td style={{ color: 'var(--text-muted)', fontSize: 13, whiteSpace: 'nowrap' }}>
                      {new Date(tx.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: '2-digit' })}
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{
                          width: 34, height: 34, borderRadius: 8, flexShrink: 0,
                          background: (CATEGORY_COLORS[tx.category] || '#94a3b8') + '20',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16
                        }}>
                          {getCategoryEmoji(tx.category)}
                        </div>
                        <div>
                          <div className="tx-title">{tx.title}</div>
                          {tx.note && <div className="tx-note">{tx.note}</div>}
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="category-badge">
                        <span className="category-dot" style={{ background: CATEGORY_COLORS[tx.category] || '#94a3b8' }} />
                        {tx.category}
                      </span>
                    </td>
                    <td>
                      <span className={`type-badge type-${tx.type}`}>
                        {tx.type === 'income' ? '↑' : '↓'} {tx.type}
                      </span>
                    </td>
                    <td className={`amount-cell amount-${tx.type}`} style={{ textAlign: 'right' }}>
                      {tx.type === 'income' ? '+' : '-'}{fmt(tx.amount)}
                    </td>
                    {role === 'admin' && (
                      <td>
                        <div className="action-btns">
                          <button className="btn btn-ghost btn-sm" onClick={() => dispatch({ type: 'SET_MODAL', payload: true, edit: tx })}>✏️</button>
                          <button className="btn btn-danger btn-sm" onClick={() => deleteTransaction(tx._id)}>🗑️</button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <TransactionCards
            transactions={paginated}
            onEdit={(tx) => dispatch({ type: 'SET_MODAL', payload: true, edit: tx })}
            onDelete={deleteTransaction}
            role={role}
          />
        )}

        {/* Pagination - Table View Only */}
        {viewMode === 'table' && totalPages > 1 && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', borderTop: '1px solid var(--border)' }}>
            <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Page {page} of {totalPages}</span>
            <div style={{ display: 'flex', gap: 6 }}>
              <button className="btn btn-ghost btn-sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>← Prev</button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pg = page <= 3 ? i + 1 : page - 2 + i;
                if (pg < 1 || pg > totalPages) return null;
                return (
                  <button key={pg} className="btn btn-sm" onClick={() => setPage(pg)}
                    style={{ background: pg === page ? 'var(--accent)' : 'transparent', color: pg === page ? 'white' : 'var(--text-muted)', border: '1px solid var(--border)' }}>
                    {pg}
                  </button>
                );
              })}
              <button className="btn btn-ghost btn-sm" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>Next →</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
