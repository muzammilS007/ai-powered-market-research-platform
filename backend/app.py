from flask import Flask, request, jsonify
from flask_cors import CORS
from datetime import datetime, timedelta
import os
from dotenv import load_dotenv
from database import db

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)

# Database configuration
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL', 'sqlite:///market_research.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Initialize database with app
db.init_app(app)

# Import models and services
from models import MarketData, TrendAnalysis, SentimentReport, HistoricalQuery, MarketInsights, APIUsage
from services.ai_engine import AIEngine
from services.data_fetcher import DataFetcher
from services.sentiment_analyzer import SentimentAnalyzer
from services.trend_detector import TrendDetector

# Initialize services
ai_engine = AIEngine()
data_fetcher = DataFetcher()
sentiment_analyzer = SentimentAnalyzer()
trend_detector = TrendDetector()

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({'status': 'healthy', 'timestamp': datetime.utcnow().isoformat()})

@app.route('/api/search', methods=['POST'])
def search_market_insights():
    """Main endpoint for market research analysis"""
    start_time = datetime.utcnow()
    
    try:
        data = request.get_json()
        query = data.get('query', '').strip()
        sources = data.get('sources', ['news', 'social'])
        
        if not query:
            return jsonify({'error': 'Query parameter is required'}), 400
        
        if len(query) > 500:
            return jsonify({'error': 'Query too long. Maximum 500 characters allowed.'}), 400
        
        # Create initial query record with processing status
        historical_query = HistoricalQuery(
            query=query,
            sources=','.join(sources),
            status='processing',
            created_at=start_time
        )
        db.session.add(historical_query)
        db.session.flush()  # Get the ID without committing
        
        try:
            # Fetch data from external sources
            raw_data = data_fetcher.fetch_data(query, sources)
            data_points_count = len(raw_data) if raw_data else 0
            
            # Perform sentiment analysis
            sentiment_results = sentiment_analyzer.analyze_sentiment(raw_data)
            
            # Detect trends
            trend_results = trend_detector.detect_trends(raw_data, query)
            
            # Generate AI insights using prompt engineering
            ai_insights = ai_engine.generate_insights(query, raw_data, sentiment_results, trend_results)
            
            # Calculate processing time
            processing_time = (datetime.utcnow() - start_time).total_seconds()
            
            # Update query record with results
            historical_query.results_summary = ai_insights.get('summary', '')
            historical_query.insights = ai_insights
            historical_query.data_points_count = data_points_count
            historical_query.processing_time = processing_time
            historical_query.status = 'completed'
            historical_query.updated_at = datetime.utcnow()
            
            # Store sentiment report
            sentiment_report = SentimentReport(
                query_id=historical_query.id,
                positive_score=sentiment_results.get('positive', 0),
                negative_score=sentiment_results.get('negative', 0),
                neutral_score=sentiment_results.get('neutral', 0),
                overall_sentiment=sentiment_results.get('overall', 'neutral'),
                sentiment_breakdown=sentiment_results.get('breakdown', {}),
                sample_texts=sentiment_results.get('sample_texts', {}),
                confidence_score=sentiment_results.get('confidence', 0.7),
                created_at=datetime.utcnow()
            )
            db.session.add(sentiment_report)
            
            # Store trend analysis
            trend_analysis = TrendAnalysis(
                query_id=historical_query.id,
                trend_direction=trend_results.get('direction', 'stable'),
                trend_strength=trend_results.get('strength', 0.5),
                emerging_topics=','.join(trend_results.get('emerging_topics', [])),
                declining_topics=','.join(trend_results.get('declining_topics', [])),
                related_keywords=','.join(trend_results.get('related_keywords', [])),
                confidence_score=trend_results.get('confidence', 0.7),
                analysis_data=trend_results.get('analysis_data', {}),
                created_at=datetime.utcnow()
            )
            db.session.add(trend_analysis)
            
            # Store market insights
            insights_data = ai_insights.get('insights', [])
            for insight in insights_data:
                market_insight = MarketInsights(
                    query_id=historical_query.id,
                    insight_type=insight.get('type', 'trend'),
                    title=insight.get('title', ''),
                    description=insight.get('description', ''),
                    impact_level=insight.get('impact_level', 'medium'),
                    timeframe=insight.get('timeframe', 'medium-term'),
                    confidence_score=insight.get('confidence', 0.7),
                    supporting_data=insight.get('supporting_data', {}),
                    created_at=datetime.utcnow()
                )
                db.session.add(market_insight)
            
            db.session.commit()
            
            response = {
                'query_id': historical_query.id,
                'query': query,
                'insights': ai_insights,
                'sentiment': sentiment_results,
                'trends': trend_results,
                'data_sources': sources,
                'data_points_count': data_points_count,
                'processing_time': processing_time,
                'timestamp': datetime.utcnow().isoformat()
            }
            
            return jsonify(response)
            
        except Exception as processing_error:
            # Update query record with error status
            historical_query.status = 'failed'
            historical_query.error_message = str(processing_error)
            historical_query.updated_at = datetime.utcnow()
            db.session.commit()
            
            return jsonify({
                'error': 'Processing failed',
                'message': str(processing_error),
                'query_id': historical_query.id
            }), 500
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@app.route('/api/history', methods=['GET'])
def get_search_history():
    """Get historical search queries"""
    try:
        limit = request.args.get('limit', 10, type=int)
        queries = db.session.query(HistoricalQuery).order_by(HistoricalQuery.created_at.desc()).limit(limit).all()
        
        history = []
        for query in queries:
            history.append({
                'id': query.id,
                'query': query.query,
                'sources': query.sources.split(',') if query.sources else [],
                'summary': query.results_summary,
                'created_at': query.created_at.isoformat()
            })
        
        return jsonify({'history': history})
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/query/<int:query_id>', methods=['GET'])
def get_query_details(query_id):
    """Get detailed results for a specific query"""
    try:
        query = db.session.get(HistoricalQuery, query_id)
        if not query:
            return jsonify({'error': 'Query not found'}), 404
        
        # Get related sentiment report
        sentiment_report = db.session.query(SentimentReport).filter_by(query_id=query_id).first()
        
        # Get related trend analysis
        trend_analysis = db.session.query(TrendAnalysis).filter_by(query_id=query_id).first()
        
        # Get related market insights
        market_insights = db.session.query(MarketInsights).filter_by(query_id=query_id).all()
        
        response = {
            'query': query.to_dict(),
            'sentiment_report': sentiment_report.to_dict() if sentiment_report else None,
            'trend_analysis': trend_analysis.to_dict() if trend_analysis else None,
            'market_insights': [insight.to_dict() for insight in market_insights]
        }
        
        return jsonify(response)
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/insights', methods=['GET'])
def get_market_insights():
    """Get market insights with filtering options"""
    try:
        # Get query parameters
        insight_type = request.args.get('type')
        impact_level = request.args.get('impact')
        timeframe = request.args.get('timeframe')
        limit = request.args.get('limit', 20, type=int)
        
        # Build query
        query = db.session.query(MarketInsights)
        
        if insight_type:
            query = query.filter(MarketInsights.insight_type == insight_type)
        if impact_level:
            query = query.filter(MarketInsights.impact_level == impact_level)
        if timeframe:
            query = query.filter(MarketInsights.timeframe == timeframe)
        
        insights = query.order_by(MarketInsights.created_at.desc()).limit(limit).all()
        
        return jsonify({
            'insights': [insight.to_dict() for insight in insights],
            'total_count': len(insights)
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/trends', methods=['GET'])
def get_trending_topics():
    """Get current trending topics"""
    try:
        days_back = request.args.get('days', 7, type=int)
        limit = request.args.get('limit', 10, type=int)
        
        # Get recent trend analyses
        cutoff_date = datetime.utcnow() - timedelta(days=days_back)
        recent_trends = db.session.query(TrendAnalysis).filter(
            TrendAnalysis.created_at >= cutoff_date
        ).order_by(TrendAnalysis.created_at.desc()).limit(50).all()
        
        # Aggregate trending topics
        topic_stats = {}
        for trend in recent_trends:
            if trend.emerging_topics:
                topics = [t.strip() for t in trend.emerging_topics.split(',') if t.strip()]
                for topic in topics:
                    if topic not in topic_stats:
                        topic_stats[topic] = {
                            'topic': topic,
                            'frequency': 0,
                            'avg_strength': 0,
                            'total_strength': 0,
                            'latest_timestamp': None
                        }
                    
                    topic_stats[topic]['frequency'] += 1
                    topic_stats[topic]['total_strength'] += trend.trend_strength
                    topic_stats[topic]['avg_strength'] = topic_stats[topic]['total_strength'] / topic_stats[topic]['frequency']
                    
                    if not topic_stats[topic]['latest_timestamp'] or trend.created_at > topic_stats[topic]['latest_timestamp']:
                        topic_stats[topic]['latest_timestamp'] = trend.created_at
        
        # Sort by frequency and strength
        trending_topics = sorted(
            topic_stats.values(),
            key=lambda x: (x['frequency'], x['avg_strength']),
            reverse=True
        )[:limit]
        
        # Format response
        for topic in trending_topics:
            topic['latest_timestamp'] = topic['latest_timestamp'].isoformat() if topic['latest_timestamp'] else None
            del topic['total_strength']  # Remove internal calculation field
        
        return jsonify({
            'trending_topics': trending_topics,
            'period_days': days_back,
            'total_analyses': len(recent_trends)
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/stats', methods=['GET'])
def get_api_stats():
    """Get API usage statistics"""
    try:
        days_back = request.args.get('days', 30, type=int)
        cutoff_date = datetime.utcnow() - timedelta(days=days_back)
        
        # Get API usage stats
        api_usage = db.session.query(APIUsage).filter(
            APIUsage.created_at >= cutoff_date
        ).all()
        
        # Aggregate stats by API
        stats_by_api = {}
        total_requests = 0
        total_cost = 0
        
        for usage in api_usage:
            api_name = usage.api_name
            if api_name not in stats_by_api:
                stats_by_api[api_name] = {
                    'api_name': api_name,
                    'total_requests': 0,
                    'total_tokens': 0,
                    'total_cost': 0,
                    'avg_response_time': 0,
                    'error_count': 0,
                    'response_times': []
                }
            
            stats_by_api[api_name]['total_requests'] += usage.requests_count
            stats_by_api[api_name]['total_tokens'] += usage.tokens_used or 0
            stats_by_api[api_name]['total_cost'] += usage.cost_estimate or 0
            
            if usage.response_time:
                stats_by_api[api_name]['response_times'].append(usage.response_time)
            
            if usage.status_code and usage.status_code >= 400:
                stats_by_api[api_name]['error_count'] += 1
            
            total_requests += usage.requests_count
            total_cost += usage.cost_estimate or 0
        
        # Calculate average response times
        for api_stats in stats_by_api.values():
            if api_stats['response_times']:
                api_stats['avg_response_time'] = sum(api_stats['response_times']) / len(api_stats['response_times'])
            del api_stats['response_times']  # Remove internal calculation field
        
        # Get query stats
        query_stats = {
            'total_queries': db.session.query(HistoricalQuery).filter(HistoricalQuery.created_at >= cutoff_date).count(),
            'completed_queries': db.session.query(HistoricalQuery).filter(
                HistoricalQuery.created_at >= cutoff_date,
                HistoricalQuery.status == 'completed'
            ).count(),
            'failed_queries': db.session.query(HistoricalQuery).filter(
                HistoricalQuery.created_at >= cutoff_date,
                HistoricalQuery.status == 'failed'
            ).count()
        }
        
        return jsonify({
            'period_days': days_back,
            'api_usage': list(stats_by_api.values()),
            'total_requests': total_requests,
            'total_cost': round(total_cost, 4),
            'query_stats': query_stats
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(host='0.0.0.0', port=8000, debug=True)