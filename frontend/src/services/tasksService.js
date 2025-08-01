import axios from 'axios';
import { format } from 'date-fns';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const tasksService = {
  // Get all tasks for the current user
  getAllTasks: async () => {
    try {
      const response = await api.get('/tasks');
      return response.data;
    } catch (error) {
      console.error('Error fetching tasks:', error);
      throw error;
    }
  },

  // Get tasks for a specific date range (useful for calendar)
  getTasksByDateRange: async (startDate, endDate) => {
    try {
      const response = await api.get('/tasks', {
        params: {
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching tasks by date range:', error);
      throw error;
    }
  },

  // Create a new task
  createTask: async (taskData) => {
    try {
      const response = await api.post('/tasks', taskData);
      return response.data;
    } catch (error) {
      console.error('Error creating task:', error);
      throw error;
    }
  },

  // Update an existing task
  updateTask: async (taskId, taskData) => {
    try {
      const response = await api.put(`/tasks/${taskId}`, taskData);
      return response.data;
    } catch (error) {
      console.error('Error updating task:', error);
      throw error;
    }
  },

  // Delete a task
  deleteTask: async (taskId) => {
    try {
      const response = await api.delete(`/tasks/${taskId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting task:', error);
      throw error;
    }
  },

  // Get a single task by ID
  getTaskById: async (taskId) => {
    try {
      const response = await api.get(`/tasks/${taskId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching task:', error);
      throw error;
    }
  },

  // Convert task to calendar event format
  taskToCalendarEvent: (task) => {
    const eventTypeColors = {
      study: '#3b82f6',
      review: '#10b981',
      practice: '#f59e0b',
      exam: '#ef4444',
      assignment: '#8b5cf6',
      other: '#6b7280',
    };

    return {
      id: task._id,
      title: task.title,
      type: task.type,
      subject: task.subject,
      date: new Date(task.scheduledDate),
      startTime: task.scheduledTime.start,
      endTime: task.scheduledTime.end,
      color: task.color || eventTypeColors[task.type] || '#3b82f6',
      description: task.description,
      priority: task.priority,
      difficulty: task.difficulty,
      status: task.status,
      topic: task.topic,
      estimatedDuration: task.estimatedDuration,
      location: task.location || '',
    };
  },

  // Convert calendar event back to task format
  calendarEventToTask: (event) => {
    // Calculate estimated duration in minutes
    const startTime = event.startDateTime || new Date();
    const endTime = event.endDateTime || new Date();
    const durationMs = endTime.getTime() - startTime.getTime();
    const estimatedDuration = Math.max(30, Math.round(durationMs / (1000 * 60))); // minimum 30 minutes

    return {
      title: event.title,
      description: event.description || '',
      subject: event.subject || 'General',
      topic: event.subject || event.title || 'General Topic', // Required field
      type: event.type || 'study',
      priority: event.priority || 'medium',
      difficulty: event.difficulty || 'medium',
      scheduledDate: event.startDateTime || new Date(),
      scheduledTime: {
        start: format(event.startDateTime || new Date(), 'HH:mm'),
        end: format(event.endDateTime || new Date(), 'HH:mm'),
      },
      estimatedDuration: estimatedDuration,
      color: event.color || '#3b82f6',
    };
  },
};

export default tasksService;
