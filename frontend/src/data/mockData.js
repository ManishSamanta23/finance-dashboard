export const mockTransactions = [
  { _id: '1', title: 'Monthly Salary', amount: 75000, type: 'income', category: 'Salary', date: '2024-01-05', note: 'January salary credit', paymentMethod: 'bank transfer', tags: ['monthly'] },
  { _id: '2', title: 'Freelance Project', amount: 15000, type: 'income', category: 'Freelance', date: '2024-01-12', note: 'Web development project', paymentMethod: 'upi', tags: [] },
  { _id: '3', title: 'Rent', amount: 18000, type: 'expense', category: 'Housing', date: '2024-01-01', note: 'Monthly apartment rent', paymentMethod: 'bank transfer', tags: ['essential', 'monthly'] },
  { _id: '4', title: 'Groceries', amount: 4500, type: 'expense', category: 'Food', date: '2024-01-08', note: 'Weekly grocery shopping', paymentMethod: 'upi', tags: ['essential'] },
  { _id: '5', title: 'Netflix Subscription', amount: 649, type: 'expense', category: 'Subscription', date: '2024-01-10', note: 'Monthly subscription', paymentMethod: 'card', tags: ['subscription'] },
  { _id: '6', title: 'Gym Membership', amount: 1200, type: 'expense', category: 'Health', date: '2024-01-03', note: 'Monthly gym fee', paymentMethod: 'card', tags: ['wellness'] },
  { _id: '7', title: 'Investment Returns', amount: 8000, type: 'income', category: 'Investment', date: '2024-01-20', note: 'Mutual fund returns', paymentMethod: 'bank transfer', tags: [] },
  { _id: '8', title: 'Electricity Bill', amount: 2800, type: 'expense', category: 'Utilities', date: '2024-01-15', note: 'Monthly electricity', paymentMethod: 'bank transfer', tags: ['essential', 'monthly'] },
  { _id: '9', title: 'Restaurant Dining', amount: 3200, type: 'expense', category: 'Food', date: '2024-01-18', note: 'Team dinner outing', paymentMethod: 'card', tags: ['social'] },
  { _id: '10', title: 'Transportation', amount: 1800, type: 'expense', category: 'Transport', date: '2024-01-22', note: 'Cab and metro expenses', paymentMethod: 'upi', tags: ['daily'] },
  { _id: '11', title: 'Monthly Salary', amount: 75000, type: 'income', category: 'Salary', date: '2024-02-05', note: 'February salary credit', paymentMethod: 'bank transfer', tags: ['monthly'] },
  { _id: '12', title: 'Shopping Spree', amount: 6200, type: 'expense', category: 'Shopping', date: '2024-02-14', note: 'Valentines day shopping', paymentMethod: 'card', tags: ['leisure'] },
  { _id: '13', title: 'Medical Checkup', amount: 3500, type: 'expense', category: 'Health', date: '2024-02-08', note: 'Annual health checkup', paymentMethod: 'cash', tags: ['wellness'] },
  { _id: '14', title: 'Internet Bill', amount: 999, type: 'expense', category: 'Utilities', date: '2024-02-10', note: 'Monthly broadband', paymentMethod: 'bank transfer', tags: ['essential', 'monthly'] },
  { _id: '15', title: 'Consulting Income', amount: 12000, type: 'income', category: 'Business', date: '2024-02-25', note: 'Business consulting', paymentMethod: 'bank transfer', tags: [] },
  { _id: '16', title: 'Rent', amount: 18000, type: 'expense', category: 'Housing', date: '2024-02-01', note: 'Monthly apartment rent', paymentMethod: 'bank transfer', tags: ['essential', 'monthly'] },
  { _id: '17', title: 'Groceries', amount: 4200, type: 'expense', category: 'Food', date: '2024-02-12', note: 'Bi-weekly grocery run', paymentMethod: 'upi', tags: ['essential'] },
  { _id: '18', title: 'Movie Tickets', amount: 850, type: 'expense', category: 'Entertainment', date: '2024-02-20', note: 'Weekend movies', paymentMethod: 'card', tags: ['leisure'] },
  { _id: '19', title: 'Monthly Salary', amount: 75000, type: 'income', category: 'Salary', date: '2024-03-05', note: 'March salary credit', paymentMethod: 'bank transfer', tags: ['monthly'] },
  { _id: '20', title: 'Quarterly Bonus', amount: 25000, type: 'income', category: 'Bonus', date: '2024-03-15', note: 'Q1 performance bonus', paymentMethod: 'bank transfer', tags: ['bonus'] },
  { _id: '21', title: 'Rent', amount: 18000, type: 'expense', category: 'Housing', date: '2024-03-01', note: 'Monthly apartment rent', paymentMethod: 'bank transfer', tags: ['essential', 'monthly'] },
  { _id: '22', title: 'New Headphones', amount: 15000, type: 'expense', category: 'Shopping', date: '2024-03-20', note: 'Sony WH-1000XM5', paymentMethod: 'card', tags: ['electronics'] },
  { _id: '23', title: 'Goa Vacation', amount: 22000, type: 'expense', category: 'Travel', date: '2024-03-25', note: 'Weekend trip to Goa', paymentMethod: 'card', tags: ['vacation', 'leisure'] },
  { _id: '24', title: 'Groceries', amount: 5100, type: 'expense', category: 'Food', date: '2024-03-10', note: 'Monthly groceries', paymentMethod: 'upi', tags: ['essential'] },
  { _id: '25', title: 'Design Freelance', amount: 20000, type: 'income', category: 'Freelance', date: '2024-03-28', note: 'UI/UX design project', paymentMethod: 'bank transfer', tags: [] },
];

export const CATEGORIES = [
  'Salary', 'Freelance', 'Investment', 'Business', 'Gift', 'Bonus', 'Other Income',
  'Housing', 'Food', 'Transport', 'Health', 'Entertainment', 'Shopping', 'Utilities', 'Travel', 'Education', 'Personal Care', 'Insurance', 'EMI', 'Subscription', 'Other'
];

export const CATEGORY_COLORS = {
  Housing: '#6366f1', Food: '#f59e0b', Transport: '#10b981', Health: '#ef4444',
  Entertainment: '#8b5cf6', Shopping: '#f97316', Utilities: '#06b6d4', Travel: '#ec4899',
  Salary: '#22c55e', Freelance: '#3b82f6', Investment: '#a855f7', Business: '#14b8a6',
  Education: '#f43f5e', 'Other Income': '#84cc16', Other: '#94a3b8', Gift: '#f472b6',
  Bonus: '#fbbf24', 'Personal Care': '#a78bfa', Insurance: '#60a5fa', EMI: '#475569', Subscription: '#f59e0b'
};

export const mockInsights = {
  totalBalance: 200000,
  totalIncome: 230000,
  totalExpenses: 30000,
  recentActivity: [],
  categoryBreakdown: [],
  monthlyTrend: []
};
