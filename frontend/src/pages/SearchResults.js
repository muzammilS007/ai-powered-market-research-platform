import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApi } from '../context/ApiContext';
import { LoadingSpinner, PageLoader } from '../components/LoadingSpinner';
import { ErrorAlert } from '../components/ErrorAlert';
import { SentimentChart } from '../components/SentimentChart';
import { TrendChart } from '../components/TrendChart';
import { InsightsPanel } from '../components/InsightsPanel';
import { DataSources } from '../components/DataSources';

export const SearchResults = () => {
  const { queryId } = useParams();
  const navigate = useNavigate();
  const { getQueryDetails, loading, error, clearError } = useApi();
  
  const [queryData, setQueryData] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    if (queryId) {
      loadQueryDetails();
    }
  }, [queryId]);

  const loadQueryDetails = async () => {
    try {
      clearError();
      const data = await getQueryDetails(queryId);
      setQueryData(data);
    } catch (err) {
      console.error('Failed to load query details:', err);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadQueryDetails();
    setIsRefreshing(false);
  };

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleString();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-success-100 text-success-800';
      case 'processing':
        return 'bg-warning-100 text-warning-800';
      case 'failed':
        return 'bg-danger-100 text-danger-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'sentiment', label: 'Sentiment', icon: '😊' },
    { id: 'trends', label: 'Trends', icon: '📈' },
    { id: 'insights', label: 'AI Insights', icon: '🤖' },
    { id: 'sources', label: 'Data Sources', icon: '🔗' }
  ];

  if (loading && !queryData) {
    return <PageLoader text="Loading search results..." />;
  }

  if (error && !queryData) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <button
            onClick={() => navigate('/')}
            className="btn-secondary mb-4"
          >
            ← Back to Dashboard
          </button>
        </div>
        <ErrorAlert 
          message={error} 
          onClose={clearError}
          onRetry={loadQueryDetails}
        />
      </div>
    );
  }

  if (!queryData) {
    return (
      <div className="max-w-4xl mx-auto text-center py-12">
        <div className="text-gray-400 text-6xl mb-4">🔍</div>
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">
          Search Results Not Found
        </h2>
        <p className="text-gray-600 mb-6">
          The search results you're looking for could not be found.
        </p>
        <button
          onClick={() => navigate('/')}
          className="btn-primary"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/')}
            className="btn-secondary"
          >
            ← Back
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Search Results
            </h1>
            <p className="text-gray-600 text-sm">
              Query ID: {queryId}
            </p>
          </div>
        </div>
        
        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="btn-secondary flex items-center space-x-2"
        >
          {isRefreshing ? (
            <LoadingSpinner size="sm" />
          ) : (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          )}
          <span>Refresh</span>
        </button>
      </div>

      {/* Query Info Card */}
      <div className="card">
        <div className="card-body">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                "{queryData.query}"
              </h2>
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <span>📅 {formatTimestamp(queryData.created_at)}</span>
                <span>⏱️ {queryData.processing_time ? `${(queryData.processing_time / 1000).toFixed(1)}s` : 'N/A'}</span>
                <span>📊 {queryData.data_points_count || 0} data points</span>
              </div>
            </div>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(queryData.status)}`}>
              {queryData.status}
            </span>
          </div>
          
          {queryData.summary && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-medium text-gray-900 mb-2">Summary</h3>
              <p className="text-gray-700 text-sm leading-relaxed">
                {queryData.summary}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <ErrorAlert message={error} onClose={clearError} />
      )}

      {/* Tabs Navigation */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 transition-colors duration-200 ${
                activeTab === tab.id
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="min-h-96">
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Quick Stats */}
            <div className="card">
              <div className="card-header">
                <h3 className="text-lg font-semibold">📊 Quick Stats</h3>
              </div>
              <div className="card-body space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-primary-50 rounded-lg">
                    <div className="text-2xl font-bold text-primary-600">
                      {queryData.sentiment_report?.overall_sentiment || 'N/A'}
                    </div>
                    <div className="text-sm text-gray-600">Overall Sentiment</div>
                  </div>
                  <div className="text-center p-3 bg-success-50 rounded-lg">
                    <div className="text-2xl font-bold text-success-600">
                      {queryData.trend_analysis?.trend_direction || 'N/A'}
                    </div>
                    <div className="text-sm text-gray-600">Trend Direction</div>
                  </div>
                </div>
                
                {queryData.sentiment_report?.confidence_score && (
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Confidence Score</span>
                      <span>{Math.round(queryData.sentiment_report.confidence_score * 100)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${queryData.sentiment_report.confidence_score * 100}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Key Insights Preview */}
            <div className="card">
              <div className="card-header">
                <h3 className="text-lg font-semibold">🔍 Key Insights</h3>
              </div>
              <div className="card-body">
                {queryData.market_insights && queryData.market_insights.length > 0 ? (
                  <div className="space-y-3">
                    {queryData.market_insights.slice(0, 3).map((insight, index) => (
                      <div key={index} className="p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-start justify-between mb-1">
                          <h4 className="font-medium text-gray-900 text-sm">
                            {insight.title}
                          </h4>
                          <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                            insight.impact_level === 'high' ? 'bg-danger-100 text-danger-800' :
                            insight.impact_level === 'medium' ? 'bg-warning-100 text-warning-800' :
                            'bg-success-100 text-success-800'
                          }`}>
                            {insight.impact_level}
                          </span>
                        </div>
                        <p className="text-gray-600 text-xs">
                          {insight.description?.substring(0, 100)}...
                        </p>
                      </div>
                    ))}
                    {queryData.market_insights.length > 3 && (
                      <button
                        onClick={() => setActiveTab('insights')}
                        className="text-primary-600 text-sm font-medium hover:text-primary-700"
                      >
                        View all {queryData.market_insights.length} insights →
                      </button>
                    )}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">No insights available</p>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'sentiment' && (
          <SentimentChart data={queryData.sentiment_report} />
        )}

        {activeTab === 'trends' && (
          <TrendChart data={queryData.trend_analysis} />
        )}

        {activeTab === 'insights' && (
          <InsightsPanel insights={queryData.market_insights} />
        )}

        {activeTab === 'sources' && (
          <DataSources 
            sources={queryData.data_sources} 
            dataPoints={queryData.data_points_count}
          />
        )}
      </div>
    </div>
  );
};

export default SearchResults;