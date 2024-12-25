'use client';

import { useState } from 'react';
import { useActiveFiles } from '../hooks/useActiveFiles';
import { useAuth } from '../context/AuthContext';
import { useChatSessions } from '../hooks/useChatSessions';
import ChatHistoryModal from './ChatHistoryModal';

export default function Layout({ children }) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [activeTab, setActiveTab] = useState('files');
    const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
    const { activeFiles } = useActiveFiles();
    const { user, signOut } = useAuth();
    const { sessions, activeSession, setActiveSession, messages, deleteSession } = useChatSessions();

    const handleSignOut = async () => {
        await signOut();
    };

    const handleSessionClick = async (sessionId) => {
        await setActiveSession(sessionId);
        setIsHistoryModalOpen(true);
    };

    const handleDeleteSession = async (e, sessionId) => {
        e.stopPropagation(); // Prevent triggering session click
        if (window.confirm('Are you sure you want to delete this chat history?')) {
            await deleteSession(sessionId);
        }
    };

    return (
        <div className="min-h-screen bg-[var(--background-dark)]">
            {/* Header */}
            <header className="bg-[var(--card-dark)] shadow-lg fixed w-full top-0 z-10 border-b border-[#3a3a3a]">
                <div className="flex items-center justify-between px-6 py-4">
                    <div className="flex items-center space-x-4">
                        <button
                            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                            className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] focus:outline-none transition-colors duration-200 lg:hidden"
                        >
                            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </button>
                        <h1 className="text-xl font-semibold text-[var(--text-primary)]">LabRag</h1>
                    </div>
                    <div className="flex items-center space-x-6">
                        <div className="text-sm text-[var(--text-secondary)]">
                            {activeFiles.length} Document{activeFiles.length !== 1 ? 's' : ''} Loaded
                        </div>
                        <div className="text-sm text-[var(--text-secondary)]">
                            {user?.email}
                        </div>
                        <button
                            onClick={handleSignOut}
                            className="px-4 py-2 text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] focus:outline-none"
                        >
                            Sign Out
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Layout */}
            <div className="flex h-full pt-14">
                {/* Sidebar */}
                <aside className={`
                    fixed inset-y-0 left-0 z-20 w-64 bg-[var(--card-dark)] shadow-lg transform 
                    lg:translate-x-0 lg:static lg:inset-0 pt-14
                    transition-transform duration-300 ease-in-out
                    ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
                `}>
                    {/* Tab Navigation */}
                    <div className="border-b border-[#3a3a3a]">
                        <nav className="flex -mb-px" aria-label="Tabs">
                            <button
                                onClick={() => setActiveTab('files')}
                                className={`w-1/2 py-4 px-1 text-center border-b-2 font-medium text-sm ${
                                    activeTab === 'files'
                                        ? 'border-[var(--text-primary)] text-[var(--text-primary)]'
                                        : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[#3a3a3a]'
                                }`}
                            >
                                Files
                            </button>
                            <button
                                onClick={() => setActiveTab('chats')}
                                className={`w-1/2 py-4 px-1 text-center border-b-2 font-medium text-sm ${
                                    activeTab === 'chats'
                                        ? 'border-[var(--text-primary)] text-[var(--text-primary)]'
                                        : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[#3a3a3a]'
                                }`}
                            >
                                Chats
                            </button>
                        </nav>
                    </div>

                    <div className="h-full overflow-y-auto p-4">
                        {activeTab === 'files' ? (
                            <>
                                <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Active Files</h2>
                                <div className="space-y-2">
                                    {activeFiles.map((file, index) => (
                                        <div
                                            key={index}
                                            className="flex items-center space-x-2 p-2 rounded-lg hover:bg-[#3a3a3a] group"
                                        >
                                            <svg className="w-5 h-5 text-[var(--text-secondary)] group-hover:text-[var(--text-primary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                            </svg>
                                            <span className="text-sm text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] truncate">
                                                {file}
                                            </span>
                                        </div>
                                    ))}
                                    {activeFiles.length === 0 && (
                                        <p className="text-sm text-[var(--text-secondary)] text-center py-4">
                                            No files uploaded yet
                                        </p>
                                    )}
                                </div>
                            </>
                        ) : (
                            <>
                                <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Chat History</h2>
                                <div className="space-y-2">
                                    {sessions.map((session) => (
                                        <div
                                            key={session.id}
                                            onClick={() => handleSessionClick(session.id)}
                                            className={`flex items-center space-x-2 p-2 rounded-lg cursor-pointer ${
                                                activeSession?.id === session.id
                                                    ? 'bg-[#3a3a3a] text-[var(--text-primary)]'
                                                    : 'hover:bg-[#3a3a3a] text-[var(--text-secondary)]'
                                            } group`}
                                        >
                                            <svg className="w-5 h-5 text-[var(--text-secondary)] group-hover:text-[var(--text-primary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                                            </svg>
                                            <div className="flex-1 min-w-0">
                                                <div className="font-medium truncate">
                                                    {session.title}
                                                </div>
                                                <div className="text-xs text-[var(--text-secondary)] truncate">
                                                    {new Date(session.last_updated).toLocaleDateString()}
                                                </div>
                                            </div>
                                            <button
                                                onClick={(e) => handleDeleteSession(e, session.id)}
                                                className="ml-2 p-1 text-[var(--text-secondary)] hover:text-red-600 rounded-full hover:bg-red-50"
                                            >
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                            </button>
                                        </div>
                                    ))}
                                    {sessions.length === 0 && (
                                        <p className="text-sm text-[var(--text-secondary)] text-center py-4">
                                            No chat sessions yet
                                        </p>
                                    )}
                                </div>
                            </>
                        )}
                    </div>
                </aside>

                {/* Main Content */}
                <main className="flex-1 p-4 lg:p-6 overflow-hidden">
                    {/* Overlay for mobile when sidebar is open */}
                    {isSidebarOpen && (
                        <div 
                            className="fixed inset-0 bg-black bg-opacity-50 z-10 lg:hidden"
                            onClick={() => setIsSidebarOpen(false)}
                        />
                    )}
                    <div className="max-w-5xl mx-auto">
                        {children}
                    </div>
                </main>
            </div>

            {/* Chat History Modal */}
            <ChatHistoryModal
                isOpen={isHistoryModalOpen}
                onClose={() => setIsHistoryModalOpen(false)}
                messages={messages}
            />
        </div>
    );
}
