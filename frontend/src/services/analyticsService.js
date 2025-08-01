import api from './api';

export const analyticsService = {
  // Get dashboard analytics
  getDashboardAnalytics: async () => {
    return await api.get('/analytics/dashboard');
  },

  // Get detailed study time analytics
  getStudyTimeAnalytics: async (period = 'week') => {
    return await api.get(`/analytics/study-time?period=${period}`);
  },

  // Get productivity analytics
  getProductivityAnalytics: async (period = 'week') => {
    // This endpoint might need to be implemented in backend
    return await api.get(`/analytics/productivity?period=${period}`);
  },

  // Get goals and progress analytics
  getGoalsAnalytics: async () => {
    // This endpoint might need to be implemented in backend
    return await api.get('/analytics/goals');
  }
};
