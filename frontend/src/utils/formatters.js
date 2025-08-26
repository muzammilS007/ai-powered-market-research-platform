// Utility functions for formatting data in the frontend

/**
 * Format a number with appropriate suffixes (K, M, B)
 * @param {number} num - The number to format
 * @param {number} decimals - Number of decimal places
 * @returns {string} Formatted number string
 */
export const formatNumber = (num, decimals = 1) => {
  if (num === null || num === undefined || isNaN(num)) return '0';
  
  const absNum = Math.abs(num);
  
  if (absNum >= 1e9) {
    return (num / 1e9).toFixed(decimals) + 'B';
  }
  if (absNum >= 1e6) {
    return (num / 1e6).toFixed(decimals) + 'M';
  }
  if (absNum >= 1e3) {
    return (num / 1e3).toFixed(decimals) + 'K';
  }
  
  return num.toLocaleString();
};

/**
 * Format a percentage value
 * @param {number} value - The decimal value (0.85 = 85%)
 * @param {number} decimals - Number of decimal places
 * @returns {string} Formatted percentage string
 */
export const formatPercentage = (value, decimals = 1) => {
  if (value === null || value === undefined || isNaN(value)) return '0%';
  return (value * 100).toFixed(decimals) + '%';
};

/**
 * Format a time duration in seconds to human readable format
 * @param {number} seconds - Duration in seconds
 * @returns {string} Formatted duration string
 */
export const formatDuration = (seconds) => {
  if (seconds === null || seconds === undefined || isNaN(seconds)) return '0s';
  
  if (seconds < 60) {
    return seconds.toFixed(1) + 's';
  }
  
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  
  if (minutes < 60) {
    return `${minutes}m ${remainingSeconds.toFixed(0)}s`;
  }
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  return `${hours}h ${remainingMinutes}m`;
};

/**
 * Format a date to relative time (e.g., "2 hours ago")
 * @param {string|Date} date - The date to format
 * @returns {string} Formatted relative time string
 */
export const formatRelativeTime = (date) => {
  if (!date) return 'Unknown';
  
  const now = new Date();
  const targetDate = new Date(date);
  const diffMs = now - targetDate;
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);
  
  if (diffSeconds < 60) {
    return 'Just now';
  }
  if (diffMinutes < 60) {
    return `${diffMinutes} minute${diffMinutes !== 1 ? 's' : ''} ago`;
  }
  if (diffHours < 24) {
    return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
  }
  if (diffDays < 7) {
    return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
  }
  
  return targetDate.toLocaleDateString();
};

/**
 * Format a date to a readable string
 * @param {string|Date} date - The date to format
 * @param {object} options - Intl.DateTimeFormat options
 * @returns {string} Formatted date string
 */
export const formatDate = (date, options = {}) => {
  if (!date) return 'Unknown';
  
  const defaultOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  };
  
  return new Date(date).toLocaleDateString('en-US', { ...defaultOptions, ...options });
};

/**
 * Format a sentiment score to a readable label
 * @param {number} score - Sentiment score (-1 to 1)
 * @returns {object} Object with label, color, and emoji
 */
export const formatSentiment = (score) => {
  if (score === null || score === undefined || isNaN(score)) {
    return { label: 'Unknown', color: 'gray', emoji: '❓' };
  }
  
  if (score >= 0.1) {
    return { label: 'Positive', color: 'success', emoji: '😊' };
  }
  if (score <= -0.1) {
    return { label: 'Negative', color: 'danger', emoji: '😞' };
  }
  
  return { label: 'Neutral', color: 'warning', emoji: '😐' };
};

/**
 * Format a trend strength to a readable label
 * @param {number} strength - Trend strength (0 to 1)
 * @returns {object} Object with label, color, and icon
 */
export const formatTrendStrength = (strength) => {
  if (strength === null || strength === undefined || isNaN(strength)) {
    return { label: 'Unknown', color: 'gray', icon: '❓' };
  }
  
  if (strength >= 0.7) {
    return { label: 'Strong', color: 'success', icon: '🔥' };
  }
  if (strength >= 0.4) {
    return { label: 'Moderate', color: 'warning', icon: '📈' };
  }
  
  return { label: 'Weak', color: 'danger', icon: '📉' };
};

/**
 * Format a confidence score to a readable label
 * @param {number} confidence - Confidence score (0 to 1)
 * @returns {object} Object with label and color
 */
export const formatConfidence = (confidence) => {
  if (confidence === null || confidence === undefined || isNaN(confidence)) {
    return { label: 'Unknown', color: 'gray' };
  }
  
  if (confidence >= 0.8) {
    return { label: 'High', color: 'success' };
  }
  if (confidence >= 0.6) {
    return { label: 'Medium', color: 'warning' };
  }
  
  return { label: 'Low', color: 'danger' };
};

/**
 * Format a query status to a readable label
 * @param {string} status - Query status
 * @returns {object} Object with label, color, and icon
 */
export const formatQueryStatus = (status) => {
  const statusMap = {
    'completed': { label: 'Completed', color: 'success', icon: '✅' },
    'processing': { label: 'Processing', color: 'warning', icon: '⏳' },
    'failed': { label: 'Failed', color: 'danger', icon: '❌' },
    'pending': { label: 'Pending', color: 'secondary', icon: '⏸️' },
    'cancelled': { label: 'Cancelled', color: 'gray', icon: '🚫' }
  };
  
  return statusMap[status] || { label: 'Unknown', color: 'gray', icon: '❓' };
};

/**
 * Truncate text to a specified length
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string} Truncated text
 */
export const truncateText = (text, maxLength = 100) => {
  if (!text || text.length <= maxLength) return text || '';
  return text.substring(0, maxLength) + '...';
};

/**
 * Generate a color based on a string (for consistent coloring)
 * @param {string} str - Input string
 * @returns {string} Hex color code
 */
export const stringToColor = (str) => {
  if (!str) return '#6B7280';
  
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  const colors = [
    '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
    '#06B6D4', '#84CC16', '#F97316', '#EC4899', '#6366F1'
  ];
  
  return colors[Math.abs(hash) % colors.length];
};

/**
 * Format file size in bytes to human readable format
 * @param {number} bytes - Size in bytes
 * @returns {string} Formatted size string
 */
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 B';
  
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};

/**
 * Debounce function to limit the rate of function calls
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} Debounced function
 */
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

/**
 * Throttle function to limit the rate of function calls
 * @param {Function} func - Function to throttle
 * @param {number} limit - Time limit in milliseconds
 * @returns {Function} Throttled function
 */
export const throttle = (func, limit) => {
  let inThrottle;
  return function executedFunction(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};