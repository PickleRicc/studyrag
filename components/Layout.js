'use client';

import { useState } from 'react';
import { useActiveFiles } from '../hooks/useActiveFiles';

export default function Layout({ children }) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const { activeFiles } = useActiveFiles();

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow-sm fixed w-full top-0 z-10">
                <div className="flex items-center justify-between px-4 py-3">
                    <div className="flex items-center space-x-3">
                        <button
                            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                            className="text-gray-500 hover:text-gray-600 focus:outline-none focus:text-gray-600 lg:hidden"
                        >
                            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </button>
                        <h1 className="text-xl font-semibold text-gray-800">StudyRag</h1>
                    </div>
                    <div className="text-sm text-gray-600">
                        {activeFiles.length} Document{activeFiles.length !== 1 ? 's' : ''} Loaded
                    </div>
                </div>
            </header>

            {/* Main Layout */}
            <div className="flex h-full pt-14">
                {/* Sidebar */}
                <aside className={`
                    fixed inset-y-0 left-0 z-20 w-64 bg-white shadow-lg transform 
                    lg:translate-x-0 lg:static lg:inset-0 pt-14
                    transition-transform duration-300 ease-in-out
                    ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
                `}>
                    <div className="h-full overflow-y-auto p-4">
                        <h2 className="text-lg font-semibold text-gray-800 mb-4">Active Files</h2>
                        <div className="space-y-2">
                            {activeFiles.map((file, index) => (
                                <div
                                    key={index}
                                    className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-50 group"
                                >
                                    <svg className="w-5 h-5 text-gray-400 group-hover:text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    <span className="text-sm text-gray-600 group-hover:text-gray-900 truncate">
                                        {file}
                                    </span>
                                </div>
                            ))}
                            {activeFiles.length === 0 && (
                                <p className="text-sm text-gray-500 text-center py-4">
                                    No files uploaded yet
                                </p>
                            )}
                        </div>
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
        </div>
    );
}
