import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase';
import { useAuth } from '../context/AuthContext';

export function useChatSessions() {
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeSession, setActiveSession] = useState(null);
    const [messages, setMessages] = useState([]);
    const [sessionDocuments, setSessionDocuments] = useState([]);
    const { user } = useAuth();

    // Fetch user's chat sessions with their documents
    const fetchSessions = async () => {
        if (!user) return [];

        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('chat_sessions')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (error) {
                console.error('Error fetching sessions:', error);
                return [];
            }

            setSessions(data || []);
            return data || [];
        } catch (err) {
            console.error('Error in fetchSessions:', err);
            return [];
        } finally {
            setLoading(false);
        }
    };

    // Fetch documents for a specific session
    const fetchSessionDocuments = async (sessionId) => {
        if (!sessionId) return;

        try {
            const { data, error } = await supabase
                .from('session_documents')
                .select(`
                    *,
                    documents(*)
                `)
                .eq('session_id', sessionId);

            if (error) throw error;
            setSessionDocuments(data?.map(item => item.documents) || []);
        } catch (err) {
            console.error('Error fetching session documents:', err);
        }
    };

    // Add document to current session
    const addDocumentToSession = async (documentId) => {
        if (!activeSession?.id || !documentId) return null;

        try {
            // Check if document is already in session
            const { data: existing } = await supabase
                .from('session_documents')
                .select('*')
                .eq('session_id', activeSession.id)
                .eq('document_id', documentId)
                .single();

            if (existing) return existing;

            // Add document to session
            const { data, error } = await supabase
                .from('session_documents')
                .insert({
                    session_id: activeSession.id,
                    document_id: documentId
                })
                .select(`
                    *,
                    documents(*)
                `)
                .single();

            if (error) throw error;

            // Update session's last_updated
            await supabase
                .from('chat_sessions')
                .update({ last_updated: new Date().toISOString() })
                .eq('id', activeSession.id);

            // Update local state
            setSessionDocuments(prev => [...prev, data.documents]);
            return data;
        } catch (err) {
            console.error('Error adding document to session:', err);
            return null;
        }
    };

    // Remove document from current session
    const removeDocumentFromSession = async (documentId) => {
        if (!activeSession?.id || !documentId) return false;

        try {
            const { error } = await supabase
                .from('session_documents')
                .delete()
                .eq('session_id', activeSession.id)
                .eq('document_id', documentId);

            if (error) throw error;

            // Update local state
            setSessionDocuments(prev => prev.filter(doc => doc.id !== documentId));
            return true;
        } catch (err) {
            console.error('Error removing document from session:', err);
            return false;
        }
    };

    // Create new session
    const createSession = async (title = 'New Chat') => {
        if (!user) {
            console.error('Cannot create session: No user logged in');
            return null;
        }

        try {
            const { data, error } = await supabase
                .from('chat_sessions')
                .insert({
                    user_id: user.id,
                    title,
                    is_active: true
                })
                .select()
                .single();

            if (error) {
                console.error('Supabase error creating session:', error);
                return null;
            }

            setActiveSession(data);
            setSessions(prev => [data, ...prev]);
            setMessages([]);
            localStorage.setItem('activeSessionId', data.id);
            return data;
        } catch (err) {
            console.error('Error creating session:', err);
            return null;
        }
    };

    // End current session
    const endSession = async () => {
        if (!activeSession) return;
        console.log('Ending session and clearing data');
        
        setActiveSession(null);
        setMessages([]);
        localStorage.removeItem('activeSessionId');
        await fetchSessions();
    };

    // Fetch messages for a session
    const fetchMessages = async (sessionId) => {
        if (!sessionId) return;

        try {
            const { data, error } = await supabase
                .from('session_messages')
                .select('*')
                .eq('session_id', sessionId)
                .order('created_at', { ascending: true });

            if (error) throw error;
            
            // Convert to our chat format
            const formattedMessages = data.map(msg => ({
                role: msg.role,
                content: msg.content,
                sources: msg.sources ? JSON.parse(msg.sources) : null
            }));
            
            setMessages(formattedMessages);
            return formattedMessages;
        } catch (err) {
            console.error('Error fetching messages:', err);
            return [];
        }
    };

    // Add message to session
    const addMessage = async (content, role = 'user', sources = null, sessionId = null) => {
        const targetSessionId = sessionId || activeSession?.id;
        
        if (!targetSessionId) {
            console.error('Cannot add message: No active session');
            return null;
        }

        try {
            // If this is the first user message, update the session title
            if (role === 'user') {
                const messages = await fetchMessages(targetSessionId);
                if (!messages || messages.length === 0) {
                    const title = content.split(' ').slice(0, 5).join(' ') + '...';
                    await supabase
                        .from('chat_sessions')
                        .update({ title })
                        .eq('id', targetSessionId);
                }
            }

            const { data, error } = await supabase
                .from('session_messages')
                .insert({
                    session_id: targetSessionId,
                    content,
                    role,
                    sources: sources ? JSON.stringify(sources) : null
                })
                .select()
                .single();

            if (error) {
                console.error('Error adding message:', error);
                return null;
            }

            // Update session's last_updated
            const { error: updateError } = await supabase
                .from('chat_sessions')
                .update({ last_updated: new Date().toISOString() })
                .eq('id', targetSessionId);

            if (updateError) {
                console.error('Error updating session timestamp:', updateError);
            }

            // Update local state with formatted message
            const formattedMessage = { 
                role: data.role, 
                content: data.content,
                sources: data.sources ? JSON.parse(data.sources) : null
            };
            setMessages(prev => [...prev, formattedMessage]);
            return formattedMessage;
        } catch (err) {
            console.error('Error in addMessage:', err);
            return null;
        }
    };

    // Format message for display
    const formatMessage = (message) => {
        if (!message) return null;
        return {
            ...message,
            sources: message.sources ? message.sources : null
        };
    };

    // Load sessions when user changes
    useEffect(() => {
        if (user) {
            const loadSessions = async () => {
                const storedSessionId = localStorage.getItem('activeSessionId');
                if (storedSessionId) {
                    // First load the active session data
                    const { data: sessionData } = await supabase
                        .from('chat_sessions')
                        .select('*')
                        .eq('id', storedSessionId)
                        .single();

                    if (sessionData) {
                        // Load messages for the active session
                        const { data: messageData } = await supabase
                            .from('session_messages')
                            .select('*')
                            .eq('session_id', storedSessionId)
                            .order('created_at');

                        setActiveSession(sessionData);
                        setMessages(messageData || []);
                    }
                }
                // Then load all sessions for the sidebar
                await fetchSessions();
            };
            loadSessions();
        } else {
            setSessions([]);
            setActiveSession(null);
            setMessages([]);
        }
    }, [user]);

    // Update localStorage when active session changes
    useEffect(() => {
        if (activeSession) {
            localStorage.setItem('activeSessionId', activeSession.id);
        } else {
            localStorage.removeItem('activeSessionId');
        }
    }, [activeSession?.id]);

    // Custom setActiveSession that also updates localStorage
    const handleSetActiveSession = async (sessionOrId) => {
        if (!sessionOrId) {
            localStorage.removeItem('activeSessionId');
            setActiveSession(null);
            setMessages([]);
            setSessionDocuments([]);
            return;
        }

        const session = typeof sessionOrId === 'string' 
            ? sessions.find(s => s.id === sessionOrId)
            : sessionOrId;

        if (session) {
            setActiveSession(session);
            await fetchMessages(session.id);
            await fetchSessionDocuments(session.id);
        }
    };

    // Switch active session
    const switchSession = async (sessionId) => {
        console.log('Switching to session:', sessionId);
        const session = sessions.find(s => s.id === sessionId);
        if (session) {
            console.log('Found session:', session);
            handleSetActiveSession(session);
            await fetchSessionDocuments(sessionId);
            console.log('Session messages loaded:');
            return messages;
        }
        console.log('Session not found:', sessionId);
        return [];
    };

    // Delete session
    const deleteSession = async (sessionId) => {
        if (!user) {
            console.error('Cannot delete session: No user logged in');
            return false;
        }

        try {
            // Delete messages first (due to foreign key constraint)
            const { error: messagesError } = await supabase
                .from('session_messages')
                .delete()
                .eq('session_id', sessionId);

            if (messagesError) {
                console.error('Error deleting messages:', messagesError);
                return false;
            }

            // Then delete the session
            const { error: sessionError } = await supabase
                .from('chat_sessions')
                .delete()
                .eq('id', sessionId);

            if (sessionError) {
                console.error('Error deleting session:', sessionError);
                return false;
            }

            // Update local state
            setSessions(prev => prev.filter(session => session.id !== sessionId));
            if (activeSession?.id === sessionId) {
                handleSetActiveSession(null);
            }

            return true;
        } catch (err) {
            console.error('Error deleting session:', err);
            return false;
        }
    };

    // Load messages and documents when active session changes
    useEffect(() => {
        if (activeSession?.id) {
            console.log('Active session changed, loading data for:', activeSession.id);
            fetchSessionDocuments(activeSession.id);
        } else {
            console.log('No active session, clearing messages and documents');
            setMessages([]);
            setSessionDocuments([]);
        }
    }, [activeSession?.id]);

    // Handle tab visibility changes
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible' && user) {
                const storedSessionId = localStorage.getItem('activeSessionId');
                if (storedSessionId) {
                    const session = sessions.find(s => s.id === storedSessionId);
                    if (session) {
                        switchSession(session.id);
                    }
                }
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
    }, [user, sessions]);

    return {
        sessions,
        loading,
        activeSession,
        messages,
        sessionDocuments,
        setActiveSession: handleSetActiveSession,
        createSession,
        addMessage,
        addDocumentToSession,
        removeDocumentFromSession,
        deleteSession,
        refreshSessions: fetchSessions,
        switchSession,
        endSession
    };
}
