import { useState } from 'react';
import { useChatSessions } from '../hooks/useChatSessions';
import { useDocuments } from '../hooks/useDocuments';
import { useAuth } from '../context/AuthContext';

export default function TestChatSessions() {
    const [newMessage, setNewMessage] = useState('');
    const [newTitle, setNewTitle] = useState('');
    const { user } = useAuth();
    const { documents, loading: documentsLoading } = useDocuments();
    
    const {
        sessions,
        loading,
        activeSession,
        messages,
        sessionDocuments,
        setActiveSession,
        createSession,
        addMessage,
        addDocumentToSession,
        removeDocumentFromSession,
    } = useChatSessions();

    const handleCreateSession = async () => {
        await createSession(newTitle || 'New Chat');
        setNewTitle('');
    };

    const handleSendMessage = async () => {
        if (newMessage.trim()) {
            await addMessage(newMessage, 'user');
            // Simulate AI response
            setTimeout(async () => {
                await addMessage('This is a simulated AI response', 'assistant');
            }, 1000);
            setNewMessage('');
        }
    };

    if (!user) {
        return (
            <div className="p-4">
                <h1 className="text-xl font-bold mb-4">Please sign in to test chat sessions</h1>
            </div>
        );
    }

    if (loading || documentsLoading) {
        return (
            <div className="p-4">
                <h1 className="text-xl font-bold mb-4">Loading...</h1>
            </div>
        );
    }

    return (
        <div className="flex h-screen">
            {/* Sidebar */}
            <div className="w-64 bg-gray-100 p-4 overflow-y-auto">
                <div className="mb-4">
                    <input
                        type="text"
                        value={newTitle}
                        onChange={(e) => setNewTitle(e.target.value)}
                        placeholder="New chat title"
                        className="w-full p-2 border rounded mb-2"
                    />
                    <button
                        onClick={handleCreateSession}
                        className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
                    >
                        New Chat
                    </button>
                </div>

                <div className="space-y-2">
                    {sessions.map((session) => (
                        <div
                            key={session.id}
                            onClick={() => setActiveSession(session.id)}
                            className={`p-2 rounded cursor-pointer ${
                                activeSession?.id === session.id
                                    ? 'bg-blue-500 text-white'
                                    : 'hover:bg-gray-200'
                            }`}
                        >
                            {session.title}
                        </div>
                    ))}
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col">
                {activeSession ? (
                    <>
                        {/* Messages */}
                        <div className="flex-1 p-4 overflow-y-auto">
                            <div className="space-y-4">
                                {messages.map((message) => (
                                    <div
                                        key={message.id}
                                        className={`p-3 rounded-lg max-w-3xl ${
                                            message.role === 'user'
                                                ? 'bg-blue-100 ml-auto'
                                                : 'bg-gray-100'
                                        }`}
                                    >
                                        <div className="font-semibold mb-1">
                                            {message.role === 'user' ? 'You' : 'AI'}
                                        </div>
                                        {message.content}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Documents */}
                        <div className="p-4 bg-gray-50 border-t">
                            <h3 className="font-semibold mb-2">Session Documents:</h3>
                            <div className="flex flex-wrap gap-2 mb-4">
                                {sessionDocuments.map((doc) => (
                                    <div
                                        key={doc.id}
                                        className="flex items-center bg-white p-2 rounded border"
                                    >
                                        <span>{doc.file_name}</span>
                                        <button
                                            onClick={() => removeDocumentFromSession(doc.id)}
                                            className="ml-2 text-red-500 hover:text-red-600"
                                        >
                                            ×
                                        </button>
                                    </div>
                                ))}
                            </div>
                            
                            {/* Available Documents */}
                            <h3 className="font-semibold mb-2">Available Documents:</h3>
                            <div className="flex flex-wrap gap-2">
                                {documents.map((doc) => {
                                    const isInSession = sessionDocuments.some(
                                        (sessionDoc) => sessionDoc.id === doc.id
                                    );
                                    return (
                                        <div
                                            key={doc.id}
                                            className={`flex items-center p-2 rounded border ${
                                                isInSession ? 'bg-gray-100' : 'bg-white'
                                            }`}
                                        >
                                            <span>{doc.file_name}</span>
                                            {!isInSession && (
                                                <button
                                                    onClick={() => addDocumentToSession(doc.id)}
                                                    className="ml-2 text-green-500 hover:text-green-600"
                                                >
                                                    +
                                                </button>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Input */}
                        <div className="p-4 border-t">
                            <div className="flex space-x-2">
                                <input
                                    type="text"
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    placeholder="Type a message..."
                                    className="flex-1 p-2 border rounded"
                                    onKeyPress={(e) => {
                                        if (e.key === 'Enter') {
                                            handleSendMessage();
                                        }
                                    }}
                                />
                                <button
                                    onClick={handleSendMessage}
                                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                                >
                                    Send
                                </button>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex items-center justify-center text-gray-500">
                        Select or create a chat session to start
                    </div>
                )}
            </div>
        </div>
    );
}
