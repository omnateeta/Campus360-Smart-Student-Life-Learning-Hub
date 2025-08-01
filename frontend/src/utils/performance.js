import { lazy } from 'react';

// Lazy loading for route components
export const LazyDashboard = lazy(() => import('../pages/Dashboard/Dashboard'));
export const LazyTasks = lazy(() => import('../pages/Tasks/Tasks'));
export const LazyCalendar = lazy(() => import('../pages/Calendar/Calendar'));
export const LazyTimer = lazy(() => import('../pages/Timer/Timer'));
export const LazyNotes = lazy(() => import('../pages/Notes/Notes'));
export const LazyAnalytics = lazy(() => import('../pages/Analytics/Analytics'));
export const LazyChat = lazy(() => import('../pages/Chat/Chat'));
export const LazyProfile = lazy(() => import('../pages/Profile/Profile'));
export const LazyStudyPlans = lazy(() => import('../pages/StudyPlans/StudyPlans'));

// Lazy loading for auth components
export const LazyLogin = lazy(() => import('../pages/Auth/Login'));
export const LazyRegister = lazy(() => import('../pages/Auth/Register'));
export const LazyForgotPassword = lazy(() => import('../pages/Auth/ForgotPassword'));
export const LazyResetPassword = lazy(() => import('../pages/Auth/ResetPassword'));

// Performance monitoring utilities
export const performanceMonitor = {
  // Measure component render time
  measureRender: (componentName, renderFunction) => {
    const startTime = performance.now();
    const result = renderFunction();
    const endTime = performance.now();
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`${componentName} render time: ${endTime - startTime}ms`);
    }
    
    return result;
  },

  // Measure API call time
  measureApiCall: async (apiName, apiFunction) => {
    const startTime = performance.now();
    try {
      const result = await apiFunction();
      const endTime = performance.now();
      
      if (process.env.NODE_ENV === 'development') {
        console.log(`${apiName} API call time: ${endTime - startTime}ms`);
      }
      
      return result;
    } catch (error) {
      const endTime = performance.now();
      
      if (process.env.NODE_ENV === 'development') {
        console.log(`${apiName} API call failed after: ${endTime - startTime}ms`);
      }
      
      throw error;
    }
  },

  // Log performance metrics
  logMetrics: () => {
    if (process.env.NODE_ENV === 'development' && window.performance) {
      const navigation = performance.getEntriesByType('navigation')[0];
      console.log('Performance Metrics:', {
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
        loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
        firstPaint: performance.getEntriesByName('first-paint')[0]?.startTime,
        firstContentfulPaint: performance.getEntriesByName('first-contentful-paint')[0]?.startTime,
      });
    }
  },
};

// Debounce utility for search and input optimization
export const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(null, args), delay);
  };
};

// Throttle utility for scroll and resize events
export const throttle = (func, limit) => {
  let inThrottle;
  return (...args) => {
    if (!inThrottle) {
      func.apply(null, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

// Memoization utility for expensive calculations
export const memoize = (fn) => {
  const cache = new Map();
  return (...args) => {
    const key = JSON.stringify(args);
    if (cache.has(key)) {
      return cache.get(key);
    }
    const result = fn(...args);
    cache.set(key, result);
    return result;
  };
};

// Virtual scrolling utility for large lists
export const createVirtualScrolling = (itemHeight, containerHeight, buffer = 5) => {
  return {
    getVisibleRange: (scrollTop, totalItems) => {
      const visibleCount = Math.ceil(containerHeight / itemHeight);
      const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - buffer);
      const endIndex = Math.min(totalItems - 1, startIndex + visibleCount + buffer * 2);
      
      return { startIndex, endIndex, visibleCount };
    },
    
    getItemStyle: (index, startIndex) => ({
      position: 'absolute',
      top: index * itemHeight,
      height: itemHeight,
      width: '100%',
    }),
    
    getContainerStyle: (totalItems) => ({
      height: totalItems * itemHeight,
      position: 'relative',
    }),
  };
};

// Image lazy loading utility
export const createImageLazyLoader = () => {
  if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.src = img.dataset.src;
          img.classList.remove('lazy');
          observer.unobserve(img);
        }
      });
    });

    return {
      observe: (img) => imageObserver.observe(img),
      disconnect: () => imageObserver.disconnect(),
    };
  }
  
  // Fallback for browsers without IntersectionObserver
  return {
    observe: (img) => {
      img.src = img.dataset.src;
      img.classList.remove('lazy');
    },
    disconnect: () => {},
  };
};

// Bundle size analyzer (development only)
export const analyzeBundleSize = () => {
  if (process.env.NODE_ENV === 'development') {
    console.log('Bundle analysis available. Use npm run build to see bundle sizes.');
  }
};

// Memory usage monitoring
export const memoryMonitor = {
  logUsage: () => {
    if (process.env.NODE_ENV === 'development' && performance.memory) {
      console.log('Memory Usage:', {
        used: Math.round(performance.memory.usedJSHeapSize / 1048576) + ' MB',
        total: Math.round(performance.memory.totalJSHeapSize / 1048576) + ' MB',
        limit: Math.round(performance.memory.jsHeapSizeLimit / 1048576) + ' MB',
      });
    }
  },
  
  startMonitoring: (interval = 30000) => {
    if (process.env.NODE_ENV === 'development') {
      return setInterval(() => {
        memoryMonitor.logUsage();
      }, interval);
    }
    return null;
  },
  
  stopMonitoring: (intervalId) => {
    if (intervalId) {
      clearInterval(intervalId);
    }
  },
};

export default {
  LazyDashboard,
  LazyTasks,
  LazyCalendar,
  LazyTimer,
  LazyNotes,
  LazyAnalytics,
  LazyChat,
  LazyProfile,
  LazyStudyPlans,
  LazyLogin,
  LazyRegister,
  LazyForgotPassword,
  LazyResetPassword,
  performanceMonitor,
  debounce,
  throttle,
  memoize,
  createVirtualScrolling,
  createImageLazyLoader,
  analyzeBundleSize,
  memoryMonitor,
};
