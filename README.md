Personal Finance Tracker
A full stack web application to manage income, expenses, and view financial analytics. Built with React, Node.js, Express, PostgreSQL/MySQL, and Redis.

Features
User Authentication
JWT-based authentication
Role-Based Access Control (admin, user, read-only)
Protected routes and conditional UI rendering
Transaction Management
Add, edit, delete, and categorize transactions (income/expense)
Search and filter transactions
Pagination and virtual scrolling for large lists
Dashboard & Analytics
Monthly/yearly spending overview
Category-wise expense breakdown
Income vs Expense trends
Interactive charts (Pie, Line, Bar)
Performance & Security
Redis caching for analytics and category lists
API rate limiting
Protection against XSS and SQL Injection

Tech Stack
Frontend: React 18+, Vite, TypeScript, Chart.js/Recharts, Tailwind CSS
Backend: Node.js, Express.js, TypeScript
Database: PostgreSQL / MySQL
Caching: Redis
API Docs: Swagger / OpenAPI

Project Structure
/frontend   # React app
/backend    # Node.js + Express API
/README.md  # Project overview and setup

Getting Started
Prerequisites
Node.js (v18+)
npm or yarn
PostgreSQL or MySQL
Redis

Setup
1. Clone the repository
git clone https://github.com/your-username/finance-tracker.git
cd finance-tracker

2. Frontend
cd frontend
npm install
npm run dev

3. Backend
cd backend
npm install
npm run dev

4. Database
Create a database in PostgreSQL/MySQL.
Run migrations (see backend README or scripts).

API Documentation
Swagger UI available at /api/docs when backend is running.

Demo Credentials
Role	Username	Password
Admin	admin@demo.com	admin123
User	user@demo.com	user123
Read-only	view@demo.com	view123

Performance
Analytics data cached for 15 minutes
Category lists cached for 1 hour
Rate limits: Auth (5/15min), Transactions (100/hr), Analytics (50/hr)
