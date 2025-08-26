# AI-Powered Market Research Tool

A comprehensive web application that analyzes market trends by generating insights from news articles, social media posts, and market data using AI-driven sentiment analysis and trend detection.

## Features

### Frontend Dashboard
- Keyword/topic search input
- Generated insights visualization
- Trend analysis charts
- Sentiment analysis reports
- Historical query reports

### Backend AI Engine
- Prompt engineering for market insights
- Sentiment analysis (positive/negative/neutral)
- Trend detection (emerging vs declining topics)
- Data fetching from multiple APIs

### Database
- MariaDB for storing market data, trends, sentiment reports, and historical queries

### Infrastructure
- Docker containerization
- Scalable architecture for large datasets

## Quick Start

1. Clone the repository
2. Run `docker-compose up` to start all services
3. Access the dashboard at `http://localhost:3000`
4. API endpoints available at `http://localhost:8000`

## Project Structure

```
├── frontend/          # React dashboard
├── backend/           # Python API server
├── database/          # MariaDB schema and migrations
├── docker/            # Docker configurations
├── docs/              # Documentation
└── docker-compose.yml # Multi-container setup
```

## Documentation

- [API Integration Guide](docs/api-integration.md)
- [Prompt Design Guidelines](docs/prompt-design.md)
- [Database Schema](docs/database-schema.md)