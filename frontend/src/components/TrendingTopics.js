import React from 'react';
import { LoadingSpinner, CardSkeleton } from './LoadingSpinner';
import { formatNumber, formatTrendStrength } from '../utils/formatters';

export const TrendingTopics = ({ topics = [], onTopicClick, loading = false, className = '' }) => {
  if (loading) {
    return (
      <div className={className}>
        <CardSkeleton lines={6} />
      </div>
    );
  }

  const getTrendIcon = (strength) => {
    if (strength >= 0.8) return '🔥';
    if (strength >= 0.6) return '📈';
    if (strength >= 0.4) return '⬆️';
    return '📊';
  };

  const getTrendColor = (strength) => {
    if (strength >= 0.8) return 'text-danger-600 bg-danger-50';
    if (strength >= 0.6) return 'text-success-600 bg-success-50';
    if (strength >= 0.4) return 'text-warning-600 bg-warning-50';
    return 'text-gray-600 bg-gray-50';
  };



  return (
    <div className={`card ${className}`}>
      <div className="card-header">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">
            🔥 Trending Topics
          </h3>
          <span className="text-xs text-gray-500">
            Last 7 days
          </span>
        </div>
      </div>
      
      <div className="card-body p-0">
        {topics.length === 0 ? (
          <div className="p-6 text-center">
            <div className="text-gray-400 text-4xl mb-2">📊</div>
            <p className="text-gray-500 text-sm">
              No trending topics available yet.
            </p>
            <p className="text-gray-400 text-xs mt-1">
              Start searching to see trends!
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {topics.map((topic, index) => (
              <button
                key={`${topic.keyword}-${index}`}
                onClick={() => onTopicClick && onTopicClick(topic.keyword)}
                className="w-full p-4 text-left hover:bg-gray-50 transition-colors duration-200 group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="text-lg">
                        {getTrendIcon(topic.strength || 0.5)}
                      </span>
                      <span className="font-medium text-gray-900 truncate group-hover:text-primary-600 transition-colors duration-200">
                        {topic.keyword}
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-3 text-xs text-gray-500">
                      <span className="flex items-center space-x-1">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                        </svg>
                        <span>{formatNumber(topic.frequency || 0)} mentions</span>
                      </span>
                      
                      {topic.strength && (
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getTrendColor(topic.strength)}`}>
                          {Math.round(topic.strength * 100)}% trend
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex-shrink-0 ml-2">
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
                  </div>
                </div>
                
                {/* Trend visualization bar */}
                {topic.strength && (
                  <div className="mt-2">
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                      <div 
                        className={`h-1.5 rounded-full transition-all duration-300 ${
                          topic.strength >= 0.8 ? 'bg-danger-500' :
                          topic.strength >= 0.6 ? 'bg-success-500' :
                          topic.strength >= 0.4 ? 'bg-warning-500' :
                          'bg-gray-400'
                        }`}
                        style={{ width: `${Math.max(topic.strength * 100, 10)}%` }}
                      />
                    </div>
                  </div>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
      
      {topics.length > 0 && (
        <div className="card-footer">
          <p className="text-xs text-gray-500 text-center">
            Click on any topic to search for insights
          </p>
        </div>
      )}
    </div>
  );
};

// Compact version for smaller spaces
export const TrendingTopicsCompact = ({ topics = [], onTopicClick, loading = false, limit = 5 }) => {
  if (loading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: limit }).map((_, index) => (
          <div key={index} className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  const displayTopics = topics.slice(0, limit);

  if (displayTopics.length === 0) {
    return (
      <div className="text-center py-4">
        <p className="text-gray-500 text-sm">No trending topics</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {displayTopics.map((topic, index) => (
        <button
          key={`${topic.keyword}-${index}`}
          onClick={() => onTopicClick && onTopicClick(topic.keyword)}
          className="w-full flex items-center justify-between p-2 text-left bg-gray-50 hover:bg-primary-50 rounded-lg transition-colors duration-200 group"
        >
          <div className="flex items-center space-x-2 flex-1 min-w-0">
            <span className="text-sm">
              {topic.strength >= 0.8 ? '🔥' : topic.strength >= 0.6 ? '📈' : '📊'}
            </span>
            <span className="text-sm font-medium text-gray-900 truncate group-hover:text-primary-600">
              {topic.keyword}
            </span>
          </div>
          <span className="text-xs text-gray-500 flex-shrink-0">
            {formatNumber(topic.frequency || 0)}
          </span>
        </button>
      ))}
    </div>
  );
};

export default TrendingTopics;