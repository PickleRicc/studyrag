-- Add sources column to session_messages table
ALTER TABLE session_messages ADD COLUMN IF NOT EXISTS sources JSONB;

-- Update RLS policy for session_messages to ensure proper access control
DROP POLICY IF EXISTS "Users can create messages in their sessions" ON session_messages;
CREATE POLICY "Users can create messages in their sessions"
    ON session_messages 
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM chat_sessions
            WHERE chat_sessions.id = session_messages.session_id
            AND chat_sessions.user_id = auth.uid()
        )
    );
