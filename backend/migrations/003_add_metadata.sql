-- Add metadata column to generations table
ALTER TABLE generations ADD COLUMN IF NOT EXISTS metadata JSONB;
COMMENT ON COLUMN generations.metadata IS 'Additional metadata for the generation (e.g., YouTube URL, video title, etc.)';
