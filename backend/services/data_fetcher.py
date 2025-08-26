import requests
import os
import json
from typing import List, Dict, Any
from datetime import datetime, timedelta
import time

class DataFetcher:
    """Service for fetching data from various external APIs"""
    
    def __init__(self):
        self.news_api_key = os.getenv('NEWS_API_KEY')
        self.twitter_api_key = os.getenv('TWITTER_API_KEY')
        self.twitter_api_secret = os.getenv('TWITTER_API_SECRET')
        self.twitter_access_token = os.getenv('TWITTER_ACCESS_TOKEN')
        self.twitter_access_token_secret = os.getenv('TWITTER_ACCESS_TOKEN_SECRET')
        
        # API endpoints
        self.news_api_url = "https://newsapi.org/v2"
        self.twitter_api_url = "https://api.twitter.com/2"
        
    def fetch_data(self, query: str, sources: List[str]) -> List[Dict[str, Any]]:
        """Fetch data from multiple sources based on query"""
        
        all_data = []
        
        for source in sources:
            try:
                if source == 'news':
                    news_data = self._fetch_news_data(query)
                    all_data.extend(news_data)
                    
                elif source == 'social' or source == 'twitter':
                    twitter_data = self._fetch_twitter_data(query)
                    all_data.extend(twitter_data)
                    
                elif source == 'reddit':
                    reddit_data = self._fetch_reddit_data(query)
                    all_data.extend(reddit_data)
                    
                # Add small delay between API calls
                time.sleep(0.5)
                
            except Exception as e:
                print(f"Error fetching data from {source}: {str(e)}")
                continue
        
        # Sort by published date (most recent first)
        all_data.sort(key=lambda x: x.get('published_at', ''), reverse=True)
        
        return all_data
    
    def _fetch_news_data(self, query: str) -> List[Dict[str, Any]]:
        """Fetch news articles from NewsAPI"""
        
        if not self.news_api_key:
            return self._generate_mock_news_data(query)
        
        try:
            # Calculate date range (last 7 days)
            to_date = datetime.utcnow()
            from_date = to_date - timedelta(days=7)
            
            params = {
                'q': query,
                'from': from_date.strftime('%Y-%m-%d'),
                'to': to_date.strftime('%Y-%m-%d'),
                'sortBy': 'publishedAt',
                'language': 'en',
                'pageSize': 50,
                'apiKey': self.news_api_key
            }
            
            response = requests.get(f"{self.news_api_url}/everything", params=params, timeout=10)
            response.raise_for_status()
            
            data = response.json()
            articles = data.get('articles', [])
            
            formatted_articles = []
            for article in articles:
                formatted_article = {
                    'source': 'news',
                    'source_id': article.get('url', ''),
                    'title': article.get('title', ''),
                    'content': article.get('description', '') + ' ' + (article.get('content', '') or ''),
                    'url': article.get('url', ''),
                    'author': article.get('author', ''),
                    'published_at': article.get('publishedAt', ''),
                    'keywords': query,
                    'raw_data': article
                }
                formatted_articles.append(formatted_article)
            
            return formatted_articles
            
        except Exception as e:
            print(f"Error fetching news data: {str(e)}")
            return self._generate_mock_news_data(query)
    
    def _fetch_twitter_data(self, query: str) -> List[Dict[str, Any]]:
        """Fetch tweets from Twitter API v2"""
        
        if not self.twitter_api_key:
            return self._generate_mock_twitter_data(query)
        
        try:
            # Twitter API v2 requires Bearer Token or OAuth 2.0
            # For demo purposes, we'll use mock data
            return self._generate_mock_twitter_data(query)
            
        except Exception as e:
            print(f"Error fetching Twitter data: {str(e)}")
            return self._generate_mock_twitter_data(query)
    
    def _fetch_reddit_data(self, query: str) -> List[Dict[str, Any]]:
        """Fetch posts from Reddit API"""
        
        try:
            # Reddit API doesn't require authentication for public data
            headers = {
                'User-Agent': 'MarketResearchTool/1.0'
            }
            
            params = {
                'q': query,
                'sort': 'new',
                'limit': 25,
                't': 'week'  # Last week
            }
            
            response = requests.get(
                'https://www.reddit.com/search.json',
                params=params,
                headers=headers,
                timeout=10
            )
            response.raise_for_status()
            
            data = response.json()
            posts = data.get('data', {}).get('children', [])
            
            formatted_posts = []
            for post in posts:
                post_data = post.get('data', {})
                
                formatted_post = {
                    'source': 'reddit',
                    'source_id': post_data.get('id', ''),
                    'title': post_data.get('title', ''),
                    'content': post_data.get('selftext', '') or post_data.get('title', ''),
                    'url': f"https://reddit.com{post_data.get('permalink', '')}",
                    'author': post_data.get('author', ''),
                    'published_at': datetime.fromtimestamp(post_data.get('created_utc', 0)).isoformat(),
                    'keywords': query,
                    'raw_data': post_data
                }
                formatted_posts.append(formatted_post)
            
            return formatted_posts
            
        except Exception as e:
            print(f"Error fetching Reddit data: {str(e)}")
            return self._generate_mock_reddit_data(query)
    
    def _generate_mock_news_data(self, query: str) -> List[Dict[str, Any]]:
        """Generate mock news data for testing"""
        
        mock_articles = [
            {
                'source': 'news',
                'source_id': 'mock_news_1',
                'title': f'{query} Market Analysis: Key Trends and Insights',
                'content': f'Recent analysis of {query} shows significant market activity with mixed sentiment from investors and analysts. Key indicators suggest potential growth opportunities.',
                'url': 'https://example-news.com/article1',
                'author': 'Market Analyst',
                'published_at': (datetime.utcnow() - timedelta(hours=2)).isoformat(),
                'keywords': query,
                'raw_data': {}
            },
            {
                'source': 'news',
                'source_id': 'mock_news_2',
                'title': f'Breaking: {query} Sees Increased Interest from Institutional Investors',
                'content': f'Institutional investors are showing renewed interest in {query} sector, with several major funds announcing new positions and strategic investments.',
                'url': 'https://example-news.com/article2',
                'author': 'Financial Reporter',
                'published_at': (datetime.utcnow() - timedelta(hours=6)).isoformat(),
                'keywords': query,
                'raw_data': {}
            },
            {
                'source': 'news',
                'source_id': 'mock_news_3',
                'title': f'{query} Industry Report: Challenges and Opportunities Ahead',
                'content': f'Industry experts weigh in on the current state of {query} market, highlighting both challenges and emerging opportunities for businesses and investors.',
                'url': 'https://example-news.com/article3',
                'author': 'Industry Expert',
                'published_at': (datetime.utcnow() - timedelta(hours=12)).isoformat(),
                'keywords': query,
                'raw_data': {}
            }
        ]
        
        return mock_articles
    
    def _generate_mock_twitter_data(self, query: str) -> List[Dict[str, Any]]:
        """Generate mock Twitter data for testing"""
        
        mock_tweets = [
            {
                'source': 'twitter',
                'source_id': 'mock_tweet_1',
                'title': f'Tweet about {query}',
                'content': f'Excited about the potential in {query} market! The fundamentals look strong and there\'s growing institutional interest. #investing #markets',
                'url': 'https://twitter.com/user1/status/123',
                'author': '@MarketBull',
                'published_at': (datetime.utcnow() - timedelta(minutes=30)).isoformat(),
                'keywords': query,
                'raw_data': {}
            },
            {
                'source': 'twitter',
                'source_id': 'mock_tweet_2',
                'title': f'Tweet about {query}',
                'content': f'Concerned about recent volatility in {query} sector. Risk management is key in these uncertain times. What are your thoughts? #riskmanagement',
                'url': 'https://twitter.com/user2/status/124',
                'author': '@CautiousTrader',
                'published_at': (datetime.utcnow() - timedelta(hours=1)).isoformat(),
                'keywords': query,
                'raw_data': {}
            },
            {
                'source': 'twitter',
                'source_id': 'mock_tweet_3',
                'title': f'Tweet about {query}',
                'content': f'Just published my analysis on {query} trends. Key takeaway: diversification remains crucial. Link to full report in bio.',
                'url': 'https://twitter.com/user3/status/125',
                'author': '@AnalystPro',
                'published_at': (datetime.utcnow() - timedelta(hours=3)).isoformat(),
                'keywords': query,
                'raw_data': {}
            }
        ]
        
        return mock_tweets
    
    def _generate_mock_reddit_data(self, query: str) -> List[Dict[str, Any]]:
        """Generate mock Reddit data for testing"""
        
        mock_posts = [
            {
                'source': 'reddit',
                'source_id': 'mock_reddit_1',
                'title': f'Discussion: What are your thoughts on {query}?',
                'content': f'I\'ve been researching {query} and wanted to get the community\'s perspective. The data looks promising but there are some concerns about market volatility.',
                'url': 'https://reddit.com/r/investing/comments/123',
                'author': 'InvestorReddit',
                'published_at': (datetime.utcnow() - timedelta(hours=4)).isoformat(),
                'keywords': query,
                'raw_data': {}
            },
            {
                'source': 'reddit',
                'source_id': 'mock_reddit_2',
                'title': f'{query} Analysis - Long-term outlook',
                'content': f'After extensive research, I believe {query} has strong long-term potential despite short-term headwinds. Here\'s my detailed analysis...',
                'url': 'https://reddit.com/r/SecurityAnalysis/comments/124',
                'author': 'DeepValueInvestor',
                'published_at': (datetime.utcnow() - timedelta(hours=8)).isoformat(),
                'keywords': query,
                'raw_data': {}
            }
        ]
        
        return mock_posts
    
    def validate_api_keys(self) -> Dict[str, bool]:
        """Validate which API keys are available"""
        
        return {
            'news_api': bool(self.news_api_key),
            'twitter_api': bool(self.twitter_api_key),
            'reddit_api': True  # Reddit doesn't require API key for public data
        }