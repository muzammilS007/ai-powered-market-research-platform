from datetime import datetime
from database import db

class MarketData(db.Model):
    """Model for storing raw market data from various sources"""
    __tablename__ = 'market_data'
    
    id = db.Column(db.Integer, primary_key=True)
    source = db.Column(db.String(50), nullable=False)  # 'news', 'twitter', 'reddit', etc.
    source_id = db.Column(db.String(255))  # Original ID from the source
    title = db.Column(db.Text)
    content = db.Column(db.Text)
    url = db.Column(db.String(500))
    author = db.Column(db.String(255))
    published_at = db.Column(db.DateTime)
    keywords = db.Column(db.Text)  # Comma-separated keywords
    raw_data = db.Column(db.JSON)  # Store original API response
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'source': self.source,
            'title': self.title,
            'content': self.content,
            'url': self.url,
            'author': self.author,
            'published_at': self.published_at.isoformat() if self.published_at else None,
            'keywords': self.keywords.split(',') if self.keywords else [],
            'created_at': self.created_at.isoformat()
        }

class TrendAnalysis(db.Model):
    """Model for storing trend analysis results"""
    __tablename__ = 'trend_analysis'
    
    id = db.Column(db.Integer, primary_key=True)
    query_id = db.Column(db.Integer, db.ForeignKey('historical_queries.id'), nullable=False)
    trend_direction = db.Column(db.String(20))  # 'rising', 'declining', 'stable'
    trend_strength = db.Column(db.Float)  # 0.0 to 1.0
    emerging_topics = db.Column(db.Text)  # Comma-separated topics
    declining_topics = db.Column(db.Text)  # Comma-separated topics
    related_keywords = db.Column(db.Text)  # Comma-separated keywords
    confidence_score = db.Column(db.Float)  # AI confidence in the analysis
    analysis_data = db.Column(db.JSON)  # Detailed analysis results
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationship
    query = db.relationship('HistoricalQuery', backref=db.backref('trend_analyses', lazy=True))
    
    def to_dict(self):
        return {
            'id': self.id,
            'query_id': self.query_id,
            'trend_direction': self.trend_direction,
            'trend_strength': self.trend_strength,
            'emerging_topics': self.emerging_topics.split(',') if self.emerging_topics else [],
            'declining_topics': self.declining_topics.split(',') if self.declining_topics else [],
            'related_keywords': self.related_keywords.split(',') if self.related_keywords else [],
            'confidence_score': self.confidence_score,
            'created_at': self.created_at.isoformat()
        }

class SentimentReport(db.Model):
    """Model for storing sentiment analysis results"""
    __tablename__ = 'sentiment_reports'
    
    id = db.Column(db.Integer, primary_key=True)
    query_id = db.Column(db.Integer, db.ForeignKey('historical_queries.id'), nullable=False)
    positive_score = db.Column(db.Float)  # 0.0 to 1.0
    negative_score = db.Column(db.Float)  # 0.0 to 1.0
    neutral_score = db.Column(db.Float)  # 0.0 to 1.0
    overall_sentiment = db.Column(db.String(20))  # 'positive', 'negative', 'neutral'
    sentiment_breakdown = db.Column(db.JSON)  # Detailed sentiment data
    sample_texts = db.Column(db.JSON)  # Sample texts for each sentiment
    confidence_score = db.Column(db.Float)  # AI confidence in the analysis
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationship
    query = db.relationship('HistoricalQuery', backref=db.backref('sentiment_reports', lazy=True))
    
    def to_dict(self):
        return {
            'id': self.id,
            'query_id': self.query_id,
            'positive_score': self.positive_score,
            'negative_score': self.negative_score,
            'neutral_score': self.neutral_score,
            'overall_sentiment': self.overall_sentiment,
            'sentiment_breakdown': self.sentiment_breakdown,
            'confidence_score': self.confidence_score,
            'created_at': self.created_at.isoformat()
        }

class HistoricalQuery(db.Model):
    """Model for storing historical search queries and results"""
    __tablename__ = 'historical_queries'
    
    id = db.Column(db.Integer, primary_key=True)
    query = db.Column(db.String(500), nullable=False)
    sources = db.Column(db.String(200))  # Comma-separated source types
    results_summary = db.Column(db.Text)  # AI-generated summary
    insights = db.Column(db.JSON)  # Structured insights data
    data_points_count = db.Column(db.Integer, default=0)  # Number of data points analyzed
    processing_time = db.Column(db.Float)  # Time taken to process in seconds
    status = db.Column(db.String(20), default='completed')  # 'processing', 'completed', 'failed'
    error_message = db.Column(db.Text)  # Error details if failed
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'query': self.query,
            'sources': self.sources.split(',') if self.sources else [],
            'results_summary': self.results_summary,
            'insights': self.insights,
            'data_points_count': self.data_points_count,
            'processing_time': self.processing_time,
            'status': self.status,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }

class MarketInsights(db.Model):
    """Model for storing processed market insights and recommendations"""
    __tablename__ = 'market_insights'
    
    id = db.Column(db.Integer, primary_key=True)
    query_id = db.Column(db.Integer, db.ForeignKey('historical_queries.id'), nullable=False)
    insight_type = db.Column(db.String(20), nullable=False)  # 'opportunity', 'risk', 'trend', 'competitive'
    title = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text)
    impact_level = db.Column(db.String(10), default='medium')  # 'high', 'medium', 'low'
    timeframe = db.Column(db.String(15), default='medium-term')  # 'short-term', 'medium-term', 'long-term'
    confidence_score = db.Column(db.Float, default=0.7)  # 0.0 to 1.0
    supporting_data = db.Column(db.JSON)  # Supporting data and evidence
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationship
    query = db.relationship('HistoricalQuery', backref=db.backref('market_insights', lazy=True))
    
    def to_dict(self):
        return {
            'id': self.id,
            'query_id': self.query_id,
            'insight_type': self.insight_type,
            'title': self.title,
            'description': self.description,
            'impact_level': self.impact_level,
            'timeframe': self.timeframe,
            'confidence_score': self.confidence_score,
            'supporting_data': self.supporting_data,
            'created_at': self.created_at.isoformat()
        }

class APIUsage(db.Model):
    """Model for tracking API usage and rate limiting"""
    __tablename__ = 'api_usage'
    
    id = db.Column(db.Integer, primary_key=True)
    api_name = db.Column(db.String(50), nullable=False)  # 'openai', 'newsapi', 'twitter'
    endpoint = db.Column(db.String(200))
    requests_count = db.Column(db.Integer, default=1)
    tokens_used = db.Column(db.Integer, default=0)  # For OpenAI API
    cost_estimate = db.Column(db.Float, default=0.0)  # Estimated cost in USD
    response_time = db.Column(db.Float)  # Response time in seconds
    status_code = db.Column(db.Integer)
    error_message = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'api_name': self.api_name,
            'endpoint': self.endpoint,
            'requests_count': self.requests_count,
            'tokens_used': self.tokens_used,
            'cost_estimate': self.cost_estimate,
            'response_time': self.response_time,
            'status_code': self.status_code,
            'created_at': self.created_at.isoformat()
        }