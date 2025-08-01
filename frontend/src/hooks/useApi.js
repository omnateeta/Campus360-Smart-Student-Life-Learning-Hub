import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';

// Generic API hook for data fetching
export const useApi = (apiFunction, dependencies = []) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async (...args) => {
    try {
      setLoading(true);
      setError(null);
      const result = await apiFunction(...args);
      setData(result);
      return result;
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [apiFunction]);

  useEffect(() => {
    fetchData();
  }, dependencies);

  const refetch = useCallback(() => {
    return fetchData();
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    refetch,
    fetchData,
  };
};

// Hook for API mutations (create, update, delete)
export const useMutation = (apiFunction) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const mutate = useCallback(async (...args) => {
    try {
      setLoading(true);
      setError(null);
      const result = await apiFunction(...args);
      return result;
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [apiFunction]);

  return {
    mutate,
    loading,
    error,
  };
};

// Hook for paginated data
export const usePaginatedApi = (apiFunction, initialParams = {}) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [params, setParams] = useState(initialParams);

  const fetchData = useCallback(async (resetData = false) => {
    try {
      setLoading(true);
      setError(null);
      
      const currentPage = resetData ? 1 : page;
      const result = await apiFunction({
        ...params,
        page: currentPage,
        limit: params.limit || 10,
      });

      if (resetData) {
        setData(result.data || []);
        setPage(1);
      } else {
        setData(prev => [...prev, ...(result.data || [])]);
      }

      setHasMore(result.hasMore || false);
      if (!resetData) {
        setPage(prev => prev + 1);
      }

      return result;
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [apiFunction, params, page]);

  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      return fetchData(false);
    }
  }, [fetchData, loading, hasMore]);

  const refresh = useCallback(() => {
    return fetchData(true);
  }, [fetchData]);

  const updateParams = useCallback((newParams) => {
    setParams(prev => ({ ...prev, ...newParams }));
    setPage(1);
    setData([]);
    setHasMore(true);
  }, []);

  useEffect(() => {
    fetchData(true);
  }, [params]);

  return {
    data,
    loading,
    error,
    hasMore,
    loadMore,
    refresh,
    updateParams,
  };
};

// Hook for real-time data with polling
export const usePolling = (apiFunction, interval = 5000, dependencies = []) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isPolling, setIsPolling] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      if (!isPolling) setLoading(true);
      setError(null);
      const result = await apiFunction();
      setData(result);
      return result;
    } catch (err) {
      setError(err.message);
      if (!isPolling) {
        toast.error(err.message);
      }
      throw err;
    } finally {
      setLoading(false);
    }
  }, [apiFunction, isPolling]);

  useEffect(() => {
    fetchData();
    
    if (interval > 0) {
      setIsPolling(true);
      const intervalId = setInterval(fetchData, interval);
      
      return () => {
        clearInterval(intervalId);
        setIsPolling(false);
      };
    }
  }, [...dependencies, interval]);

  const refetch = useCallback(() => {
    return fetchData();
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    refetch,
  };
};
