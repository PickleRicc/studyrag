import { useAuth } from '../../context/AuthContext';
import { useState } from 'react';
import Link from 'next/link';
import { useChatSessions } from '../../hooks/useChatSessions';
import ChatHistoryModal from '../ChatHistoryModal';

export default function MainLayout({ children }) {
    const { user, signOut } = useAuth();
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
    const { sessions, activeSession, setActiveSession, messages, deleteSession } = useChatSessions();

    const handleSignOut = async () => {
        try {
            await signOut();
        } catch (error) {
            console.error('Error signing out:', error);
        }
    };

    const handleSessionClick = async (sessionId) => {
        await setActiveSession(sessionId);
        setIsHistoryModalOpen(true);
    };

    const handleDeleteSession = async (e, sessionId) => {
        e.stopPropagation();
        if (window.confirm('Are you sure you want to delete this chat history?')) {
            await deleteSession(sessionId);
        }
    };

    return (
        <div className="min-h-screen bg-[var(--background-dark)]">
            {/* Header */}
            <header className="bg-[var(--card-dark)] shadow-lg fixed w-full top-0 z-40 border-b border-[#3a3a3a]">
                <div className="flex items-center justify-between px-4 sm:px-6 py-3">
                    <div className="flex items-center space-x-4">
                        <button
                            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                            className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] focus:outline-none transition-colors duration-200 lg:hidden"
                            aria-label="Toggle sidebar"
                        >
                            {isSidebarOpen ? (
                                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            ) : (
                                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                                </svg>
                            )}
                        </button>
                        <h1 className="text-xl font-semibold text-[var(--text-primary)]">StudyRag</h1>
                    </div>
                    <div className="flex items-center space-x-4">
                        <span className="text-sm text-[var(--text-secondary)]">{user?.email}</span>
                        <button
                            onClick={handleSignOut}
                            className="px-3 py-1.5 text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] focus:outline-none"
                        >
                            Sign Out
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Layout */}
            <div className="flex min-h-screen pt-14">
                {/* Sidebar Overlay */}
                {isSidebarOpen && (
                    <div
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 lg:hidden"
                        onClick={() => setIsSidebarOpen(false)}
                    />
                )}

                {/* Sidebar */}
                <aside className={`
                    fixed top-14 left-0 w-[85%] sm:w-72 h-[calc(100vh-3.5rem)] 
                    bg-[var(--card-dark)] shadow-lg border-r border-[#3a3a3a] 
                    z-40 lg:z-0 lg:static lg:w-72
                    transform transition-transform duration-300 ease-in-out
                    ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
                `}>
                    <div className="p-4 space-y-4">
                        <div className="space-y-2">
                            {sessions.map((session) => (
                                <div
                                    key={session.id}
                                    onClick={() => handleSessionClick(session.id)}
                                    className={`flex items-center justify-between p-2 rounded-lg cursor-pointer ${
                                        activeSession?.id === session.id
                                            ? 'bg-[#3a3a3a] text-[var(--text-primary)]'
                                            : 'hover:bg-[#3a3a3a] text-[var(--text-secondary)]'
                                    } group`}
                                >
                                    <div className="flex items-center space-x-3 min-w-0">
                                        <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                                        </svg>
                                        <div className="truncate">
                                            <div className="font-medium truncate">
                                                {session.title}
                                            </div>
                                            <div className="text-xs text-[var(--text-secondary)] truncate">
                                                {new Date(session.last_updated).toLocaleDateString()}
                                            </div>
                                        </div>
                                    </div>
                                    <button
                                        onClick={(e) => handleDeleteSession(e, session.id)}
                                        className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-500/10 rounded transition-all duration-200"
                                    >
                                        <svg className="w-4 h-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                    </button>
                                </div>
                            ))}
                            {sessions.length === 0 && (
                                <div className="text-center py-4">
                                    <p className="text-sm text-[var(--text-secondary)]">No chat sessions yet</p>
                                </div>
                            )}
                        </div>
                    </div>
                </aside>

                {/* Main Content */}
                <main className="flex-1 p-4 lg:p-6">
                    {children}
                </main>

                {/* Chat History Modal */}
                <ChatHistoryModal
                    isOpen={isHistoryModalOpen}
                    messages={messages || []}
                    onClose={() => {
                        setIsHistoryModalOpen(false);
                        setActiveSession(null);
                    }}
                />
            </div>
        </div>
    );
}
