# 💹 Finance Dashboard

A modern, full-stack finance dashboard built with the **MERN stack** (MongoDB, Express, React, Node.js). Manage transactions, track spending patterns, and gain financial insights with a professional, responsive interface.

---

## 🚀 Quick Start

### Prerequisites
- Node.js v16+
- npm or yarn
- MongoDB (optional — app automatically falls back to mock data)

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

> **Using without MongoDB?** The app automatically switches to built-in mock data when MongoDB is unavailable—no setup required.

---

## 🔐 Authentication & Roles

Two user roles with distinct permissions:

| Role   | Credentials       | Access Level                       |
|--------|-------------------|------------------------------------|
| Admin  | admin / admin123  | Full CRUD access to transactions   |
| Viewer | viewer / viewer123| Read-only access                   |

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
- **Role-based actions**: Admin users can add, edit, and delete transactions
- **CSV export**: Download transaction data for reporting

### Financial Insights
- **Spending analysis**: Top categories with visual indicators
- **Health metrics**: Savings rate assessment with personalized feedback
- **Comparative view**: Month-over-month income and expense trends
- **Interactive charts**: Toggle between monthly and weekly views

### User Experience
- **Dark / Light mode**: Seamless theme switching with persistent preferences
- **Responsive design**: Optimized for desktop, tablet, and mobile devices
- **Data persistence**: All preferences and data stored locally
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
| GET    | /api/transactions    | Retrieve transactions          |
| POST   | /api/transactions    | Create new transaction         |
| PUT    | /api/transactions/:id| Update transaction             |
| DELETE | /api/transactions/:id| Delete transaction             |
| GET    | /api/insights        | Fetch analytics data           |
| POST   | /api/auth/login      | User authentication            |
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
│   ├── config/
│   │   ├── mockData.js             # Sample data
│   │   └── seed.js                 # Database initialization
│   └── server.js                   # Application entry point
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
- **Graceful Fallback**: Full functionality with or without database
- **Persistent Storage**: localStorage for user preferences and offline support
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

## 📋 Environment Configuration

Create a `.env` file in the `backend/` directory:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/finance_dashboard
NODE_ENV=development
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
