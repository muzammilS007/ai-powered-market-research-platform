import re
from typing import Dict, List, Any
from collections import Counter
import openai
import os
import json

class SentimentAnalyzer:
    """Service for analyzing sentiment of market data"""
    
    def __init__(self):
        self.openai_api_key = os.getenv('OPENAI_API_KEY')
        if self.openai_api_key:
            openai.api_key = self.openai_api_key
        
        # Predefined sentiment keywords for fallback analysis
        self.positive_keywords = [
            'bullish', 'optimistic', 'growth', 'opportunity', 'positive', 'strong', 'excellent',
            'promising', 'upward', 'gain', 'profit', 'success', 'breakthrough', 'innovation',
            'expansion', 'momentum', 'rally', 'surge', 'boom', 'thriving', 'robust'
        ]
        
        self.negative_keywords = [
            'bearish', 'pessimistic', 'decline', 'risk', 'negative', 'weak', 'poor',
            'concerning', 'downward', 'loss', 'failure', 'crash', 'volatility', 'uncertainty',
            'recession', 'downturn', 'plunge', 'collapse', 'struggling', 'crisis'
        ]
        
        self.neutral_keywords = [
            'stable', 'steady', 'unchanged', 'flat', 'sideways', 'consolidation',
            'mixed', 'balanced', 'moderate', 'cautious', 'watchful'
        ]
    
    def analyze_sentiment(self, data: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Analyze sentiment of the provided data"""
        
        if not data:
            return {
                'overall': 'neutral',
                'positive': 0.0,
                'negative': 0.0,
                'neutral': 1.0,
                'confidence': 0.0,
                'sample_texts': {'positive': [], 'negative': [], 'neutral': []},
                'sentiment_breakdown': []
            }
        
        try:
            # Use AI-powered sentiment analysis if available
            if self.openai_api_key and len(data) <= 20:  # Limit for API efficiency
                return self._ai_sentiment_analysis(data)
            else:
                return self._keyword_based_sentiment_analysis(data)
                
        except Exception as e:
            print(f"Error in sentiment analysis: {str(e)}")
            return self._keyword_based_sentiment_analysis(data)
    
    def _ai_sentiment_analysis(self, data: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Use OpenAI for advanced sentiment analysis"""
        
        # Prepare text samples for analysis
        text_samples = []
        for item in data[:15]:  # Limit to 15 items for API efficiency
            text = f"{item.get('title', '')} {item.get('content', '')}"
            if text.strip():
                text_samples.append({
                    'id': item.get('source_id', ''),
                    'text': text[:500],  # Limit text length
                    'source': item.get('source', '')
                })
        
        if not text_samples:
            return self._keyword_based_sentiment_analysis(data)
        
        # Create prompt for sentiment analysis
        texts_for_analysis = "\n\n".join([f"Text {i+1}: {sample['text']}" for i, sample in enumerate(text_samples)])
        
        prompt = f"""
Analyze the sentiment of the following market-related texts. For each text, determine if the sentiment is positive, negative, or neutral regarding market conditions, investment opportunities, or business outlook.

{texts_for_analysis}

Provide your analysis in the following JSON format:
{{
    "individual_sentiments": [
        {{"text_id": 1, "sentiment": "positive/negative/neutral", "confidence": 0.85, "reasoning": "Brief explanation"}}
    ],
    "overall_sentiment": "positive/negative/neutral",
    "sentiment_scores": {{
        "positive": 0.4,
        "negative": 0.2,
        "neutral": 0.4
    }},
    "confidence": 0.8
}}

Focus on market-relevant sentiment indicators such as:
- Investment outlook and opportunities
- Market trends and directions
- Business performance and prospects
- Economic indicators and forecasts
- Risk assessment and market stability
"""
        
        try:
            response = openai.ChatCompletion.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": "You are an expert financial sentiment analyst specializing in market data interpretation."},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=800,
                temperature=0.1
            )
            
            content = response.choices[0].message.content
            ai_result = json.loads(content)
            
            # Process AI results
            sentiment_breakdown = []
            sample_texts = {'positive': [], 'negative': [], 'neutral': []}
            
            for i, sentiment_data in enumerate(ai_result.get('individual_sentiments', [])):
                if i < len(text_samples):
                    sentiment = sentiment_data.get('sentiment', 'neutral')
                    text_sample = text_samples[i]
                    
                    sentiment_breakdown.append({
                        'source': text_sample['source'],
                        'sentiment': sentiment,
                        'confidence': sentiment_data.get('confidence', 0.5),
                        'text_preview': text_sample['text'][:100] + '...'
                    })
                    
                    # Add to sample texts
                    if len(sample_texts[sentiment]) < 3:
                        sample_texts[sentiment].append(text_sample['text'][:200])
            
            scores = ai_result.get('sentiment_scores', {})
            
            return {
                'overall': ai_result.get('overall_sentiment', 'neutral'),
                'positive': scores.get('positive', 0.0),
                'negative': scores.get('negative', 0.0),
                'neutral': scores.get('neutral', 0.0),
                'confidence': ai_result.get('confidence', 0.7),
                'sample_texts': sample_texts,
                'sentiment_breakdown': sentiment_breakdown,
                'analysis_method': 'ai_powered'
            }
            
        except Exception as e:
            print(f"AI sentiment analysis failed: {str(e)}")
            return self._keyword_based_sentiment_analysis(data)
    
    def _keyword_based_sentiment_analysis(self, data: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Fallback keyword-based sentiment analysis"""
        
        sentiment_scores = {'positive': 0, 'negative': 0, 'neutral': 0}
        sentiment_breakdown = []
        sample_texts = {'positive': [], 'negative': [], 'neutral': []}
        
        for item in data:
            text = f"{item.get('title', '')} {item.get('content', '')}".lower()
            
            if not text.strip():
                continue
            
            # Count sentiment keywords
            positive_count = sum(1 for keyword in self.positive_keywords if keyword in text)
            negative_count = sum(1 for keyword in self.negative_keywords if keyword in text)
            neutral_count = sum(1 for keyword in self.neutral_keywords if keyword in text)
            
            # Determine sentiment based on keyword counts
            if positive_count > negative_count and positive_count > neutral_count:
                sentiment = 'positive'
                confidence = min(0.9, 0.5 + (positive_count * 0.1))
            elif negative_count > positive_count and negative_count > neutral_count:
                sentiment = 'negative'
                confidence = min(0.9, 0.5 + (negative_count * 0.1))
            else:
                sentiment = 'neutral'
                confidence = 0.6
            
            sentiment_scores[sentiment] += 1
            
            # Add to breakdown
            sentiment_breakdown.append({
                'source': item.get('source', 'unknown'),
                'sentiment': sentiment,
                'confidence': confidence,
                'text_preview': text[:100] + '...',
                'positive_keywords': positive_count,
                'negative_keywords': negative_count
            })
            
            # Add sample texts
            if len(sample_texts[sentiment]) < 3:
                sample_texts[sentiment].append(text[:200])
        
        # Calculate overall sentiment
        total_items = sum(sentiment_scores.values())
        if total_items == 0:
            return {
                'overall': 'neutral',
                'positive': 0.0,
                'negative': 0.0,
                'neutral': 1.0,
                'confidence': 0.5,
                'sample_texts': sample_texts,
                'sentiment_breakdown': sentiment_breakdown,
                'analysis_method': 'keyword_based'
            }
        
        # Normalize scores
        positive_ratio = sentiment_scores['positive'] / total_items
        negative_ratio = sentiment_scores['negative'] / total_items
        neutral_ratio = sentiment_scores['neutral'] / total_items
        
        # Determine overall sentiment
        if positive_ratio > negative_ratio and positive_ratio > neutral_ratio:
            overall_sentiment = 'positive'
        elif negative_ratio > positive_ratio and negative_ratio > neutral_ratio:
            overall_sentiment = 'negative'
        else:
            overall_sentiment = 'neutral'
        
        # Calculate confidence based on distribution
        max_ratio = max(positive_ratio, negative_ratio, neutral_ratio)
        confidence = min(0.9, 0.5 + (max_ratio * 0.4))
        
        return {
            'overall': overall_sentiment,
            'positive': positive_ratio,
            'negative': negative_ratio,
            'neutral': neutral_ratio,
            'confidence': confidence,
            'sample_texts': sample_texts,
            'sentiment_breakdown': sentiment_breakdown,
            'analysis_method': 'keyword_based'
        }
    
    def analyze_sentiment_trends(self, historical_data: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Analyze sentiment trends over time"""
        
        if not historical_data:
            return {'trend': 'stable', 'change_rate': 0.0, 'periods': []}
        
        # Group data by time periods (e.g., daily)
        from datetime import datetime, timedelta
        
        periods = {}
        for item in historical_data:
            try:
                if item.get('published_at'):
                    date = datetime.fromisoformat(item['published_at'].replace('Z', '+00:00'))
                    day_key = date.strftime('%Y-%m-%d')
                    
                    if day_key not in periods:
                        periods[day_key] = []
                    periods[day_key].append(item)
            except:
                continue
        
        # Analyze sentiment for each period
        period_sentiments = []
        for day, day_data in sorted(periods.items()):
            day_sentiment = self.analyze_sentiment(day_data)
            period_sentiments.append({
                'date': day,
                'sentiment': day_sentiment['overall'],
                'positive_score': day_sentiment['positive'],
                'negative_score': day_sentiment['negative'],
                'confidence': day_sentiment['confidence']
            })
        
        # Calculate trend
        if len(period_sentiments) < 2:
            return {
                'trend': 'stable',
                'change_rate': 0.0,
                'periods': period_sentiments
            }
        
        # Simple trend calculation based on positive score changes
        recent_positive = sum(p['positive_score'] for p in period_sentiments[-3:]) / min(3, len(period_sentiments))
        earlier_positive = sum(p['positive_score'] for p in period_sentiments[:3]) / min(3, len(period_sentiments))
        
        change_rate = recent_positive - earlier_positive
        
        if change_rate > 0.1:
            trend = 'improving'
        elif change_rate < -0.1:
            trend = 'declining'
        else:
            trend = 'stable'
        
        return {
            'trend': trend,
            'change_rate': change_rate,
            'periods': period_sentiments
        }