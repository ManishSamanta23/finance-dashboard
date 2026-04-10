<h1 align="center">Finance Dashboard</h1>

<p align="center">
  Full-stack personal finance platform with secure authentication, role-based access, analytics insights, and Vercel deployment.
</p>

<p align="center">
  <a href="https://finance-dashboard-xi-hazel.vercel.app"><img src="https://img.shields.io/badge/Live%20Demo-Vercel-000000?logo=vercel&logoColor=white" alt="Live Demo"></a>
  <img src="https://img.shields.io/badge/Frontend-React%2018-61dafb?logo=react&logoColor=white" alt="React 18">
  <img src="https://img.shields.io/badge/Backend-Node.js%20%2B%20Express-339933?logo=node.js&logoColor=white" alt="Node and Express">
  <img src="https://img.shields.io/badge/Database-MongoDB-47A248?logo=mongodb&logoColor=white" alt="MongoDB">
</p>

---

## Live Application

- https://finance-dashboard-xi-hazel.vercel.app

## Table of Contents

- [Overview](#overview)
- [Implemented Capabilities](#implemented-capabilities)
- [Architecture](#architecture)
- [Technology Stack](#technology-stack)
- [API Reference](#api-reference)
- [Project Structure](#project-structure)
- [Local Development](#local-development)
- [Environment Variables](#environment-variables)
- [Scripts](#scripts)
- [Deployment on Vercel](#deployment-on-vercel)
- [Operational Notes](#operational-notes)

## Overview

Finance Dashboard is a role-aware transaction and analytics application built with a React frontend and Express + MongoDB backend.

The current implementation includes:

- User authentication and authorization using JWT
- Protected transaction management endpoints
- Admin-only user management and stats endpoints
- Insights dashboards (trend, categories, totals)
- Serverless API entry for Vercel deployment

## Implemented Capabilities

### Authentication and Access

- Register user account
- Login with JWT issuance
- Fetch current authenticated user
- Role model: `admin`, `viewer`
- Route protection via auth middleware

### Transactions

- Create, read, update, and delete transactions
- Protected transaction APIs
- Per-user transaction view logic combining:
  - shared mock transactions
  - user personal transactions
  - user-specific edits/deletes on mock entries
- Filter, search, and sort in UI
- Table and card view modes
- CSV export from transactions view
- Bulk selection and bulk delete for admin

### Insights and Dashboard

- Summary metrics (balance, income, expenses)
- Savings rate and transaction count
- Expense category breakdown
- Monthly trend data
- Dashboard widgets and charts in React/Recharts

### Admin Panel

- List all users
- Update user role
- Toggle user active status
- Delete user (with self-delete restriction)
- Platform-level stats overview

### UI Experience

- Dark/light mode toggle
- Toast notifications
- Protected routes for authenticated areas

## Architecture

```text
Frontend (React)
  |-- AuthContext + AppContext
  |-- Pages: Dashboard / Transactions / Insights / Admin
  |-- Charts: Recharts
  |
  v
Backend (Express API)
  |-- /api/auth
  |-- /api/transactions
  |-- /api/insights
  |-- /api/admin
  |
  v
MongoDB (Mongoose)
```

## Technology Stack

| Layer | Tools |
|---|---|
| Frontend | React 18, React Router, Recharts, Axios |
| Backend | Node.js, Express |
| Database | MongoDB, Mongoose |
| Security | jsonwebtoken, bcryptjs |
| Deployment | Vercel (`api/index.js`, `vercel.json`) |

## API Reference

| Area | Method | Endpoint | Access |
|---|---|---|---|
| Auth | POST | `/api/auth/register` | Public |
| Auth | POST | `/api/auth/login` | Public |
| Auth | GET | `/api/auth/me` | Protected |
| Transactions | GET | `/api/transactions` | Protected |
| Transactions | POST | `/api/transactions` | Protected |
| Transactions | PUT | `/api/transactions/:id` | Protected |
| Transactions | DELETE | `/api/transactions/:id` | Protected |
| Insights | GET | `/api/insights` | Protected |
| Admin | GET | `/api/admin/stats` | Admin only |
| Admin | GET | `/api/admin/users` | Admin only |
| Admin | PUT | `/api/admin/users/:id/role` | Admin only |
| Admin | PUT | `/api/admin/users/:id/status` | Admin only |
| Admin | DELETE | `/api/admin/users/:id` | Admin only |
| Health | GET | `/api/health` | Public |

## Project Structure

```text
finance-dashboard/
|- api/
|  |- index.js
|- backend/
|  |- config/
|  |- data/
|  |- middleware/
|  |- models/
|  |- routes/
|  |- server.js
|- frontend/
|  |- src/
|  |  |- components/
|  |  |- context/
|  |  |- pages/
|  |  |- data/
|  |  |- utils/
|  |  |  |- api.js (centralized API_BASE_URL configuration)
|  |  |- App.jsx
|  |  |- index.jsx
|  |- .env (local development)
|  |- .env.example
|  |- .env.production
|- vercel.json
|- package.json
```

## Local Development

### Prerequisites

- Node.js (root `package.json` currently declares `24.x`)
- npm
- MongoDB local instance or MongoDB Atlas

### Install dependencies

```bash
npm run install-all
```

### Run frontend and backend

```bash
npm run dev
```

### Local URLs

- Frontend: `http://localhost:3000`
- Backend: `http://localhost:5000`

## Environment Variables

### Backend (`backend/.env`)

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/finance_dashboard
JWT_SECRET=replace_with_secure_secret
ADMIN_REGISTRATION_CODE=optional_admin_code
```

### Frontend (`frontend/.env`) - Local Development

```env
# Local development: backend runs on localhost:5000
REACT_APP_API_URL=http://localhost:5000
```

### Frontend (`frontend/.env.production`) - Production Reference

```env
# Production deployment: update to your deployed backend URL
# Examples:
# REACT_APP_API_URL=/api                    (for same-origin deployment)
# REACT_APP_API_URL=https://your-backend.com (for external service)
REACT_APP_API_URL=https://your-backend-url.com
```

**Critical for Vercel Deployment:** Set `REACT_APP_API_URL` in Vercel project Environment Variables to ensure all users (not just localhost) can connect to the backend. This variable is read by `frontend/src/utils/api.js`.

## Scripts

### Root scripts

- `npm run install-all` installs root, backend, and frontend dependencies
- `npm run dev` starts backend + frontend concurrently
- `npm run dev:backend` starts backend only
- `npm run dev:frontend` starts frontend only
- `npm run seed` runs backend seed script
- `npm run build` builds frontend production assets

### Backend scripts

- `npm run dev` starts backend with nodemon
- `npm start` starts backend with node

### Frontend scripts

- `npm start` starts React dev server
- `npm run build` creates production build

## Deployment on Vercel

This repository is configured for Vercel deployment with serverless API handling.

**Live Demo:** https://finance-dashboard-xi-hazel.vercel.app

### Deployment Configuration

- Build output directory: `frontend/build`
- Serverless API entry: `api/index.js`
- SPA route handling: `vercel.json`

### Required Environment Variables in Vercel

Set these in your Vercel project **Settings → Environment Variables**:

| Variable | Value | Purpose |
|---|---|---|
| `MONGO_URI` | MongoDB connection string | Database connection |
| `JWT_SECRET` | Secure random string | Token signing secret |
| `REACT_APP_API_URL` | Backend URL | Frontend API endpoint |

### Setting `REACT_APP_API_URL` for Vercel

This is critical for the app to work for other users visiting your Vercel link.

**Option A: Same-origin (Recommended for Vercel)**
```
REACT_APP_API_URL=/api
```
Use this if your backend is also deployed on Vercel via `api/index.js`.

**Option B: External backend service**
```
REACT_APP_API_URL=https://your-backend-service.com
```
Use this if your backend runs on Heroku, Railway, Render, or another platform.

### Why This Matters

**Problem:** If `REACT_APP_API_URL` is hardcoded to `http://localhost:5000`, users on other devices get `ERR_CONNECTION_REFUSED` when they try to create transactions.

**Solution:** The frontend now reads `REACT_APP_API_URL` from environment variables via `frontend/src/utils/api.js`. Set this in Vercel, and all users will connect to the correct backend.

## Operational Notes

- In CI environments (including Vercel), React treats warnings as errors when `CI=true`.
- Keep frontend ESLint warnings at zero to prevent build failures.
- The `fs.F_OK` deprecation warning is dependency/runtime noise and not the actual deployment blocker by itself.
- **Port conflicts (local dev):** If port 5000 is in use, kill Node processes: `taskkill /F /IM node.exe` (Windows) or `pkill node` (Mac/Linux).
- **Multi-user deployment:** Always set `REACT_APP_API_URL` in Vercel environment variables; otherwise, users on other devices cannot connect to the backend.
