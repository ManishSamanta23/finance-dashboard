# 💹 FinTrack — Finance Dashboard

A full-stack finance dashboard built with the **MERN stack** (MongoDB, Express, React, Node.js). Track income, expenses, and spending patterns with a clean, responsive UI.

---

## 🚀 Quick Start

### Prerequisites
- Node.js v16+
- npm or yarn
- MongoDB (optional — app runs on mock data without it)

### Installation

```bash
# Clone / unzip the project
cd finance-dashboard

# Install all dependencies (root + backend + frontend)
npm run install-all

# (Optional) Seed MongoDB with sample data
npm run seed

# Start both servers concurrently
npm run dev
```

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000

> **No MongoDB?** No problem. The app automatically falls back to built-in mock data stored in localStorage. You get the full experience without any database setup.

---

## 🔐 Demo Login / Role Switching

Use the **role switcher** in the sidebar to toggle between:

| Role   | Credentials       | Permissions                        |
|--------|-------------------|------------------------------------|
| Admin  | admin / admin123  | View + Add + Edit + Delete         |
| Viewer | viewer / viewer123| View only (read-only UI)           |

Switch roles instantly using the dropdown in the sidebar — no page reload needed.

---

## ✨ Features

### Dashboard Overview
- **4 Summary Cards**: Net Balance, Total Income, Total Expenses, Savings Rate
- **Area Chart**: Monthly income vs expense trend (Recharts)
- **Donut Chart**: Spending breakdown by category
- **Recent Transactions**: Quick view of last 6 transactions

### Transactions
- Full filterable, sortable transaction list
- Search by title or note
- Filter by type (income/expense) and category
- Sort by date, amount, or title (asc/desc)
- Paginated table (10 per page)
- **Admin only**: Add, edit, delete transactions
- **Export to CSV** with one click

### Insights & Analytics
- Top spending category with visual indicator
- Savings rate health score with feedback
- Month-over-month income and expense comparison
- Monthly grouped bar chart
- Full category expense breakdown with progress bars

### Role-Based UI (RBAC)
- Viewer: Read-only dashboard, no edit/delete buttons
- Admin: Full CRUD access, add transaction button in header
- Role persisted in localStorage across sessions

### UX & Design
- 🌙 Dark / Light mode toggle (persisted)
- 📱 Fully responsive (mobile, tablet, desktop)
- 💾 Data persisted in localStorage
- Empty state handling throughout
- Smooth transitions and micro-animations
- Custom color-coded categories with emojis

---

## 🗂 Project Structure

```
finance-dashboard/
├── backend/
│   ├── models/
│   │   └── Transaction.js       # Mongoose schema
│   ├── routes/
│   │   ├── transactions.js      # CRUD API
│   │   ├── auth.js              # Role-based login
│   │   └── insights.js          # Analytics endpoint
│   ├── config/
│   │   ├── mockData.js          # Seed/fallback data
│   │   └── seed.js              # DB seeder script
│   ├── server.js                # Express app entry
│   └── .env.example             # Environment variables
│
├── frontend/
│   └── src/
│       ├── components/
│       │   ├── layout/
│       │   │   └── Layout.js        # Sidebar + Topbar shell
│       │   ├── dashboard/
│       │   │   ├── Dashboard.js
│       │   │   ├── SummaryCards.js
│       │   │   ├── BalanceTrend.js
│       │   │   ├── SpendingPie.js
│       │   │   └── RecentTransactions.js
│       │   ├── transactions/
│       │   │   ├── Transactions.js
│       │   │   └── TransactionModal.js
│       │   └── insights/
│       │       └── Insights.js
│       ├── context/
│       │   └── AppContext.js        # Global state (useReducer)
│       ├── data/
│       │   └── mockData.js          # Mock transactions & constants
│       ├── index.css                # Design system & global styles
│       ├── App.js
│       └── index.js
│
├── package.json                 # Root scripts (concurrently)
└── README.md
```

---

## 🛠 Tech Stack

| Layer     | Technology                |
|-----------|---------------------------|
| Frontend  | React 18, Recharts        |
| Styling   | Custom CSS (CSS Variables)|
| State     | React Context + useReducer|
| Backend   | Node.js + Express         |
| Database  | MongoDB + Mongoose        |
| Fonts     | Syne (headings), DM Sans  |

---

## 🌐 API Endpoints

| Method | Endpoint             | Description                        |
|--------|----------------------|------------------------------------|
| GET    | /api/transactions    | Get all transactions (with filters)|
| POST   | /api/transactions    | Create new transaction             |
| PUT    | /api/transactions/:id| Update transaction                 |
| DELETE | /api/transactions/:id| Delete transaction                 |
| GET    | /api/insights        | Get analytics & summary data       |
| POST   | /api/auth/login      | Simulate role-based login          |
| GET    | /api/health          | Health check                       |

### Filter params for GET /api/transactions:
```
?type=expense&category=Food&search=grocery&sortBy=date&order=desc
```

---

## 📦 Environment Variables

Create a `.env` file in the `backend/` directory:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/finance_dashboard
JWT_SECRET=your_secret_key
NODE_ENV=development
```

---

## 🎨 Design Decisions

- **CSS Variables** for theming — clean dark/light mode with zero JS
- **useReducer + Context** for scalable state management without external libs
- **localStorage persistence** — transactions and preferences survive page refresh
- **Graceful degradation** — works without MongoDB using mock data
- **Mobile-first** — sidebar collapses on mobile with overlay
- **Color system** — each category has a consistent color across all charts

---

## 📸 Pages

1. **Dashboard** — Overview with summary cards and charts
2. **Transactions** — Full list with search, filter, sort, export
3. **Insights** — Deep analytics with comparisons and breakdowns

---

## 🔧 Scripts

| Command               | Description                       |
|-----------------------|-----------------------------------|
| `npm run install-all` | Install all dependencies          |
| `npm run dev`         | Start frontend + backend together |
| `npm run dev:backend` | Start only the backend            |
| `npm run dev:frontend`| Start only the frontend           |
| `npm run seed`        | Seed MongoDB with sample data     |
| `npm run build`       | Build frontend for production     |
