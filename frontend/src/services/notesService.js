import api from './api';

export const notesService = {
  // Get all notes for current user
  getNotes: async (filters = {}) => {
    const params = new URLSearchParams(filters);
    return await api.get(`/notes?${params}`);
  },

  // Get single note by ID
  getNote: async (id) => {
    return await api.get(`/notes/${id}`);
  },

  // Create new note
  createNote: async (noteData) => {
    return await api.post('/notes', noteData);
  },

  // Update note
  updateNote: async (id, noteData) => {
    return await api.put(`/notes/${id}`, noteData);
  },

  // Delete note
  deleteNote: async (id) => {
    return await api.delete(`/notes/${id}`);
  },

  // Search notes
  searchNotes: async (query) => {
    return await api.get(`/notes/search?q=${encodeURIComponent(query)}`);
  },

  // Get notes by tag
  getNotesByTag: async (tag) => {
    return await api.get(`/notes/tag/${encodeURIComponent(tag)}`);
  },

  // Get notes by subject
  getNotesBySubject: async (subject) => {
    return await api.get(`/notes/subject/${encodeURIComponent(subject)}`);
  },

  // Export note
  exportNote: async (id, format = 'pdf') => {
    return await api.get(`/notes/${id}/export?format=${format}`, {
      responseType: 'blob'
    });
  },
};

export const analyticsService = {
  // Get dashboard overview
  getDashboardOverview: async () => {
    return await api.get('/analytics/dashboard');
  },

  // Get detailed study analytics
  getStudyAnalytics: async (timeRange = 'week') => {
    return await api.get(`/analytics/study-time?range=${timeRange}`);
  },

  // Get subject performance analytics
  getSubjectAnalytics: async () => {
    return await api.get('/analytics/subjects');
  },

  // Get productivity analytics
  getProductivityAnalytics: async () => {
    return await api.get('/analytics/productivity');
  },

  // Get goal progress
  getGoalProgress: async () => {
    return await api.get('/analytics/goals');
  },

  // Get study streak data
  getStudyStreak: async () => {
    return await api.get('/analytics/streak');
  },

  // Get weekly summary
  getWeeklySummary: async () => {
    return await api.get('/analytics/weekly-summary');
  },

  // Export analytics data
  exportAnalytics: async (format = 'csv') => {
    return await api.get(`/analytics/export?format=${format}`, {
      responseType: 'blob'
    });
  },
};
