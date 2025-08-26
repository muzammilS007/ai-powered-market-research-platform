import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApi } from '../context/ApiContext';
import { SearchInput } from '../components/SearchInput';
import { TrendingTopics } from '../components/TrendingTopics';
import { RecentQueries } from '../components/RecentQueries';
import { StatsOverview } from '../components/StatsOverview';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorAlert } from '../components/ErrorAlert';

export const Dashboard = () => {
  const navigate = useNavigate();
  const {
    loading,
    error,
    searchMarketInsights,
    getTrendingTopics,
    getQueryHistory,
    getApiStats,
    clearError,
    trendingTopics,
    queryHistory,
    apiStats
  } = useApi();

  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [dashboardLoading, setDashboardLoading] = useState(true);

  // Load dashboard data on mount
  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setDashboardLoading(true);
        await Promise.allSettled([
          getTrendingTopics(7, 8),
          getQueryHistory(10),
          getApiStats()
        ]);
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setDashboardLoading(false);
      }
    };

    loadDashboardData();
  }, [getTrendingTopics, getQueryHistory, getApiStats]);

  const handleSearch = async (query) => {
    if (!query || query.trim().length === 0) {
      return;
    }

    setIsSearching(true);
    clearError();

    try {
      const result = await searchMarketInsights(query);
      if (result && result.query_id) {
        navigate(`/search/${result.query_id}`);
      }
    } catch (err) {
      console.error('Search failed:', err);
      // Error is handled by the API context
    } finally {
      setIsSearching(false);
    }
  };

  const handleTrendingTopicClick = (topic) => {
    setSearchQuery(topic);
    handleSearch(topic);
  };

  const handleRecentQueryClick = (query) => {
    if (query.id) {
      navigate(`/search/${query.id}`);
    } else {
      setSearchQuery(query.query);
      handleSearch(query.query);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Hero Section */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl lg:text-5xl font-bold text-gradient">
          AI-Powered Market Research
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Discover market trends, analyze sentiment, and get AI-driven insights 
          to make informed business decisions.
        </p>
      </div>

      {/* Search Section */}
      <div className="max-w-4xl mx-auto">
        <SearchInput
          value={searchQuery}
          onChange={setSearchQuery}
          onSearch={handleSearch}
          loading={isSearching}
          placeholder="Search for market trends, companies, products, or topics..."
        />
        
        {error && (
          <div className="mt-4">
            <ErrorAlert 
              message={error} 
              onClose={clearError}
            />
          </div>
        )}
      </div>

      {/* Dashboard Content */}
      {dashboardLoading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Stats Overview */}
            <StatsOverview stats={apiStats} />
            
            {/* Recent Queries */}
            <RecentQueries 
              queries={queryHistory}
              onQueryClick={handleRecentQueryClick}
              loading={loading}
            />
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Trending Topics */}
            <TrendingTopics 
              topics={trendingTopics}
              onTopicClick={handleTrendingTopicClick}
              loading={loading}
            />
            
            {/* Quick Actions */}
            <div className="card">
              <div className="card-header">
                <h3 className="text-lg font-semibold text-gray-900">
                  Quick Actions
                </h3>
              </div>
              <div className="card-body space-y-3">
                <button
                  onClick={() => navigate('/history')}
                  className="w-full btn-secondary justify-start"
                >
                  <span className="mr-2">📊</span>
                  View Search History
                </button>
                <button
                  onClick={() => navigate('/analytics')}
                  className="w-full btn-secondary justify-start"
                >
                  <span className="mr-2">📈</span>
                  Analytics Dashboard
                </button>
                <button
                  onClick={() => {
                    setSearchQuery('cryptocurrency market trends');
                    handleSearch('cryptocurrency market trends');
                  }}
                  className="w-full btn-secondary justify-start"
                >
                  <span className="mr-2">💰</span>
                  Crypto Market Analysis
                </button>
                <button
                  onClick={() => {
                    setSearchQuery('AI technology adoption');
                    handleSearch('AI technology adoption');
                  }}
                  className="w-full btn-secondary justify-start"
                >
                  <span className="mr-2">🤖</span>
                  AI Technology Trends
                </button>
              </div>
            </div>

            {/* Tips */}
            <div className="card">
              <div className="card-header">
                <h3 className="text-lg font-semibold text-gray-900">
                  💡 Search Tips
                </h3>
              </div>
              <div className="card-body">
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-start space-x-2">
                    <span className="text-primary-500 mt-0.5">•</span>
                    <span>Use specific company names or product categories</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-primary-500 mt-0.5">•</span>
                    <span>Include time periods like "Q4 2024" or "last month"</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-primary-500 mt-0.5">•</span>
                    <span>Combine topics: "electric vehicles consumer sentiment"</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-primary-500 mt-0.5">•</span>
                    <span>Ask questions: "What are investors saying about Tesla?"</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;