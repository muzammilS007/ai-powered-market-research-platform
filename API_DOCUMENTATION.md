# AI-Powered Market Research Platform - API Documentation

## Overview

This document provides comprehensive documentation for the AI-Powered Market Research Platform, including API endpoints, prompt engineering design, and data schema specifications.

## Table of Contents

1. [API Endpoints](#api-endpoints)
2. [Prompt Engineering Design](#prompt-engineering-design)
3. [Data Schema](#data-schema)
4. [Integration Guide](#integration-guide)
5. [Authentication](#authentication)
6. [Error Handling](#error-handling)

## API Endpoints

### Base URL
```
http://localhost:8000
```

### 1. Health Check

**Endpoint:** `GET /health`

**Description:** Check if the API server is running

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2025-08-26T10:30:00.000000"
}
```

### 2. Market Research Search

**Endpoint:** `POST /api/search`

**Description:** Perform market research analysis on a given query

**Request Body:**
```json
{
  "query": "Tesla stock market analysis",
  "source": "news"  // Options: "news", "twitter", "reddit", "all"
}
```

**Response:**
```json
{
  "query_id": 123,
  "query": "Tesla stock market analysis",
  "insights": {
    "summary": "Market analysis summary",
    "key_findings": ["Finding 1", "Finding 2"],
    "market_sentiment": "positive",
    "confidence_score": 0.85,
    "opportunities": [
      {
        "title": "Market Opportunity",
        "description": "Detailed description",
        "confidence": 0.8,
        "risk_level": "medium",
        "potential_impact": "high"
      }
    ],
    "risks": [
      {
        "title": "Market Risk",
        "description": "Risk description",
        "probability": 0.3,
        "impact": "medium",
        "mitigation": "Mitigation strategy"
      }
    ],
    "competitive_analysis": {
      "market_position": "strong",
      "key_competitors": ["Competitor 1", "Competitor 2"],
      "competitive_advantages": ["Advantage 1", "Advantage 2"]
    }
  },
  "sentiment": {
    "overall": "positive",
    "positive": 0.6,
    "negative": 0.2,
    "neutral": 0.2,
    "confidence": 0.8,
    "sentiment_breakdown": [
      {
        "sentiment": "positive",
        "confidence": 0.8,
        "text_preview": "Sample text...",
        "source": "news"
      }
    ]
  },
  "trends": {
    "direction": "upward",
    "strength": 0.7,
    "confidence": 0.8,
    "emerging_topics": ["Topic 1", "Topic 2"],
    "declining_topics": ["Topic 3"],
    "trend_indicators": {
      "volume_change": 0.15,
      "sentiment_shift": 0.1
    }
  },
  "processing_time": 2.5,
  "timestamp": "2025-08-26T10:30:00.000000"
}
```

### 3. Query History

**Endpoint:** `GET /api/history`

**Description:** Retrieve historical queries and their results

**Query Parameters:**
- `limit` (optional): Number of results to return (default: 10)
- `offset` (optional): Number of results to skip (default: 0)

**Response:**
```json
{
  "queries": [
    {
      "id": 123,
      "query": "Tesla stock analysis",
      "source": "news",
      "created_at": "2025-08-26T10:30:00.000000",
      "processing_time": 2.5,
      "status": "completed"
    }
  ],
  "total": 50,
  "limit": 10,
  "offset": 0
}
```

### 4. Specific Query Details

**Endpoint:** `GET /api/query/<int:query_id>`

**Description:** Retrieve detailed results for a specific query

**Response:** Same as search endpoint response

## Prompt Engineering Design

### Overview

The AI engine uses sophisticated prompt engineering techniques to generate high-quality market insights:

### 1. Chain-of-Thought Reasoning

**Structure:**
```
1. Data Analysis Phase
2. Pattern Recognition Phase  
3. Insight Generation Phase
4. Validation Phase
```

**Example Prompt Template:**
```
You are a senior market research analyst with 15+ years of experience.

Analyze the following market data using this systematic approach:

1. INITIAL ASSESSMENT:
   - Review the data quality and completeness
   - Identify key data points and trends
   - Note any limitations or gaps

2. PATTERN ANALYSIS:
   - Look for recurring themes and patterns
   - Identify correlations and causations
   - Analyze sentiment shifts and volume changes

3. INSIGHT SYNTHESIS:
   - Generate actionable insights
   - Assess market opportunities and risks
   - Provide strategic recommendations

4. VALIDATION:
   - Cross-reference findings with market context
   - Assess confidence levels
   - Identify areas needing further research
```

### 2. Few-Shot Learning Examples

The system includes curated examples for different analysis types:

**Market Opportunity Example:**
```json
{
  "query": "Electric vehicle market growth",
  "insight": "Strong growth trajectory driven by regulatory support and consumer adoption",
  "opportunities": [
    {
      "title": "Battery Technology Investment",
      "confidence": 0.85,
      "reasoning": "Increasing demand for longer-range EVs creates opportunity for battery innovation"
    }
  ]
}
```

### 3. Advanced Context Preparation

The system extracts and processes:

- **Market Signals:** Volume indicators, price movements, regulatory mentions
- **Key Themes:** Growth & expansion, technology & innovation, market competition
- **Data Quality Metrics:** Completeness, recency, source diversity
- **Sentiment Volatility:** High/medium/low volatility indicators

### 4. Structured Analysis Frameworks

**SWOT Analysis Integration:**
- Strengths identification
- Weakness assessment  
- Opportunity mapping
- Threat evaluation

**Porter's Five Forces:**
- Competitive rivalry analysis
- Supplier power assessment
- Buyer power evaluation
- Threat of substitutes
- Barriers to entry

## Data Schema

### Database Tables

#### 1. Historical Queries
```sql
CREATE TABLE historical_queries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    query TEXT NOT NULL,
    source TEXT NOT NULL,
    results TEXT,  -- JSON string
    processing_time REAL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### 2. Market Data
```sql
CREATE TABLE market_data (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    query_id INTEGER,
    source TEXT NOT NULL,
    title TEXT,
    content TEXT,
    url TEXT,
    published_at TIMESTAMP,
    sentiment_score REAL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (query_id) REFERENCES historical_queries (id)
);
```

#### 3. Sentiment Reports
```sql
CREATE TABLE sentiment_reports (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    query_id INTEGER,
    overall_sentiment TEXT,
    positive_score REAL,
    negative_score REAL,
    neutral_score REAL,
    confidence REAL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (query_id) REFERENCES historical_queries (id)
);
```

#### 4. Trend Analysis
```sql
CREATE TABLE trend_analysis (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    query_id INTEGER,
    direction TEXT,
    strength REAL,
    confidence REAL,
    emerging_topics TEXT,  -- JSON array
    declining_topics TEXT, -- JSON array
    trend_indicators TEXT, -- JSON object
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (query_id) REFERENCES historical_queries (id)
);
```

### JSON Data Structures

#### Market Insights Response
```json
{
  "summary": "string",
  "key_findings": ["string"],
  "market_sentiment": "positive|negative|neutral",
  "confidence_score": "float (0-1)",
  "opportunities": [
    {
      "title": "string",
      "description": "string", 
      "confidence": "float (0-1)",
      "risk_level": "low|medium|high",
      "potential_impact": "low|medium|high",
      "timeframe": "short|medium|long",
      "market_size": "string",
      "competitive_advantage": "string"
    }
  ],
  "risks": [
    {
      "title": "string",
      "description": "string",
      "probability": "float (0-1)",
      "impact": "low|medium|high",
      "category": "market|operational|regulatory|competitive",
      "mitigation": "string",
      "monitoring_indicators": ["string"]
    }
  ],
  "competitive_analysis": {
    "market_position": "dominant|strong|moderate|weak",
    "key_competitors": ["string"],
    "competitive_advantages": ["string"],
    "market_share_trends": "string",
    "differentiation_factors": ["string"]
  }
}
```

## Integration Guide

### Environment Setup

1. **Required Environment Variables:**
```bash
# API Keys
OPENAI_API_KEY=your_openai_key
NEWS_API_KEY=your_news_api_key
TWITTER_API_URL=your_twitter_api_url
REDDIT_CLIENT_ID=your_reddit_client_id
REDDIT_CLIENT_SECRET=your_reddit_client_secret

# Database Configuration
DATABASE_URL=sqlite:///market_research.db

# Application Settings
FLASK_ENV=development
FLASK_DEBUG=True
```

2. **Installation:**
```bash
# Backend
cd backend
pip install -r requirements.txt
python app.py

# Frontend
cd frontend
npm install
npm start
```

### API Client Example

```python
import requests
import json

class MarketResearchClient:
    def __init__(self, base_url="http://localhost:8000"):
        self.base_url = base_url
    
    def search_market_data(self, query, source="news"):
        """Perform market research search"""
        url = f"{self.base_url}/api/search"
        payload = {
            "query": query,
            "source": source
        }
        
        response = requests.post(url, json=payload)
        return response.json()
    
    def get_query_history(self, limit=10, offset=0):
        """Get query history"""
        url = f"{self.base_url}/api/history"
        params = {"limit": limit, "offset": offset}
        
        response = requests.get(url, params=params)
        return response.json()
    
    def get_query_details(self, query_id):
        """Get specific query details"""
        url = f"{self.base_url}/api/query/{query_id}"
        
        response = requests.get(url)
        return response.json()

# Usage Example
client = MarketResearchClient()
result = client.search_market_data("Tesla stock analysis", "news")
print(json.dumps(result, indent=2))
```

## Authentication

Currently, the API does not require authentication. For production deployment, consider implementing:

- API key authentication
- JWT token-based authentication
- Rate limiting
- CORS configuration

## Error Handling

### Standard Error Response
```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable error message",
    "details": "Additional error details"
  },
  "timestamp": "2025-08-26T10:30:00.000000"
}
```

### Common Error Codes

- `INVALID_REQUEST`: Malformed request body
- `MISSING_PARAMETERS`: Required parameters not provided
- `API_LIMIT_EXCEEDED`: External API rate limit reached
- `PROCESSING_ERROR`: Error during data processing
- `DATABASE_ERROR`: Database operation failed
- `EXTERNAL_API_ERROR`: External service unavailable

### HTTP Status Codes

- `200`: Success
- `400`: Bad Request
- `404`: Not Found
- `429`: Too Many Requests
- `500`: Internal Server Error
- `503`: Service Unavailable

## Performance Considerations

- **Caching:** Results are cached in the database for faster retrieval
- **Rate Limiting:** External API calls are managed to prevent quota exhaustion
- **Async Processing:** Long-running analyses can be processed asynchronously
- **Data Pagination:** Large result sets are paginated for better performance

## Security Best Practices

- Store API keys securely in environment variables
- Validate all input parameters
- Implement request rate limiting
- Use HTTPS in production
- Sanitize database queries to prevent SQL injection
- Log security events for monitoring

---

**Last Updated:** August 26, 2025
**Version:** 1.0.0
**Contact:** Development Team