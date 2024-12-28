import { useState, useEffect } from 'react';
import FileUpload from '../components/FileUpload';
import QueryInterface from '../components/QueryInterface';
import Chat from '../components/Chat';
import { useActiveFiles } from '../hooks/useActiveFiles';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/router';
import MainLayout from '../components/Layout/MainLayout';

export default function Home() {
  const router = useRouter();
  const [mode, setMode] = useState('query');
  const { activeFiles, addActiveFile, removeActiveFile } = useActiveFiles();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    // If no user is logged in, redirect to sign in
    if (!isLoading && !user) {
      router.push('/auth/signin');
    }
  }, [user, router, isLoading]);

  // Show nothing while checking auth state
  if (isLoading || !user) {
    return null;
  }

  const handleUploadSuccess = (fileInfo) => {
    // Add only the file name to active files
    addActiveFile(fileInfo.name);
  };

  const handleDeleteFile = async (indexToDelete) => {
    const fileToDelete = activeFiles[indexToDelete];
    try {
      const response = await fetch(`/api/deleteFile?fileName=${encodeURIComponent(fileToDelete)}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete file');
      removeActiveFile(fileToDelete);
    } catch (error) {
      console.error('Error deleting file:', error);
    }
  };

  return (
    <MainLayout>
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
              {activeFiles.map((fileName, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-[var(--card-dark)] rounded-lg border border-[#3a3a3a]"
                >
                  <span className="text-[var(--text-secondary)]">{fileName}</span>
                  <button
                    onClick={() => handleDeleteFile(index)}
                    className="text-red-500 hover:text-red-600"
                  >
                    Delete
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
    </MainLayout>
  );
}
