ALTER TABLE mhp_listings 
ADD COLUMN IF NOT EXISTS google_place_id TEXT,
ADD COLUMN IF NOT EXISTS google_rating DECIMAL(2,1),
ADD COLUMN IF NOT EXISTS google_total_reviews INTEGER,
ADD COLUMN IF NOT EXISTS review_summary TEXT,
ADD COLUMN IF NOT EXISTS review_highlights TEXT[], 
ADD COLUMN IF NOT EXISTS review_improvements TEXT[],
ADD COLUMN IF NOT EXISTS last_review_sync TIMESTAMP; 
ADD COLUMN IF NOT EXISTS google_place_id TEXT,
ADD COLUMN IF NOT EXISTS google_rating DECIMAL(2,1),
ADD COLUMN IF NOT EXISTS google_total_reviews INTEGER,
ADD COLUMN IF NOT EXISTS review_summary TEXT,
ADD COLUMN IF NOT EXISTS review_highlights TEXT[], 
ADD COLUMN IF NOT EXISTS review_improvements TEXT[],
ADD COLUMN IF NOT EXISTS last_review_sync TIMESTAMP; 