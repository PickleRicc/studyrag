-- Add sources column to session_messages table
ALTER TABLE session_messages ADD COLUMN IF NOT EXISTS sources JSONB;
