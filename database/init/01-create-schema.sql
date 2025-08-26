-- AI-Powered Market Research Tool Database Schema
-- MariaDB/MySQL Database Initialization Script

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = "+00:00";

-- Create database if not exists
CREATE DATABASE IF NOT EXISTS `market_research` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `market_research`;

-- --------------------------------------------------------
-- Table structure for `market_data`
-- Stores raw market data from various sources
-- --------------------------------------------------------

CREATE TABLE `market_data` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `source` varchar(50) NOT NULL COMMENT 'Data source: news, twitter, reddit, etc.',
  `source_id` varchar(255) DEFAULT NULL COMMENT 'Original ID from the source API',
  `title` text DEFAULT NULL COMMENT 'Article/post title',
  `content` longtext DEFAULT NULL COMMENT 'Full content/description',
  `url` varchar(500) DEFAULT NULL COMMENT 'Original URL',
  `author` varchar(255) DEFAULT NULL COMMENT 'Author/publisher name',
  `published_at` datetime DEFAULT NULL COMMENT 'Original publication date',
  `keywords` text DEFAULT NULL COMMENT 'Comma-separated keywords',
  `raw_data` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`raw_data`)) COMMENT 'Original API response as JSON',
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_source` (`source`),
  KEY `idx_published_at` (`published_at`),
  KEY `idx_created_at` (`created_at`),
  FULLTEXT KEY `idx_title_content` (`title`,`content`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Raw market data from external sources';

-- --------------------------------------------------------
-- Table structure for `historical_queries`
-- Stores user search queries and their results
-- --------------------------------------------------------

CREATE TABLE `historical_queries` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `query` varchar(500) NOT NULL COMMENT 'User search query',
  `sources` varchar(200) DEFAULT NULL COMMENT 'Comma-separated source types used',
  `results_summary` text DEFAULT NULL COMMENT 'AI-generated summary of results',
  `insights` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`insights`)) COMMENT 'Structured insights data as JSON',
  `data_points_count` int(11) DEFAULT 0 COMMENT 'Number of data points analyzed',
  `processing_time` decimal(8,3) DEFAULT NULL COMMENT 'Processing time in seconds',
  `status` enum('processing','completed','failed') DEFAULT 'completed' COMMENT 'Query processing status',
  `error_message` text DEFAULT NULL COMMENT 'Error details if processing failed',
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_query` (`query`(255)),
  KEY `idx_status` (`status`),
  KEY `idx_created_at` (`created_at`),
  FULLTEXT KEY `idx_query_fulltext` (`query`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Historical search queries and results';

-- --------------------------------------------------------
-- Table structure for `trend_analysis`
-- Stores trend analysis results
-- --------------------------------------------------------

CREATE TABLE `trend_analysis` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `query_id` int(11) NOT NULL COMMENT 'Reference to historical_queries table',
  `trend_direction` enum('rising','declining','stable') DEFAULT 'stable' COMMENT 'Overall trend direction',
  `trend_strength` decimal(3,2) DEFAULT 0.50 COMMENT 'Trend strength from 0.0 to 1.0',
  `emerging_topics` text DEFAULT NULL COMMENT 'Comma-separated emerging topics',
  `declining_topics` text DEFAULT NULL COMMENT 'Comma-separated declining topics',
  `related_keywords` text DEFAULT NULL COMMENT 'Comma-separated related keywords',
  `confidence_score` decimal(3,2) DEFAULT 0.70 COMMENT 'AI confidence in analysis (0.0-1.0)',
  `analysis_data` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`analysis_data`)) COMMENT 'Detailed analysis results as JSON',
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_query_id` (`query_id`),
  KEY `idx_trend_direction` (`trend_direction`),
  KEY `idx_created_at` (`created_at`),
  CONSTRAINT `fk_trend_analysis_query` FOREIGN KEY (`query_id`) REFERENCES `historical_queries` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Trend analysis results';

-- --------------------------------------------------------
-- Table structure for `sentiment_reports`
-- Stores sentiment analysis results
-- --------------------------------------------------------

CREATE TABLE `sentiment_reports` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `query_id` int(11) NOT NULL COMMENT 'Reference to historical_queries table',
  `positive_score` decimal(3,2) DEFAULT 0.00 COMMENT 'Positive sentiment score (0.0-1.0)',
  `negative_score` decimal(3,2) DEFAULT 0.00 COMMENT 'Negative sentiment score (0.0-1.0)',
  `neutral_score` decimal(3,2) DEFAULT 1.00 COMMENT 'Neutral sentiment score (0.0-1.0)',
  `overall_sentiment` enum('positive','negative','neutral') DEFAULT 'neutral' COMMENT 'Overall sentiment classification',
  `sentiment_breakdown` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`sentiment_breakdown`)) COMMENT 'Detailed sentiment data as JSON',
  `sample_texts` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`sample_texts`)) COMMENT 'Sample texts for each sentiment as JSON',
  `confidence_score` decimal(3,2) DEFAULT 0.70 COMMENT 'AI confidence in analysis (0.0-1.0)',
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_query_id` (`query_id`),
  KEY `idx_overall_sentiment` (`overall_sentiment`),
  KEY `idx_created_at` (`created_at`),
  CONSTRAINT `fk_sentiment_reports_query` FOREIGN KEY (`query_id`) REFERENCES `historical_queries` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Sentiment analysis results';

