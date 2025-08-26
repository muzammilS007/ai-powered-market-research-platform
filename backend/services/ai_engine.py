import openai
import os
import json
import re
from datetime import datetime
from typing import Dict, List, Any
import re

class AIEngine:
    """Advanced AI Engine for generating market insights using sophisticated prompt engineering"""
    
    def __init__(self):
        self.openai_api_key = os.getenv('OPENAI_API_KEY')
        if self.openai_api_key:
            openai.api_key = self.openai_api_key
        
        # Advanced prompt templates with few-shot learning examples
        self.insight_examples = [
            {
                "query": "Tesla stock performance",
                "context": "Positive sentiment: 65%, Recent news about new factory, Stock up 12%",
                "analysis": "Tesla shows strong momentum driven by expansion news and positive investor sentiment. The 12% stock increase correlates with factory announcement, indicating market confidence in growth strategy."
            },
            {
                "query": "Cryptocurrency market trends",
                "context": "Mixed sentiment: 45% positive, 35% negative, Regulatory concerns, Institutional adoption",
                "analysis": "Cryptocurrency market exhibits volatility with regulatory uncertainty offsetting institutional adoption benefits. Mixed sentiment reflects market's struggle between growth potential and regulatory risks."
            }
        ]
        
    def generate_insights(self, query: str, raw_data: List[Dict], 
                         sentiment_results: Dict, trend_results: Dict) -> Dict[str, Any]:
        """Generate comprehensive market insights using prompt engineering"""
        
        try:
            # Prepare context from raw data
            context = self._prepare_context(raw_data, sentiment_results, trend_results)
            
            # Generate main insights
            main_insights = self._generate_main_insights(query, context)
            
            # Generate specific analyses
            market_opportunities = self._identify_market_opportunities(query, context)
            risk_assessment = self._assess_market_risks(query, context)
            competitive_landscape = self._analyze_competitive_landscape(query, context)
            
            return {
                'summary': main_insights.get('summary', ''),
                'key_findings': main_insights.get('key_findings', []),
                'market_opportunities': market_opportunities,
                'risk_assessment': risk_assessment,
                'competitive_landscape': competitive_landscape,
                'recommendations': main_insights.get('recommendations', []),
                'confidence_score': main_insights.get('confidence_score', 0.7),
                'data_quality': self._assess_data_quality(raw_data),
                'generated_at': datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            return {
                'summary': f'Error generating insights: {str(e)}',
                'key_findings': [],
                'market_opportunities': [],
                'risk_assessment': {'level': 'unknown', 'factors': []},
                'competitive_landscape': [],
                'recommendations': [],
                'confidence_score': 0.0,
                'error': str(e)
            }
    
    def _prepare_context(self, raw_data: List[Dict], sentiment_results: Dict, trend_results: Dict) -> str:
        """Prepare enhanced context with market signals extraction and data preprocessing"""
        
        # Extract market signals and key themes
        market_signals = self._extract_market_signals(raw_data)
        key_themes = self._identify_key_themes(raw_data)
        data_quality_metrics = self._calculate_data_quality_metrics(raw_data)
        
        # Sample recent and most relevant articles/posts
        sample_content = []
        sorted_data = sorted(raw_data[:15], key=lambda x: len(x.get('content', '')), reverse=True)
        
        for item in sorted_data[:8]:  # Focus on most substantial content
            content = f"📊 Source: {item.get('source', 'Unknown')}\n"
            content += f"📰 Title: {item.get('title', 'No title')}\n"
            content += f"📝 Content: {item.get('content', '')[:300]}...\n"
            content += f"📅 Published: {item.get('published_at', 'Unknown')}\n"
            content += f"🎯 Relevance Score: {self._calculate_relevance_score(item):.2f}\n\n"
            sample_content.append(content)
        
        # Build comprehensive context
        context = f"""
🔍 COMPREHENSIVE MARKET INTELLIGENCE CONTEXT:

📈 SENTIMENT ANALYSIS SUMMARY:
- Overall Market Sentiment: {sentiment_results.get('overall', 'neutral').upper()}
- Positive Sentiment: {sentiment_results.get('positive', 0):.1%}
- Negative Sentiment: {sentiment_results.get('negative', 0):.1%}
- Neutral Sentiment: {sentiment_results.get('neutral', 0):.1%}
- Sentiment Confidence: {sentiment_results.get('confidence', 0.7):.1%}
- Sentiment Volatility: {self._calculate_sentiment_volatility(sentiment_results)}

📊 TREND ANALYSIS INSIGHTS:
- Primary Trend Direction: {trend_results.get('direction', 'stable').upper()}
- Trend Strength: {trend_results.get('strength', 0.5):.1%}
- Trend Confidence: {trend_results.get('confidence', 0.5):.1%}
- Analysis Period: {trend_results.get('analysis_period', {}).get('duration', 'Unknown')}
- Emerging Topics: {', '.join(trend_results.get('emerging_topics', ['None identified']))}
- Declining Topics: {', '.join(trend_results.get('declining_topics', ['None identified']))}
- Trend Indicators: {self._format_trend_indicators(trend_results.get('trend_indicators', {}))}

🎯 KEY MARKET SIGNALS:
{self._format_market_signals(market_signals)}

🏷️ DOMINANT THEMES:
{self._format_key_themes(key_themes)}

📋 DATA QUALITY ASSESSMENT:
- Total Data Points: {len(raw_data)}
- Data Completeness: {data_quality_metrics.get('completeness', 0):.1%}
- Data Recency: {data_quality_metrics.get('recency', 0):.1%}
- Source Diversity: {data_quality_metrics.get('source_diversity', 0):.1%}
- Content Quality: {data_quality_metrics.get('content_quality', 0):.1%}

📰 REPRESENTATIVE CONTENT SAMPLES:
{''.join(sample_content[:6])}

🔢 STATISTICAL SUMMARY:
- Average Content Length: {sum(len(item.get('content', '')) for item in raw_data) / len(raw_data) if raw_data else 0:.0f} characters
- Source Distribution: {self._get_source_distribution(raw_data)}
- Time Range: {self._get_time_range(raw_data)}
"""
        return context
    
    def _extract_market_signals(self, raw_data: List[Dict]) -> Dict[str, Any]:
        """Extract key market signals from raw data"""
        signals = {
            'volume_indicators': [],
            'price_movements': [],
            'regulatory_mentions': [],
            'innovation_signals': [],
            'competitive_actions': []
        }
        
        # Simple keyword-based signal extraction
        for item in raw_data:
            content = (item.get('content', '') + ' ' + item.get('title', '')).lower()
            
            # Volume indicators
            if any(word in content for word in ['surge', 'spike', 'increase', 'growth', 'expansion']):
                signals['volume_indicators'].append('Positive volume signal detected')
            
            # Price movements
            if any(word in content for word in ['price', 'cost', 'valuation', 'market cap']):
                signals['price_movements'].append('Price-related activity identified')
            
            # Regulatory mentions
            if any(word in content for word in ['regulation', 'policy', 'government', 'compliance']):
                signals['regulatory_mentions'].append('Regulatory development noted')
            
            # Innovation signals
            if any(word in content for word in ['innovation', 'technology', 'breakthrough', 'patent']):
                signals['innovation_signals'].append('Innovation activity detected')
            
            # Competitive actions
            if any(word in content for word in ['acquisition', 'merger', 'partnership', 'competition']):
                signals['competitive_actions'].append('Competitive movement identified')
        
        return signals
    
    def _identify_key_themes(self, raw_data: List[Dict]) -> List[str]:
        """Identify dominant themes in the data"""
        theme_keywords = {
            'Growth & Expansion': ['growth', 'expansion', 'scale', 'increase'],
            'Technology & Innovation': ['technology', 'innovation', 'digital', 'AI'],
            'Market Competition': ['competition', 'competitor', 'market share'],
            'Financial Performance': ['revenue', 'profit', 'earnings', 'financial'],
            'Regulatory & Policy': ['regulation', 'policy', 'compliance', 'government'],
            'Customer & Demand': ['customer', 'demand', 'consumer', 'user']
        }
        
        theme_scores = {}
        total_content = ' '.join([item.get('content', '') + ' ' + item.get('title', '') for item in raw_data]).lower()
        
        for theme, keywords in theme_keywords.items():
            score = sum(total_content.count(keyword) for keyword in keywords)
            if score > 0:
                theme_scores[theme] = score
        
        return sorted(theme_scores.keys(), key=lambda x: theme_scores[x], reverse=True)[:5]
    
    def _calculate_data_quality_metrics(self, raw_data: List[Dict]) -> Dict[str, float]:
        """Calculate comprehensive data quality metrics"""
        if not raw_data:
            return {'completeness': 0, 'recency': 0, 'source_diversity': 0, 'content_quality': 0}
        
        # Completeness: items with both title and content
        complete_items = sum(1 for item in raw_data if item.get('title') and item.get('content'))
        completeness = complete_items / len(raw_data)
        
        # Recency: items from last 7 days
        recent_items = 0
        for item in raw_data:
            if item.get('published_at'):
                try:
                    pub_date = datetime.fromisoformat(item['published_at'].replace('Z', '+00:00'))
                    days_old = (datetime.utcnow() - pub_date.replace(tzinfo=None)).days
                    if days_old <= 7:
                        recent_items += 1
                except:
                    pass
        recency = recent_items / len(raw_data)
        
        # Source diversity
        sources = set(item.get('source', 'unknown') for item in raw_data)
        source_diversity = min(len(sources) / 5, 1.0)  # Normalize to max 5 sources
        
        # Content quality: average content length
        avg_length = sum(len(item.get('content', '')) for item in raw_data) / len(raw_data)
        content_quality = min(avg_length / 500, 1.0)  # Normalize to 500 chars as good quality
        
        return {
            'completeness': completeness,
            'recency': recency,
            'source_diversity': source_diversity,
            'content_quality': content_quality
        }
    
    def _calculate_relevance_score(self, item: Dict) -> float:
        """Calculate relevance score for content item"""
        score = 0.5  # Base score
        
        # Content length bonus
        content_length = len(item.get('content', ''))
        if content_length > 200:
            score += 0.2
        if content_length > 500:
            score += 0.2
        
        # Title quality bonus
        if item.get('title') and len(item.get('title', '')) > 10:
            score += 0.1
        
        return min(score, 1.0)
    
    def _calculate_sentiment_volatility(self, sentiment_results: Dict) -> str:
        """Calculate sentiment volatility indicator"""
        pos = sentiment_results.get('positive', 0)
        neg = sentiment_results.get('negative', 0)
        neu = sentiment_results.get('neutral', 0)
        
        # High volatility if sentiment is very mixed
        if abs(pos - neg) < 0.2 and neu < 0.6:
            return 'HIGH'
        elif abs(pos - neg) < 0.4:
            return 'MEDIUM'
        else:
            return 'LOW'
    
    def _format_trend_indicators(self, indicators: Dict) -> str:
        """Format trend indicators for display"""
        if not indicators:
            return 'No specific indicators identified'
        
        formatted = []
        for key, value in indicators.items():
            if value > 0:
                formatted.append(f"{key.title()}: {value}")
        
        return ', '.join(formatted) if formatted else 'No significant indicators'
    
    def _format_market_signals(self, signals: Dict) -> str:
        """Format market signals for display"""
        formatted_signals = []
        for category, signal_list in signals.items():
            if signal_list:
                formatted_signals.append(f"• {category.replace('_', ' ').title()}: {len(signal_list)} signals detected")
        
        return '\n'.join(formatted_signals) if formatted_signals else '• No significant market signals detected'
    
    def _format_key_themes(self, themes: List[str]) -> str:
        """Format key themes for display"""
        if not themes:
            return '• No dominant themes identified'
        
        return '\n'.join([f"• {theme}" for theme in themes])
    
    def _get_source_distribution(self, raw_data: List[Dict]) -> str:
        """Get source distribution summary"""
        sources = {}
        for item in raw_data:
            source = item.get('source', 'Unknown')
            sources[source] = sources.get(source, 0) + 1
        
        return ', '.join([f"{source}: {count}" for source, count in sorted(sources.items(), key=lambda x: x[1], reverse=True)[:3]])
    
    def _get_time_range(self, raw_data: List[Dict]) -> str:
        """Get time range of data"""
        dates = []
        for item in raw_data:
            if item.get('published_at'):
                try:
                    pub_date = datetime.fromisoformat(item['published_at'].replace('Z', '+00:00'))
                    dates.append(pub_date)
                except:
                    pass
        
        if dates:
            earliest = min(dates)
            latest = max(dates)
            return f"{earliest.strftime('%Y-%m-%d')} to {latest.strftime('%Y-%m-%d')}"
        
        return 'Unknown time range'
    
    def _generate_main_insights(self, query: str, context: str) -> Dict[str, Any]:
        """Generate main market insights using advanced prompt engineering with chain-of-thought reasoning"""
        
        # Build few-shot learning examples
        examples_text = "\n\n".join([
            f"Example {i+1}:\nQuery: {ex['query']}\nContext: {ex['context']}\nAnalysis: {ex['analysis']}"
            for i, ex in enumerate(self.insight_examples)
        ])
        
        prompt = f"""
You are a senior market research analyst with 15+ years of experience in financial markets, consumer behavior, and competitive intelligence. Your analysis methodology follows a structured approach:

1. PATTERN RECOGNITION: Identify key patterns in the data
2. CAUSAL ANALYSIS: Determine cause-and-effect relationships
3. TREND EXTRAPOLATION: Project future implications
4. RISK-REWARD ASSESSMENT: Evaluate potential outcomes
5. STRATEGIC RECOMMENDATIONS: Provide actionable insights

LEARNING EXAMPLES:
{examples_text}

Now analyze the following market scenario using the same structured approach:

QUERY: {query}

MARKET DATA CONTEXT:
{context}

STEP-BY-STEP ANALYSIS:

Step 1 - Pattern Recognition:
First, I'll identify the key patterns in sentiment, trends, and market signals...

Step 2 - Causal Analysis:
Next, I'll determine what's driving these patterns and their interconnections...

Step 3 - Trend Extrapolation:
Based on current patterns, I'll project likely future developments...

Step 4 - Risk-Reward Assessment:
I'll evaluate potential positive and negative outcomes...

Step 5 - Strategic Recommendations:
Finally, I'll provide specific, actionable recommendations...

Provide your complete analysis in this exact JSON format:
{{
    "summary": "A comprehensive 2-3 sentence executive summary highlighting the most critical market insights",
    "key_findings": [
        "Finding 1: [Pattern/Trend] - [Supporting Data] - [Implication]",
        "Finding 2: [Pattern/Trend] - [Supporting Data] - [Implication]",
        "Finding 3: [Pattern/Trend] - [Supporting Data] - [Implication]"
    ],
    "recommendations": [
        "{{Priority: High}} [Specific Action] - [Expected Outcome] - [Timeline]",
        "{{Priority: Medium}} [Specific Action] - [Expected Outcome] - [Timeline]",
        "{{Priority: Low}} [Specific Action] - [Expected Outcome] - [Timeline]"
    ],
    "confidence_score": 0.85,
    "methodology_notes": "Brief explanation of analysis approach and data reliability factors"
}}

Ensure every insight is:
- Backed by specific data points from the context
- Quantified where possible (percentages, trends, volumes)
- Actionable with clear next steps
- Prioritized by business impact
"""
        
        try:
            if not self.openai_api_key:
                # Fallback analysis when OpenAI is not available
                return self._generate_fallback_insights(query, context)
            
            response = openai.ChatCompletion.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": "You are an expert market research analyst specializing in data-driven insights and trend analysis."},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=1000,
                temperature=0.3
            )
            
            content = response.choices[0].message.content
            return json.loads(content)
            
        except Exception as e:
            return self._generate_fallback_insights(query, context)
    
    def _identify_market_opportunities(self, query: str, context: str) -> List[Dict[str, Any]]:
        """Identify market opportunities using SWOT analysis framework and opportunity scoring"""
        
        prompt = f"""
You are a strategic business analyst specializing in market opportunity identification. Use the SWOT analysis framework combined with Porter's Five Forces to identify high-value opportunities.

ANALYSIS FRAMEWORK:
1. STRENGTHS: What advantages exist in the current market?
2. WEAKNESSES: What gaps or inefficiencies are present?
3. OPPORTUNITIES: What external factors create potential?
4. THREATS: What challenges could become opportunities if addressed?
5. COMPETITIVE DYNAMICS: Where are competitors vulnerable?

MARKET QUERY: {query}

MARKET INTELLIGENCE:
{context}

STRUCTURED OPPORTUNITY ANALYSIS:

Step 1 - Market Gap Analysis:
Identify unmet needs, underserved segments, or inefficiencies...

Step 2 - Competitive Advantage Assessment:
Determine where competitive weaknesses create openings...

Step 3 - Trend Convergence Opportunities:
Find where multiple trends intersect to create new possibilities...

Step 4 - Risk-Adjusted Opportunity Scoring:
Evaluate each opportunity's potential vs. implementation difficulty...

Provide opportunities in this enhanced JSON format:
[
    {{
        "opportunity": "[Specific opportunity with clear value proposition]",
        "category": "market_gap/competitive_advantage/trend_convergence/disruption",
        "potential_impact": "high/medium/low",
        "timeframe": "short-term (0-6 months)/medium-term (6-18 months)/long-term (18+ months)",
        "implementation_difficulty": "low/medium/high",
        "opportunity_score": 0.85,
        "supporting_evidence": "[Specific data points and market signals]",
        "success_metrics": "[How to measure opportunity realization]",
        "key_requirements": "[Critical resources or capabilities needed]"
    }}
]

Prioritize opportunities by:
- Market size and growth potential
- Competitive advantage sustainability
- Implementation feasibility
- Time-to-market considerations
- Resource requirements vs. expected returns

Limit to top 3-5 highest-scoring opportunities.
"""
        
        try:
            if not self.openai_api_key:
                return self._generate_fallback_opportunities()
            
            response = openai.ChatCompletion.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": "You are a business opportunity analyst."},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=500,
                temperature=0.4
            )
            
            content = response.choices[0].message.content
            return json.loads(content)
            
        except Exception as e:
            return self._generate_fallback_opportunities()
    
    def _assess_market_risks(self, query: str, context: str) -> Dict[str, Any]:
        """Assess market risks using advanced risk analysis frameworks and quantitative scoring"""
        
        prompt = f"""
You are a senior risk analyst with expertise in market risk assessment, scenario planning, and quantitative risk modeling. Apply the following comprehensive risk analysis framework:

RISK ANALYSIS METHODOLOGY:
1. SYSTEMATIC RISK: Market-wide factors affecting all participants
2. UNSYSTEMATIC RISK: Specific risks unique to the sector/company
3. OPERATIONAL RISK: Internal process and execution risks
4. REGULATORY RISK: Policy and compliance-related risks
5. COMPETITIVE RISK: Threats from market competition
6. TECHNOLOGICAL RISK: Disruption and obsolescence risks

MARKET FOCUS: {query}

RISK INTELLIGENCE DATA:
{context}

STRUCTURED RISK ASSESSMENT:

Step 1 - Risk Identification:
Systematically identify all potential risk categories from the data...

Step 2 - Probability Assessment:
Evaluate likelihood based on historical patterns and current indicators...

Step 3 - Impact Analysis:
Quantify potential business impact across multiple dimensions...

Step 4 - Risk Correlation Analysis:
Identify how risks might compound or cascade...

Step 5 - Mitigation Strategy Development:
Develop specific, actionable risk mitigation approaches...

Provide comprehensive risk assessment in this JSON format:
{{
    "overall_risk_level": "low/medium/high",
    "risk_score": 0.65,
    "confidence_level": 0.80,
    "risk_factors": [
        {{
            "risk": "[Specific risk with clear description]",
            "category": "systematic/unsystematic/operational/regulatory/competitive/technological",
            "probability": "low/medium/high",
            "probability_score": 0.70,
            "impact": "low/medium/high",
            "impact_score": 0.80,
            "risk_score": 0.75,
            "time_horizon": "immediate/short-term/medium-term/long-term",
            "mitigation": "[Specific, actionable mitigation strategy]",
            "mitigation_cost": "low/medium/high",
            "early_warning_indicators": "[Key metrics to monitor]"
        }}
    ],
    "market_volatility": {{
        "current_level": "low/medium/high",
        "trend_direction": "increasing/stable/decreasing",
        "volatility_drivers": "[Key factors causing volatility]"
    }},
    "scenario_analysis": {{
        "best_case": "[Optimistic scenario description]",
        "base_case": "[Most likely scenario]",
        "worst_case": "[Pessimistic scenario description]"
    }},
    "risk_monitoring_recommendations": "[Key metrics and frequencies for ongoing risk monitoring]"
}}

Ensure risk assessment is:
- Quantified with probability and impact scores (0.0-1.0)
- Prioritized by overall risk score (probability × impact)
- Supported by specific data evidence
- Actionable with clear mitigation strategies
- Forward-looking with early warning indicators
"""
        
        try:
            if not self.openai_api_key:
                return self._generate_fallback_risks()
            
            response = openai.ChatCompletion.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": "You are a risk assessment specialist."},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=400,
                temperature=0.2
            )
            
            content = response.choices[0].message.content
            return json.loads(content)
            
        except Exception as e:
            return self._generate_fallback_risks()
    
    def _analyze_competitive_landscape(self, query: str, context: str) -> List[Dict[str, Any]]:
        """Analyze competitive landscape using Porter's Five Forces and competitive intelligence"""
        
        prompt = f"""
You are a competitive intelligence analyst specializing in market structure analysis. Apply Porter's Five Forces framework to analyze the competitive landscape:

PORTER'S FIVE FORCES ANALYSIS:
1. COMPETITIVE RIVALRY: Intensity of competition among existing players
2. SUPPLIER POWER: Bargaining power of suppliers
3. BUYER POWER: Bargaining power of customers
4. THREAT OF SUBSTITUTES: Risk of alternative products/services
5. BARRIERS TO ENTRY: Difficulty for new competitors to enter

MARKET ANALYSIS FOCUS: {query}

COMPETITIVE INTELLIGENCE DATA:
{context}

COMPETITIVE ANALYSIS METHODOLOGY:

Step 1 - Market Player Identification:
Identify direct competitors, indirect competitors, and potential entrants...

Step 2 - Competitive Positioning Analysis:
Analyze each player's market position, strengths, and vulnerabilities...

Step 3 - Market Share and Influence Assessment:
Evaluate relative market power and influence...

Step 4 - Strategic Group Mapping:
Group competitors by strategic approach and market focus...

Step 5 - Competitive Dynamics Prediction:
Forecast likely competitive moves and market evolution...

Provide competitive analysis in this JSON format:
[
    {{
        "competitor_name": "[Company/Brand Name]",
        "competitive_tier": "market_leader/strong_player/niche_player/emerging_threat",
        "market_share_estimate": "dominant/significant/moderate/small",
        "mention_frequency": 5,
        "sentiment_context": "positive/neutral/negative",
        "competitive_strengths": [
            "[Specific strength with evidence]",
            "[Another key advantage]"
        ],
        "competitive_weaknesses": [
            "[Specific vulnerability]",
            "[Another weakness to exploit]"
        ],
        "strategic_focus": "[Primary market strategy or positioning]",
        "threat_level": "high/medium/low",
        "opportunity_for_differentiation": "[How to compete effectively against this player]"
    }}
]

Additionally, extract and analyze:
- Market concentration (fragmented/moderately concentrated/highly concentrated)
- Competitive intensity indicators
- Barriers to entry assessment
- Substitute threat evaluation

Limit analysis to top 5-7 most relevant competitors based on market impact and mention frequency.
"""
        
        try:
            if not self.openai_api_key:
                return self._generate_fallback_competitive_analysis(context)
            
            response = openai.ChatCompletion.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": "You are a competitive intelligence analyst with expertise in market structure analysis and Porter's Five Forces framework."},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=800,
                temperature=0.3
            )
            
            content = response.choices[0].message.content
            return json.loads(content)
            
        except Exception as e:
            return self._generate_fallback_competitive_analysis(context)
    
    def _generate_fallback_competitive_analysis(self, context: str) -> List[Dict[str, Any]]:
        """Generate basic competitive analysis when OpenAI API is not available"""
        
        try:
            # Extract mentioned companies/competitors from context
            competitors = []
            # Enhanced keyword extraction for common companies
            common_companies = ['Apple', 'Google', 'Microsoft', 'Amazon', 'Tesla', 'Meta', 'Netflix', 
                              'Samsung', 'Intel', 'NVIDIA', 'Adobe', 'Salesforce', 'Oracle', 'IBM']
            
            for company in common_companies:
                if company.lower() in context.lower():
                    mention_count = context.lower().count(company.lower())
                    # Simple sentiment analysis based on context
                    sentiment = 'neutral'
                    if any(word in context.lower() for word in ['positive', 'growth', 'success', 'leading']):
                        sentiment = 'positive'
                    elif any(word in context.lower() for word in ['negative', 'decline', 'loss', 'struggling']):
                        sentiment = 'negative'
                    
                    competitors.append({
                        'competitor_name': company,
                        'competitive_tier': 'strong_player',
                        'market_share_estimate': 'moderate',
                        'mention_frequency': mention_count,
                        'sentiment_context': sentiment,
                        'competitive_strengths': ['Market presence', 'Brand recognition'],
                        'competitive_weaknesses': ['Market competition', 'Industry challenges'],
                        'strategic_focus': 'Market expansion and innovation',
                        'threat_level': 'medium',
                        'opportunity_for_differentiation': 'Focus on unique value proposition and customer experience'
                    })
            
            return sorted(competitors, key=lambda x: x['mention_frequency'], reverse=True)[:5]
            
        except Exception as e:
            return []
    
    def _assess_data_quality(self, raw_data: List[Dict]) -> Dict[str, Any]:
        """Assess the quality and reliability of the data"""
        
        total_items = len(raw_data)
        
        # Count items with complete information
        complete_items = 0
        recent_items = 0
        
        for item in raw_data:
            if item.get('title') and item.get('content'):
                complete_items += 1
            
            # Check if item is recent (within last 30 days)
            if item.get('published_at'):
                try:
                    pub_date = datetime.fromisoformat(item['published_at'].replace('Z', '+00:00'))
                    days_old = (datetime.utcnow() - pub_date.replace(tzinfo=None)).days
                    if days_old <= 30:
                        recent_items += 1
                except:
                    pass
        
        completeness_score = complete_items / total_items if total_items > 0 else 0
        recency_score = recent_items / total_items if total_items > 0 else 0
        
        quality_score = (completeness_score + recency_score) / 2
        
        return {
            'total_data_points': total_items,
            'completeness_score': completeness_score,
            'recency_score': recency_score,
            'overall_quality_score': quality_score,
            'quality_rating': 'high' if quality_score > 0.7 else 'medium' if quality_score > 0.4 else 'low'
        }
    
    def _generate_fallback_insights(self, query: str, context: str) -> Dict[str, Any]:
        """Generate enhanced fallback insights when OpenAI API is not available"""
        
        import random
        
        # Extract key metrics from context with enhanced parsing
        sentiment_match = re.search(r'Overall Market Sentiment: (\w+)', context)
        sentiment = sentiment_match.group(1).lower() if sentiment_match else 'neutral'
        
        trend_match = re.search(r'Primary Trend Direction: (\w+)', context)
        trend = trend_match.group(1).lower() if trend_match else 'stable'
        
        # Extract numerical data for more dynamic analysis
        pos_sentiment = self._extract_percentage(context, 'Positive Sentiment:')
        neg_sentiment = self._extract_percentage(context, 'Negative Sentiment:')
        trend_strength = self._extract_percentage(context, 'Trend Strength:')
        data_points = self._extract_number(context, 'Total Data Points:')
        
        # Generate dynamic market interpretation
        market_condition = self._determine_market_condition(sentiment, trend, pos_sentiment, neg_sentiment)
        volatility_level = self._assess_volatility(pos_sentiment, neg_sentiment, trend_strength)
        
        # Create contextual insights based on query type
        query_type = self._classify_query_type(query)
        
        # Generate dynamic findings based on actual data
        key_findings = self._generate_dynamic_findings(query, sentiment, trend, pos_sentiment, neg_sentiment, trend_strength, query_type)
        
        # Generate contextual recommendations
        recommendations = self._generate_contextual_recommendations(market_condition, volatility_level, query_type, data_points)
        
        # Calculate dynamic confidence score
        confidence_score = self._calculate_dynamic_confidence(data_points, pos_sentiment + neg_sentiment, trend_strength)
        
        insights = {
            'summary': f'Market analysis for {query} reveals {market_condition} conditions with {sentiment} sentiment ({pos_sentiment:.1%} positive, {neg_sentiment:.1%} negative). The {trend} trend shows {trend_strength:.1%} strength, indicating {self._interpret_market_momentum(trend, trend_strength)} momentum across {data_points} data points.',
            'key_findings': key_findings,
            'recommendations': recommendations,
            'confidence_score': confidence_score,
            'methodology_notes': f'Analysis based on {data_points} data points using sentiment pattern recognition, trend analysis, and {query_type} market dynamics assessment'
        }
        
        return insights
    
    def _extract_percentage(self, context: str, label: str) -> float:
        """Extract percentage values from context"""
        pattern = rf'{re.escape(label)}\s*(\d+\.\d+)%'
        match = re.search(pattern, context)
        return float(match.group(1)) / 100 if match else 0.0
    
    def _extract_number(self, context: str, label: str) -> int:
        """Extract numerical values from context"""
        pattern = rf'{re.escape(label)}\s*(\d+)'
        match = re.search(pattern, context)
        return int(match.group(1)) if match else 0
    
    def _determine_market_condition(self, sentiment: str, trend: str, pos_sentiment: float, neg_sentiment: float) -> str:
        """Determine overall market condition"""
        if sentiment == 'positive' and trend in ['bullish', 'upward'] and pos_sentiment > 0.6:
            return 'strongly bullish'
        elif sentiment == 'negative' and trend in ['bearish', 'downward'] and neg_sentiment > 0.6:
            return 'strongly bearish'
        elif abs(pos_sentiment - neg_sentiment) < 0.2:
            return 'mixed and volatile'
        elif sentiment == 'positive' or pos_sentiment > neg_sentiment:
            return 'cautiously optimistic'
        elif sentiment == 'negative' or neg_sentiment > pos_sentiment:
            return 'cautiously pessimistic'
        else:
            return 'neutral and stable'
    
    def _assess_volatility(self, pos_sentiment: float, neg_sentiment: float, trend_strength: float) -> str:
        """Assess market volatility level"""
        sentiment_spread = abs(pos_sentiment - neg_sentiment)
        
        if sentiment_spread < 0.2 and trend_strength < 0.3:
            return 'high volatility'
        elif sentiment_spread < 0.4 and trend_strength < 0.6:
            return 'moderate volatility'
        else:
            return 'low volatility'
    
    def _classify_query_type(self, query: str) -> str:
        """Classify the type of market query"""
        query_lower = query.lower()
        
        if any(word in query_lower for word in ['stock', 'share', 'equity', 'ticker']):
            return 'equity_analysis'
        elif any(word in query_lower for word in ['crypto', 'bitcoin', 'ethereum', 'blockchain']):
            return 'cryptocurrency_analysis'
        elif any(word in query_lower for word in ['sector', 'industry', 'market']):
            return 'sector_analysis'
        elif any(word in query_lower for word in ['company', 'corporation', 'business']):
            return 'company_analysis'
        else:
            return 'general_market_analysis'
    
    def _generate_dynamic_findings(self, query: str, sentiment: str, trend: str, pos_sentiment: float, neg_sentiment: float, trend_strength: float, query_type: str) -> List[str]:
        """Generate dynamic findings based on actual data"""
        findings = []
        
        # Sentiment-based finding
        if pos_sentiment > 0.6:
            findings.append(f'Strong positive sentiment ({pos_sentiment:.1%}) indicates high investor confidence in {query}, suggesting potential upward price pressure')
        elif neg_sentiment > 0.6:
            findings.append(f'Dominant negative sentiment ({neg_sentiment:.1%}) reflects market concerns about {query}, potentially creating downward pressure')
        else:
            findings.append(f'Mixed sentiment ({pos_sentiment:.1%} positive, {neg_sentiment:.1%} negative) suggests market uncertainty and potential volatility in {query}')
        
        # Trend-based finding
        if trend_strength > 0.7:
            findings.append(f'Strong {trend} trend ({trend_strength:.1%} strength) indicates clear market direction with high conviction among participants')
        elif trend_strength > 0.4:
            findings.append(f'Moderate {trend} trend ({trend_strength:.1%} strength) suggests emerging market consensus but with room for reversal')
        else:
            findings.append(f'Weak trend strength ({trend_strength:.1%}) indicates market indecision and potential for sudden directional changes')
        
        # Query-type specific finding
        if query_type == 'equity_analysis':
            findings.append(f'Equity-specific indicators suggest {self._get_equity_insight(sentiment, trend_strength)} performance expectations')
        elif query_type == 'cryptocurrency_analysis':
            findings.append(f'Cryptocurrency market dynamics show {self._get_crypto_insight(pos_sentiment, neg_sentiment)} adoption and regulatory sentiment')
        elif query_type == 'sector_analysis':
            findings.append(f'Sector-wide analysis reveals {self._get_sector_insight(trend, trend_strength)} competitive positioning and growth prospects')
        else:
            findings.append(f'Market-wide analysis indicates {self._get_general_insight(sentiment, trend)} economic conditions and investor behavior patterns')
        
        return findings[:3]  # Limit to 3 key findings
    
    def _generate_contextual_recommendations(self, market_condition: str, volatility_level: str, query_type: str, data_points: int) -> List[str]:
        """Generate contextual recommendations based on market conditions"""
        recommendations = []
        
        # Market condition based recommendations
        if 'bullish' in market_condition:
            recommendations.append('{Priority: High} Consider increasing position size during pullbacks - Expected outcome: Capitalize on upward momentum - Timeline: 1-3 months')
        elif 'bearish' in market_condition:
            recommendations.append('{Priority: High} Implement defensive strategies and risk management - Expected outcome: Protect capital during downturn - Timeline: Immediate')
        elif 'mixed' in market_condition:
            recommendations.append('{Priority: High} Adopt range-trading strategies and monitor key support/resistance levels - Expected outcome: Profit from volatility - Timeline: 2-6 weeks')
        else:
            recommendations.append('{Priority: Medium} Maintain balanced approach with regular portfolio rebalancing - Expected outcome: Steady growth with controlled risk - Timeline: 3-6 months')
        
        # Volatility based recommendations
        if volatility_level == 'high volatility':
            recommendations.append('{Priority: Medium} Reduce position sizes and increase cash reserves - Expected outcome: Lower portfolio risk - Timeline: Immediate')
        elif volatility_level == 'moderate volatility':
            recommendations.append('{Priority: Medium} Use dollar-cost averaging for new positions - Expected outcome: Smooth entry prices - Timeline: 4-8 weeks')
        else:
            recommendations.append('{Priority: Low} Consider longer-term strategic positions - Expected outcome: Benefit from stable trends - Timeline: 6-12 months')
        
        # Data quality based recommendations
        if data_points < 10:
            recommendations.append('{Priority: High} Expand data sources for more comprehensive analysis - Expected outcome: Improved decision accuracy - Timeline: 1-2 weeks')
        
        return recommendations[:3]  # Limit to 3 recommendations
    
    def _calculate_dynamic_confidence(self, data_points: int, sentiment_coverage: float, trend_strength: float) -> float:
        """Calculate dynamic confidence score based on data quality"""
        base_confidence = 0.5
        
        # Data quantity factor
        if data_points >= 20:
            base_confidence += 0.2
        elif data_points >= 10:
            base_confidence += 0.1
        
        # Sentiment coverage factor
        if sentiment_coverage > 0.8:
            base_confidence += 0.15
        elif sentiment_coverage > 0.5:
            base_confidence += 0.1
        
        # Trend strength factor
        if trend_strength > 0.7:
            base_confidence += 0.1
        elif trend_strength > 0.4:
            base_confidence += 0.05
        
        return min(base_confidence, 0.95)  # Cap at 95%
    
    def _get_equity_insight(self, sentiment: str, trend_strength: float) -> str:
        """Get equity-specific insight"""
        if sentiment == 'positive' and trend_strength > 0.6:
            return 'strong bullish'
        elif sentiment == 'negative' and trend_strength > 0.6:
            return 'concerning bearish'
        else:
            return 'mixed with cautious'
    
    def _get_crypto_insight(self, pos_sentiment: float, neg_sentiment: float) -> str:
        """Get cryptocurrency-specific insight"""
        if pos_sentiment > 0.6:
            return 'increasing mainstream'
        elif neg_sentiment > 0.6:
            return 'declining institutional'
        else:
            return 'stabilizing market'
    
    def _get_sector_insight(self, trend: str, trend_strength: float) -> str:
        """Get sector-specific insight"""
        if trend == 'upward' and trend_strength > 0.6:
            return 'strengthening'
        elif trend == 'downward' and trend_strength > 0.6:
            return 'weakening'
        else:
            return 'consolidating'
    
    def _get_general_insight(self, sentiment: str, trend: str) -> str:
        """Get general market insight"""
        if sentiment == 'positive' and trend in ['upward', 'bullish']:
            return 'favorable'
        elif sentiment == 'negative' and trend in ['downward', 'bearish']:
            return 'challenging'
        else:
            return 'transitional'
    
    def _interpret_market_momentum(self, trend: str, trend_strength: float) -> str:
        """Interpret market momentum"""
        if trend_strength > 0.7:
            return 'strong'
        elif trend_strength > 0.4:
            return 'moderate'
        else:
            return 'weak'
    
    def _generate_fallback_opportunities(self) -> List[Dict[str, Any]]:
        """Generate basic opportunities when OpenAI API is not available"""
        
        return [
            {
                'opportunity': 'Market monitoring and trend analysis',
                'potential_impact': 'medium',
                'timeframe': 'short-term',
                'supporting_evidence': 'Active market discussion and data availability'
            }
        ]
    
    def _generate_fallback_risks(self) -> Dict[str, Any]:
        """Generate basic risk assessment when OpenAI API is not available"""
        
        return {
            'overall_risk_level': 'medium',
            'risk_factors': [
                {
                    'risk': 'Market volatility and uncertainty',
                    'probability': 'medium',
                    'impact': 'medium',
                    'mitigation': 'Continuous monitoring and diversification'
                }
            ],
            'market_volatility': 'Standard market fluctuations observed'
        }