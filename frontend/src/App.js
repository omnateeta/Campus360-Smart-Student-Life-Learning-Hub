import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import CssBaseline from '@mui/material/CssBaseline';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Contexts
import { AuthProvider } from './contexts/AuthContext';
import { SocketProvider } from './contexts/SocketContext';

// Components
import Layout from './components/Layout/Layout';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import ErrorBoundary from './components/ErrorBoundary/ErrorBoundary';
import { PageLoading } from './components/Loading/Loading';

// Lazy-loaded pages for better performance
import {
  LazyLogin,
  LazyRegister,
  LazyForgotPassword,
  LazyResetPassword,
  LazyDashboard,
  LazyStudyPlans,
  LazyTasks,
  LazyCalendar,
  LazyTimer,
  LazyNotes,
  LazyAnalytics,
  LazyChat,
  LazyProfile,
} from './utils/performance';
import StudyPlanDetails from './pages/StudyPlans/StudyPlanDetail';
import CreateStudyPlan from './pages/StudyPlans/CreateStudyPlan';
import Tasks from './pages/Tasks/Tasks';
import Calendar from './pages/Calendar/Calendar';
import Timer from './pages/Timer/Timer';
import Notes from './pages/Notes/Notes';
import Analytics from './pages/Analytics/Analytics';
import Profile from './pages/Profile/Profile';
import AIChat from './pages/AI/AIChat';
import AuthTest from './pages/AuthTest';

// Create theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#3B82F6',
      light: '#60A5FA',
      dark: '#1D4ED8',
    },
    secondary: {
      main: '#8B5CF6',
      light: '#A78BFA',
      dark: '#7C3AED',
    },
    background: {
      default: '#F8FAFC',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#1E293B',
      secondary: '#64748B',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
    },
    h2: {
      fontWeight: 600,
    },
    h3: {
      fontWeight: 600,
    },
    h4: {
      fontWeight: 600,
    },
    h5: {
      fontWeight: 500,
    },
    h6: {
      fontWeight: 500,
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 500,
          borderRadius: 8,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
          borderRadius: 12,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        },
      },
    },
  },
});

// Create React Query client with optimized settings
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
    },
    mutations: {
      retry: 1,
    },
  },
});

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider theme={theme}>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <CssBaseline />
            <AuthProvider>
              <SocketProvider>
                <Router>
                  <Suspense fallback={<PageLoading message="Loading application..." />}>
                    <Routes>
                      {/* Public Routes */}
                      <Route path="/login" element={<LazyLogin />} />
                      <Route path="/register" element={<LazyRegister />} />
                      <Route path="/forgot-password" element={<LazyForgotPassword />} />
                      <Route path="/reset-password/:token" element={<LazyResetPassword />} />
                      
                      {/* Protected Routes */}
                      <Route path="/" element={
                        <ProtectedRoute>
                          <Layout />
                        </ProtectedRoute>
                      }>
                        <Route index element={<LazyDashboard />} />
                        <Route path="dashboard" element={<LazyDashboard />} />
                        
                        {/* Study Plans Routes */}
                        <Route path="study-plans" element={<LazyStudyPlans />} />
                        <Route path="study-plans/create" element={<CreateStudyPlan />} />
                        <Route path="study-plans/edit/:id" element={<CreateStudyPlan />} />
                        <Route path="study-plans/:id" element={<StudyPlanDetails />} />
                        
                        {/* Feature Routes */}
                        <Route path="tasks" element={<Tasks />} />
                        <Route path="calendar" element={<LazyCalendar />} />
                        <Route path="timer" element={<LazyTimer />} />
                        <Route path="notes" element={<LazyNotes />} />
                        <Route path="analytics" element={<LazyAnalytics />} />
                        <Route path="ai-chat" element={<AIChat />} />
                        <Route path="profile" element={<LazyProfile />} />
                        <Route path="auth-test" element={<AuthTest />} />
                      </Route>
                      
                      {/* Catch all route */}
                      <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                  </Suspense>
                </Router>
              </SocketProvider>
            </AuthProvider>
            
            {/* Toast Notifications */}
            <ToastContainer
              position="top-right"
              autoClose={5000}
              hideProgressBar={false}
              newestOnTop={false}
              closeOnClick
              rtl={false}
              pauseOnFocusLoss
              draggable
              pauseOnHover
              theme="light"
            />
            
            {/* React Query Devtools (only in development) */}
            {process.env.NODE_ENV === 'development' && (
              <ReactQueryDevtools initialIsOpen={false} />
            )}
          </LocalizationProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
