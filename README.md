# Finance Dashboard

A full-stack finance dashboard built with React, Express, and MongoDB.

This project supports authenticated transaction management, analytics dashboards, role-based admin controls, and deployment on Vercel.

## Live Demo

- Vercel: https://finance-dashboard-xi-hazel.vercel.app

## What Is Implemented

- JWT authentication (register, login, current user)
- Role-based access (`admin`, `viewer`)
- Protected transaction APIs
- Transaction CRUD for authenticated users
- Combined transaction view:
  - shared mock transactions
  - user-created personal transactions
  - user-specific edits/deletions on mock transactions
- Insights API for totals, category breakdown, trend data, savings rate
- Admin APIs for user management and platform stats
- Frontend pages:
  - Dashboard
  - Transactions
  - Insights
  - Admin Panel (admin only)
- Transaction tools in UI:
  - filter/search/sort
  - table/card view
  - CSV export
  - selection and bulk delete (admin)
- Theme toggle (light/dark)
- Toast notifications
- Vercel serverless API entry (`api/index.js`)

## Tech Stack

### Frontend
- React 18
- React Router
- Recharts
- Axios

### Backend
- Node.js + Express
- MongoDB + Mongoose
- JWT (`jsonwebtoken`)
- Password hashing (`bcryptjs`)

## Project Structure

```text
finance-dashboard/
|- api/
|  |- index.js                # Vercel serverless API app
|- backend/
|  |- config/
|  |  |- db.js
|  |  |- fileStore.js
|  |  |- mockData.js
|  |  |- seed.js
|  |- data/
|  |  |- transactions.json
|  |  |- users.json
|  |- middleware/
|  |  |- auth.js
|  |- models/
|  |  |- Transaction.js
|  |  |- User.js
|  |- routes/
|  |  |- admin.js
|  |  |- auth.js
|  |  |- insights.js
|  |  |- transactions.js
|  |- server.js
|- frontend/
|  |- src/
|  |  |- components/
|  |  |- context/
|  |  |- pages/
|  |  |- data/
|  |  |- App.jsx
|  |  |- index.jsx
|- vercel.json
|- package.json
```

## API Endpoints

### Auth
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`

### Transactions (Protected)
- `GET /api/transactions`
- `POST /api/transactions`
- `PUT /api/transactions/:id`
- `DELETE /api/transactions/:id`

### Insights (Protected)
- `GET /api/insights`

### Admin (Admin only)
- `GET /api/admin/stats`
- `GET /api/admin/users`
- `PUT /api/admin/users/:id/role`
- `PUT /api/admin/users/:id/status`
- `DELETE /api/admin/users/:id`

### Health
- `GET /api/health`

## Local Development

### Prerequisites
- Node.js (project root currently specifies `24.x` in `engines`)
- npm
- MongoDB (local or Atlas)

### Install

```bash
npm run install-all
```

### Run (frontend + backend)

```bash
npm run dev
```

Default URLs:
- Frontend: `http://localhost:3000`
- Backend: `http://localhost:5000`

## Environment Variables

### backend/.env

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/finance_dashboard
JWT_SECRET=replace_with_secure_secret
ADMIN_REGISTRATION_CODE=optional_admin_code
```

### frontend/.env.local (optional)

```env
REACT_APP_API_URL=http://localhost:5000
```

## Scripts

### Root
- `npm run install-all` - install root, backend, and frontend dependencies
- `npm run dev` - run backend and frontend together
- `npm run dev:backend` - run backend only
- `npm run dev:frontend` - run frontend only
- `npm run seed` - seed backend data
- `npm run build` - build frontend

### Backend
- `npm run dev` - start backend with nodemon
- `npm start` - start backend with node

### Frontend
- `npm start` - start React app
- `npm run build` - production build

## Deployment (Vercel)

This repository is configured for Vercel with:
- build output from `frontend/build`
- API routes served by `api/index.js`
- SPA routing in `vercel.json`

Required Vercel environment variables:
- `MONGO_URI`
- `JWT_SECRET`
- `REACT_APP_API_URL` (can be empty for same-origin `/api` routing)

## Notes

- In CI (including Vercel), React build treats warnings as errors when `CI=true`.
- Keep frontend ESLint warnings at zero to avoid failed deployments.
