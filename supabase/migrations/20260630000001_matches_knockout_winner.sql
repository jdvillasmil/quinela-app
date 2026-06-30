-- Add knockout_winner column to store the advancing team when a knockout match ends in a draw (penalties)
-- Only used for bracket propagation; scoring uses home_score/away_score as-is
ALTER TABLE matches ADD COLUMN IF NOT EXISTS knockout_winner text;
