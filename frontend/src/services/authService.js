import api from './api';

export const authService = {
  // Register new user
  register: async (userData) => {
    try {
      // Ensure clean data format (prevent double stringification)
      const cleanData = {
        name: String(userData.name || '').trim(),
        email: String(userData.email || '').trim().toLowerCase(),
        password: String(userData.password || '')
      };
      
      console.log('AuthService - Sending registration data:', cleanData);
      
      // Make direct fetch call to avoid any axios serialization issues
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(cleanData)
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }
      
      if (data.token) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
      }
      
      return data;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  },

  // Login user
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    if (response.token) {
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
    }
    return response;
  },

  // Google OAuth login
  googleLogin: async (googleUserData) => {
    const response = await api.post('/auth/google', googleUserData);
    if (response.token) {
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
    }
    return response;
  },

  // Logout user
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  // Forgot password
  forgotPassword: async (email) => {
    return await api.post('/auth/forgot-password', { email });
  },

  // Reset password
  resetPassword: async (token, password) => {
    return await api.post('/auth/reset-password', { token, password });
  },

  // Verify email
  verifyEmail: async (token) => {
    return await api.post('/auth/verify-email', { token });
  },

  // Refresh token
  refreshToken: async () => {
    const response = await api.post('/auth/refresh');
    if (response.token) {
      localStorage.setItem('token', response.token);
    }
    return response;
  },

  // Get current user
  getCurrentUser: async () => {
    return await api.get('/auth/me');
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  },

  // Get stored user data
  getStoredUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },
};
