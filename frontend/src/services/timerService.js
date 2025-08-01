import api from './api';

export const timerService = {
  // Start timer session
  startSession: async (sessionData) => {
    return await api.post('/timer/start', sessionData);
  },

  // Pause timer session
  pauseSession: async (sessionId) => {
    return await api.post(`/timer/${sessionId}/pause`);
  },

  // Resume timer session
  resumeSession: async (sessionId) => {
    return await api.post(`/timer/${sessionId}/resume`);
  },

  // Complete timer session
  completeSession: async (sessionId, completionData) => {
    return await api.post(`/timer/${sessionId}/complete`, completionData);
  },

  // Get timer session history
  getSessionHistory: async (limit = 10) => {
    return await api.get(`/timer/history?limit=${limit}`);
  },

  // Get current active session
  getActiveSession: async () => {
    return await api.get('/timer/active');
  },

  // Get timer statistics
  getTimerStats: async (timeRange = 'week') => {
    return await api.get(`/timer/stats?range=${timeRange}`);
  },
};

export const aiService = {
  // Generate study plan
  generateStudyPlan: async (subject, goals, timeline, difficulty) => {
    return await api.post('/ai/generate-study-plan', {
      subject,
      goals,
      timeline,
      difficulty
    });
  },

  // Chat with AI assistant
  chatWithAI: async (message, conversationId = null) => {
    return await api.post('/ai/chat', {
      message,
      conversationId
    });
  },

  // Get chat conversations
  getChatConversations: async () => {
    return await api.get('/ai/conversations');
  },

  // Get chat conversation messages
  getConversationMessages: async (conversationId) => {
    return await api.get(`/ai/conversations/${conversationId}/messages`);
  },

  // Create new conversation
  createConversation: async (title, subject) => {
    return await api.post('/ai/conversations', { title, subject });
  },

  // Delete conversation
  deleteConversation: async (conversationId) => {
    return await api.delete(`/ai/conversations/${conversationId}`);
  },

  // Summarize content
  summarizeContent: async (content, type = 'text') => {
    return await api.post('/ai/summarize', { content, type });
  },

  // Get study tips
  getStudyTips: async (subject, topic) => {
    return await api.post('/ai/study-tips', { subject, topic });
  },

  // Generate quiz
  generateQuiz: async (subject, topic, difficulty, questionCount) => {
    return await api.post('/ai/generate-quiz', {
      subject,
      topic,
      difficulty,
      questionCount
    });
  },

  // Explain concept
  explainConcept: async (concept, subject, level = 'intermediate') => {
    return await api.post('/ai/explain', {
      concept,
      subject,
      level
    });
  },
};
