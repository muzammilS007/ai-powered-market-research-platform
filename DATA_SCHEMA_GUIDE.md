# Data Schema and Architecture Guide

## Overview

This guide provides comprehensive documentation of the data schema, database architecture, and data flow patterns used in the AI-Powered Market Research Platform.

## Table of Contents

1. [Database Architecture](#database-architecture)
2. [Table Schemas](#table-schemas)
3. [Data Flow Patterns](#data-flow-patterns)
4. [JSON Data Structures](#json-data-structures)
5. [Data Validation Rules](#data-validation-rules)
6. [Performance Optimization](#performance-optimization)
7. [Migration Strategy](#migration-strategy)

## Database Architecture

### Database Selection: SQLite

**Rationale:**
- **Simplicity**: Zero-configuration, serverless database
- **Portability**: Single file database, easy deployment
- **Performance**: Excellent for read-heavy workloads
- **Development**: Ideal for development and small-to-medium scale deployments

**Configuration:**
```python
# Database URL in .env file
DATABASE_URL=sqlite:///market_research.db

# SQLAlchemy Configuration
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

engine = create_engine('sqlite:///market_research.db')
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()
```

### Entity Relationship Diagram

```
┌─────────────────────┐
│  historical_queries │
│  ─────────────────  │
│  id (PK)           │
│  query             │
│  source            │
│  results (JSON)    │
│  processing_time   │
│  created_at        │
│  updated_at        │
└─────────────────────┘
           │
           │ 1:N
           ▼
┌─────────────────────┐
│    market_data      │
│  ─────────────────  │
│  id (PK)           │
│  query_id (FK)     │
│  source            │
│  title             │
│  content           │
│  url               │
│  published_at      │
│  sentiment_score   │
│  created_at        │
└─────────────────────┘

┌─────────────────────┐
│ sentiment_reports   │
│  ─────────────────  │
│  id (PK)           │
│  query_id (FK)     │
│  overall_sentiment │
│  positive_score    │
│  negative_score    │
│  neutral_score     │
│  confidence        │
│  created_at        │
└─────────────────────┘

┌─────────────────────┐
│   trend_analysis    │
│  ─────────────────  │
│  id (PK)           │
│  query_id (FK)     │
│  direction         │
│  strength          │
│  confidence        │
│  emerging_topics   │
│  declining_topics  │
│  trend_indicators  │
│  created_at        │
└─────────────────────┘
```

## Table Schemas

### 1. Historical Queries

**Purpose:** Store all market research queries and their complete results

```sql
CREATE TABLE historical_queries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    query TEXT NOT NULL,
    source TEXT NOT NULL CHECK (source IN ('news', 'twitter', 'reddit', 'all')),
    results TEXT, -- JSON string containing complete analysis results
    processing_time REAL, -- Time in seconds
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_historical_queries_created_at ON historical_queries(created_at DESC);
CREATE INDEX idx_historical_queries_query ON historical_queries(query);
CREATE INDEX idx_historical_queries_source ON historical_queries(source);
```

**Field Specifications:**
- `id`: Auto-incrementing primary key
- `query`: User's search query (max 500 characters)
- `source`: Data source filter ('news', 'twitter', 'reddit', 'all')
- `results`: Complete JSON response including insights, sentiment, and trends
- `processing_time`: Analysis duration in seconds
- `created_at`: Query creation timestamp
- `updated_at`: Last modification timestamp

### 2. Market Data

**Purpose:** Store raw market data collected from various sources

```sql
CREATE TABLE market_data (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    query_id INTEGER NOT NULL,
    source TEXT NOT NULL,
    title TEXT,
    content TEXT,
    url TEXT,
    published_at TIMESTAMP,
    sentiment_score REAL CHECK (sentiment_score >= -1.0 AND sentiment_score <= 1.0),
    relevance_score REAL CHECK (relevance_score >= 0.0 AND relevance_score <= 1.0),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (query_id) REFERENCES historical_queries (id) ON DELETE CASCADE
);

-- Indexes for performance
CREATE INDEX idx_market_data_query_id ON market_data(query_id);
CREATE INDEX idx_market_data_source ON market_data(source);
CREATE INDEX idx_market_data_published_at ON market_data(published_at DESC);
CREATE INDEX idx_market_data_sentiment_score ON market_data(sentiment_score);
```

**Field Specifications:**
- `id`: Auto-incrementing primary key
- `query_id`: Foreign key to historical_queries
- `source`: Data source ('NewsAPI', 'Twitter', 'Reddit', etc.)
- `title`: Article/post title (max 200 characters)
- `content`: Full content text (max 10,000 characters)
- `url`: Source URL (max 500 characters)
- `published_at`: Original publication timestamp
- `sentiment_score`: Normalized sentiment score (-1.0 to 1.0)
- `relevance_score`: Content relevance score (0.0 to 1.0)

### 3. Sentiment Reports

**Purpose:** Store aggregated sentiment analysis results

```sql
CREATE TABLE sentiment_reports (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    query_id INTEGER NOT NULL,
    overall_sentiment TEXT NOT NULL CHECK (overall_sentiment IN ('positive', 'negative', 'neutral')),
    positive_score REAL NOT NULL CHECK (positive_score >= 0.0 AND positive_score <= 1.0),
    negative_score REAL NOT NULL CHECK (negative_score >= 0.0 AND negative_score <= 1.0),
    neutral_score REAL NOT NULL CHECK (neutral_score >= 0.0 AND neutral_score <= 1.0),
    confidence REAL NOT NULL CHECK (confidence >= 0.0 AND confidence <= 1.0),
    sentiment_breakdown TEXT, -- JSON array of individual sentiment scores
    volatility TEXT CHECK (volatility IN ('LOW', 'MEDIUM', 'HIGH')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (query_id) REFERENCES historical_queries (id) ON DELETE CASCADE,
    CHECK (ABS(positive_score + negative_score + neutral_score - 1.0) < 0.01)
);

-- Indexes for performance
CREATE INDEX idx_sentiment_reports_query_id ON sentiment_reports(query_id);
CREATE INDEX idx_sentiment_reports_overall_sentiment ON sentiment_reports(overall_sentiment);
CREATE INDEX idx_sentiment_reports_confidence ON sentiment_reports(confidence DESC);
```

**Field Specifications:**
- `overall_sentiment`: Dominant sentiment category
- `positive_score`: Percentage of positive sentiment (0.0-1.0)
- `negative_score`: Percentage of negative sentiment (0.0-1.0)
- `neutral_score`: Percentage of neutral sentiment (0.0-1.0)
- `confidence`: Analysis confidence level (0.0-1.0)
- `sentiment_breakdown`: JSON array of individual item sentiments
- `volatility`: Sentiment volatility indicator

### 4. Trend Analysis

**Purpose:** Store trend analysis results and indicators

```sql
CREATE TABLE trend_analysis (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    query_id INTEGER NOT NULL,
    direction TEXT NOT NULL CHECK (direction IN ('upward', 'downward', 'stable', 'volatile')),
    strength REAL NOT NULL CHECK (strength >= 0.0 AND strength <= 1.0),
    confidence REAL NOT NULL CHECK (confidence >= 0.0 AND confidence <= 1.0),
    emerging_topics TEXT, -- JSON array of emerging topic strings
    declining_topics TEXT, -- JSON array of declining topic strings
    trend_indicators TEXT, -- JSON object with various trend metrics
    analysis_period TEXT, -- JSON object with time period information
    market_signals TEXT, -- JSON object with extracted market signals
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (query_id) REFERENCES historical_queries (id) ON DELETE CASCADE
);

-- Indexes for performance
CREATE INDEX idx_trend_analysis_query_id ON trend_analysis(query_id);
CREATE INDEX idx_trend_analysis_direction ON trend_analysis(direction);
CREATE INDEX idx_trend_analysis_strength ON trend_analysis(strength DESC);
CREATE INDEX idx_trend_analysis_confidence ON trend_analysis(confidence DESC);
```

**Field Specifications:**
- `direction`: Primary trend direction
- `strength`: Trend strength indicator (0.0-1.0)
- `confidence`: Analysis confidence level (0.0-1.0)
- `emerging_topics`: JSON array of trending topics
- `declining_topics`: JSON array of declining topics
- `trend_indicators`: JSON object with quantitative indicators
- `analysis_period`: JSON object with time range information
- `market_signals`: JSON object with extracted market signals

## Data Flow Patterns

### 1. Query Processing Flow

```
User Query → Data Fetching → Raw Data Storage → Analysis Processing → Results Storage → Response
```

**Detailed Flow:**
1. **Query Reception**: API receives search request
2. **Data Fetching**: External APIs called (NewsAPI, Twitter, Reddit)
3. **Raw Data Storage**: Market data stored in `market_data` table
4. **Sentiment Analysis**: Individual and aggregate sentiment calculated
5. **Trend Analysis**: Trend patterns and indicators identified
6. **AI Insights**: Advanced prompt engineering generates insights
7. **Results Compilation**: Complete results stored in `historical_queries`
8. **Response Delivery**: JSON response sent to client

### 2. Data Lifecycle Management

**Data Retention Policy:**
```sql
-- Clean up old market data (older than 90 days)
DELETE FROM market_data 
WHERE created_at < datetime('now', '-90 days');

-- Archive old queries (older than 1 year)
CREATE TABLE archived_queries AS 
SELECT * FROM historical_queries 
WHERE created_at < datetime('now', '-1 year');

DELETE FROM historical_queries 
WHERE created_at < datetime('now', '-1 year');
```

### 3. Caching Strategy

**Query Result Caching:**
```python
def get_cached_result(query: str, source: str, max_age_hours: int = 24) -> Optional[Dict]:
    """Retrieve cached query result if available and fresh"""
    cutoff_time = datetime.utcnow() - timedelta(hours=max_age_hours)
    
    cached_query = session.query(HistoricalQuery).filter(
        HistoricalQuery.query == query,
        HistoricalQuery.source == source,
        HistoricalQuery.created_at > cutoff_time
    ).first()
    
    if cached_query and cached_query.results:
        return json.loads(cached_query.results)
    
    return None
```

## JSON Data Structures

### 1. Complete Query Results

```json
{
  "query_id": 123,
  "query": "Tesla stock market analysis",
  "source": "news",
  "insights": {
    "summary": "Tesla shows strong market performance driven by EV adoption and technological innovation",
    "key_findings": [
      "Stock price increased 15% over the past month",
      "EV delivery numbers exceeded expectations",
      "Autonomous driving technology showing progress"
    ],
    "market_sentiment": "positive",
    "confidence_score": 0.87,
    "opportunities": [
      {
        "title": "Expansion into Energy Storage",
        "description": "Growing demand for grid-scale energy storage solutions",
        "confidence": 0.82,
        "risk_level": "medium",
        "potential_impact": "high",
        "timeframe": "medium",
        "market_size": "$15.7B by 2027",
        "competitive_advantage": "Integrated battery technology and manufacturing scale"
      }
    ],
    "risks": [
      {
        "title": "Regulatory Changes in EV Incentives",
        "description": "Potential reduction in government EV subsidies could impact demand",
        "probability": 0.35,
        "impact": "medium",
        "category": "regulatory",
        "mitigation": "Diversify into markets with stable policy frameworks",
        "monitoring_indicators": [
          "Government policy announcements",
          "Legislative committee activities"
        ]
      }
    ],
    "competitive_analysis": {
      "market_position": "strong",
      "key_competitors": ["Ford", "GM", "Volkswagen", "BYD"],
      "competitive_advantages": [
        "Supercharger network",
        "Battery technology",
        "Brand recognition",
        "Software integration"
      ],
      "market_share_trends": "Maintaining leadership in premium EV segment",
      "differentiation_factors": [
        "Autonomous driving capabilities",
        "Energy ecosystem integration",
        "Direct sales model"
      ]
    }
  },
  "sentiment": {
    "overall": "positive",
    "positive": 0.65,
    "negative": 0.15,
    "neutral": 0.20,
    "confidence": 0.83,
    "volatility": "MEDIUM",
    "sentiment_breakdown": [
      {
        "sentiment": "positive",
        "confidence": 0.89,
        "positive_keywords": 3,
        "negative_keywords": 0,
        "source": "news",
        "text_preview": "Tesla reports record quarterly deliveries..."
      }
    ]
  },
  "trends": {
    "direction": "upward",
    "strength": 0.78,
    "confidence": 0.81,
    "analysis_period": {
      "duration": "30 days",
      "start_date": "2025-07-26",
      "end_date": "2025-08-26"
    },
    "emerging_topics": [
      "Autonomous driving progress",
      "Energy storage expansion",
      "Manufacturing efficiency"
    ],
    "declining_topics": [
      "Production delays",
      "Quality concerns"
    ],
    "trend_indicators": {
      "volume_change": 0.23,
      "sentiment_shift": 0.15,
      "mention_frequency": 0.31,
      "source_diversity": 0.67
    },
    "market_signals": {
      "volume_indicators": ["Positive volume signal detected"],
      "price_movements": ["Price-related activity identified"],
      "regulatory_mentions": [],
      "innovation_signals": ["Innovation activity detected"],
      "competitive_actions": ["Competitive movement identified"]
    }
  },
  "data_quality": {
    "total_data_points": 45,
    "completeness": 0.91,
    "recency": 0.78,
    "source_diversity": 0.85,
    "content_quality": 0.82,
    "average_content_length": 387,
    "source_distribution": "NewsAPI: 28, Reddit: 12, Twitter: 5",
    "time_range": "2025-08-20 to 2025-08-26"
  },
  "processing_time": 3.2,
  "timestamp": "2025-08-26T10:30:00.000000"
}
```

### 2. Market Data Item Structure

```json
{
  "id": 1001,
  "query_id": 123,
  "source": "NewsAPI",
  "title": "Tesla Reports Record Q3 Deliveries",
  "content": "Tesla Inc. announced record third-quarter vehicle deliveries...",
  "url": "https://example.com/tesla-q3-deliveries",
  "published_at": "2025-08-25T14:30:00Z",
  "sentiment_score": 0.72,
  "relevance_score": 0.89,
  "extracted_entities": [
    {"entity": "Tesla", "type": "ORGANIZATION", "confidence": 0.99},
    {"entity": "Q3", "type": "DATE", "confidence": 0.95}
  ],
  "keywords": ["deliveries", "record", "growth", "electric vehicle"],
  "created_at": "2025-08-26T10:30:00.000000"
}
```

## Data Validation Rules

### 1. Input Validation

```python
from pydantic import BaseModel, validator, Field
from typing import Optional, List
from datetime import datetime

class QueryRequest(BaseModel):
    query: str = Field(..., min_length=3, max_length=500)
    source: str = Field(..., regex=r'^(news|twitter|reddit|all)$')
    
    @validator('query')
    def validate_query(cls, v):
        if not v.strip():
            raise ValueError('Query cannot be empty or whitespace only')
        return v.strip()

class MarketDataItem(BaseModel):
    source: str = Field(..., max_length=50)
    title: Optional[str] = Field(None, max_length=200)
    content: Optional[str] = Field(None, max_length=10000)
    url: Optional[str] = Field(None, max_length=500)
    published_at: Optional[datetime] = None
    sentiment_score: Optional[float] = Field(None, ge=-1.0, le=1.0)
    relevance_score: Optional[float] = Field(None, ge=0.0, le=1.0)
    
    @validator('url')
    def validate_url(cls, v):
        if v and not v.startswith(('http://', 'https://')):
            raise ValueError('URL must start with http:// or https://')
        return v
```

### 2. Data Integrity Constraints

```sql
-- Ensure sentiment scores sum to approximately 1.0
CREATE TRIGGER validate_sentiment_scores
BEFORE INSERT ON sentiment_reports
BEGIN
    SELECT CASE
        WHEN ABS(NEW.positive_score + NEW.negative_score + NEW.neutral_score - 1.0) > 0.01
        THEN RAISE(ABORT, 'Sentiment scores must sum to 1.0')
    END;
END;

-- Ensure processing_time is reasonable
CREATE TRIGGER validate_processing_time
BEFORE INSERT ON historical_queries
BEGIN
    SELECT CASE
        WHEN NEW.processing_time < 0 OR NEW.processing_time > 300
        THEN RAISE(ABORT, 'Processing time must be between 0 and 300 seconds')
    END;
END;

-- Ensure published_at is not in the future
CREATE TRIGGER validate_published_at
BEFORE INSERT ON market_data
BEGIN
    SELECT CASE
        WHEN NEW.published_at > datetime('now')
        THEN RAISE(ABORT, 'Published date cannot be in the future')
    END;
END;
```

## Performance Optimization

### 1. Indexing Strategy

```sql
-- Composite indexes for common query patterns
CREATE INDEX idx_historical_queries_query_source ON historical_queries(query, source);
CREATE INDEX idx_market_data_query_published ON market_data(query_id, published_at DESC);
CREATE INDEX idx_sentiment_reports_query_confidence ON sentiment_reports(query_id, confidence DESC);

-- Full-text search indexes
CREATE VIRTUAL TABLE market_data_fts USING fts5(
    title, content, 
    content='market_data', 
    content_rowid='id'
);

-- Triggers to maintain FTS index
CREATE TRIGGER market_data_fts_insert AFTER INSERT ON market_data BEGIN
    INSERT INTO market_data_fts(rowid, title, content) VALUES (new.id, new.title, new.content);
END;

CREATE TRIGGER market_data_fts_delete AFTER DELETE ON market_data BEGIN
    INSERT INTO market_data_fts(market_data_fts, rowid, title, content) VALUES('delete', old.id, old.title, old.content);
END;
```

### 2. Query Optimization

```python
# Efficient pagination
def get_query_history(limit: int = 10, offset: int = 0) -> List[Dict]:
    """Get paginated query history with optimized query"""
    query = """
    SELECT id, query, source, processing_time, created_at
    FROM historical_queries
    ORDER BY created_at DESC
    LIMIT ? OFFSET ?
    """
    
    return execute_query(query, (limit, offset))

# Efficient search with FTS
def search_market_data(search_term: str, query_id: int) -> List[Dict]:
    """Search market data using full-text search"""
    query = """
    SELECT md.* 
    FROM market_data md
    JOIN market_data_fts fts ON md.id = fts.rowid
    WHERE fts MATCH ? AND md.query_id = ?
    ORDER BY bm25(fts) DESC
    LIMIT 20
    """
    
    return execute_query(query, (search_term, query_id))
```

### 3. Connection Pooling

```python
from sqlalchemy.pool import StaticPool

# SQLite connection pooling configuration
engine = create_engine(
    'sqlite:///market_research.db',
    poolclass=StaticPool,
    pool_pre_ping=True,
    pool_recycle=300,
    connect_args={
        'check_same_thread': False,
        'timeout': 20
    }
)
```

## Migration Strategy

### 1. Schema Versioning

```python
# migrations/001_initial_schema.py
def upgrade():
    """Create initial schema"""
    op.create_table(
        'historical_queries',
        sa.Column('id', sa.Integer, primary_key=True),
        sa.Column('query', sa.Text, nullable=False),
        sa.Column('source', sa.Text, nullable=False),
        sa.Column('results', sa.Text),
        sa.Column('processing_time', sa.Float),
        sa.Column('created_at', sa.DateTime, default=datetime.utcnow),
        sa.Column('updated_at', sa.DateTime, default=datetime.utcnow)
    )

def downgrade():
    """Drop initial schema"""
    op.drop_table('historical_queries')

# migrations/002_add_indexes.py
def upgrade():
    """Add performance indexes"""
    op.create_index('idx_historical_queries_created_at', 'historical_queries', ['created_at'])
    op.create_index('idx_historical_queries_query', 'historical_queries', ['query'])

def downgrade():
    """Remove performance indexes"""
    op.drop_index('idx_historical_queries_created_at')
    op.drop_index('idx_historical_queries_query')
```

### 2. Data Migration Scripts

```python
# scripts/migrate_legacy_data.py
def migrate_legacy_queries():
    """Migrate data from legacy format"""
    legacy_queries = load_legacy_data()
    
    for legacy_query in legacy_queries:
        new_query = HistoricalQuery(
            query=legacy_query['search_term'],
            source=legacy_query.get('data_source', 'news'),
            results=json.dumps(legacy_query['analysis_results']),
            processing_time=legacy_query.get('duration', 0),
            created_at=parse_datetime(legacy_query['timestamp'])
        )
        
        session.add(new_query)
    
    session.commit()
```

### 3. Backup and Recovery

```bash
#!/bin/bash
# backup_database.sh

BACKUP_DIR="/backups/market_research"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="$BACKUP_DIR/market_research_$TIMESTAMP.db"

# Create backup directory
mkdir -p $BACKUP_DIR

# Create database backup
sqlite3 market_research.db ".backup $BACKUP_FILE"

# Compress backup
gzip $BACKUP_FILE

# Clean up old backups (keep last 30 days)
find $BACKUP_DIR -name "*.gz" -mtime +30 -delete

echo "Backup completed: ${BACKUP_FILE}.gz"
```

---

**Last Updated:** August 26, 2025
**Version:** 1.0.0
**Database Engine:** SQLite 3.x
**Schema Version:** 1.0