import Layout from '../components/Layout';
import Chat from '../components/Chat';
import FileUpload from '../components/FileUpload';
import QueryInterface from '../components/QueryInterface';
import { useState, useEffect } from 'react';
import { useActiveFiles } from '../hooks/useActiveFiles';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/navigation';

export default function Home() {
    const router = useRouter();
    const [mode, setMode] = useState('query'); // 'query' or 'chat'
    const { activeFiles, addActiveFile, removeActiveFile } = useActiveFiles();
    const { user } = useAuth();

    useEffect(() => {
        if (!user) {
            router.push('/auth/signup');
        }
    }, [user, router]);

    const handleUploadSuccess = (data) => {
        // Add new file to active files
        if (data.fileName) {
            addActiveFile(data.fileName);
        }
    };

    const handleDeleteFile = async (indexToDelete) => {
        const fileToDelete = activeFiles[indexToDelete];
        
        try {
            const response = await fetch(`/api/deleteFile?fileName=${encodeURIComponent(fileToDelete)}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                throw new Error('Failed to delete file');
            }

            // Remove from active files
            removeActiveFile(fileToDelete);
        } catch (error) {
            console.error('Error deleting file:', error);
        }
    };

    if (!user) {
        return (
            <div className="relative px-4 py-10 bg-[var(--card-dark)] border border-[#3a3a3a] rounded-xl sm:p-20">
                <div className="max-w-md mx-auto">
                    <div className="space-y-6 text-center">
                        <h2 className="text-2xl font-medium text-[var(--text-primary)]">Welcome to LabRag</h2>
                        <p className="text-[var(--text-secondary)]">Please sign in to start using LabRag</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <Layout>
            <div className="container mx-auto px-4 py-8">
                {/* Instructions */}
                <div className="mb-8 p-6 bg-[var(--card-dark)] rounded-xl border border-[#3a3a3a]">
                    <h2 className="text-xl font-medium text-[var(--text-primary)] mb-4">How to Use LabRag</h2>
                    <div className="space-y-4 text-[var(--text-secondary)]">
                        <p>1. Upload your PDF documents or audio files using the upload area below</p>
                        <p>2. Choose your preferred mode:</p>
                        <ul className="list-disc list-inside pl-4 space-y-2">
                            <li><span className="text-[var(--accent-green)]">Query Mode:</span> Ask specific questions about your documents</li>
                            <li><span className="text-[var(--accent-green)]">Chat Mode:</span> Have a conversation about your documents</li>
                        </ul>
                    </div>
                </div>

                {/* Mode Selection */}
                <div className="flex space-x-4 mb-8">
                    <button
                        onClick={() => setMode('query')}
                        className={`px-6 py-3 rounded-lg transition-all duration-200 ${
                            mode === 'query'
                                ? 'bg-[var(--accent-green-dim)] text-[var(--accent-green)]'
                                : 'bg-[var(--card-dark)] text-[var(--text-secondary)] hover:bg-[#3a3a3a]'
                        }`}
                    >
                        Query Mode
                    </button>
                    <button
                        onClick={() => setMode('chat')}
                        className={`px-6 py-3 rounded-lg transition-all duration-200 ${
                            mode === 'chat'
                                ? 'bg-[var(--accent-green-dim)] text-[var(--accent-green)]'
                                : 'bg-[var(--card-dark)] text-[var(--text-secondary)] hover:bg-[#3a3a3a]'
                        }`}
                    >
                        Chat Mode
                    </button>
                </div>

                {/* File Upload Area */}
                <div className="mb-8">
                    <FileUpload onUploadSuccess={handleUploadSuccess} />
                </div>

                {/* Active Files */}
                {activeFiles.length > 0 && (
                    <div className="mb-8">
                        <h3 className="text-lg font-medium text-[var(--text-primary)] mb-4">Active Files</h3>
                        <div className="space-y-2">
                            {activeFiles.map((file, index) => (
                                <div
                                    key={index}
                                    className="flex items-center justify-between p-3 bg-[var(--card-dark)] rounded-lg border border-[#3a3a3a]"
                                >
                                    <span className="text-[var(--text-primary)] truncate">{file}</span>
                                    <button
                                        onClick={() => handleDeleteFile(index)}
                                        className="p-1.5 text-[var(--text-secondary)] hover:text-red-500 hover:bg-red-500/10 rounded transition-all duration-200"
                                    >
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Interface */}
                <div className="mb-8">
                    {mode === 'query' ? <QueryInterface /> : <Chat />}
                </div>
            </div>
        </Layout>
    );
}
