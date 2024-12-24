-- Create chat_sessions table
CREATE TABLE IF NOT EXISTS chat_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL DEFAULT 'New Chat',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create session_messages table
CREATE TABLE IF NOT EXISTS session_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID REFERENCES chat_sessions(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create session_documents table
CREATE TABLE IF NOT EXISTS session_documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID REFERENCES chat_sessions(id) ON DELETE CASCADE,
    document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(session_id, document_id)
);

-- Add RLS policies
ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_documents ENABLE ROW LEVEL SECURITY;

-- Chat sessions policies
CREATE POLICY "Users can view their own chat sessions"
    ON chat_sessions FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own chat sessions"
    ON chat_sessions FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own chat sessions"
    ON chat_sessions FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own chat sessions"
    ON chat_sessions FOR DELETE
    USING (auth.uid() = user_id);

-- Session messages policies
CREATE POLICY "Users can view messages in their sessions"
    ON session_messages FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM chat_sessions
        WHERE chat_sessions.id = session_messages.session_id
        AND chat_sessions.user_id = auth.uid()
    ));

CREATE POLICY "Users can create messages in their sessions"
    ON session_messages FOR INSERT
    WITH CHECK (EXISTS (
        SELECT 1 FROM chat_sessions
        WHERE chat_sessions.id = session_messages.session_id
        AND chat_sessions.user_id = auth.uid()
    ));

CREATE POLICY "Users can delete messages in their sessions"
    ON session_messages FOR DELETE
    USING (EXISTS (
        SELECT 1 FROM chat_sessions
        WHERE chat_sessions.id = session_messages.session_id
        AND chat_sessions.user_id = auth.uid()
    ));

-- Session documents policies
CREATE POLICY "Users can view documents in their sessions"
    ON session_documents FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM chat_sessions
        WHERE chat_sessions.id = session_documents.session_id
        AND chat_sessions.user_id = auth.uid()
    ));

CREATE POLICY "Users can add documents to their sessions"
    ON session_documents FOR INSERT
    WITH CHECK (EXISTS (
        SELECT 1 FROM chat_sessions
        WHERE chat_sessions.id = session_documents.session_id
        AND chat_sessions.user_id = auth.uid()
    ));

CREATE POLICY "Users can remove documents from their sessions"
    ON session_documents FOR DELETE
    USING (EXISTS (
        SELECT 1 FROM chat_sessions
        WHERE chat_sessions.id = session_documents.session_id
        AND chat_sessions.user_id = auth.uid()
    ));
