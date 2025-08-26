import React, { useEffect, useRef } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
} from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import { ChartSkeleton } from './LoadingSpinner';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
);

export const SentimentChart = ({ data, loading = false, className = '' }) => {
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
          <div className="text-gray-400 text-4xl mb-2">😊</div>
          <p className="text-gray-500">No sentiment data available</p>
        </div>
      </div>
    );
  }

  const sentimentBreakdown = data.sentiment_breakdown || {
    positive: 0,
    negative: 0,
    neutral: 0
  };

  const sampleTexts = data.sample_texts || [];
  const confidenceScore = data.confidence_score || 0;
  const overallSentiment = data.overall_sentiment || 'neutral';

  // Doughnut chart for sentiment distribution
  const doughnutData = {
    labels: ['Positive', 'Negative', 'Neutral'],
    datasets: [
      {
        data: [
          sentimentBreakdown.positive,
          sentimentBreakdown.negative,
          sentimentBreakdown.neutral
        ],
        backgroundColor: [
          '#10B981', // success-500
          '#EF4444', // danger-500
          '#6B7280'  // gray-500
        ],
        borderColor: [
          '#059669', // success-600
          '#DC2626', // danger-600
          '#4B5563'  // gray-600
        ],
        borderWidth: 2,
        hoverBackgroundColor: [
          '#059669',
          '#DC2626',
          '#4B5563'
        ]
      }
    ]
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 20,
          usePointStyle: true,
          font: {
            size: 12
          }
        }
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = total > 0 ? ((context.parsed / total) * 100).toFixed(1) : 0;
            return `${context.label}: ${context.parsed} (${percentage}%)`;
          }
        }
      }
    }
  };

  // Bar chart for sentiment comparison
  const barData = {
    labels: ['Positive', 'Negative', 'Neutral'],
    datasets: [
      {
        label: 'Sentiment Count',
        data: [
          sentimentBreakdown.positive,
          sentimentBreakdown.negative,
          sentimentBreakdown.neutral
        ],
        backgroundColor: [
          'rgba(16, 185, 129, 0.8)',
          'rgba(239, 68, 68, 0.8)',
          'rgba(107, 114, 128, 0.8)'
        ],
        borderColor: [
          'rgb(16, 185, 129)',
          'rgb(239, 68, 68)',
          'rgb(107, 114, 128)'
        ],
        borderWidth: 1,
        borderRadius: 4
      }
    ]
  };

  const barOptions = {
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
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1
        }
      }
    }
  };

  const getSentimentColor = (sentiment) => {
    switch (sentiment?.toLowerCase()) {
      case 'positive':
        return 'text-success-600 bg-success-50';
      case 'negative':
        return 'text-danger-600 bg-danger-50';
      case 'neutral':
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getSentimentIcon = (sentiment) => {
    switch (sentiment?.toLowerCase()) {
      case 'positive':
        return '😊';
      case 'negative':
        return '😞';
      case 'neutral':
      default:
        return '😐';
    }
  };

  const total = sentimentBreakdown.positive + sentimentBreakdown.negative + sentimentBreakdown.neutral;

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="card">
        <div className="card-header">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">
              😊 Sentiment Analysis
            </h2>
            <div className="flex items-center space-x-2">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getSentimentColor(overallSentiment)}`}>
                {getSentimentIcon(overallSentiment)} {overallSentiment}
              </span>
            </div>
          </div>
        </div>
        <div className="card-body">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-success-50 rounded-lg">
              <div className="text-2xl font-bold text-success-600">
                {sentimentBreakdown.positive}
              </div>
              <div className="text-sm text-success-700">Positive</div>
              <div className="text-xs text-success-600">
                {total > 0 ? Math.round((sentimentBreakdown.positive / total) * 100) : 0}%
              </div>
            </div>
            <div className="text-center p-4 bg-danger-50 rounded-lg">
              <div className="text-2xl font-bold text-danger-600">
                {sentimentBreakdown.negative}
              </div>
              <div className="text-sm text-danger-700">Negative</div>
              <div className="text-xs text-danger-600">
                {total > 0 ? Math.round((sentimentBreakdown.negative / total) * 100) : 0}%
              </div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-600">
                {sentimentBreakdown.neutral}
              </div>
              <div className="text-sm text-gray-700">Neutral</div>
              <div className="text-xs text-gray-600">
                {total > 0 ? Math.round((sentimentBreakdown.neutral / total) * 100) : 0}%
              </div>
            </div>
            <div className="text-center p-4 bg-primary-50 rounded-lg">
              <div className="text-2xl font-bold text-primary-600">
                {Math.round(confidenceScore * 100)}%
              </div>
              <div className="text-sm text-primary-700">Confidence</div>
              <div className="text-xs text-primary-600">
                Analysis accuracy
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Doughnut Chart */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-semibold text-gray-900">
              📊 Sentiment Distribution
            </h3>
          </div>
          <div className="card-body">
            <div className="chart-container">
              <Doughnut data={doughnutData} options={doughnutOptions} />
            </div>
          </div>
        </div>

        {/* Bar Chart */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-semibold text-gray-900">
              📈 Sentiment Comparison
            </h3>
          </div>
          <div className="card-body">
            <div className="chart-container">
              <Bar data={barData} options={barOptions} />
            </div>
          </div>
        </div>
      </div>

      {/* Sample Texts */}
      {sampleTexts.length > 0 && (
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-semibold text-gray-900">
              💬 Sample Mentions
            </h3>
          </div>
          <div className="card-body">
            <div className="space-y-4">
              {sampleTexts.slice(0, 6).map((sample, index) => (
                <div key={index} className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-start justify-between mb-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSentimentColor(sample.sentiment)}`}>
                      {getSentimentIcon(sample.sentiment)} {sample.sentiment}
                    </span>
                    {sample.confidence && (
                      <span className="text-xs text-gray-500">
                        {Math.round(sample.confidence * 100)}% confidence
                      </span>
                    )}
                  </div>
                  <p className="text-gray-700 text-sm leading-relaxed">
                    "{sample.text}"
                  </p>
                  {sample.source && (
                    <div className="mt-2 text-xs text-gray-500">
                      Source: {sample.source}
                    </div>
                  )}
                </div>
              ))}
            </div>
            {sampleTexts.length > 6 && (
              <div className="mt-4 text-center">
                <p className="text-sm text-gray-500">
                  Showing 6 of {sampleTexts.length} sample mentions
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Analysis Details */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-semibold text-gray-900">
            🔍 Analysis Details
          </h3>
        </div>
        <div className="card-body">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Methodology</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-primary-500 rounded-full"></span>
                  <span>AI-powered sentiment classification</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-primary-500 rounded-full"></span>
                  <span>Context-aware analysis</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-primary-500 rounded-full"></span>
                  <span>Multi-source data aggregation</span>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Key Metrics</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Mentions:</span>
                  <span className="font-medium">{total}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Confidence Score:</span>
                  <span className="font-medium">{Math.round(confidenceScore * 100)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Overall Sentiment:</span>
                  <span className={`font-medium ${getSentimentColor(overallSentiment).split(' ')[0]}`}>
                    {overallSentiment}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SentimentChart;