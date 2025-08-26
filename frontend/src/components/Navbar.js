import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useApi } from '../context/ApiContext';

export const Navbar = () => {
  const location = useLocation();
  const { checkHealth } = useApi();
  const [healthStatus, setHealthStatus] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navItems = [
    { path: '/', label: 'Dashboard', icon: '🏠' },
    { path: '/history', label: 'History', icon: '📊' },
    { path: '/analytics', label: 'Analytics', icon: '📈' },
  ];

  const handleHealthCheck = async () => {
    try {
      const status = await checkHealth();
      setHealthStatus('healthy');
      setTimeout(() => setHealthStatus(null), 3000);
    } catch (error) {
      setHealthStatus('unhealthy');
      setTimeout(() => setHealthStatus(null), 3000);
    }
  };

  const isActivePath = (path) => {
    if (path === '/') {
      return location.pathname === '/' || location.pathname.startsWith('/search');
    }
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="bg-white shadow-soft border-b border-gray-200 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Brand */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center text-white font-bold text-lg group-hover:shadow-glow transition-all duration-200">
              AI
            </div>
            <div className="hidden sm:block">
              <h1 className="text-xl font-bold text-gradient">
                Market Research
              </h1>
              <p className="text-xs text-gray-500 -mt-1">
                AI-Powered Insights
              </p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center space-x-2 ${
                  isActivePath(item.path)
                    ? 'bg-primary-100 text-primary-700 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <span className="text-base">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            ))}
          </div>

          {/* Health Check and Mobile Menu */}
          <div className="flex items-center space-x-3">
            {/* Health Check Button */}
            <button
              onClick={handleHealthCheck}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 flex items-center space-x-1 ${
                healthStatus === 'healthy'
                  ? 'bg-success-100 text-success-700'
                  : healthStatus === 'unhealthy'
                  ? 'bg-danger-100 text-danger-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
              title="Check backend health"
            >
              <span className={`w-2 h-2 rounded-full ${
                healthStatus === 'healthy'
                  ? 'bg-success-500'
                  : healthStatus === 'unhealthy'
                  ? 'bg-danger-500'
                  : 'bg-gray-400'
              }`} />
              <span className="hidden sm:inline">
                {healthStatus === 'healthy'
                  ? 'Healthy'
                  : healthStatus === 'unhealthy'
                  ? 'Offline'
                  : 'Status'
                }
              </span>
            </button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors duration-200"
              aria-label="Toggle menu"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {isMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200 bg-white">
            <div className="flex flex-col space-y-2">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMenuOpen(false)}
                  className={`px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 flex items-center space-x-3 ${
                    isActivePath(item.path)
                      ? 'bg-primary-100 text-primary-700 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <span className="text-lg">{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;