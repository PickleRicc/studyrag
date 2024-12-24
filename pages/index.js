import Layout from '../components/Layout';
import Chat from '../components/Chat';
import FileUpload from '../components/FileUpload';
import QueryInterface from '../components/QueryInterface';
import { useState } from 'react';
import { useActiveFiles } from '../hooks/useActiveFiles';
import { useAuth } from '../context/AuthContext';

export default function Home() {
    const [mode, setMode] = useState('query'); // 'query' or 'chat'
    const { activeFiles, addActiveFile, removeActiveFile } = useActiveFiles();
    const { user } = useAuth();

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
            <div className="min-h-screen bg-gray-100 py-6 flex flex-col justify-center sm:py-12">
                <div className="relative py-3 sm:max-w-xl sm:mx-auto">
                    <div className="relative px-4 py-10 bg-white shadow-lg sm:rounded-3xl sm:p-20">
                        <div className="max-w-md mx-auto">
                            <div className="divide-y divide-gray-200">
                                <div className="py-8 text-base leading-6 space-y-4 text-gray-700 sm:text-lg sm:leading-7">
                                    <p>Please sign in to use StudyRag.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <Layout>
            <div className="h-full flex flex-col space-y-6">
                {/* Instructions Panel */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h2 className="text-lg font-semibold text-gray-800 mb-4">How to Use StudyRag</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="flex items-start space-x-3">
                            <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="font-medium text-gray-800">1. Upload Documents</h3>
                                <p className="text-sm text-gray-600 mt-1">Drop your PDF files or audio lectures in the upload area below</p>
                            </div>
                        </div>
                        
                        <div className="flex items-start space-x-3">
                            <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="font-medium text-gray-800">2. Ask Questions</h3>
                                <p className="text-sm text-gray-600 mt-1">Use the chat interface to ask questions about your documents</p>
                            </div>
                        </div>

                        <div className="flex items-start space-x-3">
                            <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="font-medium text-gray-800">3. Get Smart Answers</h3>
                                <p className="text-sm text-gray-600 mt-1">Receive AI-powered responses based on your document content</p>
                            </div>
                        </div>
                    </div>
                </div>

                <FileUpload onUploadSuccess={handleUploadSuccess} />
                
                {activeFiles.length > 0 && (
                    <div className="flex-1">
                        <div className="bg-white rounded-lg shadow-sm p-4 mb-8">
                            <h2 className="text-lg font-medium text-gray-900 mb-2">
                                📚 Available Documents
                            </h2>
                            <div className="flex flex-wrap gap-2">
                                {activeFiles.map((fileName, index) => (
                                    <span
                                        key={index}
                                        className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                                    >
                                        {fileName}
                                        <button
                                            onClick={() => handleDeleteFile(index)}
                                            className="ml-2 inline-flex items-center p-0.5 rounded-full text-blue-400 hover:bg-blue-200 hover:text-blue-600"
                                        >
                                            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                                                <path
                                                    fillRule="evenodd"
                                                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                                                    clipRule="evenodd"
                                                />
                                            </svg>
                                        </button>
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Mode Toggle */}
                        <div className="flex justify-center mb-6">
                            <div className="inline-flex rounded-md shadow-sm" role="group">
                                <button
                                    type="button"
                                    onClick={() => setMode('query')}
                                    className={`px-4 py-2 text-sm font-medium rounded-l-lg ${
                                        mode === 'query'
                                            ? 'bg-blue-500 text-white'
                                            : 'bg-white text-gray-700 hover:bg-gray-50'
                                    } border border-gray-200`}
                                >
                                    Single Query
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setMode('chat')}
                                    className={`px-4 py-2 text-sm font-medium rounded-r-lg ${
                                        mode === 'chat'
                                            ? 'bg-blue-500 text-white'
                                            : 'bg-white text-gray-700 hover:bg-gray-50'
                                    } border border-l-0 border-gray-200`}
                                >
                                    Chat
                                </button>
                            </div>
                        </div>

                        {mode === 'query' ? (
                            <QueryInterface />
                        ) : (
                            <Chat />
                        )}
                    </div>
                )}
            </div>
        </Layout>
    );
}
