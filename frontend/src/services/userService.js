import api from './api';

export const userService = {
  // Get user profile
  getProfile: async () => {
    return await api.get('/users/profile');
  },

  // Update user profile
  updateProfile: async (profileData) => {
    return await api.put('/users/profile', profileData);
  },

  // Upload user avatar
  uploadAvatar: async (file) => {
    const formData = new FormData();
    formData.append('avatar', file);
    return await api.post('/users/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  // Get user gamification data
  getGamificationData: async () => {
    return await api.get('/users/gamification');
  },

  // Update user preferences
  updatePreferences: async (preferences) => {
    return await api.put('/users/preferences', preferences);
  },

  // Get user badges
  getBadges: async () => {
    return await api.get('/users/badges');
  },

  // Get user achievements
  getAchievements: async () => {
    return await api.get('/users/achievements');
  },

  // Change password
  changePassword: async (currentPassword, newPassword) => {
    return await api.post('/users/change-password', {
      currentPassword,
      newPassword
    });
  },

  // Export user data
  exportUserData: async (format = 'json') => {
    return await api.get(`/users/export?format=${format}`, {
      responseType: 'blob'
    });
  },

  // Delete user account
  deleteAccount: async (password) => {
    return await api.delete('/users/account', {
      data: { password }
    });
  },

  // Get user statistics
  getUserStats: async () => {
    return await api.get('/users/stats');
  },

  // Update study goals
  updateStudyGoals: async (goals) => {
    return await api.put('/users/study-goals', goals);
  },
};
