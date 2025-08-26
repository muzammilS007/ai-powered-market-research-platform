import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useApi } from '../context/ApiContext';
import { LoadingSpinner, PageLoader } from '../components/LoadingSpinner';
import { ErrorAlert } from '../components/ErrorAlert';

export const History = () => {
  const { getQueryHistory } = useApi();
  const [queries, setQueries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getQueryHistory();
      setQueries(data || []);
    } catch (err) {
      setError(err.message || 'Failed to load query history');
    } finally {
      setLoading(false);
    }
  };

  // Filter and sort queries
  const filteredQueries = queries.filter(query => {
    const matchesSearch = query.query_text?.toLowerCase().includes(searchTerm.toLowerCase()) || false;
    const matchesStatus = statusFilter === 'all' || query.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const sortedQueries = [...filteredQueries].sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.created_at) - new Date(a.created_at);
      case 'oldest':
        return new Date(a.created_at) - new Date(b.created_at);
      case 'processing_time':
        return (b.processing_time || 0) - (a.processing_time || 0);
      case 'data_points':
        return (b.data_points_count || 0) - (a.data_points_count || 0);
      default:
        return 0;
    }
  });

  // Pagination
  const totalPages = Math.ceil(sortedQueries.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedQueries = sortedQueries.slice(startIndex, startIndex + itemsPerPage);

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
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

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return '✅';
      case 'processing':
        return '⏳';
      case 'failed':
        return '❌';
      default:
        return '❓';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatProcessingTime = (seconds) => {
    if (!seconds) return 'N/A';
    if (seconds < 1) return `${Math.round(seconds * 1000)}ms`;
    return `${seconds.toFixed(1)}s`;
  };

  if (loading) {
    return <PageLoader text="Loading query history..." />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          📚 Query History
        </h1>
        <p className="text-gray-600">
          View and manage your previous market research queries
        </p>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="mb-6">
          <ErrorAlert
            message={error}
            onRetry={loadHistory}
            onDismiss={() => setError(null)}
          />
        </div>
      )}

      {/* Filters and Search */}
      <div className="card mb-6">
        <div className="card-body">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            {/* Search */}
            <div className="flex-1 max-w-md">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search queries..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input pl-10"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-400">🔍</span>
                </div>
              </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
              <div className="flex items-center space-x-2">
                <label className="text-sm font-medium text-gray-700">Status:</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="input-sm"
                >
                  <option value="all">All Status</option>
                  <option value="completed">Completed</option>
                  <option value="processing">Processing</option>
                  <option value="failed">Failed</option>
                </select>
              </div>
              <div className="flex items-center space-x-2">
                <label className="text-sm font-medium text-gray-700">Sort:</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="input-sm"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="processing_time">Processing Time</option>
                  <option value="data_points">Data Points</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="card">
          <div className="card-body text-center">
            <div className="text-2xl font-bold text-primary-600">
              {queries.length}
            </div>
            <div className="text-sm text-gray-600">Total Queries</div>
          </div>
        </div>
        <div className="card">
          <div className="card-body text-center">
            <div className="text-2xl font-bold text-success-600">
              {queries.filter(q => q.status === 'completed').length}
            </div>
            <div className="text-sm text-gray-600">Completed</div>
          </div>
        </div>
        <div className="card">
          <div className="card-body text-center">
            <div className="text-2xl font-bold text-warning-600">
              {queries.filter(q => q.status === 'processing').length}
            </div>
            <div className="text-sm text-gray-600">Processing</div>
          </div>
        </div>
        <div className="card">
          <div className="card-body text-center">
            <div className="text-2xl font-bold text-danger-600">
              {queries.filter(q => q.status === 'failed').length}
            </div>
            <div className="text-sm text-gray-600">Failed</div>
          </div>
        </div>
      </div>

      {/* Query List */}
      {paginatedQueries.length > 0 ? (
        <div className="space-y-4">
          {paginatedQueries.map((query) => (
            <div key={query.id} className="card hover:shadow-lg transition-shadow">
              <div className="card-body">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(query.status)}`}>
                        {getStatusIcon(query.status)} {query.status}
                      </span>
                      <span className="text-sm text-gray-500">
                        {formatDate(query.created_at)}
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      "{query.query}"
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Data Points:</span>
                        <span className="ml-1 font-medium">
                          {query.data_points_count?.toLocaleString() || 'N/A'}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500">Processing Time:</span>
                        <span className="ml-1 font-medium">
                          {formatProcessingTime(query.processing_time)}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500">Query ID:</span>
                        <span className="ml-1 font-mono text-xs">
                          #{query.id}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500">Status:</span>
                        <span className="ml-1 font-medium capitalize">
                          {query.status}
                        </span>
                      </div>
                    </div>
                    {query.error_message && (
                      <div className="mt-3 p-3 bg-danger-50 border border-danger-200 rounded-lg">
                        <div className="text-sm text-danger-700">
                          <strong>Error:</strong> {query.error_message}
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col space-y-2 ml-4">
                    {query.status === 'completed' && (
                      <Link
                        to={`/results/${query.id}`}
                        className="btn btn-primary btn-sm"
                      >
                        View Results
                      </Link>
                    )}
                    {query.status === 'processing' && (
                      <button
                        onClick={() => window.location.reload()}
                        className="btn btn-secondary btn-sm"
                      >
                        Refresh Status
                      </button>
                    )}
                    {query.status === 'failed' && (
                      <button
                        onClick={() => {
                          // Implement retry functionality
                          console.log('Retry query:', query.id);
                        }}
                        className="btn btn-warning btn-sm"
                      >
                        Retry Query
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card">
          <div className="card-body text-center py-12">
            <div className="text-gray-400 text-4xl mb-4">📚</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm || statusFilter !== 'all' ? 'No matching queries found' : 'No query history yet'}
            </h3>
            <p className="text-gray-500 mb-4">
              {searchTerm || statusFilter !== 'all' 
                ? 'Try adjusting your search or filter criteria'
                : 'Start by making your first market research query'
              }
            </p>
            {!searchTerm && statusFilter === 'all' && (
              <Link to="/" className="btn btn-primary">
                Start New Search
              </Link>
            )}
          </div>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-6">
          <div className="text-sm text-gray-700">
            Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, sortedQueries.length)} of {sortedQueries.length} results
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="btn btn-secondary btn-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <div className="flex items-center space-x-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pageNum = i + 1;
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`px-3 py-1 text-sm rounded ${
                      currentPage === pageNum
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
              {totalPages > 5 && (
                <>
                  <span className="px-2 text-gray-500">...</span>
                  <button
                    onClick={() => setCurrentPage(totalPages)}
                    className={`px-3 py-1 text-sm rounded ${
                      currentPage === totalPages
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {totalPages}
                  </button>
                </>
              )}
            </div>
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="btn btn-secondary btn-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default History;