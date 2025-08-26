import React, { useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  PointElement,
  LineElement,
  Filler,
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';
import { ChartSkeleton } from './LoadingSpinner';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  PointElement,
  LineElement,
  Filler
);

export const TrendChart = ({ data, loading = false, className = '' }) => {
  const [activeTab, setActiveTab] = useState('timeline');

  if (loading) {
    return (
      <div className={className}>
        <ChartSkeleton />
      </div>
    );
  }

  if (!data) {
    return (
      <div className={`card ${className}`}>
        <div className="card-body text-center py-12">
          <div className="text-gray-400 text-4xl mb-2">📈</div>
          <p className="text-gray-500">No trend data available</p>
        </div>
      </div>
    );
  }

  const analysisData = data.analysis_data || {};
  const relatedKeywords = data.related_keywords || [];
  const trendDirection = data.trend_direction || 'stable';
  const strength = data.strength || 0;
  const confidenceScore = data.confidence_score || 0;

  // Generate sample timeline data if not provided
  const timelineData = analysisData.timeline || [
    { date: '2024-01-01', mentions: 10, sentiment: 0.2 },
    { date: '2024-01-02', mentions: 15, sentiment: 0.3 },
    { date: '2024-01-03', mentions: 12, sentiment: 0.1 },
    { date: '2024-01-04', mentions: 20, sentiment: 0.4 },
    { date: '2024-01-05', mentions: 25, sentiment: 0.5 },
    { date: '2024-01-06', mentions: 18, sentiment: 0.3 },
    { date: '2024-01-07', mentions: 30, sentiment: 0.6 }
  ];

  // Line chart for trend timeline
  const lineData = {
    labels: timelineData.map(item => {
      const date = new Date(item.date);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }),
    datasets: [
      {
        label: 'Mentions',
        data: timelineData.map(item => item.mentions),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderWidth: 2,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: 'rgb(59, 130, 246)',
        pointBorderColor: 'white',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6
      },
      {
        label: 'Sentiment Score',
        data: timelineData.map(item => item.sentiment * 50), // Scale for visibility
        borderColor: 'rgb(16, 185, 129)',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        borderWidth: 2,
        fill: false,
        tension: 0.4,
        pointBackgroundColor: 'rgb(16, 185, 129)',
        pointBorderColor: 'white',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
        yAxisID: 'y1'
      }
    ]
  };

  const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      legend: {
        position: 'top',
        labels: {
          usePointStyle: true,
          padding: 20
        }
      },
      tooltip: {
        callbacks: {
          afterLabel: function(context) {
            if (context.datasetIndex === 1) {
              return `Actual sentiment: ${(context.parsed.y / 50).toFixed(2)}`;
            }
            return '';
          }
        }
      }
    },
    scales: {
      x: {
        display: true,
        title: {
          display: true,
          text: 'Date'
        }
      },
      y: {
        type: 'linear',
        display: true,
        position: 'left',
        title: {
          display: true,
          text: 'Mentions'
        },
        beginAtZero: true
      },
      y1: {
        type: 'linear',
        display: true,
        position: 'right',
        title: {
          display: true,
          text: 'Sentiment Score (scaled)'
        },
        grid: {
          drawOnChartArea: false,
        },
        beginAtZero: true
      }
    }
  };

  // Bar chart for keyword frequency
  const keywordData = {
    labels: relatedKeywords.slice(0, 10).map(keyword => keyword.word || keyword),
    datasets: [
      {
        label: 'Frequency',
        data: relatedKeywords.slice(0, 10).map(keyword => keyword.frequency || Math.floor(Math.random() * 100) + 10),
        backgroundColor: 'rgba(139, 92, 246, 0.8)',
        borderColor: 'rgb(139, 92, 246)',
        borderWidth: 1,
        borderRadius: 4
      }
    ]
  };

  const keywordOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            return `${context.label}: ${context.parsed.y} mentions`;
          }
        }
      }
    },
    scales: {
      x: {
        ticks: {
          maxRotation: 45,
          minRotation: 45
        }
      },
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Frequency'
        }
      }
    }
  };

  const getTrendColor = (direction) => {
    switch (direction?.toLowerCase()) {
      case 'rising':
      case 'up':
        return 'text-success-600 bg-success-50';
      case 'falling':
      case 'down':
        return 'text-danger-600 bg-danger-50';
      case 'stable':
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getTrendIcon = (direction) => {
    switch (direction?.toLowerCase()) {
      case 'rising':
      case 'up':
        return '📈';
      case 'falling':
      case 'down':
        return '📉';
      case 'stable':
      default:
        return '➡️';
    }
  };

  const getStrengthLabel = (strength) => {
    if (strength >= 0.8) return 'Very Strong';
    if (strength >= 0.6) return 'Strong';
    if (strength >= 0.4) return 'Moderate';
    if (strength >= 0.2) return 'Weak';
    return 'Very Weak';
  };

  const tabs = [
    { id: 'timeline', label: 'Timeline', icon: '📈' },
    { id: 'keywords', label: 'Keywords', icon: '🔤' },
    { id: 'insights', label: 'Insights', icon: '💡' }
  ];

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="card">
        <div className="card-header">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">
              📈 Trend Analysis
            </h2>
            <div className="flex items-center space-x-2">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getTrendColor(trendDirection)}`}>
                {getTrendIcon(trendDirection)} {trendDirection}
              </span>
            </div>
          </div>
        </div>
        <div className="card-body">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-primary-50 rounded-lg">
              <div className="text-2xl font-bold text-primary-600">
                {getTrendIcon(trendDirection)}
              </div>
              <div className="text-sm text-primary-700">Direction</div>
              <div className="text-xs text-primary-600 capitalize">
                {trendDirection}
              </div>
            </div>
            <div className="text-center p-4 bg-secondary-50 rounded-lg">
              <div className="text-2xl font-bold text-secondary-600">
                {Math.round(strength * 100)}%
              </div>
              <div className="text-sm text-secondary-700">Strength</div>
              <div className="text-xs text-secondary-600">
                {getStrengthLabel(strength)}
              </div>
            </div>
            <div className="text-center p-4 bg-success-50 rounded-lg">
              <div className="text-2xl font-bold text-success-600">
                {Math.round(confidenceScore * 100)}%
              </div>
              <div className="text-sm text-success-700">Confidence</div>
              <div className="text-xs text-success-600">
                Analysis accuracy
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="card">
        <div className="card-header border-b-0">
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-white text-primary-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="card-body">
          {/* Timeline Tab */}
          {activeTab === 'timeline' && (
            <div className="space-y-4">
              <div className="chart-container" style={{ height: '400px' }}>
                <Line data={lineData} options={lineOptions} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <div className="text-lg font-semibold text-blue-600">
                    {timelineData.reduce((sum, item) => sum + item.mentions, 0)}
                  </div>
                  <div className="text-sm text-blue-700">Total Mentions</div>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <div className="text-lg font-semibold text-green-600">
                    {Math.max(...timelineData.map(item => item.mentions))}
                  </div>
                  <div className="text-sm text-green-700">Peak Mentions</div>
                </div>
                <div className="text-center p-3 bg-purple-50 rounded-lg">
                  <div className="text-lg font-semibold text-purple-600">
                    {(timelineData.reduce((sum, item) => sum + item.sentiment, 0) / timelineData.length).toFixed(2)}
                  </div>
                  <div className="text-sm text-purple-700">Avg Sentiment</div>
                </div>
              </div>
            </div>
          )}

          {/* Keywords Tab */}
          {activeTab === 'keywords' && (
            <div className="space-y-4">
              <div className="chart-container" style={{ height: '400px' }}>
                <Bar data={keywordData} options={keywordOptions} />
              </div>
              <div className="mt-6">
                <h4 className="font-medium text-gray-900 mb-3">Related Keywords</h4>
                <div className="flex flex-wrap gap-2">
                  {relatedKeywords.slice(0, 20).map((keyword, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                    >
                      {keyword.word || keyword}
                      {keyword.frequency && (
                        <span className="ml-1 text-xs text-gray-500">
                          ({keyword.frequency})
                        </span>
                      )}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Insights Tab */}
          {activeTab === 'insights' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Key Findings</h4>
                  <ul className="space-y-3">
                    <li className="flex items-start space-x-3">
                      <span className="flex-shrink-0 w-2 h-2 bg-primary-500 rounded-full mt-2"></span>
                      <div>
                        <p className="text-sm text-gray-700">
                          Trend is currently <strong className="capitalize">{trendDirection}</strong> with {getStrengthLabel(strength).toLowerCase()} strength
                        </p>
                      </div>
                    </li>
                    <li className="flex items-start space-x-3">
                      <span className="flex-shrink-0 w-2 h-2 bg-primary-500 rounded-full mt-2"></span>
                      <div>
                        <p className="text-sm text-gray-700">
                          Analysis confidence is <strong>{Math.round(confidenceScore * 100)}%</strong> based on available data
                        </p>
                      </div>
                    </li>
                    <li className="flex items-start space-x-3">
                      <span className="flex-shrink-0 w-2 h-2 bg-primary-500 rounded-full mt-2"></span>
                      <div>
                        <p className="text-sm text-gray-700">
                          {relatedKeywords.length} related keywords identified
                        </p>
                      </div>
                    </li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Recommendations</h4>
                  <ul className="space-y-3">
                    {trendDirection === 'rising' && (
                      <li className="flex items-start space-x-3">
                        <span className="flex-shrink-0 w-2 h-2 bg-success-500 rounded-full mt-2"></span>
                        <div>
                          <p className="text-sm text-gray-700">
                            Consider increasing investment or focus on this trending topic
                          </p>
                        </div>
                      </li>
                    )}
                    {trendDirection === 'falling' && (
                      <li className="flex items-start space-x-3">
                        <span className="flex-shrink-0 w-2 h-2 bg-warning-500 rounded-full mt-2"></span>
                        <div>
                          <p className="text-sm text-gray-700">
                            Monitor closely and consider alternative strategies
                          </p>
                        </div>
                      </li>
                    )}
                    <li className="flex items-start space-x-3">
                      <span className="flex-shrink-0 w-2 h-2 bg-primary-500 rounded-full mt-2"></span>
                      <div>
                        <p className="text-sm text-gray-700">
                          Continue monitoring for pattern changes
                        </p>
                      </div>
                    </li>
                    <li className="flex items-start space-x-3">
                      <span className="flex-shrink-0 w-2 h-2 bg-primary-500 rounded-full mt-2"></span>
                      <div>
                        <p className="text-sm text-gray-700">
                          Analyze related keywords for additional opportunities
                        </p>
                      </div>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Trend Strength Indicator */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-3">Trend Strength Breakdown</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Momentum:</span>
                    <span className="font-medium">{Math.round(strength * 100)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-primary-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${strength * 100}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Very Weak</span>
                    <span>Very Strong</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TrendChart;