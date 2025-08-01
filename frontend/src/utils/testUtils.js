import React from 'react';
import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ToastContainer } from 'react-toastify';
import CssBaseline from '@mui/material/CssBaseline';
import { AuthProvider } from '../contexts/AuthContext';
import { SocketProvider } from '../contexts/SocketContext';
import theme from '../theme';

// Mock implementations for testing
export const mockAuthContext = {
  user: {
    id: 1,
    name: 'Test User',
    email: 'test@example.com',
    preferences: {
      theme: 'light',
      notifications: true,
    },
    gamification: {
      level: 5,
      points: 1250,
      badges: ['early-bird', 'streak-master'],
      streak: 7,
    },
  },
  loading: false,
  error: null,
  isAuthenticated: true,
  login: jest.fn(),
  register: jest.fn(),
  logout: jest.fn(),
  googleLogin: jest.fn(),
  forgotPassword: jest.fn(),
  resetPassword: jest.fn(),
  updateUser: jest.fn(),
  clearError: jest.fn(),
};

export const mockSocketContext = {
  socket: null,
  isConnected: false,
  notifications: [],
  addNotification: jest.fn(),
  markAsRead: jest.fn(),
  clearNotifications: jest.fn(),
};

// Custom render function with all providers
export const renderWithProviders = (
  ui,
  {
    preloadedState = {},
    route = '/',
    authContext = mockAuthContext,
    socketContext = mockSocketContext,
    ...renderOptions
  } = {}
) => {
  // Create a new QueryClient for each test
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        cacheTime: 0,
      },
    },
  });

  window.history.pushState({}, 'Test page', route);

  const Wrapper = ({ children }) => (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ThemeProvider theme={theme}>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <CssBaseline />
            <AuthProvider value={authContext}>
              <SocketProvider value={socketContext}>
                {children}
                <ToastContainer />
              </SocketProvider>
            </AuthProvider>
          </LocalizationProvider>
        </ThemeProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );

  return {
    ...render(ui, { wrapper: Wrapper, ...renderOptions }),
    queryClient,
  };
};

// Mock API responses
export const mockApiResponses = {
  auth: {
    login: {
      success: true,
      user: mockAuthContext.user,
      token: 'mock-jwt-token',
    },
    register: {
      success: true,
      user: mockAuthContext.user,
      token: 'mock-jwt-token',
    },
  },
  tasks: {
    getTasks: {
      data: [
        {
          id: 1,
          title: 'Test Task',
          description: 'Test Description',
          status: 'pending',
          priority: 'high',
          dueDate: new Date(),
        },
      ],
      total: 1,
      page: 1,
      limit: 10,
    },
  },
  studyPlans: {
    getStudyPlans: {
      data: [
        {
          id: 1,
          title: 'Test Study Plan',
          subject: 'Mathematics',
          progress: 75,
          createdAt: new Date(),
        },
      ],
      total: 1,
    },
  },
  notes: {
    getNotes: {
      data: [
        {
          id: 1,
          title: 'Test Note',
          content: 'Test content',
          subject: 'Mathematics',
          tags: ['test'],
          createdAt: new Date(),
        },
      ],
      total: 1,
    },
  },
};

// Mock API functions
export const createMockApi = (responses = mockApiResponses) => ({
  auth: {
    login: jest.fn().mockResolvedValue(responses.auth.login),
    register: jest.fn().mockResolvedValue(responses.auth.register),
    logout: jest.fn().mockResolvedValue({}),
    getCurrentUser: jest.fn().mockResolvedValue({ user: mockAuthContext.user }),
    forgotPassword: jest.fn().mockResolvedValue({}),
    resetPassword: jest.fn().mockResolvedValue({}),
  },
  tasks: {
    getTasks: jest.fn().mockResolvedValue(responses.tasks.getTasks),
    createTask: jest.fn().mockResolvedValue({ id: 2, ...responses.tasks.getTasks.data[0] }),
    updateTask: jest.fn().mockResolvedValue({ id: 1, ...responses.tasks.getTasks.data[0] }),
    deleteTask: jest.fn().mockResolvedValue({}),
    completeTask: jest.fn().mockResolvedValue({}),
  },
  studyPlans: {
    getStudyPlans: jest.fn().mockResolvedValue(responses.studyPlans.getStudyPlans),
    createStudyPlan: jest.fn().mockResolvedValue({ id: 2, ...responses.studyPlans.getStudyPlans.data[0] }),
    updateStudyPlan: jest.fn().mockResolvedValue({ id: 1, ...responses.studyPlans.getStudyPlans.data[0] }),
    deleteStudyPlan: jest.fn().mockResolvedValue({}),
  },
  notes: {
    getNotes: jest.fn().mockResolvedValue(responses.notes.getNotes),
    createNote: jest.fn().mockResolvedValue({ id: 2, ...responses.notes.getNotes.data[0] }),
    updateNote: jest.fn().mockResolvedValue({ id: 1, ...responses.notes.getNotes.data[0] }),
    deleteNote: jest.fn().mockResolvedValue({}),
  },
});

// Test helpers
export const waitForLoadingToFinish = () =>
  new Promise(resolve => setTimeout(resolve, 0));

export const createMockIntersectionObserver = () => {
  const mockIntersectionObserver = jest.fn();
  mockIntersectionObserver.mockReturnValue({
    observe: () => null,
    unobserve: () => null,
    disconnect: () => null,
  });
  window.IntersectionObserver = mockIntersectionObserver;
};

export const createMockResizeObserver = () => {
  const mockResizeObserver = jest.fn();
  mockResizeObserver.mockReturnValue({
    observe: () => null,
    unobserve: () => null,
    disconnect: () => null,
  });
  window.ResizeObserver = mockResizeObserver;
};

// Custom matchers
export const customMatchers = {
  toBeInTheDocument: (received) => {
    const pass = received !== null;
    return {
      message: () => `expected element ${pass ? 'not ' : ''}to be in the document`,
      pass,
    };
  },
};

export default {
  renderWithProviders,
  mockAuthContext,
  mockSocketContext,
  mockApiResponses,
  createMockApi,
  waitForLoadingToFinish,
  createMockIntersectionObserver,
  createMockResizeObserver,
  customMatchers,
};
