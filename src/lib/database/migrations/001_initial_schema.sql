-- src/lib/database/migrations/001_initial_schema.sql
CREATE TABLE generation_markers (
    id SERIAL PRIMARY KEY,
    marker_type VARCHAR(50) NOT NULL,
    key VARCHAR(100) NOT NULL,
    markers TEXT[] NOT NULL
);

CREATE TABLE user_responses (
    id SERIAL PRIMARY KEY,
    question_id VARCHAR(50) NOT NULL,
    response_text TEXT NOT NULL,
    parsed_data JSONB NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add indexes
CREATE INDEX idx_markers_type ON generation_markers(marker_type);
CREATE INDEX idx_responses_question ON user_responses(question_id);