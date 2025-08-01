import api from './api';

export const aiService = {
  // Chat with AI assistant
  chat: async (message, context = null) => {
    return await api.post('/ai/chat', { message, context });
  },

  // Generate AI study plan
  generateStudyPlan: async (planData) => {
    return await api.post('/ai/generate-plan', planData);
  },

  // Summarize content
  summarizeContent: async (content, type = 'general') => {
    return await api.post('/ai/summarize', { content, type });
  },

  // Get study tips
  getStudyTips: async (subject, topic, difficulty) => {
    return await api.post('/ai/study-tips', { subject, topic, difficulty });
  },

  // Generate quiz questions
  generateQuiz: async (subject, topic, difficulty = 'medium', questionCount = 5) => {
    return await api.post('/ai/quiz', { subject, topic, difficulty, questionCount });
  }
};
