import { useState } from 'react';
import { useChatSessions } from '../hooks/useChatSessions';

export default function ChatSidebar() {
    const [newTitle, setNewTitle] = useState('');
    const {
        sessions,
        loading,
        activeSession,
        setActiveSession,
        createSession,
        deleteSession,
    } = useChatSessions();

    const handleCreateSession = async () => {
        await createSession(newTitle || 'New Chat');
        setNewTitle('');
    };

    return (
        <div className="w-64 bg-[var(--card-dark)] h-full flex flex-col border-r border-[#3a3a3a]">
            {/* Header */}
            <div className="p-4 border-b border-[#3a3a3a]">
                <button
                    onClick={handleCreateSession}
                    className="w-full flex items-center justify-center space-x-2 bg-[var(--accent-green)] bg-opacity-10 
                             hover:bg-opacity-20 text-[var(--accent-green)] p-2 rounded-lg transition-all duration-200"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    <span>New Chat</span>
                </button>
            </div>

            {/* Chat List */}
            <div className="flex-1 overflow-y-auto p-2">
                {loading ? (
                    <div className="flex items-center justify-center h-full">
                        <div className="flex space-x-2">
                            <div className="w-2 h-2 bg-[var(--text-secondary)] rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                            <div className="w-2 h-2 bg-[var(--text-secondary)] rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                            <div className="w-2 h-2 bg-[var(--text-secondary)] rounded-full animate-bounce"></div>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-1">
                        {sessions.map((session) => (
                            <div
                                key={session.id}
                                onClick={() => setActiveSession(session.id)}
                                className={`group flex items-center p-2 rounded-lg cursor-pointer transition-colors duration-200 ${
                                    activeSession?.id === session.id
                                        ? 'bg-[var(--accent-green)] bg-opacity-10 text-[var(--accent-green)]'
                                        : 'text-[var(--text-secondary)] hover:bg-[#3a3a3a]'
                                }`}
                            >
                                <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                                          d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                                </svg>
                                <span className="truncate flex-1">{session.title}</span>
                                {activeSession?.id === session.id && (
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            deleteSession(session.id);
                                        }}
                                        className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-500/10 
                                                 hover:text-red-500 rounded transition-all duration-200"
                                    >
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
