import React, { useState, useRef } from 'react';
import { LoadingSpinner } from './LoadingSpinner';

export const SearchInput = ({ 
  value, 
  onChange, 
  onSearch, 
  loading = false, 
  placeholder = "Search for market insights...",
  maxLength = 500 
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (value && value.trim().length > 0 && !loading) {
      onSearch(value.trim());
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleClear = () => {
    onChange('');
    inputRef.current?.focus();
  };

  const remainingChars = maxLength - (value?.length || 0);
  const isNearLimit = remainingChars < 50;
  const isAtLimit = remainingChars <= 0;

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit} className="relative">
        <div className={`relative flex items-center bg-white rounded-xl border-2 transition-all duration-200 shadow-soft ${
          isFocused 
            ? 'border-primary-500 shadow-glow' 
            : 'border-gray-200 hover:border-gray-300'
        }`}>
          {/* Search Icon */}
          <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" 
              />
            </svg>
          </div>

          {/* Input Field */}
          <input
            ref={inputRef}
            type="text"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder={placeholder}
            maxLength={maxLength}
            disabled={loading}
            className={`w-full pl-12 pr-24 py-4 text-lg bg-transparent border-none outline-none placeholder-gray-400 ${
              loading ? 'cursor-not-allowed' : ''
            }`}
          />

          {/* Clear Button */}
          {value && value.length > 0 && !loading && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute right-16 top-1/2 transform -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 transition-colors duration-200"
              title="Clear search"
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

          {/* Search Button */}
          <button
            type="submit"
            disabled={!value || value.trim().length === 0 || loading || isAtLimit}
            className={`absolute right-2 top-1/2 transform -translate-y-1/2 px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center space-x-2 ${
              !value || value.trim().length === 0 || loading || isAtLimit
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-primary-600 text-white hover:bg-primary-700 shadow-sm hover:shadow-md'
            }`}
          >
            {loading ? (
              <>
                <LoadingSpinner size="sm" />
                <span className="hidden sm:inline">Searching...</span>
              </>
            ) : (
              <>
                <span>Search</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M13 7l5 5m0 0l-5 5m5-5H6" 
                  />
                </svg>
              </>
            )}
          </button>
        </div>

        {/* Character Counter */}
        {value && value.length > 0 && (
          <div className="flex justify-between items-center mt-2 text-sm">
            <div className="text-gray-500">
              Press Enter to search or click the search button
            </div>
            <div className={`font-medium ${
              isAtLimit 
                ? 'text-danger-600' 
                : isNearLimit 
                ? 'text-warning-600' 
                : 'text-gray-500'
            }`}>
              {value.length}/{maxLength}
            </div>
          </div>
        )}
      </form>

      {/* Search Suggestions */}
      {isFocused && (!value || value.length === 0) && (
        <div className="mt-4 p-4 bg-white rounded-lg border border-gray-200 shadow-soft">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Popular searches:</h4>
          <div className="flex flex-wrap gap-2">
            {[
              'Tesla stock analysis',
              'Cryptocurrency trends',
              'AI market growth',
              'E-commerce consumer behavior',
              'Renewable energy investments',
              'Social media sentiment'
            ].map((suggestion) => (
              <button
                key={suggestion}
                onClick={() => {
                  onChange(suggestion);
                  onSearch(suggestion);
                }}
                className="px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-full hover:bg-primary-100 hover:text-primary-700 transition-colors duration-200"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchInput;