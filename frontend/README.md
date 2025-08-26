# AI-Powered Market Research Dashboard - Frontend

A modern React-based web dashboard for AI-powered market research and sentiment analysis.

## Features

### 🎯 Core Functionality
- **Smart Search**: Intelligent market research queries with real-time suggestions
- **Interactive Dashboard**: Comprehensive overview of market trends and insights
- **Advanced Analytics**: Detailed charts and visualizations for data analysis
- **Query History**: Track and revisit previous research queries
- **Real-time Updates**: Live data updates and notifications

### 📊 Visualization Components
- **Sentiment Analysis Charts**: Doughnut and bar charts for sentiment distribution
- **Trend Visualization**: Line and area charts for trend analysis over time
- **Market Insights Panel**: AI-generated insights with filtering and sorting
- **Data Source Tracking**: Monitor reliability and status of data sources
- **Performance Metrics**: API usage statistics and system health monitoring

### 🎨 UI/UX Features
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **Modern Interface**: Clean, professional design with Tailwind CSS
- **Loading States**: Skeleton loaders and spinners for better UX
- **Error Handling**: Comprehensive error alerts with retry functionality
- **Accessibility**: WCAG compliant with keyboard navigation support

## Technology Stack

- **React 18**: Modern React with hooks and functional components
- **React Router**: Client-side routing for single-page application
- **Chart.js**: Interactive charts and data visualizations
- **Tailwind CSS**: Utility-first CSS framework for styling
- **Axios**: HTTP client for API communication
- **Context API**: State management for global application state

## Project Structure

```
frontend/
├── public/
│   ├── index.html          # Main HTML template
│   └── manifest.json       # PWA configuration
├── src/
│   ├── components/         # Reusable UI components
│   │   ├── DataSources.js  # Data source information display
│   │   ├── ErrorAlert.js   # Error handling and alerts
│   │   ├── InsightsPanel.js # AI insights display
│   │   ├── LoadingSpinner.js # Loading states and skeletons
│   │   ├── Navbar.js       # Navigation bar
│   │   ├── RecentQueries.js # Recent query history
│   │   ├── SearchInput.js  # Search input with suggestions
│   │   ├── SentimentChart.js # Sentiment analysis charts
│   │   ├── StatsOverview.js # Statistics overview
│   │   ├── TrendChart.js   # Trend visualization charts
│   │   └── TrendingTopics.js # Trending topics display
│   ├── context/
│   │   └── ApiContext.js   # API communication and state
│   ├── pages/
│   │   ├── Analytics.js    # Analytics dashboard page
│   │   ├── Dashboard.js    # Main dashboard page
│   │   ├── History.js      # Query history page
│   │   └── SearchResults.js # Search results page
│   ├── utils/
│   │   └── formatters.js   # Utility functions for formatting
│   ├── App.js              # Main application component
│   ├── index.css           # Global styles and Tailwind imports
│   └── index.js            # Application entry point
├── package.json            # Dependencies and scripts
├── tailwind.config.js      # Tailwind CSS configuration
└── postcss.config.js       # PostCSS configuration
```

## Installation

### Prerequisites
- Node.js 16+ and npm/yarn
- Backend API server running (see backend README)

### Setup Steps

1. **Install Dependencies**
   ```bash
   cd frontend
   npm install
   ```

2. **Environment Configuration**
   Create a `.env` file in the frontend directory:
   ```env
   REACT_APP_API_URL=http://localhost:5000
   REACT_APP_API_TIMEOUT=30000
   REACT_APP_ENABLE_LOGGING=true
   ```

3. **Start Development Server**
   ```bash
   npm start
   ```
   The application will be available at `http://localhost:3000`

## Available Scripts

- `npm start` - Start development server with hot reload
- `npm run build` - Build production-ready application
- `npm test` - Run test suite
- `npm run eject` - Eject from Create React App (irreversible)

## Configuration

### API Configuration
The frontend communicates with the backend API through the `ApiContext`. Configure the API base URL in the environment variables or directly in `src/context/ApiContext.js`.

### Styling Customization
Customize the appearance by modifying:
- `tailwind.config.js` - Tailwind CSS configuration
- `src/index.css` - Global styles and custom components

### Chart Configuration
Chart.js configurations can be customized in the respective chart components:
- `SentimentChart.js` - Sentiment analysis visualizations
- `TrendChart.js` - Trend analysis charts
- `Analytics.js` - Analytics dashboard charts

## Usage Guide

### Dashboard Navigation
1. **Dashboard**: Main overview with trending topics and recent queries
2. **Search**: Enter market research queries and view detailed results
3. **History**: Browse previous queries and their results
4. **Analytics**: Comprehensive analytics and performance metrics

### Search Functionality
1. Enter your market research query in the search input
2. Use suggested queries or create custom searches
3. View real-time results with sentiment analysis and trends
4. Navigate through different result tabs (Overview, Sentiment, Trends, etc.)

### Analytics Features
- **Overview**: Key metrics and recent activity
- **Usage**: Query volume and usage patterns
- **Performance**: System health and response times
- **Insights**: Market sentiment and trending topics

## API Integration

The frontend integrates with the following backend endpoints:

- `GET /api/health` - Health check
- `POST /api/search` - Submit search queries
- `GET /api/query/{id}` - Get query details
- `GET /api/history` - Get query history
- `GET /api/trends` - Get trending topics
- `GET /api/insights` - Get market insights
- `GET /api/stats` - Get API statistics

## Performance Optimization

### Implemented Optimizations
- **Code Splitting**: Lazy loading of route components
- **Memoization**: React.memo for expensive components
- **Debounced Search**: Reduced API calls during typing
- **Image Optimization**: SVG icons and optimized assets
- **Bundle Analysis**: Webpack bundle optimization

### Best Practices
- Use React DevTools for performance profiling
- Monitor bundle size with `npm run build`
- Implement proper error boundaries
- Use loading states for better UX

## Troubleshooting

### Common Issues

1. **API Connection Errors**
   - Verify backend server is running
   - Check API URL in environment variables
   - Ensure CORS is properly configured

2. **Chart Rendering Issues**
   - Verify Chart.js dependencies are installed
   - Check browser console for JavaScript errors
   - Ensure data format matches chart expectations

3. **Styling Problems**
   - Run `npm run build` to regenerate Tailwind CSS
   - Check for conflicting CSS classes
   - Verify Tailwind configuration

### Debug Mode
Enable debug logging by setting `REACT_APP_ENABLE_LOGGING=true` in your environment variables.

## Contributing

1. Follow React best practices and hooks patterns
2. Use TypeScript for new components (optional)
3. Maintain consistent code formatting with Prettier
4. Write unit tests for new components
5. Update documentation for new features

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## License

This project is part of the AI-Powered Market Research platform. See the main project LICENSE file for details.