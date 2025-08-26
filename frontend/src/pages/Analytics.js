import React, { useState, useEffect } from 'react';
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
  ArcElement,
  Filler,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import { useApi } from '../context/ApiContext';
import { LoadingSpinner, PageLoader, ChartSkeleton } from '../components/LoadingSpinner';
import { ErrorAlert } from '../components/ErrorAlert';
import { TrendingTopics } from '../components/TrendingTopics';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  PointElement,
  LineElement,
  ArcElement,
  Filler
);

export const Analytics = () => {
  const { getApiStats, getTrendingTopics, getMarketInsights } = useApi();
  const [stats, setStats] = useState(null);
  const [trends, setTrends] = useState([]);
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState('7d');
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    loadAnalytics();
  }, [timeRange]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [statsData, trendsData, insightsData] = await Promise.all([
        getApiStats(),
        getTrendingTopics({ days: parseInt(timeRange.replace('d', '')) }),
        getMarketInsights({ limit: 10 })
      ]);
      
      setStats(statsData);
      setTrends(trendsData || []);
      setInsights(insightsData || []);
    } catch (err) {
      setError(err.message || 'Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  // Generate sample data for charts if not available
  const generateSampleData = () => {
    const days = parseInt(timeRange.replace('d', ''));
    const data = [];
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      data.push({
        date: date.toISOString().split('T')[0],
        queries: Math.floor(Math.random() * 50) + 10,
        success_rate: 0.85 + Math.random() * 0.1,
        avg_response_time: 1.5 + Math.random() * 2
      });
    }
    return data;
  };

  const sampleData = generateSampleData();
  const chartData = stats?.daily_stats || sampleData;

  // Usage Trend Chart
  const usageChartData = {
    labels: chartData.map(item => {
      const date = new Date(item.date);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }),
    datasets: [
      {
        label: 'Queries',
        data: chartData.map(item => item.queries),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderWidth: 2,
        fill: true,
        tension: 0.4
      }
    ]
  };

  const usageChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Query Volume Over Time'
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Number of Queries'
        }
      }
    }
  };

  // Performance Chart
  const performanceChartData = {
    labels: chartData.map(item => {
      const date = new Date(item.date);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }),
    datasets: [
      {
        label: 'Success Rate (%)',
        data: chartData.map(item => item.success_rate * 100),
        borderColor: 'rgb(16, 185, 129)',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        borderWidth: 2,
        fill: false,
        tension: 0.4,
        yAxisID: 'y'
      },
      {
        label: 'Avg Response Time (s)',
        data: chartData.map(item => item.avg_response_time),
        borderColor: 'rgb(245, 158, 11)',
        backgroundColor: 'rgba(245, 158, 11, 0.1)',
        borderWidth: 2,
        fill: false,
        tension: 0.4,
        yAxisID: 'y1'
      }
    ]
  };

  const performanceChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Performance Metrics'
      }
    },
    scales: {
      x: {
        display: true,
      },
      y: {
        type: 'linear',
        display: true,
        position: 'left',
        title: {
          display: true,
          text: 'Success Rate (%)'
        },
        min: 0,
        max: 100
      },
      y1: {
        type: 'linear',
        display: true,
        position: 'right',
        title: {
          display: true,
          text: 'Response Time (s)'
        },
        grid: {
          drawOnChartArea: false,
        },
        min: 0
      }
    }
  };

  // Query Types Distribution
  const queryTypes = {
    'Market Analysis': 35,
    'Sentiment Analysis': 25,
    'Trend Prediction': 20,
    'Risk Assessment': 15,
    'Other': 5
  };

  const queryTypesChartData = {
    labels: Object.keys(queryTypes),
    datasets: [
      {
        data: Object.values(queryTypes),
        backgroundColor: [
          '#3B82F6',
          '#10B981',
          '#F59E0B',
          '#EF4444',
          '#8B5CF6'
        ],
        borderColor: [
          '#2563EB',
          '#059669',
          '#D97706',
          '#DC2626',
          '#7C3AED'
        ],
        borderWidth: 2
      }
    ]
  };

  const queryTypesChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 20,
          usePointStyle: true
        }
      },
      title: {
        display: true,
        text: 'Query Types Distribution'
      }
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'usage', label: 'Usage', icon: '📈' },
    { id: 'performance', label: 'Performance', icon: '⚡' },
    { id: 'insights', label: 'Insights', icon: '💡' }
  ];

  if (loading) {
    return <PageLoader text="Loading analytics..." />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              📊 Analytics Dashboard
            </h1>
            <p className="text-gray-600">
              Comprehensive insights into API usage and market trends
            </p>
          </div>
          <div className="mt-4 sm:mt-0">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="input"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
            </select>
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="mb-6">
          <ErrorAlert
            message={error}
            onRetry={loadAnalytics}
            onDismiss={() => setError(null)}
          />
        </div>
      )}

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="card">
          <div className="card-body text-center">
            <div className="text-3xl font-bold text-primary-600">
              {stats?.total_queries?.toLocaleString() || '1,234'}
            </div>
            <div className="text-sm text-gray-600 mt-1">Total Queries</div>
            <div className="text-xs text-success-600 mt-1">
              +12% from last period
            </div>
          </div>
        </div>
        <div className="card">
          <div className="card-body text-center">
            <div className="text-3xl font-bold text-success-600">
              {stats?.success_rate ? Math.round(stats.success_rate * 100) : '94'}%
            </div>
            <div className="text-sm text-gray-600 mt-1">Success Rate</div>
            <div className="text-xs text-success-600 mt-1">
              +2% from last period
            </div>
          </div>
        </div>
        <div className="card">
          <div className="card-body text-center">
            <div className="text-3xl font-bold text-warning-600">
              {stats?.avg_response_time?.toFixed(1) || '2.1'}s
            </div>
            <div className="text-sm text-gray-600 mt-1">Avg Response Time</div>
            <div className="text-xs text-danger-600 mt-1">
              +0.3s from last period
            </div>
          </div>
        </div>
        <div className="card">
          <div className="card-body text-center">
            <div className="text-3xl font-bold text-secondary-600">
              {stats?.total_data_points?.toLocaleString() || '45.2K'}
            </div>
            <div className="text-sm text-gray-600 mt-1">Data Points</div>
            <div className="text-xs text-success-600 mt-1">
              +18% from last period
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="card mb-6">
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
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="chart-container" style={{ height: '300px' }}>
                  <Line data={usageChartData} options={usageChartOptions} />
                </div>
                <div className="chart-container" style={{ height: '300px' }}>
                  <Doughnut data={queryTypesChartData} options={queryTypesChartOptions} />
                </div>
              </div>
              
              {/* Recent Activity */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
                <div className="space-y-3">
                  {[1, 2, 3, 4, 5].map((item) => (
                    <div key={item} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">📊</span>
                        <div>
                          <div className="font-medium text-gray-900">
                            Market analysis query completed
                          </div>
                          <div className="text-sm text-gray-500">
                            {item} hour{item > 1 ? 's' : ''} ago
                          </div>
                        </div>
                      </div>
                      <span className="px-2 py-1 bg-success-50 text-success-600 rounded-full text-xs font-medium">
                        Success
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Usage Tab */}
          {activeTab === 'usage' && (
            <div className="space-y-6">
              <div className="chart-container" style={{ height: '400px' }}>
                <Line data={usageChartData} options={usageChartOptions} />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="card">
                  <div className="card-body text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {Math.max(...chartData.map(d => d.queries))}
                    </div>
                    <div className="text-sm text-gray-600">Peak Daily Queries</div>
                  </div>
                </div>
                <div className="card">
                  <div className="card-body text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {Math.round(chartData.reduce((sum, d) => sum + d.queries, 0) / chartData.length)}
                    </div>
                    <div className="text-sm text-gray-600">Avg Daily Queries</div>
                  </div>
                </div>
                <div className="card">
                  <div className="card-body text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {chartData.reduce((sum, d) => sum + d.queries, 0)}
                    </div>
                    <div className="text-sm text-gray-600">Total Queries</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Performance Tab */}
          {activeTab === 'performance' && (
            <div className="space-y-6">
              <div className="chart-container" style={{ height: '400px' }}>
                <Line data={performanceChartData} options={performanceChartOptions} />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="card">
                  <div className="card-header">
                    <h3 className="text-lg font-semibold text-gray-900">System Health</h3>
                  </div>
                  <div className="card-body space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">API Status</span>
                      <span className="px-2 py-1 bg-success-50 text-success-600 rounded-full text-sm font-medium">
                        🟢 Healthy
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Database</span>
                      <span className="px-2 py-1 bg-success-50 text-success-600 rounded-full text-sm font-medium">
                        🟢 Healthy
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">AI Engine</span>
                      <span className="px-2 py-1 bg-warning-50 text-warning-600 rounded-full text-sm font-medium">
                        🟡 Degraded
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="card">
                  <div className="card-header">
                    <h3 className="text-lg font-semibold text-gray-900">Performance Metrics</h3>
                  </div>
                  <div className="card-body space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Uptime</span>
                      <span className="font-medium">99.9%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Error Rate</span>
                      <span className="font-medium">0.1%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">P95 Response Time</span>
                      <span className="font-medium">3.2s</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Insights Tab */}
          {activeTab === 'insights' && (
            <div className="space-y-6">
              <TrendingTopics data={trends} loading={false} />
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="card">
                  <div className="card-header">
                    <h3 className="text-lg font-semibold text-gray-900">Top Performing Queries</h3>
                  </div>
                  <div className="card-body space-y-3">
                    {['Tesla stock analysis', 'Bitcoin price prediction', 'Tech sector trends', 'Oil market outlook', 'Fed rate impact'].map((query, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="text-gray-900">{query}</span>
                        <span className="text-sm text-gray-500">{Math.floor(Math.random() * 100) + 50} queries</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="card">
                  <div className="card-header">
                    <h3 className="text-lg font-semibold text-gray-900">Market Sentiment</h3>
                  </div>
                  <div className="card-body">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Overall Market</span>
                        <span className="px-3 py-1 bg-success-50 text-success-600 rounded-full text-sm font-medium">
                          😊 Positive
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Tech Sector</span>
                        <span className="px-3 py-1 bg-warning-50 text-warning-600 rounded-full text-sm font-medium">
                          😐 Neutral
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Energy Sector</span>
                        <span className="px-3 py-1 bg-danger-50 text-danger-600 rounded-full text-sm font-medium">
                          😞 Negative
                        </span>
                      </div>
                    </div>
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

export default Analytics;