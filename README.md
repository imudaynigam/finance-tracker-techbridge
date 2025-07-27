# Personal Finance Tracker

A full-stack personal finance management application built with React, Node.js, and TypeScript. This application helps users track their income, expenses, and financial goals with role-based access control.

## 🚀 Features

### Authentication & Authorization
- **User Registration & Login** - Secure JWT-based authentication
- **Role-Based Access Control** - Admin, User, and Read-only roles
- **Protected Routes** - Role-specific access to features

### Transaction Management
- **Add/Edit/Delete Transactions** - Full CRUD operations
- **Income & Expense Tracking** - Categorize and track all financial activities
- **Search & Filter** - Find transactions by category, type, or description
- **Pagination** - Efficient handling of large transaction lists

### Dashboard & Analytics
- **Financial Overview** - Total balance, income, and expenses
- **Interactive Charts** - Pie charts for category breakdown, line charts for trends
- **Real-time Statistics** - Savings rate, financial health indicators
- **Monthly Trends** - Income vs expenses over time

### User Interface
- **Modern Design** - Clean, responsive UI with Tailwind CSS
- **Dark/Light Mode** - Theme support
- **Mobile Responsive** - Works on all device sizes
- **Loading States** - Smooth user experience

## 🛠️ Tech Stack

### Frontend
- **React 18** - Modern React with hooks
- **TypeScript** - Type-safe development
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **Shadcn/ui** - Beautiful component library
- **Recharts** - Interactive charts and graphs
- **Axios** - HTTP client for API calls

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **TypeScript** - Type-safe development
- **TypeORM** - Object-Relational Mapping
- **PostgreSQL** - Database (simplified mode available)
- **JWT** - JSON Web Tokens for authentication
- **bcryptjs** - Password hashing
- **Swagger/OpenAPI** - API documentation

### Development Tools
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Git** - Version control

## 📦 Installation

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- PostgreSQL (optional - simplified mode available)

### Quick Start

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd finance-tracker
   ```

2. **Install dependencies**
   ```bash
   # Install frontend dependencies
   cd frontend
   npm install

   # Install backend dependencies
   cd ../backend
   npm install
   ```

3. **Set up environment variables**
   ```bash
   # Create .env file in backend directory
   cd backend
   cp .env.example .env
   ```

   Edit the `.env` file:
   ```env
   # Database (optional for simplified mode)
   DB_HOST=localhost
   DB_PORT=5432
   DB_USERNAME=postgres
   DB_PASSWORD=your_password
   DB_DATABASE=finance_tracker

   # JWT
   JWT_SECRET=your_super_secret_jwt_key
   JWT_EXPIRES_IN=1d

   # Server
   PORT=5000
   ```

4. **Start the application**
   ```bash
   # Start backend (in backend directory)
   npm run build
   npm start

   # Start frontend (in frontend directory)
   npm run dev
   ```

5. **Access the application**
   - Frontend: http://localhost:8080 (or 8081)
   - Backend API: http://localhost:5000
   - API Documentation: http://localhost:5000/api/docs

## 🔐 Demo Credentials

The application comes with pre-configured demo users:

- **Admin User**
  - Email: `admin@demo.com`
  - Password: `admin123`
  - Permissions: Full access to all features

- **Regular User**
  - Email: `user@demo.com`
  - Password: `user123`
  - Permissions: Manage own transactions

- **Read-only User**
  - Email: `view@demo.com`
  - Password: `view123`
  - Permissions: View-only access

## 📁 Project Structure

```
finance-tracker/
├── frontend/                 # React frontend application
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── contexts/        # React contexts
│   │   ├── services/        # API services
│   │   ├── hooks/          # Custom hooks
│   │   └── lib/            # Utility functions
│   ├── public/             # Static assets
│   └── package.json
├── backend/                 # Node.js backend API
│   ├── src/
│   │   ├── controllers/    # API controllers
│   │   ├── models/         # Database models
│   │   ├── routes/         # API routes
│   │   ├── middleware/     # Express middleware
│   │   ├── config/         # Configuration files
│   │   └── utils/          # Utility functions
│   └── package.json
└── README.md
```

## 🔧 Development

### Available Scripts

**Frontend:**
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

**Backend:**
```bash
npm run dev          # Start development server
npm run build        # Build TypeScript
npm start            # Start production server
npm run seed         # Seed database with demo data
```

### API Endpoints

The backend provides the following API endpoints:

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile
- `GET /api/transactions` - Get transactions
- `POST /api/transactions` - Create transaction
- `PUT /api/transactions/:id` - Update transaction
- `DELETE /api/transactions/:id` - Delete transaction
- `GET /api/categories` - Get categories
- `GET /api/analytics/*` - Analytics endpoints

## 🚀 Deployment

### Frontend Deployment
The frontend can be deployed to any static hosting service:
- Vercel
- Netlify
- GitHub Pages
- AWS S3

### Backend Deployment
The backend can be deployed to:
- Heroku
- Railway
- DigitalOcean
- AWS EC2

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

If you encounter any issues or have questions:
1. Check the API documentation at http://localhost:5000/api/docs
2. Review the console logs for error messages
3. Ensure all dependencies are installed
4. Verify environment variables are set correctly

## 🎯 Roadmap

- [ ] Export functionality (PDF, CSV)
- [ ] Budget planning and tracking
- [ ] Financial goals and milestones
- [ ] Multi-currency support
- [ ] Mobile app (React Native)
- [ ] Advanced analytics and reporting
- [ ] Integration with banking APIs
- [ ] Push notifications
- [ ] Data backup and sync

---

**Built with ❤️ using modern web technologies**
