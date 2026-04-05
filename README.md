# 💹 Finance Dashboard

A modern, full-stack finance dashboard built with the **MERN stack** (MongoDB, Express, React, Node.js). Manage transactions, track spending patterns, and gain financial insights with a professional, responsive interface.

---

## 🚀 Quick Start

### Prerequisites
- Node.js 24.x
- npm or yarn
- MongoDB (local or Atlas)

### Installation

```bash
# Navigate to project directory
cd finance-dashboard

# Install all dependencies
npm run install-all

# Start development servers
npm run dev
```

**Access the application:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

> **Using without MongoDB?** The app can still fall back to mock data in development, but login, registration, and saved transactions require MongoDB for the full experience.

---

## 🔐 Authentication & Roles

Two user roles with distinct permissions:

| Role   | Access Level                       |
|--------|------------------------------------|
| Admin  | Full dashboard and transaction management |
| Viewer | Read-only access for dashboard data |

Accounts are created through the registration form. Transactions are scoped to the logged-in user.

---

## ✨ Core Features

### Dashboard
- **Summary metrics**: Balance, income, expenses, savings rate
- **Trend analysis**: Monthly income vs. expense visualization
- **Category breakdown**: Pie chart of spending by category
- **Recent activity**: Quick view of latest transactions

### Transactions Management
- **Smart filtering**: Search by title/note, filter by type and category
- **Data organization**: Sortable columns, paginated view
- **Account isolation**: Each logged-in user sees only their own transactions
- **CSV export**: Download transaction data for reporting

### Financial Insights
- **Spending analysis**: Top categories with visual indicators
- **Health metrics**: Savings rate assessment with personalized feedback
- **Comparative view**: Month-over-month income and expense trends
- **Interactive charts**: Toggle between monthly and weekly views

### User Experience
- **Dark / Light mode**: Seamless theme switching with persistent preferences
- **Responsive design**: Optimized for desktop, tablet, and mobile devices
- **Persistent data**: Preferences stored locally, transactions stored per account
- **Professional typography**: Carefully selected font stack for financial clarity

---

## 🛠 Technology Stack

| Layer            | Technology                  |
|------------------|-----------------------------|
| Frontend         | React 18, Recharts          |
| Styling          | CSS Variables, Custom CSS   |
| State Management | React Context + useReducer  |
| Backend          | Express.js, Node.js         |
| Database         | MongoDB + Mongoose          |
| Typography       | Plus Jakarta Sans, Inter, JetBrains Mono |

---

## 🌐 API Endpoints

| Method | Endpoint              | Purpose                        |
|--------|----------------------|--------------------------------|
| POST   | /api/auth/register   | Create a new user              |
| GET    | /api/transactions    | Retrieve transactions          |
| POST   | /api/transactions    | Create new transaction         |
| PUT    | /api/transactions/:id| Update transaction             |
| DELETE | /api/transactions/:id| Delete transaction             |
| GET    | /api/insights        | Fetch analytics data           |
| POST   | /api/auth/login      | User authentication            |
| GET    | /api/auth/me         | Current logged-in user         |
| GET    | /api/admin/stats     | Admin statistics               |
| GET    | /api/admin/users     | Admin user list                |
| GET    | /api/health          | System health check            |

---

## 📁 Project Structure

```
finance-dashboard/
├── backend/
│   ├── models/
│   │   └── Transaction.js          # Data schema
│   ├── routes/
│   │   ├── transactions.js         # CRUD operations
│   │   ├── auth.js                 # Authentication
│   │   └── insights.js             # Analytics
│   ├── middleware/
│   │   └── auth.js                 # JWT protection helpers
│   ├── config/
│   │   ├── mockData.js             # Sample data
│   │   └── seed.js                 # Database initialization
│   └── server.js                   # Application entry point
│
├── api/
│   └── index.js                    # Vercel serverless API entry point
│
├── frontend/
│   └── src/
│       ├── components/
│       │   ├── layout/             # App shell
│       │   ├── dashboard/          # Overview page
│       │   ├── transactions/       # Transaction management
│       │   └── insights/           # Analytics page
│       ├── context/                # State management
│       ├── data/                   # Constants & mock data
│       ├── index.css               # Design system
│       └── App.jsx                 # Root component
│
└── package.json                    # Project configuration
```

---

## 🎨 Design & Architecture

- **CSS Variables**: Dynamic theming with automatic dark/light mode
- **Context API**: Scalable state management without additional dependencies
- **Responsive Layout**: Mobile-first approach with adaptive sidebar
- **Graceful Fallback**: Development mock mode when the database is unavailable
- **Persistent Storage**: localStorage for user preferences and per-account transaction cache
- **Consistent Styling**: Category-based color coding across all visualizations

---

## 🔧 Development Scripts

| Command               | Description                        |
|-----------------------|------------------------------------|
| `npm run install-all` | Install dependencies               |
| `npm run dev`         | Start both servers concurrently    |
| `npm run dev:backend` | Backend only                       |
| `npm run dev:frontend`| Frontend only                      |
| `npm run seed`        | Populate MongoDB with sample data  |
| `npm run build`       | Production build                   |

---

## 🚀 Vercel Deployment

This project is deployed as a single Vercel project:

- Live URL: https://finance-dashboard-xi-hazel.vercel.app

- Frontend builds from `frontend/`
- API runs from `api/index.js`
- Static assets and SPA routes are handled by `vercel.json`

### Vercel environment variables

Set these in Vercel project settings:

```env
MONGO_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_secure_jwt_secret
REACT_APP_API_URL=
```

### MongoDB Atlas

- Add `0.0.0.0/0` to Network Access for Vercel
- Confirm the database user and password in `MONGO_URI`
- Redeploy after any secret changes

---

## 📋 Environment Configuration

Create a `.env` file in the `backend/` directory for local development:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/finance_dashboard
JWT_SECRET=your_local_jwt_secret
NODE_ENV=development
```

Create `frontend/.env.local` for local frontend API calls:

```env
REACT_APP_API_URL=http://localhost:5000
```

---

## 📱 Pages & Views

1. **Dashboard** — Summary cards, trends, and category breakdown
2. **Transactions** — Complete transaction list with filtering and management
3. **Insights** — Detailed analytics and financial health assessment

---

## 🌟 Key Improvements

- **Professional typography system** with optimized font selection for financial clarity
- **Automatic database fallback** for zero-friction development and testing
- **Dark mode optimization** with refined chart and tooltip styling
- **Role-based access control** with intuitive permission enforcement
- **Advanced filtering and sorting** for detailed transaction analysis
