import React, { createContext, useContext, useState, useCallback } from 'react';
import axios from 'axios';

const ApiContext = createContext();

// API base URL - can be configured via environment variable
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 seconds timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for logging
api.interceptors.request.use(
  (config) => {
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    console.log(`API Response: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error('API Response Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export const ApiProvider = ({ children }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchResults, setSearchResults] = useState(null);
  const [queryHistory, setQueryHistory] = useState([]);
  const [trendingTopics, setTrendingTopics] = useState([]);
  const [apiStats, setApiStats] = useState(null);

  // Clear error state
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Health check
  const checkHealth = useCallback(async () => {
    try {
      const response = await api.get('/health');
      return response.data;
    } catch (err) {
      throw new Error('Backend service is unavailable');
    }
  }, []);

  // Search for market insights
  const searchMarketInsights = useCallback(async (query) => {
    if (!query || query.trim().length === 0) {
      throw new Error('Search query cannot be empty');
    }

    if (query.length > 500) {
      throw new Error('Search query is too long (max 500 characters)');
    }

    setLoading(true);
    setError(null);

    try {
      const response = await api.post('/search', { query: query.trim() });
      const result = response.data;
      
      setSearchResults(result);
      
      // Add to query history
      setQueryHistory(prev => [{
        id: result.query_id,
        query: query.trim(),
        timestamp: new Date().toISOString(),
        status: 'completed',
        data_points: result.data_points_count,
        processing_time: result.processing_time
      }, ...prev.slice(0, 9)]); // Keep only last 10 queries
      
      return result;
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || 'Search failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Get detailed query results
  const getQueryDetails = useCallback(async (queryId) => {
    if (!queryId) {
      throw new Error('Query ID is required');
    }

    setLoading(true);
    setError(null);

    try {
      const response = await api.get(`/query/${queryId}`);
      const data = response.data;
      
      // Flatten the nested structure for easier frontend consumption
      const flattenedData = {
        ...data.query, // Spread the query object properties
        sentiment_report: data.sentiment_report,
        trend_analysis: data.trend_analysis,
        market_insights: data.market_insights
      };
      
      return flattenedData;
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || 'Failed to fetch query details';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Get query history
  const getQueryHistory = useCallback(async (limit = 20) => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.get(`/history?limit=${limit}`);
      const history = response.data.history || [];
      setQueryHistory(history);
      return history;
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || 'Failed to fetch query history';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Get trending topics
  const getTrendingTopics = useCallback(async (daysBack = 7, limit = 10) => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.get(`/trends?days_back=${daysBack}&limit=${limit}`);
      const trends = response.data.trending_topics || [];
      setTrendingTopics(trends);
      return trends;
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || 'Failed to fetch trending topics';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Get market insights with filters
  const getMarketInsights = useCallback(async (filters = {}) => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      
      if (filters.insightType) params.append('insight_type', filters.insightType);
      if (filters.impactLevel) params.append('impact_level', filters.impactLevel);
      if (filters.timeframe) params.append('timeframe', filters.timeframe);
      if (filters.minConfidence) params.append('min_confidence', filters.minConfidence);
      if (filters.limit) params.append('limit', filters.limit);
      
      const response = await api.get(`/insights?${params.toString()}`);
      return response.data.insights || [];
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || 'Failed to fetch market insights';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Get API usage statistics
  const getApiStats = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.get('/stats');
      const stats = response.data;
      setApiStats(stats);
      return stats;
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || 'Failed to fetch API statistics';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const value = {
    // State
    loading,
    error,
    searchResults,
    queryHistory,
    trendingTopics,
    apiStats,
    
    // Actions
    clearError,
    checkHealth,
    searchMarketInsights,
    getQueryDetails,
    getQueryHistory,
    getTrendingTopics,
    getMarketInsights,
    getApiStats,
    
    // Direct API access for custom requests
    api,
  };

  return (
    <ApiContext.Provider value={value}>
      {children}
    </ApiContext.Provider>
  );
};

export const useApi = () => {
  const context = useContext(ApiContext);
  if (!context) {
    throw new Error('useApi must be used within an ApiProvider');
  }
  return context;
};

export default ApiContext;