import React from 'react';

export const LoadingSpinner = ({ 
  size = 'md', 
  color = 'primary', 
  className = '',
  text = null 
}) => {
  const sizeClasses = {
    xs: 'w-3 h-3',
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12'
  };

  const colorClasses = {
    primary: 'border-primary-600',
    secondary: 'border-gray-600',
    success: 'border-success-600',
    warning: 'border-warning-600',
    danger: 'border-danger-600',
    white: 'border-white'
  };

  const textSizeClasses = {
    xs: 'text-xs',
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl'
  };

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className="flex flex-col items-center space-y-2">
        <div 
          className={`loading-spinner ${sizeClasses[size]} ${colorClasses[color]}`}
          role="status"
          aria-label="Loading"
        />
        {text && (
          <span className={`text-gray-600 font-medium ${textSizeClasses[size]}`}>
            {text}
          </span>
        )}
      </div>
    </div>
  );
};

// Inline loading spinner for buttons and small spaces
export const InlineSpinner = ({ size = 'sm', color = 'primary', className = '' }) => {
  const sizeClasses = {
    xs: 'w-3 h-3',
    sm: 'w-4 h-4',
    md: 'w-5 h-5'
  };

  const colorClasses = {
    primary: 'border-primary-600',
    secondary: 'border-gray-600',
    success: 'border-success-600',
    warning: 'border-warning-600',
    danger: 'border-danger-600',
    white: 'border-white'
  };

  return (
    <div 
      className={`loading-spinner ${sizeClasses[size]} ${colorClasses[color]} ${className}`}
      role="status"
      aria-label="Loading"
    />
  );
};

// Full page loading overlay
export const PageLoader = ({ text = 'Loading...', backdrop = true }) => {
  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center ${
      backdrop ? 'bg-white bg-opacity-80 backdrop-blur-sm' : ''
    }`}>
      <div className="text-center">
        <LoadingSpinner size="xl" text={text} />
      </div>
    </div>
  );
};

// Card loading skeleton
export const CardSkeleton = ({ lines = 3, className = '' }) => {
  return (
    <div className={`card animate-pulse ${className}`}>
      <div className="card-body space-y-3">
        {Array.from({ length: lines }).map((_, index) => (
          <div key={index} className="space-y-2">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            {index === 0 && <div className="h-4 bg-gray-200 rounded w-1/2"></div>}
          </div>
        ))}
      </div>
    </div>
  );
};

// Table loading skeleton
export const TableSkeleton = ({ rows = 5, columns = 4, className = '' }) => {
  return (
    <div className={`animate-pulse ${className}`}>
      <div className="overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              {Array.from({ length: columns }).map((_, index) => (
                <th key={index} className="px-6 py-3">
                  <div className="h-4 bg-gray-200 rounded w-20"></div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {Array.from({ length: rows }).map((_, rowIndex) => (
              <tr key={rowIndex}>
                {Array.from({ length: columns }).map((_, colIndex) => (
                  <td key={colIndex} className="px-6 py-4">
                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Chart loading skeleton
export const ChartSkeleton = ({ className = '' }) => {
  return (
    <div className={`chart-container animate-pulse ${className}`}>
      <div className="w-full h-full bg-gray-200 rounded-lg flex items-end justify-center space-x-2 p-4">
        {Array.from({ length: 8 }).map((_, index) => (
          <div 
            key={index}
            className="bg-gray-300 rounded-t"
            style={{
              width: '20px',
              height: `${Math.random() * 60 + 20}%`
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default LoadingSpinner;