-- --------------------------------------------------------
-- Table structure for `api_usage`
-- Tracks API usage and costs for monitoring
-- --------------------------------------------------------

CREATE TABLE `api_usage` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `api_name` varchar(50) NOT NULL COMMENT 'API service name: openai, newsapi, twitter, etc.',
  `endpoint` varchar(200) DEFAULT NULL COMMENT 'Specific API endpoint called',
  `requests_count` int(11) DEFAULT 1 COMMENT 'Number of requests made',
  `tokens_used` int(11) DEFAULT 0 COMMENT 'Tokens used (for OpenAI API)',
  `cost_estimate` decimal(10,4) DEFAULT 0.0000 COMMENT 'Estimated cost in USD',
  `response_time` decimal(8,3) DEFAULT NULL COMMENT 'Response time in seconds',
  `status_code` int(11) DEFAULT NULL COMMENT 'HTTP status code',
  `error_message` text DEFAULT NULL COMMENT 'Error message if request failed',
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_api_name` (`api_name`),
  KEY `idx_created_at` (`created_at`),
  KEY `idx_status_code` (`status_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='API usage tracking and cost monitoring';

-- --------------------------------------------------------
-- Table structure for `market_insights`
-- Stores processed market insights and recommendations
-- --------------------------------------------------------

