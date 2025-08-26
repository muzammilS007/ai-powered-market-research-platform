import React, { useState } from 'react';
import { LoadingSpinner } from './LoadingSpinner';

export const InsightsPanel = ({ insights = [], loading = false, className = '' }) => {
  const [selectedInsight, setSelectedInsight] = useState(null);
  const [filterType, setFilterType] = useState('all');
  const [sortBy, setSortBy] = useState('confidence');

  if (loading) {
    return (
      <div className={`card ${className}`}>
        <div className="card-header">
          <h2 className="text-xl font-semibold text-gray-900">
            💡 AI Market Insights
          </h2>
        </div>
        <div className="card-body">
          <LoadingSpinner size="lg" text="Generating insights..." />
        </div>
      </div>
    );
  }

  if (!insights || insights.length === 0) {
    return (
      <div className={`card ${className}`}>
        <div className="card-header">
          <h2 className="text-xl font-semibold text-gray-900">
            💡 AI Market Insights
          </h2>
        </div>
        <div className="card-body text-center py-12">
          <div className="text-gray-400 text-4xl mb-2">💡</div>
          <p className="text-gray-500">No insights available</p>
          <p className="text-sm text-gray-400 mt-1">
            Insights will appear here after analyzing market data
          </p>
        </div>
      </div>
    );
  }

  // Filter insights by type
  const filteredInsights = insights.filter(insight => {
    if (filterType === 'all') return true;
    return insight.insight_type === filterType;
  });

  // Sort insights
  const sortedInsights = [...filteredInsights].sort((a, b) => {
    switch (sortBy) {
      case 'confidence':
        return (b.confidence_score || 0) - (a.confidence_score || 0);
      case 'impact':
        const impactOrder = { 'high': 3, 'medium': 2, 'low': 1 };
        return (impactOrder[b.impact_level] || 0) - (impactOrder[a.impact_level] || 0);
      case 'timeframe':
        const timeframeOrder = { 'immediate': 4, 'short-term': 3, 'medium-term': 2, 'long-term': 1 };
        return (timeframeOrder[b.timeframe] || 0) - (timeframeOrder[a.timeframe] || 0);
      default:
        return 0;
    }
  });

  const getInsightTypeIcon = (type) => {
    switch (type?.toLowerCase()) {
      case 'opportunity':
        return '🚀';
      case 'risk':
        return '⚠️';
      case 'trend':
        return '📈';
      case 'recommendation':
        return '💡';
      case 'prediction':
        return '🔮';
      default:
        return '💡';
    }
  };

  const getInsightTypeColor = (type) => {
    switch (type?.toLowerCase()) {
      case 'opportunity':
        return 'text-success-600 bg-success-50 border-success-200';
      case 'risk':
        return 'text-danger-600 bg-danger-50 border-danger-200';
      case 'trend':
        return 'text-primary-600 bg-primary-50 border-primary-200';
      case 'recommendation':
        return 'text-secondary-600 bg-secondary-50 border-secondary-200';
      case 'prediction':
        return 'text-purple-600 bg-purple-50 border-purple-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getImpactColor = (impact) => {
    switch (impact?.toLowerCase()) {
      case 'high':
        return 'text-danger-600 bg-danger-50';
      case 'medium':
        return 'text-warning-600 bg-warning-50';
      case 'low':
        return 'text-success-600 bg-success-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getTimeframeColor = (timeframe) => {
    switch (timeframe?.toLowerCase()) {
      case 'immediate':
        return 'text-danger-600 bg-danger-50';
      case 'short-term':
        return 'text-warning-600 bg-warning-50';
      case 'medium-term':
        return 'text-primary-600 bg-primary-50';
      case 'long-term':
        return 'text-success-600 bg-success-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const uniqueTypes = [...new Set(insights.map(insight => insight.insight_type))].filter(Boolean);

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header with Filters */}
      <div className="card">
        <div className="card-header">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <h2 className="text-xl font-semibold text-gray-900">
              💡 AI Market Insights
            </h2>
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
              {/* Filter by Type */}
              <div className="flex items-center space-x-2">
                <label className="text-sm font-medium text-gray-700">Type:</label>
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
              {/* Sort By */}
              <div className="flex items-center space-x-2">
                <label className="text-sm font-medium text-gray-700">Sort:</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="input-sm"
                >
                  <option value="confidence">Confidence</option>
                  <option value="impact">Impact Level</option>
                  <option value="timeframe">Timeframe</option>
                </select>
              </div>
            </div>
          </div>
        </div>
        <div className="card-body">
          <div className="text-sm text-gray-600">
            Showing {sortedInsights.length} of {insights.length} insights
          </div>
        </div>
      </div>

      {/* Insights Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {sortedInsights.map((insight, index) => (
          <div
            key={insight.id || index}
            className={`card hover:shadow-lg transition-shadow cursor-pointer ${
              selectedInsight?.id === insight.id ? 'ring-2 ring-primary-500' : ''
            }`}
            onClick={() => setSelectedInsight(insight)}
          >
            <div className="card-header">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">
                    {getInsightTypeIcon(insight.insight_type)}
                  </span>
                  <div>
                    <h3 className="font-semibold text-gray-900 line-clamp-2">
                      {insight.title}
                    </h3>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getInsightTypeColor(insight.insight_type)}`}>
                        {insight.insight_type}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-end space-y-1">
                  {insight.confidence_score && (
                    <div className="text-xs text-gray-500">
                      {Math.round(insight.confidence_score * 100)}% confidence
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="card-body">
              <p className="text-gray-700 text-sm line-clamp-3 mb-4">
                {insight.description}
              </p>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {insight.impact_level && (
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getImpactColor(insight.impact_level)}`}>
                      {insight.impact_level} impact
                    </span>
                  )}
                  {insight.timeframe && (
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTimeframeColor(insight.timeframe)}`}>
                      {insight.timeframe}
                    </span>
                  )}
                </div>
                <button className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                  View Details →
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Detailed View Modal */}
      {selectedInsight && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="card-header border-b">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <span className="text-3xl">
                    {getInsightTypeIcon(selectedInsight.insight_type)}
                  </span>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">
                      {selectedInsight.title}
                    </h2>
                    <div className="flex items-center space-x-2 mt-2">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getInsightTypeColor(selectedInsight.insight_type)}`}>
                        {selectedInsight.insight_type}
                      </span>
                      {selectedInsight.impact_level && (
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getImpactColor(selectedInsight.impact_level)}`}>
                          {selectedInsight.impact_level} impact
                        </span>
                      )}
                      {selectedInsight.timeframe && (
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getTimeframeColor(selectedInsight.timeframe)}`}>
                          {selectedInsight.timeframe}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedInsight(null)}
                  className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
                >
                  ×
                </button>
              </div>
            </div>
            <div className="card-body space-y-6">
              {/* Description */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
                <p className="text-gray-700 leading-relaxed">
                  {selectedInsight.description}
                </p>
              </div>

              {/* Supporting Data */}
              {selectedInsight.supporting_data && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Supporting Data</h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <pre className="text-sm text-gray-700 whitespace-pre-wrap">
                      {typeof selectedInsight.supporting_data === 'string' 
                        ? selectedInsight.supporting_data 
                        : JSON.stringify(selectedInsight.supporting_data, null, 2)
                      }
                    </pre>
                  </div>
                </div>
              )}

              {/* Metrics */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Key Metrics</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="text-center p-3 bg-primary-50 rounded-lg">
                    <div className="text-lg font-semibold text-primary-600">
                      {selectedInsight.confidence_score ? Math.round(selectedInsight.confidence_score * 100) : 'N/A'}%
                    </div>
                    <div className="text-sm text-primary-700">Confidence</div>
                  </div>
                  <div className="text-center p-3 bg-secondary-50 rounded-lg">
                    <div className="text-lg font-semibold text-secondary-600 capitalize">
                      {selectedInsight.impact_level || 'N/A'}
                    </div>
                    <div className="text-sm text-secondary-700">Impact Level</div>
                  </div>
                  <div className="text-center p-3 bg-success-50 rounded-lg">
                    <div className="text-lg font-semibold text-success-600 capitalize">
                      {selectedInsight.timeframe || 'N/A'}
                    </div>
                    <div className="text-sm text-success-700">Timeframe</div>
                  </div>
                </div>
              </div>

              {/* Action Items */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Recommended Actions</h3>
                <div className="space-y-2">
                  {selectedInsight.insight_type === 'opportunity' && (
                    <div className="flex items-start space-x-3">
                      <span className="flex-shrink-0 w-2 h-2 bg-success-500 rounded-full mt-2"></span>
                      <p className="text-sm text-gray-700">
                        Consider capitalizing on this opportunity within the {selectedInsight.timeframe} timeframe
                      </p>
                    </div>
                  )}
                  {selectedInsight.insight_type === 'risk' && (
                    <div className="flex items-start space-x-3">
                      <span className="flex-shrink-0 w-2 h-2 bg-danger-500 rounded-full mt-2"></span>
                      <p className="text-sm text-gray-700">
                        Implement risk mitigation strategies to address this {selectedInsight.impact_level} impact risk
                      </p>
                    </div>
                  )}
                  <div className="flex items-start space-x-3">
                    <span className="flex-shrink-0 w-2 h-2 bg-primary-500 rounded-full mt-2"></span>
                    <p className="text-sm text-gray-700">
                      Monitor related market indicators for changes
                    </p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <span className="flex-shrink-0 w-2 h-2 bg-primary-500 rounded-full mt-2"></span>
                    <p className="text-sm text-gray-700">
                      Review and update strategy based on new data
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Summary Stats */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-semibold text-gray-900">
            📊 Insights Summary
          </h3>
        </div>
        <div className="card-body">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-lg font-semibold text-blue-600">
                {insights.length}
              </div>
              <div className="text-sm text-blue-700">Total Insights</div>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-lg font-semibold text-green-600">
                {insights.filter(i => i.insight_type === 'opportunity').length}
              </div>
              <div className="text-sm text-green-700">Opportunities</div>
            </div>
            <div className="text-center p-3 bg-red-50 rounded-lg">
              <div className="text-lg font-semibold text-red-600">
                {insights.filter(i => i.insight_type === 'risk').length}
              </div>
              <div className="text-sm text-red-700">Risks</div>
            </div>
            <div className="text-center p-3 bg-purple-50 rounded-lg">
              <div className="text-lg font-semibold text-purple-600">
                {insights.filter(i => i.impact_level === 'high').length}
              </div>
              <div className="text-sm text-purple-700">High Impact</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InsightsPanel;