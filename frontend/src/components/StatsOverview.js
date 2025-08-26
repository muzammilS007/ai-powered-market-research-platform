import React from 'react';
import { LoadingSpinner, CardSkeleton } from './LoadingSpinner';

export const StatsOverview = ({ stats, loading = false, className = '' }) => {
  if (loading) {
    return (
      <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 ${className}`}>
        {Array.from({ length: 4 }).map((_, index) => (
          <CardSkeleton key={index} lines={2} />
        ))}
      </div>
    );
  }

  if (!stats) {
    return (
      <div className={`card ${className}`}>
        <div className="card-body text-center py-8">
          <div className="text-gray-400 text-4xl mb-2">📊</div>
          <p className="text-gray-500 text-sm">
            Statistics not available
          </p>
        </div>
      </div>
    );
  }

  const formatNumber = (num) => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num?.toString() || '0';
  };

  const formatPercentage = (value) => {
    return `${Math.round(value || 0)}%`;
  };

  const formatDuration = (ms) => {
    if (!ms) return 'N/A';
    
    if (ms < 1000) {
      return `${Math.round(ms)}ms`;
    } else if (ms < 60000) {
      return `${(ms / 1000).toFixed(1)}s`;
    } else {
      return `${Math.round(ms / 60000)}m`;
    }
  };

  const statCards = [
    {
      title: 'Total Searches',
      value: formatNumber(stats.total_queries || 0),
      icon: '🔍',
      color: 'primary',
      description: 'All time searches',
      trend: stats.queries_trend
    },
    {
      title: 'Data Points',
      value: formatNumber(stats.total_data_points || 0),
      icon: '📊',
      color: 'success',
      description: 'Analyzed data points',
      trend: stats.data_points_trend
    },
    {
      title: 'Success Rate',
      value: formatPercentage(stats.success_rate || 0),
      icon: '✅',
      color: 'success',
      description: 'Successful queries',
      trend: stats.success_rate_trend
    },
    {
      title: 'Avg Response',
      value: formatDuration(stats.avg_processing_time || 0),
      icon: '⚡',
      color: 'warning',
      description: 'Processing time',
      trend: stats.response_time_trend
    }
  ];

  const getColorClasses = (color) => {
    const colors = {
      primary: {
        bg: 'bg-primary-50',
        text: 'text-primary-600',
        icon: 'bg-primary-100'
      },
      success: {
        bg: 'bg-success-50',
        text: 'text-success-600',
        icon: 'bg-success-100'
      },
      warning: {
        bg: 'bg-warning-50',
        text: 'text-warning-600',
        icon: 'bg-warning-100'
      },
      danger: {
        bg: 'bg-danger-50',
        text: 'text-danger-600',
        icon: 'bg-danger-100'
      }
    };
    return colors[color] || colors.primary;
  };

  const getTrendIcon = (trend) => {
    if (!trend) return null;
    
    if (trend > 0) {
      return (
        <div className="flex items-center text-success-600">
          <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 17l9.2-9.2M17 17V7H7" />
          </svg>
          <span className="text-xs font-medium">+{Math.abs(trend)}%</span>
        </div>
      );
    } else if (trend < 0) {
      return (
        <div className="flex items-center text-danger-600">
          <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 7l-9.2 9.2M7 7v10h10" />
          </svg>
          <span className="text-xs font-medium">{trend}%</span>
        </div>
      );
    }
    
    return (
      <div className="flex items-center text-gray-500">
        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
        </svg>
        <span className="text-xs font-medium">0%</span>
      </div>
    );
  };

  return (
    <div className={className}>
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          📈 System Overview
        </h2>
        <p className="text-gray-600 text-sm">
          Real-time statistics and performance metrics
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => {
          const colorClasses = getColorClasses(stat.color);
          
          return (
            <div key={index} className="card hover:shadow-md transition-shadow duration-200">
              <div className="card-body">
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-10 h-10 rounded-lg ${colorClasses.icon} flex items-center justify-center`}>
                    <span className="text-lg">{stat.icon}</span>
                  </div>
                  {getTrendIcon(stat.trend)}
                </div>
                
                <div className="space-y-1">
                  <h3 className="text-2xl font-bold text-gray-900">
                    {stat.value}
                  </h3>
                  <p className="text-sm font-medium text-gray-700">
                    {stat.title}
                  </p>
                  <p className="text-xs text-gray-500">
                    {stat.description}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Additional Stats */}
      {stats.recent_activity && (
        <div className="mt-8 card">
          <div className="card-header">
            <h3 className="text-lg font-semibold text-gray-900">
              🕒 Recent Activity
            </h3>
          </div>
          <div className="card-body">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary-600">
                  {formatNumber(stats.recent_activity.last_24h || 0)}
                </div>
                <div className="text-sm text-gray-600">Last 24 hours</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-success-600">
                  {formatNumber(stats.recent_activity.last_7d || 0)}
                </div>
                <div className="text-sm text-gray-600">Last 7 days</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-warning-600">
                  {formatNumber(stats.recent_activity.last_30d || 0)}
                </div>
                <div className="text-sm text-gray-600">Last 30 days</div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* System Health */}
      {stats.system_health && (
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-semibold text-gray-900">
                🏥 System Health
              </h3>
            </div>
            <div className="card-body space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">API Status</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  stats.system_health.api_status === 'healthy' 
                    ? 'bg-success-100 text-success-800'
                    : 'bg-danger-100 text-danger-800'
                }`}>
                  {stats.system_health.api_status || 'Unknown'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Database</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  stats.system_health.database_status === 'healthy' 
                    ? 'bg-success-100 text-success-800'
                    : 'bg-danger-100 text-danger-800'
                }`}>
                  {stats.system_health.database_status || 'Unknown'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">AI Engine</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  stats.system_health.ai_engine_status === 'healthy' 
                    ? 'bg-success-100 text-success-800'
                    : 'bg-warning-100 text-warning-800'
                }`}>
                  {stats.system_health.ai_engine_status || 'Unknown'}
                </span>
              </div>
            </div>
          </div>
          
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-semibold text-gray-900">
                📊 Usage Breakdown
              </h3>
            </div>
            <div className="card-body space-y-3">
              {stats.usage_breakdown && Object.entries(stats.usage_breakdown).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 capitalize">
                    {key.replace('_', ' ')}
                  </span>
                  <span className="text-sm font-medium text-gray-900">
                    {formatNumber(value)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StatsOverview;