CREATE TABLE `market_insights` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `query_id` int(11) NOT NULL COMMENT 'Reference to historical_queries table',
  `insight_type` enum('opportunity','risk','trend','competitive') NOT NULL COMMENT 'Type of insight',
  `title` varchar(255) NOT NULL COMMENT 'Insight title/summary',
  `description` text DEFAULT NULL COMMENT 'Detailed insight description',
  `impact_level` enum('high','medium','low') DEFAULT 'medium' COMMENT 'Potential impact level',
  `timeframe` enum('short-term','medium-term','long-term') DEFAULT 'medium-term' COMMENT 'Relevant timeframe',
  `confidence_score` decimal(3,2) DEFAULT 0.70 COMMENT 'Confidence in this insight (0.0-1.0)',
  `supporting_data` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`supporting_data`)) COMMENT 'Supporting data and evidence as JSON',
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_query_id` (`query_id`),
  KEY `idx_insight_type` (`insight_type`),
  KEY `idx_impact_level` (`impact_level`),
  KEY `idx_created_at` (`created_at`),
  CONSTRAINT `fk_market_insights_query` FOREIGN KEY (`query_id`) REFERENCES `historical_queries` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Processed market insights and recommendations';

-- --------------------------------------------------------
-- Create indexes for better performance
-- --------------------------------------------------------

-- Composite indexes for common queries
CREATE INDEX `idx_market_data_source_date` ON `market_data` (`source`, `published_at`);
CREATE INDEX `idx_sentiment_query_sentiment` ON `sentiment_reports` (`query_id`, `overall_sentiment`);
CREATE INDEX `idx_trend_query_direction` ON `trend_analysis` (`query_id`, `trend_direction`);
CREATE INDEX `idx_insights_type_impact` ON `market_insights` (`insight_type`, `impact_level`);

-- --------------------------------------------------------
-- Insert sample data for testing
-- --------------------------------------------------------

-- Sample historical query
INSERT INTO `historical_queries` (`query`, `sources`, `results_summary`, `data_points_count`, `processing_time`, `status`) VALUES
('artificial intelligence market trends', 'news,social', 'AI market shows strong growth potential with increasing enterprise adoption and investment in machine learning technologies.', 25, 2.450, 'completed');

-- Sample sentiment report
INSERT INTO `sentiment_reports` (`query_id`, `positive_score`, `negative_score`, `neutral_score`, `overall_sentiment`, `confidence_score`) VALUES
(1, 0.65, 0.15, 0.20, 'positive', 0.82);

-- Sample trend analysis
INSERT INTO `trend_analysis` (`query_id`, `trend_direction`, `trend_strength`, `emerging_topics`, `declining_topics`, `confidence_score`) VALUES
(1, 'rising', 0.75, 'machine learning,enterprise ai,automation', 'traditional software,manual processes', 0.78);

-- Sample market insight
INSERT INTO `market_insights` (`query_id`, `insight_type`, `title`, `description`, `impact_level`, `timeframe`, `confidence_score`) VALUES
(1, 'opportunity', 'Enterprise AI Adoption Acceleration', 'Businesses are rapidly adopting AI solutions for automation and efficiency gains, creating significant market opportunities.', 'high', 'short-term', 0.85);

COMMIT;

-- --------------------------------------------------------
-- Create views for common queries
-- --------------------------------------------------------

-- View for complete query results with all related data
CREATE VIEW `query_results_complete` AS
SELECT 
    hq.id as query_id,
    hq.query,
    hq.sources,
    hq.results_summary,
    hq.data_points_count,
    hq.processing_time,
    hq.status,
    hq.created_at as query_date,
    sr.overall_sentiment,
    sr.positive_score,
    sr.negative_score,
    sr.neutral_score,
    ta.trend_direction,
    ta.trend_strength,
    ta.emerging_topics,
    ta.declining_topics
FROM historical_queries hq
LEFT JOIN sentiment_reports sr ON hq.id = sr.query_id
LEFT JOIN trend_analysis ta ON hq.id = ta.query_id
ORDER BY hq.created_at DESC;

-- View for trending topics analysis
CREATE VIEW `trending_topics_summary` AS
SELECT 
    DATE(ta.created_at) as analysis_date,
    ta.trend_direction,
    COUNT(*) as analysis_count,
    AVG(ta.trend_strength) as avg_trend_strength,
    GROUP_CONCAT(DISTINCT ta.emerging_topics SEPARATOR ';') as all_emerging_topics
FROM trend_analysis ta
WHERE ta.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
GROUP BY DATE(ta.created_at), ta.trend_direction
ORDER BY analysis_date DESC;

-- View for API usage summary
CREATE VIEW `api_usage_summary` AS
SELECT 
    api_name,
    DATE(created_at) as usage_date,
    SUM(requests_count) as total_requests,
    SUM(tokens_used) as total_tokens,
    SUM(cost_estimate) as total_cost,
    AVG(response_time) as avg_response_time,
    COUNT(CASE WHEN status_code >= 400 THEN 1 END) as error_count
FROM api_usage
WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
GROUP BY api_name, DATE(created_at)
ORDER BY usage_date DESC, api_name;