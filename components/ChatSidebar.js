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
    } = useChatSessions();

    const handleCreateSession = async () => {
        await createSession(newTitle || 'New Chat');
        setNewTitle('');
    };

    return (
        <div className="w-64 bg-gray-800 h-full flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-gray-700">
                <button
                    onClick={handleCreateSession}
                    className="w-full flex items-center justify-center space-x-2 bg-gray-700 hover:bg-gray-600 text-white p-2 rounded-lg transition-colors"
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
                    <div className="text-gray-400 p-4">Loading...</div>
                ) : (
                    <div className="space-y-1">
                        {sessions.map((session) => (
                            <div
                                key={session.id}
                                onClick={() => setActiveSession(session.id)}
                                className={`group flex items-center p-2 rounded-lg cursor-pointer ${
                                    activeSession?.id === session.id
                                        ? 'bg-gray-700 text-white'
                                        : 'text-gray-300 hover:bg-gray-700'
                                }`}
                            >
                                <svg className="w-4 h-4 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                                </svg>
                                <div className="flex-1 min-w-0">
                                    <div className="font-medium truncate">
                                        {session.title}
                                    </div>
                                    <div className="text-xs text-gray-400 truncate">
                                        {new Date(session.last_updated).toLocaleDateString()}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
