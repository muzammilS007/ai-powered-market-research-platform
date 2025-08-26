-- MariaDB Configuration and Optimization
-- Additional database settings for AI-Powered Market Research Tool

USE `market_research`;

-- --------------------------------------------------------
-- Database Configuration Settings
-- --------------------------------------------------------

-- Set global variables for better performance with text processing
SET GLOBAL innodb_buffer_pool_size = 268435456; -- 256MB
SET GLOBAL innodb_log_file_size = 67108864; -- 64MB
SET GLOBAL max_allowed_packet = 67108864; -- 64MB for large JSON data
SET GLOBAL innodb_file_per_table = ON;
SET GLOBAL innodb_flush_log_at_trx_commit = 2; -- Better performance for non-critical data

-- Full-text search configuration
SET GLOBAL ft_min_word_len = 3;
SET GLOBAL ft_max_word_len = 84;
SET GLOBAL ft_stopword_file = '';

-- --------------------------------------------------------
-- Create stored procedures for common operations
-- --------------------------------------------------------

DELIMITER //

-- Procedure to clean old market data (older than 90 days)
CREATE PROCEDURE CleanOldMarketData()
BEGIN
    DECLARE rows_deleted INT DEFAULT 0;
    
    DELETE FROM market_data 
    WHERE created_at < DATE_SUB(NOW(), INTERVAL 90 DAY);
    
    SET rows_deleted = ROW_COUNT();
    
    INSERT INTO api_usage (api_name, endpoint, requests_count, created_at)
    VALUES ('system', 'cleanup_market_data', rows_deleted, NOW());
    
    SELECT CONCAT('Deleted ', rows_deleted, ' old market data records') AS result;
END //

-- Procedure to get trending keywords from recent queries
CREATE PROCEDURE GetTrendingKeywords(IN days_back INT)
BEGIN
    SELECT 
        SUBSTRING_INDEX(SUBSTRING_INDEX(ta.emerging_topics, ',', numbers.n), ',', -1) AS keyword,
        COUNT(*) AS frequency,
        AVG(ta.trend_strength) AS avg_strength
    FROM (
        SELECT 1 n UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4 UNION ALL SELECT 5
        UNION ALL SELECT 6 UNION ALL SELECT 7 UNION ALL SELECT 8 UNION ALL SELECT 9 UNION ALL SELECT 10
    ) numbers
    INNER JOIN trend_analysis ta ON CHAR_LENGTH(ta.emerging_topics) - CHAR_LENGTH(REPLACE(ta.emerging_topics, ',', '')) >= numbers.n - 1
    WHERE ta.created_at >= DATE_SUB(NOW(), INTERVAL days_back DAY)
        AND ta.emerging_topics IS NOT NULL
        AND TRIM(SUBSTRING_INDEX(SUBSTRING_INDEX(ta.emerging_topics, ',', numbers.n), ',', -1)) != ''
    GROUP BY keyword
    HAVING frequency > 1
    ORDER BY frequency DESC, avg_strength DESC
    LIMIT 20;
END //

-- Procedure to calculate sentiment trends over time
CREATE PROCEDURE GetSentimentTrends(IN days_back INT)
BEGIN
    SELECT 
        DATE(sr.created_at) AS analysis_date,
        AVG(sr.positive_score) AS avg_positive,
        AVG(sr.negative_score) AS avg_negative,
        AVG(sr.neutral_score) AS avg_neutral,
        COUNT(*) AS total_analyses
    FROM sentiment_reports sr
    INNER JOIN historical_queries hq ON sr.query_id = hq.id
    WHERE sr.created_at >= DATE_SUB(NOW(), INTERVAL days_back DAY)
    GROUP BY DATE(sr.created_at)
    ORDER BY analysis_date DESC;
END //

-- Procedure to get market insights summary
CREATE PROCEDURE GetMarketInsightsSummary(IN query_text VARCHAR(500))
BEGIN
    SELECT 
        mi.insight_type,
        mi.impact_level,
        mi.timeframe,
        COUNT(*) AS insight_count,
        AVG(mi.confidence_score) AS avg_confidence,
        GROUP_CONCAT(DISTINCT mi.title SEPARATOR '; ') AS insight_titles
    FROM market_insights mi
    INNER JOIN historical_queries hq ON mi.query_id = hq.id
    WHERE hq.query LIKE CONCAT('%', query_text, '%')
        OR query_text IS NULL
    GROUP BY mi.insight_type, mi.impact_level, mi.timeframe
    ORDER BY insight_count DESC, avg_confidence DESC;
END //

-- Procedure to archive old completed queries
CREATE PROCEDURE ArchiveOldQueries()
BEGIN
    DECLARE archived_count INT DEFAULT 0;
    
    -- Create archive table if it doesn't exist
    CREATE TABLE IF NOT EXISTS `historical_queries_archive` LIKE `historical_queries`;
    
    -- Move old completed queries to archive (older than 1 year)
    INSERT INTO `historical_queries_archive`
    SELECT * FROM `historical_queries`
    WHERE status = 'completed' 
        AND created_at < DATE_SUB(NOW(), INTERVAL 1 YEAR);
    
    SET archived_count = ROW_COUNT();
    
    -- Delete archived queries from main table
    DELETE FROM `historical_queries`
    WHERE status = 'completed' 
        AND created_at < DATE_SUB(NOW(), INTERVAL 1 YEAR);
    
    SELECT CONCAT('Archived ', archived_count, ' old query records') AS result;
