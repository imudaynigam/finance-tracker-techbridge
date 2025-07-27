import axios from 'axios';

const API_BASE_URL = 'http://localhost:3001/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 second timeout
  withCredentials: true, // Include credentials for CORS
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log('API Request:', config.method?.toUpperCase(), config.url);
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => {
    console.log('API Response:', response.status, response.config.url);
    return response;
  },
  (error) => {
    console.error('API Response Error:', error.response?.status, error.config?.url, error.message);
    
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Don't redirect to /login, let the component handle it
    }
    
    if (error.code === 'ECONNABORTED') {
      console.error('Request timeout - backend might not be running');
    }
    
    if (error.code === 'ERR_NETWORK') {
      console.error('Network error - check if backend is running on port 3001');
    }
    
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (data: { email: string; password: string; firstName?: string; lastName?: string }) =>
    api.post('/auth/register', data),
  
  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),
  
  getProfile: () => api.get('/auth/profile'),
};

// Transactions API
export const transactionsAPI = {
  getAll: (params?: {
    page?: number;
    limit?: number;
    type?: string;
    categoryId?: number;
    startDate?: string;
    endDate?: string;
    search?: string;
  }) => api.get('/transactions', { params }),
  
  getAllForAnalytics: (params?: {
    type?: string;
    categoryId?: number;
    startDate?: string;
    endDate?: string;
  }) => api.get('/analytics/transactions', { params }),
  
  getById: (id: number) => api.get(`/transactions/${id}`),
  
  create: (data: {
    amount: number;
    type: 'income' | 'expense';
    description: string;
    date: string;
    categoryId: number;
  }) => api.post('/transactions', data),
  
  update: (id: number, data: {
    amount?: number;
    type?: 'income' | 'expense';
    description?: string;
    date?: string;
    categoryId?: number;
  }) => api.put(`/transactions/${id}`, data),
  
  delete: (id: number) => api.delete(`/transactions/${id}`),
};

// Analytics API
export const analyticsAPI = {
  getMonthlyOverview: (year: number, month: number) =>
    api.get('/analytics/monthly-overview', { params: { year, month } }),
  
  getYearlyOverview: (year: number) =>
    api.get('/analytics/yearly-overview', { params: { year } }),
  
  getCategoryBreakdown: (year: number, month: number) =>
    api.get('/analytics/category-breakdown', { params: { year, month } }),
  
  getTrends: (year: number) =>
    api.get('/analytics/trends', { params: { year } }),
};

// Categories API
export const categoriesAPI = {
  getAll: () => api.get('/categories'),
  
  create: (data: { name: string; description?: string; color?: string }) =>
    api.post('/categories', data),
    
  update: (id: number, data: { name?: string; description?: string; color?: string }) =>
    api.put(`/categories/${id}`, data),
    
  delete: (id: number) => api.delete(`/categories/${id}`),
};

// Admin API
export const adminAPI = {
  // System overview
  getSystemOverview: () => api.get('/admin/overview'),
  
  // System analytics
  getSystemAnalytics: (period?: number) => 
    api.get('/admin/analytics', { params: { period } }),
  
  // User management
  getAllUsers: () => api.get('/admin/users'),
  
  createUser: (data: {
    email: string;
    password: string;
    firstName?: string;
    lastName?: string;
    role?: 'admin' | 'user' | 'read-only';
  }) => api.post('/admin/users', data),
  
  getUserDetails: (id: number) => api.get(`/admin/users/${id}`),
  
  updateUser: (id: number, data: {
    email?: string;
    firstName?: string;
    lastName?: string;
    role?: 'admin' | 'user' | 'read-only';
    password?: string;
  }) => api.put(`/admin/users/${id}`, data),
  
  deleteUser: (id: number) => api.delete(`/admin/users/${id}`),
};

export default api; 