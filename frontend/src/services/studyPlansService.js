import api from './api';

export const studyPlansService = {
  // Get all study plans for current user
  getStudyPlans: async () => {
    return await api.get('/study-plans');
  },

  // Get single study plan by ID
  getStudyPlan: async (id) => {
    return await api.get(`/study-plans/${id}`);
  },

  // Create new study plan
  createStudyPlan: async (planData) => {
    return await api.post('/study-plans', planData);
  },

  // Update study plan
  updateStudyPlan: async (id, planData) => {
    return await api.put(`/study-plans/${id}`, planData);
  },

  // Delete study plan
  deleteStudyPlan: async (id) => {
    return await api.delete(`/study-plans/${id}`);
  },

  // Mark topic as completed
  completeTopicInPlan: async (planId, topicId) => {
    return await api.post(`/study-plans/${planId}/complete-topic`, { topicId });
  },

  // Get study plan progress
  getStudyPlanProgress: async (id) => {
    return await api.get(`/study-plans/${id}/progress`);
  },

  // Add AI insight to study plan
  addAIInsight: async (planId, insight) => {
    return await api.post(`/study-plans/${planId}/ai-insights`, { insight });
  },

  // Generate study plan with AI
  generateAIStudyPlan: async (subject, goals, timeline) => {
    return await api.post('/ai/generate-study-plan', {
      subject,
      goals,
      timeline
    });
  },
};

export const tasksService = {
  // Get all tasks for current user
  getTasks: async (filters = {}) => {
    const params = new URLSearchParams(filters);
    return await api.get(`/tasks?${params}`);
  },

  // Get single task by ID
  getTask: async (id) => {
    return await api.get(`/tasks/${id}`);
  },

  // Create new task
  createTask: async (taskData) => {
    return await api.post('/tasks', taskData);
  },

  // Update task
  updateTask: async (id, taskData) => {
    return await api.put(`/tasks/${id}`, taskData);
  },

  // Delete task
  deleteTask: async (id) => {
    return await api.delete(`/tasks/${id}`);
  },

  // Mark task as completed
  completeTask: async (id) => {
    return await api.post(`/tasks/${id}/complete`);
  },

  // Get tasks for calendar view
  getCalendarTasks: async (startDate, endDate) => {
    return await api.get(`/tasks/calendar?start=${startDate}&end=${endDate}`);
  },

  // Get tasks for current week
  getWeekTasks: async () => {
    return await api.get('/tasks/week');
  },

  // Start pomodoro session for task
  startPomodoroSession: async (taskId) => {
    return await api.post(`/tasks/${taskId}/pomodoro/start`);
  },

  // Complete pomodoro session
  completePomodoroSession: async (taskId, sessionData) => {
    return await api.post(`/tasks/${taskId}/pomodoro/complete`, sessionData);
  },
};
