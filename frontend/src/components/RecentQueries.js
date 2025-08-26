import React from 'react';
import { LoadingSpinner, CardSkeleton } from './LoadingSpinner';
import { formatRelativeTime, formatQueryStatus } from '../utils/formatters';

export const RecentQueries = ({ queries = [], onQueryClick, loading = false, className = '' }) => {
  if (loading) {
    return (
      <div className={className}>
        <CardSkeleton lines={5} />
      </div>
    );
  }

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    
    if (diffInMinutes < 1) {
      return 'Just now';
    } else if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`;
    } else if (diffInMinutes < 1440) {
      const hours = Math.floor(diffInMinutes / 60);
      return `${hours}h ago`;
    } else {
      const days = Math.floor(diffInMinutes / 1440);
      return `${days}d ago`;
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return '✅';
      case 'processing':
        return '⏳';
      case 'failed':
        return '❌';
      default:
        return '📊';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'text-success-600 bg-success-50';
      case 'processing':
        return 'text-warning-600 bg-warning-50';
      case 'failed':
        return 'text-danger-600 bg-danger-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const formatProcessingTime = (timeMs) => {
    if (!timeMs) return null;
    
    if (timeMs < 1000) {
      return `${Math.round(timeMs)}ms`;
    } else {
      return `${(timeMs / 1000).toFixed(1)}s`;
    }
  };

  return (
    <div className={`card ${className}`}>
      <div className="card-header">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">
            📊 Recent Searches
          </h3>
          {queries.length > 0 && (
            <span className="text-xs text-gray-500">
              {queries.length} {queries.length === 1 ? 'query' : 'queries'}
            </span>
          )}
        </div>
      </div>
      
      <div className="card-body p-0">
        {queries.length === 0 ? (
          <div className="p-6 text-center">
            <div className="text-gray-400 text-4xl mb-2">🔍</div>
            <p className="text-gray-500 text-sm">
              No recent searches yet.
            </p>
            <p className="text-gray-400 text-xs mt-1">
              Your search history will appear here.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {queries.map((query, index) => (
              <button
                key={query.id || index}
                onClick={() => onQueryClick && onQueryClick(query)}
                className="w-full p-4 text-left hover:bg-gray-50 transition-colors duration-200 group"
                disabled={query.status === 'processing'}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="text-base">
                        {getStatusIcon(query.status)}
                      </span>
                      <span className="font-medium text-gray-900 truncate group-hover:text-primary-600 transition-colors duration-200">
                        {query.query}
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      <span className="flex items-center space-x-1">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>{formatRelativeTime(query.timestamp || query.created_at)}</span>
                      </span>
                      
                      {query.data_points && query.data_points > 0 && (
                        <span className="flex items-center space-x-1">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                          </svg>
                          <span>{query.data_points} data points</span>
                        </span>
                      )}
                      
                      {query.processing_time && (
                        <span className="flex items-center space-x-1">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                          </svg>
                          <span>{formatProcessingTime(query.processing_time)}</span>
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex-shrink-0 ml-2 flex flex-col items-end space-y-1">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                       formatQueryStatus(query.status).color === 'success' ? 'bg-success-50 text-success-600' :
                       formatQueryStatus(query.status).color === 'warning' ? 'bg-warning-50 text-warning-600' :
                       formatQueryStatus(query.status).color === 'danger' ? 'bg-danger-50 text-danger-600' :
                       'bg-gray-50 text-gray-600'
                     }`}>
                       {formatQueryStatus(query.status).label}
                     </span>
                    
                    {query.status !== 'processing' && (
                      <svg 
                        className="w-4 h-4 text-gray-400 group-hover:text-primary-500 transition-colors duration-200" 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          strokeWidth={2} 
                          d="M9 5l7 7-7 7" 
                        />
                      </svg>
                    )}
                    
                    {query.status === 'processing' && (
                      <LoadingSpinner size="xs" />
                    )}
                  </div>
                </div>
                
                {/* Error message for failed queries */}
                {query.status === 'failed' && query.error_message && (
                  <div className="mt-2 p-2 bg-danger-50 border border-danger-200 rounded text-xs text-danger-700">
                    {query.error_message}
                  </div>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
      
      {queries.length > 0 && (
        <div className="card-footer">
          <p className="text-xs text-gray-500 text-center">
            Click on any search to view detailed results
          </p>
        </div>
      )}
    </div>
  );
};

// Compact version for smaller spaces
export const RecentQueriesCompact = ({ queries = [], onQueryClick, loading = false, limit = 3 }) => {
  if (loading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: limit }).map((_, index) => (
          <div key={index} className="animate-pulse">
            <div className="h-12 bg-gray-200 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  const displayQueries = queries.slice(0, limit);

  if (displayQueries.length === 0) {
    return (
      <div className="text-center py-4">
        <p className="text-gray-500 text-sm">No recent searches</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {displayQueries.map((query, index) => (
        <button
          key={query.id || index}
          onClick={() => onQueryClick && onQueryClick(query)}
          className="w-full p-3 text-left bg-gray-50 hover:bg-primary-50 rounded-lg transition-colors duration-200 group"
          disabled={query.status === 'processing'}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 flex-1 min-w-0">
              <span className="text-sm">
                {(() => {
                  switch (query.status) {
                    case 'completed':
                      return '✅';
                    case 'processing':
                      return '⏳';
                    case 'failed':
                      return '❌';
                    default:
                      return '📊';
                  }
                })()}
              </span>
              <span className="text-sm font-medium text-gray-900 truncate group-hover:text-primary-600">
                {query.query}
              </span>
            </div>
            <div className="flex items-center space-x-2 flex-shrink-0">
              <span className="text-xs text-gray-500">
                {formatRelativeTime(query.timestamp || query.created_at)}
              </span>
              {query.status === 'processing' ? (
                <LoadingSpinner size="xs" />
              ) : (
                <svg className="w-3 h-3 text-gray-400 group-hover:text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              )}
            </div>
          </div>
        </button>
      ))}
    </div>
  );
};

export default RecentQueries;