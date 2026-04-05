import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { mockTransactions } from '../data/mockData';
import { useAuth } from './AuthContext';

const AppContext = createContext();
const API = process.env.REACT_APP_API_URL || '';

const initialState = {
  transactions: [],
  filters: { type: '', category: '', search: '', sortBy: 'date', order: 'desc' },
  insights: null,
  loading: false,
  darkMode: localStorage.getItem('fd_dark') === 'true',
  activeTab: 'dashboard',
  showModal: false,
  editTransaction: null,
  toasts: [],
  viewMode: localStorage.getItem('fd_view_mode') || 'table',
  selectedTransactions: []
};

const generateToastId = () => Date.now().toString();

function reducer(state, action) {
  switch (action.type) {
    case 'SET_TRANSACTIONS': return { ...state, transactions: action.payload };
    case 'ADD_TRANSACTION': {
      const updated = [action.payload, ...state.transactions];
      return { ...state, transactions: updated };
    }
    case 'UPDATE_TRANSACTION': {
      const updated = state.transactions.map(t => t._id === action.payload._id ? action.payload : t);
      return { ...state, transactions: updated };
    }
    case 'DELETE_TRANSACTION': {
      const updated = state.transactions.filter(t => t._id !== action.payload);
      return { ...state, transactions: updated };
    }
    case 'SET_FILTER': return { ...state, filters: { ...state.filters, ...action.payload } };
    case 'RESET_FILTERS': return { ...state, filters: initialState.filters };
    case 'SET_INSIGHTS': return { ...state, insights: action.payload };
    case 'SET_LOADING': return { ...state, loading: action.payload };
    case 'TOGGLE_DARK': {
      const dark = !state.darkMode;
      localStorage.setItem('fd_dark', dark);
      return { ...state, darkMode: dark };
    }
    case 'SET_TAB': return { ...state, activeTab: action.payload };
    case 'SET_MODAL': return { ...state, showModal: action.payload, editTransaction: action.edit || null };
    case 'ADD_TOAST': {
      const newToast = { id: action.payload.id || generateToastId(), ...action.payload };
      const toasts = [...state.toasts, newToast];
      if (toasts.length > 3) toasts.shift();
      return { ...state, toasts };
    }
    case 'REMOVE_TOAST': return { ...state, toasts: state.toasts.filter(t => t.id !== action.payload) };
    case 'SET_VIEW_MODE': {
      localStorage.setItem('fd_view_mode', action.payload);
      return { ...state, viewMode: action.payload };
    }
    case 'TOGGLE_TRANSACTION_SELECT': {
      const selected = state.selectedTransactions.includes(action.payload)
        ? state.selectedTransactions.filter(id => id !== action.payload)
        : [...state.selectedTransactions, action.payload];
      return { ...state, selectedTransactions: selected };
    }
    case 'SELECT_ALL_TRANSACTIONS': {
      return { ...state, selectedTransactions: action.payload ? state.transactions.map(t => t._id) : [] };
    }
    case 'CLEAR_SELECTED': return { ...state, selectedTransactions: [] };
    default: return state;
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const { token, user, isAuthenticated } = useAuth();

  useEffect(() => {
    const loadFromAPI = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/transactions`);
        const result = await response.json();
        if (result.success && result.data.length > 0) {
          dispatch({ type: 'SET_TRANSACTIONS', payload: result.data });
          dispatch({ type: 'SET_INSIGHTS', payload: computeInsights(result.data) });
        } else {
          // API returned empty — fallback to mock data
          dispatch({ type: 'SET_TRANSACTIONS', payload: mockTransactions });
          dispatch({ type: 'SET_INSIGHTS', payload: computeInsights(mockTransactions) });
        }
      } catch (error) {
        console.error('Error loading from API, fallback to mock data:', error);
        // API not available — use mock data
        dispatch({ type: 'SET_TRANSACTIONS', payload: mockTransactions });
        dispatch({ type: 'SET_INSIGHTS', payload: computeInsights(mockTransactions) });
      }
    };

    if (isAuthenticated) {
      loadFromAPI();
    } else {
      dispatch({ type: 'SET_TRANSACTIONS', payload: mockTransactions });
      dispatch({ type: 'SET_INSIGHTS', payload: computeInsights(mockTransactions) });
    }
  }, [isAuthenticated, user?.id]);

  useEffect(() => {
    dispatch({ type: 'SET_INSIGHTS', payload: computeInsights(state.transactions) });
  }, [state.transactions]);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', state.darkMode ? 'dark' : 'light');
  }, [state.darkMode]);

  // Auto-dismiss toasts after 3 seconds
  useEffect(() => {
    const timers = state.toasts.map(toast => 
      setTimeout(() => dispatch({ type: 'REMOVE_TOAST', payload: toast.id }), 3000)
    );
    return () => timers.forEach(t => clearTimeout(t));
  }, [state.toasts]);

  const showToast = (type, message) => {
    dispatch({ 
      type: 'ADD_TOAST', 
      payload: { id: generateToastId(), type, message } 
    });
  };

  return (
    <AppContext.Provider value={{ state, dispatch, showToast }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);

function computeInsights(transactions) {
  const income = transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const expenses = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);

  const categoryMap = {};
  transactions.filter(t => t.type === 'expense').forEach(t => {
    categoryMap[t.category] = (categoryMap[t.category] || 0) + t.amount;
  });
  const categoryBreakdown = Object.entries(categoryMap)
    .map(([category, amount]) => ({ category, amount }))
    .sort((a, b) => b.amount - a.amount);

  const monthlyMap = {};
  transactions.forEach(t => {
    const d = new Date(t.date);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const label = d.toLocaleString('default', { month: 'short' }) + " '" + String(d.getFullYear()).slice(2);
    if (!monthlyMap[key]) monthlyMap[key] = { month: label, key, income: 0, expense: 0 };
    monthlyMap[key][t.type] += t.amount;
  });
  const monthlyTrend = Object.values(monthlyMap).sort((a, b) => a.key.localeCompare(b.key));

  return {
    totalBalance: income - expenses,
    totalIncome: income,
    totalExpenses: expenses,
    categoryBreakdown,
    monthlyTrend,
    highestCategory: categoryBreakdown[0] || null,
    savingsRate: income > 0 ? (((income - expenses) / income) * 100).toFixed(1) : 0,
    transactionCount: transactions.length,
  };
}
