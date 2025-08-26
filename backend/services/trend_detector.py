import re
from typing import Dict, List, Any, Tuple
from collections import Counter, defaultdict
from datetime import datetime, timedelta
import math

class TrendDetector:
    """Service for detecting market trends and emerging topics"""
    
    def __init__(self):
        # Common stop words to filter out
        self.stop_words = {
            'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with',
            'by', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had',
            'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'must',
            'this', 'that', 'these', 'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they',
            'me', 'him', 'her', 'us', 'them', 'my', 'your', 'his', 'her', 'its', 'our', 'their'
        }
        
        # Market-specific keywords that indicate trends
        self.trend_indicators = {
            'growth': ['growth', 'expansion', 'increase', 'rising', 'surge', 'boom', 'rally'],
            'decline': ['decline', 'decrease', 'falling', 'drop', 'crash', 'plunge', 'downturn'],
            'volatility': ['volatile', 'fluctuation', 'uncertainty', 'unstable', 'erratic'],
            'innovation': ['innovation', 'breakthrough', 'technology', 'disruption', 'advancement'],
            'regulation': ['regulation', 'policy', 'government', 'compliance', 'legal'],
            'competition': ['competition', 'competitor', 'market share', 'rivalry']
        }
    
    def detect_trends(self, data: List[Dict[str, Any]], query: str) -> Dict[str, Any]:
        """Detect trends in the provided market data"""
        
        if not data:
            return {
                'direction': 'stable',
                'strength': 0.5,
                'emerging_topics': [],
                'declining_topics': [],
                'trend_indicators': {},
                'confidence': 0.0
            }
        
        try:
            # Extract keywords and topics
            keywords_over_time = self._extract_keywords_over_time(data)
            
            # Detect emerging and declining topics
            emerging_topics = self._detect_emerging_topics(keywords_over_time)
            declining_topics = self._detect_declining_topics(keywords_over_time)
            
            # Analyze overall trend direction
            trend_direction, trend_strength = self._analyze_trend_direction(data, keywords_over_time)
            
            # Identify trend indicators
            trend_indicators = self._identify_trend_indicators(data)
            
            # Calculate confidence based on data quality and consistency
            confidence = self._calculate_trend_confidence(data, keywords_over_time)
            
            return {
                'direction': trend_direction,
                'strength': trend_strength,
                'emerging_topics': emerging_topics,
                'declining_topics': declining_topics,
                'trend_indicators': trend_indicators,
                'confidence': confidence,
                'analysis_period': self._get_analysis_period(data),
                'data_points': len(data)
            }
            
        except Exception as e:
            print(f"Error in trend detection: {str(e)}")
            return {
                'direction': 'stable',
                'strength': 0.5,
                'emerging_topics': [],
                'declining_topics': [],
                'trend_indicators': {},
                'confidence': 0.3,
                'error': str(e)
            }
    
    def _extract_keywords_over_time(self, data: List[Dict[str, Any]]) -> Dict[str, List[Tuple[datetime, int]]]:
        """Extract keywords and their frequency over time"""
        
        keywords_timeline = defaultdict(list)
        
        # Group data by time periods (hours)
        time_periods = defaultdict(list)
        
        for item in data:
            try:
                if item.get('published_at'):
                    # Parse datetime
                    pub_date = datetime.fromisoformat(item['published_at'].replace('Z', '+00:00'))
                    # Group by hour
                    hour_key = pub_date.replace(minute=0, second=0, microsecond=0)
                    time_periods[hour_key].append(item)
            except:
                # If no valid date, use current time
                current_time = datetime.utcnow().replace(minute=0, second=0, microsecond=0)
                time_periods[current_time].append(item)
        
        # Extract keywords for each time period
        for time_period, period_data in time_periods.items():
            period_keywords = self._extract_keywords_from_texts(period_data)
            
            for keyword, count in period_keywords.items():
                keywords_timeline[keyword].append((time_period, count))
        
        return dict(keywords_timeline)
    
    def _extract_keywords_from_texts(self, data: List[Dict[str, Any]]) -> Counter:
        """Extract relevant keywords from text data"""
        
        all_text = ""
        for item in data:
            title = item.get('title', '')
            content = item.get('content', '')
            all_text += f" {title} {content}"
        
        # Clean and tokenize text
        text = re.sub(r'[^a-zA-Z\s]', ' ', all_text.lower())
        words = text.split()
        
        # Filter out stop words and short words
        keywords = [word for word in words 
                   if len(word) > 3 and word not in self.stop_words]
        
        # Count keyword frequencies
        keyword_counts = Counter(keywords)
        
        # Return top keywords
        return Counter(dict(keyword_counts.most_common(50)))
    
    def _detect_emerging_topics(self, keywords_over_time: Dict[str, List[Tuple[datetime, int]]]) -> List[str]:
        """Detect topics that are gaining momentum"""
        
        emerging_topics = []
        
        for keyword, timeline in keywords_over_time.items():
            if len(timeline) < 2:
                continue
            
            # Sort by time
            timeline.sort(key=lambda x: x[0])
            
            # Calculate trend slope
            recent_counts = [count for _, count in timeline[-3:]]
            earlier_counts = [count for _, count in timeline[:3]]
            
            if len(recent_counts) > 0 and len(earlier_counts) > 0:
                recent_avg = sum(recent_counts) / len(recent_counts)
                earlier_avg = sum(earlier_counts) / len(earlier_counts)
                
                # Check if keyword is trending upward
                if recent_avg > earlier_avg * 1.5 and recent_avg >= 2:
                    emerging_topics.append(keyword)
        
        # Sort by momentum and return top topics
        return emerging_topics[:10]
    
    def _detect_declining_topics(self, keywords_over_time: Dict[str, List[Tuple[datetime, int]]]) -> List[str]:
        """Detect topics that are losing momentum"""
        
        declining_topics = []
        
        for keyword, timeline in keywords_over_time.items():
            if len(timeline) < 2:
                continue
            
            # Sort by time
            timeline.sort(key=lambda x: x[0])
            
            # Calculate trend slope
            recent_counts = [count for _, count in timeline[-3:]]
            earlier_counts = [count for _, count in timeline[:3]]
            
            if len(recent_counts) > 0 and len(earlier_counts) > 0:
                recent_avg = sum(recent_counts) / len(recent_counts)
                earlier_avg = sum(earlier_counts) / len(earlier_counts)
                
                # Check if keyword is trending downward
                if earlier_avg > recent_avg * 1.5 and earlier_avg >= 3:
                    declining_topics.append(keyword)
        
        # Sort by decline rate and return top topics
        return declining_topics[:10]
    
    def _analyze_trend_direction(self, data: List[Dict[str, Any]], 
                               keywords_over_time: Dict[str, List[Tuple[datetime, int]]]) -> Tuple[str, float]:
        """Analyze overall trend direction and strength"""
        
        # Count trend indicator keywords
        growth_indicators = 0
        decline_indicators = 0
        
        for item in data:
            text = f"{item.get('title', '')} {item.get('content', '')}".lower()
            
            # Count growth indicators
            for indicator in self.trend_indicators['growth']:
                growth_indicators += text.count(indicator)
            
            # Count decline indicators
            for indicator in self.trend_indicators['decline']:
                decline_indicators += text.count(indicator)
        
        # Calculate trend direction
        total_indicators = growth_indicators + decline_indicators
        
        if total_indicators == 0:
            return 'stable', 0.5
        
        growth_ratio = growth_indicators / total_indicators
        decline_ratio = decline_indicators / total_indicators
        
        # Determine direction
        if growth_ratio > 0.6:
            direction = 'rising'
            strength = min(0.9, 0.5 + (growth_ratio - 0.5))
        elif decline_ratio > 0.6:
            direction = 'declining'
            strength = min(0.9, 0.5 + (decline_ratio - 0.5))
        else:
            direction = 'stable'
            strength = 0.5
        
        return direction, strength
    
    def _identify_trend_indicators(self, data: List[Dict[str, Any]]) -> Dict[str, int]:
        """Identify specific trend indicators in the data"""
        
        indicators = {category: 0 for category in self.trend_indicators.keys()}
        
        for item in data:
            text = f"{item.get('title', '')} {item.get('content', '')}".lower()
            
            for category, keywords in self.trend_indicators.items():
                for keyword in keywords:
                    indicators[category] += text.count(keyword)
        
        return indicators
    
    def _calculate_trend_confidence(self, data: List[Dict[str, Any]], 
                                  keywords_over_time: Dict[str, List[Tuple[datetime, int]]]) -> float:
        """Calculate confidence in trend analysis"""
        
        # Factors affecting confidence:
        # 1. Amount of data
        # 2. Time span of data
        # 3. Consistency of trends
        # 4. Data quality
        
        data_amount_score = min(1.0, len(data) / 50)  # Normalize to 50 data points
        
        # Time span score
        time_span_hours = self._get_time_span_hours(data)
        time_span_score = min(1.0, time_span_hours / 168)  # Normalize to 1 week
        
        # Trend consistency score
        consistency_score = self._calculate_trend_consistency(keywords_over_time)
        
        # Data quality score (based on completeness)
        quality_score = self._calculate_data_quality_score(data)
        
        # Weighted average
        confidence = (
            data_amount_score * 0.3 +
            time_span_score * 0.2 +
            consistency_score * 0.3 +
            quality_score * 0.2
        )
        
        return round(confidence, 2)
    
    def _get_time_span_hours(self, data: List[Dict[str, Any]]) -> float:
        """Calculate time span of data in hours"""
        
        dates = []
        for item in data:
            try:
                if item.get('published_at'):
                    date = datetime.fromisoformat(item['published_at'].replace('Z', '+00:00'))
                    dates.append(date)
            except:
                continue
        
        if len(dates) < 2:
            return 1.0  # Default to 1 hour
        
        dates.sort()
        time_span = dates[-1] - dates[0]
        return time_span.total_seconds() / 3600  # Convert to hours
    
    def _calculate_trend_consistency(self, keywords_over_time: Dict[str, List[Tuple[datetime, int]]]) -> float:
        """Calculate how consistent the trends are"""
        
        if not keywords_over_time:
            return 0.5
        
        consistent_trends = 0
        total_keywords = 0
        
        for keyword, timeline in keywords_over_time.items():
            if len(timeline) < 3:
                continue
            
            total_keywords += 1
            
            # Check if trend is consistent (monotonic or stable)
            timeline.sort(key=lambda x: x[0])
            counts = [count for _, count in timeline]
            
            # Check for monotonic increase or decrease
            increasing = all(counts[i] <= counts[i+1] for i in range(len(counts)-1))
            decreasing = all(counts[i] >= counts[i+1] for i in range(len(counts)-1))
            stable = max(counts) - min(counts) <= 1
            
            if increasing or decreasing or stable:
                consistent_trends += 1
        
        if total_keywords == 0:
            return 0.5
        
        return consistent_trends / total_keywords
    
    def _calculate_data_quality_score(self, data: List[Dict[str, Any]]) -> float:
        """Calculate data quality score based on completeness"""
        
        if not data:
            return 0.0
        
        complete_items = 0
        
        for item in data:
            # Check if item has essential fields
            has_title = bool(item.get('title', '').strip())
            has_content = bool(item.get('content', '').strip())
            has_date = bool(item.get('published_at', '').strip())
            has_source = bool(item.get('source', '').strip())
            
            completeness = sum([has_title, has_content, has_date, has_source]) / 4
            if completeness >= 0.75:  # At least 3 out of 4 fields
                complete_items += 1
        
        return complete_items / len(data)
    
    def _get_analysis_period(self, data: List[Dict[str, Any]]) -> Dict[str, str]:
        """Get the time period covered by the analysis"""
        
        dates = []
        for item in data:
            try:
                if item.get('published_at'):
                    date = datetime.fromisoformat(item['published_at'].replace('Z', '+00:00'))
                    dates.append(date)
            except:
                continue
        
        if not dates:
            return {'start': 'unknown', 'end': 'unknown', 'duration': 'unknown'}
        
        dates.sort()
        start_date = dates[0]
        end_date = dates[-1]
        duration = end_date - start_date
        
        return {
            'start': start_date.isoformat(),
            'end': end_date.isoformat(),
            'duration': f"{duration.days} days, {duration.seconds // 3600} hours"
        }
    
    def detect_seasonal_trends(self, historical_data: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Detect seasonal patterns in market trends"""
        
        # Group data by month and day of week
        monthly_patterns = defaultdict(list)
        weekly_patterns = defaultdict(list)
        
        for item in historical_data:
            try:
                if item.get('published_at'):
                    date = datetime.fromisoformat(item['published_at'].replace('Z', '+00:00'))
                    month = date.strftime('%B')
                    day_of_week = date.strftime('%A')
                    
                    monthly_patterns[month].append(item)
                    weekly_patterns[day_of_week].append(item)
            except:
                continue
        
        # Analyze patterns
        monthly_activity = {month: len(items) for month, items in monthly_patterns.items()}
        weekly_activity = {day: len(items) for day, items in weekly_patterns.items()}
        
        return {
            'monthly_patterns': monthly_activity,
            'weekly_patterns': weekly_activity,
            'peak_month': max(monthly_activity, key=monthly_activity.get) if monthly_activity else None,
            'peak_day': max(weekly_activity, key=weekly_activity.get) if weekly_activity else None
        }