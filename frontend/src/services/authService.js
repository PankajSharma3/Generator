import { apiMethods } from './api';

const authService = {
  // Login user
  login: async (credentials) => {
    return apiMethods.post('/auth/login', credentials);
  },

  // Register new user
  signup: async (userData) => {
    return apiMethods.post('/auth/signup', userData);
  },

  // Get current user
  getCurrentUser: async () => {
    return apiMethods.get('/auth/me');
  },

  // Update user profile
  updateProfile: async (profileData) => {
    return apiMethods.put('/auth/profile', profileData);
  },

  // Logout (client-side only)
  logout: () => {
    // Clear any client-side data if needed
    localStorage.removeItem('auth-store');
  }
};

export default authService;