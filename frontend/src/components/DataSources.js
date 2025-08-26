import React, { useState } from 'react';
import { LoadingSpinner } from './LoadingSpinner';

export const DataSources = ({ sources = [], loading = false, className = '' }) => {
  const [expandedSource, setExpandedSource] = useState(null);
  const [filterType, setFilterType] = useState('all');

  if (loading) {
    return (
      <div className={`card ${className}`}>
        <div className="card-header">
          <h2 className="text-xl font-semibold text-gray-900">
            📊 Data Sources
          </h2>
        </div>
        <div className="card-body">
          <LoadingSpinner size="lg" text="Loading data sources..." />
        </div>
      </div>
    );
  }

  // Generate sample data sources if none provided
  const defaultSources = [
    {
      id: 1,
      name: 'Financial News API',
      type: 'news',
      url: 'https://api.financialnews.com',
      status: 'active',
      last_updated: '2024-01-15T10:30:00Z',
      data_points: 1250,
      reliability: 0.95,
      description: 'Real-time financial news and market updates from major financial publications.',
      coverage: ['stocks', 'bonds', 'commodities', 'forex'],
      update_frequency: 'real-time'
    },
    {
      id: 2,
      name: 'Social Media Sentiment',
      type: 'social',
      url: 'https://api.socialmedia.com',
      status: 'active',
      last_updated: '2024-01-15T10:25:00Z',
      data_points: 3420,
      reliability: 0.87,
      description: 'Aggregated sentiment analysis from Twitter, Reddit, and financial forums.',
      coverage: ['sentiment', 'trends', 'discussions'],
      update_frequency: '5 minutes'
    },
    {
      id: 3,
      name: 'Market Data Feed',
      type: 'market',
      url: 'https://api.marketdata.com',
      status: 'active',
      last_updated: '2024-01-15T10:35:00Z',
      data_points: 890,
      reliability: 0.99,
      description: 'Live market data including prices, volumes, and technical indicators.',
      coverage: ['prices', 'volumes', 'indicators'],
      update_frequency: 'real-time'
    },
    {
      id: 4,
      name: 'Economic Indicators',
      type: 'economic',
      url: 'https://api.economic.gov',
      status: 'active',
      last_updated: '2024-01-15T09:00:00Z',
      data_points: 156,
      reliability: 0.98,
      description: 'Government economic data including GDP, inflation, employment statistics.',
      coverage: ['gdp', 'inflation', 'employment'],
      update_frequency: 'daily'
    },
    {
      id: 5,
      name: 'Company Filings',
      type: 'regulatory',
      url: 'https://api.sec.gov',
      status: 'maintenance',
      last_updated: '2024-01-14T16:00:00Z',
      data_points: 78,
      reliability: 0.96,
      description: 'SEC filings, earnings reports, and regulatory documents.',
      coverage: ['filings', 'earnings', 'regulatory'],
      update_frequency: 'hourly'
    }
  ];

  const dataSources = sources.length > 0 ? sources : defaultSources;

  // Filter sources by type
  const filteredSources = dataSources.filter(source => {
    if (filterType === 'all') return true;
    return source.type === filterType;
  });

  const getSourceTypeIcon = (type) => {
    switch (type?.toLowerCase()) {
      case 'news':
        return '📰';
      case 'social':
        return '💬';
      case 'market':
        return '📈';
      case 'economic':
        return '🏛️';
      case 'regulatory':
        return '📋';
      default:
        return '📊';
    }
  };

  const getSourceTypeColor = (type) => {
    switch (type?.toLowerCase()) {
      case 'news':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'social':
        return 'text-purple-600 bg-purple-50 border-purple-200';
      case 'market':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'economic':
        return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'regulatory':
        return 'text-gray-600 bg-gray-50 border-gray-200';
      default:
        return 'text-primary-600 bg-primary-50 border-primary-200';
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return 'text-success-600 bg-success-50';
      case 'maintenance':
        return 'text-warning-600 bg-warning-50';
      case 'error':
        return 'text-danger-600 bg-danger-50';
      case 'inactive':
        return 'text-gray-600 bg-gray-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return '🟢';
      case 'maintenance':
        return '🟡';
      case 'error':
        return '🔴';
      case 'inactive':
        return '⚫';
      default:
        return '⚫';
    }
  };

  const getReliabilityColor = (reliability) => {
    if (reliability >= 0.9) return 'text-success-600';
    if (reliability >= 0.8) return 'text-warning-600';
    return 'text-danger-600';
  };

  const formatLastUpdated = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  const uniqueTypes = [...new Set(dataSources.map(source => source.type))].filter(Boolean);
  const totalDataPoints = dataSources.reduce((sum, source) => sum + (source.data_points || 0), 0);
  const averageReliability = dataSources.reduce((sum, source) => sum + (source.reliability || 0), 0) / dataSources.length;
  const activeSources = dataSources.filter(source => source.status === 'active').length;

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header with Stats */}
      <div className="card">
        <div className="card-header">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <h2 className="text-xl font-semibold text-gray-900">
              📊 Data Sources
            </h2>
            <div className="flex items-center space-x-4">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="input-sm"
              >
                <option value="all">All Types</option>
                {uniqueTypes.map(type => (
                  <option key={type} value={type} className="capitalize">
                    {type}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
        <div className="card-body">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-primary-50 rounded-lg">
              <div className="text-lg font-semibold text-primary-600">
                {dataSources.length}
              </div>
              <div className="text-sm text-primary-700">Total Sources</div>
            </div>
            <div className="text-center p-3 bg-success-50 rounded-lg">
              <div className="text-lg font-semibold text-success-600">
                {activeSources}
              </div>
              <div className="text-sm text-success-700">Active Sources</div>
            </div>
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-lg font-semibold text-blue-600">
                {totalDataPoints.toLocaleString()}
              </div>
              <div className="text-sm text-blue-700">Data Points</div>
            </div>
            <div className="text-center p-3 bg-purple-50 rounded-lg">
              <div className="text-lg font-semibold text-purple-600">
                {Math.round(averageReliability * 100)}%
              </div>
              <div className="text-sm text-purple-700">Avg Reliability</div>
            </div>
          </div>
        </div>
      </div>

      {/* Sources List */}
      <div className="space-y-4">
        {filteredSources.map((source) => (
          <div key={source.id} className="card hover:shadow-lg transition-shadow">
            <div className="card-header">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">
                    {getSourceTypeIcon(source.type)}
                  </span>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {source.name}
                    </h3>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getSourceTypeColor(source.type)}`}>
                        {source.type}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(source.status)}`}>
                        {getStatusIcon(source.status)} {source.status}
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setExpandedSource(expandedSource === source.id ? null : source.id)}
                  className="text-primary-600 hover:text-primary-700 font-medium text-sm"
                >
                  {expandedSource === source.id ? 'Less' : 'More'} Details
                </button>
              </div>
            </div>
            <div className="card-body">
              <p className="text-gray-700 text-sm mb-4">
                {source.description}
              </p>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div className="text-center p-2 bg-gray-50 rounded">
                  <div className="text-sm font-semibold text-gray-900">
                    {source.data_points?.toLocaleString() || 'N/A'}
                  </div>
                  <div className="text-xs text-gray-600">Data Points</div>
                </div>
                <div className="text-center p-2 bg-gray-50 rounded">
                  <div className={`text-sm font-semibold ${getReliabilityColor(source.reliability)}`}>
                    {source.reliability ? Math.round(source.reliability * 100) + '%' : 'N/A'}
                  </div>
                  <div className="text-xs text-gray-600">Reliability</div>
                </div>
                <div className="text-center p-2 bg-gray-50 rounded">
                  <div className="text-sm font-semibold text-gray-900">
                    {source.update_frequency || 'N/A'}
                  </div>
                  <div className="text-xs text-gray-600">Update Freq</div>
                </div>
                <div className="text-center p-2 bg-gray-50 rounded">
                  <div className="text-sm font-semibold text-gray-900">
                    {formatLastUpdated(source.last_updated)}
                  </div>
                  <div className="text-xs text-gray-600">Last Updated</div>
                </div>
              </div>

              {/* Coverage Tags */}
              {source.coverage && source.coverage.length > 0 && (
                <div className="mb-4">
                  <div className="text-sm font-medium text-gray-700 mb-2">Coverage:</div>
                  <div className="flex flex-wrap gap-1">
                    {source.coverage.map((item, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Expanded Details */}
              {expandedSource === source.id && (
                <div className="border-t pt-4 mt-4 space-y-4">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Technical Details</h4>
                    <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">API Endpoint:</span>
                        <span className="font-mono text-gray-900 text-xs">
                          {source.url}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Last Updated:</span>
                        <span className="text-gray-900">
                          {new Date(source.last_updated).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Status:</span>
                        <span className={`font-medium ${getStatusColor(source.status).split(' ')[0]}`}>
                          {source.status}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Data Quality Metrics</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Reliability Score:</span>
                        <span className={`font-medium ${getReliabilityColor(source.reliability)}`}>
                          {source.reliability ? (source.reliability * 100).toFixed(1) + '%' : 'N/A'}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all duration-300 ${
                            source.reliability >= 0.9 ? 'bg-success-500' :
                            source.reliability >= 0.8 ? 'bg-warning-500' : 'bg-danger-500'
                          }`}
                          style={{ width: `${(source.reliability || 0) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Usage Statistics</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="bg-blue-50 rounded-lg p-3">
                        <div className="text-lg font-semibold text-blue-600">
                          {source.data_points?.toLocaleString() || '0'}
                        </div>
                        <div className="text-sm text-blue-700">Total Data Points</div>
                      </div>
                      <div className="bg-green-50 rounded-lg p-3">
                        <div className="text-lg font-semibold text-green-600">
                          {source.update_frequency || 'Unknown'}
                        </div>
                        <div className="text-sm text-green-700">Update Frequency</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredSources.length === 0 && (
        <div className="card">
          <div className="card-body text-center py-12">
            <div className="text-gray-400 text-4xl mb-2">📊</div>
            <p className="text-gray-500">No data sources found</p>
            <p className="text-sm text-gray-400 mt-1">
              {filterType !== 'all' ? `No sources of type "${filterType}"` : 'No data sources available'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataSources;