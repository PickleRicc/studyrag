import { useState, useRef, useEffect } from 'react';
import { useActiveFiles } from '../hooks/useActiveFiles';
import { useChatSessions } from '../hooks/useChatSessions';

export default function Chat() {
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const messagesEndRef = useRef(null);
    const { activeFiles } = useActiveFiles();
    const {
        activeSession,
        messages,
        createSession,
        addMessage,
        endSession,
        setActiveSession
    } = useChatSessions();

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMessage = input.trim();
        setInput('');
        setError(null);
        setIsLoading(true);

        try {
            let currentSession = activeSession;
            // Create a session if none exists
            if (!currentSession) {
                const title = userMessage.split(' ').slice(0, 5).join(' ') + '...';
                currentSession = await createSession(title);
                if (!currentSession) {
                    setError('Failed to create chat session');
                    setIsLoading(false);
                    return;
                }
                // Wait for session to be fully created
                await new Promise(resolve => setTimeout(resolve, 500));
            }

            // Add user message using current session ID
            const userMessageResult = await addMessage(userMessage, 'user', null, currentSession.id);
            if (!userMessageResult) {
                setError('Failed to save message');
                setIsLoading(false);
                return;
            }

            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: userMessage,
                    messageHistory: messages,
                    activeFiles
                })
            });

            if (!response.ok) {
                throw new Error('Failed to get response');
            }

            const data = await response.json();
            
            if (data.error) {
                throw new Error(data.error);
            }

            // Add AI response
            console.log('Adding AI response to session:', currentSession.id);
            const aiMessageResult = await addMessage(data.message, 'assistant', data.sources, currentSession.id);
            if (!aiMessageResult) {
                throw new Error('Failed to save AI response');
            }
            console.log('AI response added successfully:', aiMessageResult);

        } catch (err) {
            console.error('Chat error:', err);
            console.error('Error details:', err.stack);
            setError(err.message || 'Failed to get response');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-[calc(100vh-16rem)] bg-white rounded-xl shadow-sm border border-gray-200">
            {/* End Chat Button */}
            {activeSession && (
                <div className="px-4 py-2 border-b">
                    <button
                        onClick={async () => {
                            if (window.confirm('Are you sure you want to end this chat session? It will be saved to your chat history.')) {
                                await endSession();
                            }
                        }}
                        className="px-4 py-2 text-sm text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md transition-colors duration-150 ease-in-out flex items-center"
                    >
                        <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        End Chat
                    </button>
                </div>
            )}

            {/* Messages Container */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-gray-500">
                        <div className="text-center">
                            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                            <p className="mt-2 text-sm">Start a conversation by asking a question about your documents</p>
                        </div>
                    </div>
                ) : (
                    messages.map((message, index) => (
                        <div
                            key={index}
                            className={`flex ${
                                message.role === 'assistant' ? 'bg-gray-100' : 'bg-white'
                            } p-4 border-b`}
                        >
                            <div className="flex-1">
                                <div className="font-medium mb-1">
                                    {message.role === 'assistant' ? 'AI' : 'You'}
                                </div>
                                <div className="text-gray-700 whitespace-pre-wrap">
                                    {message.content}
                                </div>
                                {message.sources && (
                                    <div className="mt-2">
                                        <div className="text-sm text-gray-500 mb-1">Sources:</div>
                                        {Array.isArray(message.sources) ? (
                                            message.sources.map((source, idx) => (
                                                <div key={idx} className="text-sm text-blue-600">
                                                    {source.fileName || source}
                                                    {source.score && ` (${(source.score * 100).toFixed(1)}% match)`}
                                                </div>
                                            ))
                                        ) : typeof message.sources === 'string' ? (
                                            JSON.parse(message.sources).map((source, idx) => (
                                                <div key={idx} className="text-sm text-blue-600">
                                                    {typeof source === 'object' ? source.fileName : source}
                                                    {source.score && ` (${(source.score * 100).toFixed(1)}% match)`}
                                                </div>
                                            ))
                                        ) : null}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Container */}
            <div className="border-t border-gray-200 p-4">
                <form onSubmit={handleSubmit} className="flex space-x-4">
                    <div className="flex-1 relative">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Ask a question about your documents..."
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            disabled={isLoading}
                        />
                        {error && (
                            <p className="absolute -top-6 left-0 text-sm text-red-500">{error}</p>
                        )}
                    </div>
                    <button
                        type="submit"
                        disabled={isLoading || !input.trim()}
                        className={`px-4 py-2 rounded-lg flex items-center justify-center min-w-[5rem]
                            ${isLoading || !input.trim()
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                : 'bg-blue-600 text-white hover:bg-blue-700'}`}
                    >
                        {isLoading ? (
                            <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        ) : (
                            'Send'
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}
