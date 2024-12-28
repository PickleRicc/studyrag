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
        <div className="min-h-screen bg-[var(--background-dark)] flex">
            {/* Sidebar */}
            <aside className={`fixed lg:static inset-y-0 left-0 z-20 w-64 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
                            lg:translate-x-0 transition-transform duration-200 ease-in-out bg-[var(--card-dark)] border-r border-[#3a3a3a]`}>
                <div className="h-full flex flex-col">
                    {/* Sidebar Header */}
                    <div className="p-4 border-b border-[#3a3a3a]">
                        <h2 className="text-lg font-medium text-[var(--text-primary)]">Chat History</h2>
                    </div>

                    {/* Chat Sessions List */}
                    <div className="flex-1 overflow-y-auto p-4">
                        {sessions.map((session) => (
                            <div
                                key={session.id}
                                onClick={() => handleSessionClick(session.id)}
                                className={`group p-3 rounded-lg mb-2 cursor-pointer transition-all duration-200 
                                          ${session.id === activeSession?.id 
                                            ? 'bg-[#1c3520]' 
                                            : 'hover:bg-[#2a2a2a]'}`}
                            >
                                <div className="flex items-center justify-between">
                                    <span className={`truncate flex-1 text-[var(--text-primary)]`}>
                                        {session.title}
                                    </span>
                                    <button
                                        onClick={(e) => handleDeleteSession(e, session.id)}
                                        className="ml-2 p-1.5 rounded-lg text-[var(--text-secondary)]
                                                 hover:bg-red-500/10 hover:text-red-500
                                                 transition-all duration-200"
                                        aria-label="Delete chat session"
                                    >
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-h-screen">
                {/* Navigation Bar */}
                <nav className="bg-[var(--card-dark)] border-b border-[#3a3a3a]">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex justify-between h-16">
                            <div className="flex items-center space-x-4">
                                <button
                                    onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                                    className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] focus:outline-none transition-colors duration-200 lg:hidden"
                                >
                                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                                    </svg>
                                </button>
                                <Link href="/" className="text-xl font-bold text-[var(--text-primary)]">
                                    LabRag
                                </Link>
                            </div>

                            <div className="flex items-center">
                                {user && (
                                    <div className="flex items-center space-x-4">
                                        <span className="text-[var(--text-secondary)]">
                                            {user.email}
                                        </span>
                                        <button
                                            onClick={handleSignOut}
                                            className="px-4 py-2 rounded-lg text-[var(--text-secondary)] hover:bg-[#3a3a3a] transition-colors"
                                        >
                                            Sign Out
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </nav>

                {/* Main Content Area */}
                <main className="flex-1 overflow-auto">
                    {children}
                </main>
            </div>

            {/* Chat History Modal */}
            <ChatHistoryModal
                isOpen={isHistoryModalOpen}
                onClose={() => setIsHistoryModalOpen(false)}
                messages={messages || []}
            />
        </div>
    );
}