END //

DELIMITER ;

-- --------------------------------------------------------
-- Create triggers for data integrity and logging
-- --------------------------------------------------------

DELIMITER //

-- Trigger to validate sentiment scores sum to approximately 1.0
CREATE TRIGGER validate_sentiment_scores
    BEFORE INSERT ON sentiment_reports
    FOR EACH ROW
BEGIN
    DECLARE total_score DECIMAL(3,2);
    SET total_score = NEW.positive_score + NEW.negative_score + NEW.neutral_score;
    
    IF total_score < 0.95 OR total_score > 1.05 THEN
        SIGNAL SQLSTATE '45000' 
        SET MESSAGE_TEXT = 'Sentiment scores must sum to approximately 1.0';
    END IF;
END //

-- Trigger to update query status when analysis is complete
CREATE TRIGGER update_query_completion
    AFTER INSERT ON sentiment_reports
    FOR EACH ROW
BEGIN
    -- Check if both sentiment and trend analysis exist for this query
    IF EXISTS (SELECT 1 FROM trend_analysis WHERE query_id = NEW.query_id) THEN
        UPDATE historical_queries 
        SET status = 'completed', updated_at = NOW()
        WHERE id = NEW.query_id AND status = 'processing';
    END IF;
END //

-- Trigger to log API usage for expensive operations
CREATE TRIGGER log_query_processing
    AFTER UPDATE ON historical_queries
    FOR EACH ROW
BEGIN
    IF NEW.status = 'completed' AND OLD.status = 'processing' THEN
        INSERT INTO api_usage (api_name, endpoint, requests_count, response_time, created_at)
        VALUES ('system', 'query_processing', 1, NEW.processing_time, NOW());
    END IF;
END //

DELIMITER ;

-- --------------------------------------------------------
-- Create events for automated maintenance
-- --------------------------------------------------------

-- Enable event scheduler
SET GLOBAL event_scheduler = ON;

-- Event to clean old market data weekly
CREATE EVENT IF NOT EXISTS cleanup_old_data
ON SCHEDULE EVERY 1 WEEK
STARTS CURRENT_TIMESTAMP
DO
  CALL CleanOldMarketData();

-- Event to archive old queries monthly
CREATE EVENT IF NOT EXISTS archive_old_queries
ON SCHEDULE EVERY 1 MONTH
STARTS CURRENT_TIMESTAMP
DO
  CALL ArchiveOldQueries();

-- --------------------------------------------------------
-- Create user roles and permissions
-- --------------------------------------------------------

-- Create application user with limited permissions
CREATE USER IF NOT EXISTS 'market_app'@'%' IDENTIFIED BY 'secure_app_password_2024';

-- Grant necessary permissions to application user
GRANT SELECT, INSERT, UPDATE ON market_research.market_data TO 'market_app'@'%';
GRANT SELECT, INSERT, UPDATE ON market_research.historical_queries TO 'market_app'@'%';
GRANT SELECT, INSERT, UPDATE ON market_research.sentiment_reports TO 'market_app'@'%';
GRANT SELECT, INSERT, UPDATE ON market_research.trend_analysis TO 'market_app'@'%';
GRANT SELECT, INSERT, UPDATE ON market_research.market_insights TO 'market_app'@'%';
GRANT SELECT, INSERT ON market_research.api_usage TO 'market_app'@'%';

-- Grant access to views
GRANT SELECT ON market_research.query_results_complete TO 'market_app'@'%';
GRANT SELECT ON market_research.trending_topics_summary TO 'market_app'@'%';
GRANT SELECT ON market_research.api_usage_summary TO 'market_app'@'%';

-- Grant execute permissions for stored procedures
GRANT EXECUTE ON PROCEDURE market_research.GetTrendingKeywords TO 'market_app'@'%';
GRANT EXECUTE ON PROCEDURE market_research.GetSentimentTrends TO 'market_app'@'%';
GRANT EXECUTE ON PROCEDURE market_research.GetMarketInsightsSummary TO 'market_app'@'%';

FLUSH PRIVILEGES;

-- --------------------------------------------------------
-- Performance optimization queries
-- --------------------------------------------------------

-- Analyze tables for better query optimization
ANALYZE TABLE market_data, historical_queries, sentiment_reports, trend_analysis, market_insights, api_usage;

-- Update table statistics
OPTIMIZE TABLE market_data, historical_queries, sentiment_reports, trend_analysis, market_insights, api_usage;

-- Show final database status
SELECT 
    'Database setup completed successfully' AS status,
    COUNT(*) AS total_tables
FROM information_schema.tables 
WHERE table_schema = 'market_research';

SELECT 
    table_name,
    table_rows,
    ROUND(((data_length + index_length) / 1024 / 1024), 2) AS 'Size (MB)'
FROM information_schema.tables 
WHERE table_schema = 'market_research'
ORDER BY table_name;