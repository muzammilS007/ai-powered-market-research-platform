import React, { useState, useEffect } from 'react';

export const ErrorAlert = ({ 
  message, 
  type = 'danger', 
  onClose, 
  autoClose = false, 
  autoCloseDelay = 5000,
  className = '',
  showIcon = true 
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    if (autoClose && autoCloseDelay > 0) {
      const timer = setTimeout(() => {
        handleClose();
      }, autoCloseDelay);

      return () => clearTimeout(timer);
    }
  }, [autoClose, autoCloseDelay]);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsVisible(false);
      if (onClose) {
        onClose();
      }
    }, 200); // Animation duration
  };

  if (!isVisible) {
    return null;
  }

  const typeStyles = {
    danger: {
      container: 'alert-danger',
      icon: '❌',
      iconColor: 'text-danger-600'
    },
    warning: {
      container: 'alert-warning',
      icon: '⚠️',
      iconColor: 'text-warning-600'
    },
    info: {
      container: 'alert-info',
      icon: 'ℹ️',
      iconColor: 'text-primary-600'
    },
    success: {
      container: 'alert-success',
      icon: '✅',
      iconColor: 'text-success-600'
    }
  };

  const style = typeStyles[type] || typeStyles.danger;

  return (
    <div 
      className={`${style.container} transition-all duration-200 ${
        isClosing ? 'opacity-0 transform scale-95' : 'opacity-100 transform scale-100'
      } ${className}`}
      role="alert"
    >
      <div className="flex items-start space-x-3">
        {showIcon && (
          <div className={`flex-shrink-0 ${style.iconColor}`}>
            <span className="text-lg" role="img" aria-label={type}>
              {style.icon}
            </span>
          </div>
        )}
        
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium">
            {typeof message === 'string' ? (
              <p>{message}</p>
            ) : (
              message
            )}
          </div>
        </div>
        
        {onClose && (
          <button
            onClick={handleClose}
            className={`flex-shrink-0 p-1 rounded-md hover:bg-opacity-20 hover:bg-gray-600 transition-colors duration-200 ${
              style.iconColor
            }`}
            aria-label="Close alert"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M6 18L18 6M6 6l12 12" 
              />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
};

// Specialized error alert for API errors
export const ApiErrorAlert = ({ error, onClose, onRetry, className = '' }) => {
  if (!error) return null;

  const getErrorMessage = (error) => {
    if (typeof error === 'string') {
      return error;
    }
    
    if (error.response?.data?.error) {
      return error.response.data.error;
    }
    
    if (error.message) {
      return error.message;
    }
    
    return 'An unexpected error occurred. Please try again.';
  };

  const getErrorDetails = (error) => {
    if (error.response?.status) {
      return `HTTP ${error.response.status}`;
    }
    return null;
  };

  const errorMessage = getErrorMessage(error);
  const errorDetails = getErrorDetails(error);

  return (
    <div className={`alert-danger ${className}`} role="alert">
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0 text-danger-600">
          <span className="text-lg" role="img" aria-label="error">
            ❌
          </span>
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium text-danger-800">
            {errorMessage}
          </div>
          {errorDetails && (
            <div className="text-xs text-danger-600 mt-1">
              {errorDetails}
            </div>
          )}
        </div>
        
        <div className="flex-shrink-0 flex space-x-2">
          {onRetry && (
            <button
              onClick={onRetry}
              className="text-xs font-medium text-danger-700 hover:text-danger-800 underline"
            >
              Retry
            </button>
          )}
          {onClose && (
            <button
              onClick={onClose}
              className="p-1 rounded-md hover:bg-danger-200 transition-colors duration-200 text-danger-600"
              aria-label="Close alert"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M6 18L18 6M6 6l12 12" 
                />
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// Success notification
export const SuccessAlert = ({ message, onClose, autoClose = true, className = '' }) => {
  return (
    <ErrorAlert
      message={message}
      type="success"
      onClose={onClose}
      autoClose={autoClose}
      className={className}
    />
  );
};

// Warning notification
export const WarningAlert = ({ message, onClose, autoClose = false, className = '' }) => {
  return (
    <ErrorAlert
      message={message}
      type="warning"
      onClose={onClose}
      autoClose={autoClose}
      className={className}
    />
  );
};

// Info notification
export const InfoAlert = ({ message, onClose, autoClose = false, className = '' }) => {
  return (
    <ErrorAlert
      message={message}
      type="info"
      onClose={onClose}
      autoClose={autoClose}
      className={className}
    />
  );
};

export default ErrorAlert;