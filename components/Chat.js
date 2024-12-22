'use client';

import { useState, useRef, useEffect } from 'react';
import { useActiveFiles } from '../hooks/useActiveFiles';

export default function Chat() {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const messagesEndRef = useRef(null);
    const { activeFiles } = useActiveFiles();

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
            setMessages(prev => [...prev, { role: 'user', content: userMessage }]);

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

            setMessages(prev => [...prev, {
                role: 'assistant',
                content: data.message,
                sources: data.sources
            }]);

        } catch (err) {
            console.error('Chat error:', err);
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-[calc(100vh-16rem)] bg-white rounded-xl shadow-sm border border-gray-200">
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
                            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                            <div className={`
                                max-w-[80%] sm:max-w-[70%] rounded-2xl px-4 py-2
                                ${message.role === 'user' 
                                    ? 'bg-blue-600 text-white' 
                                    : 'bg-gray-100 text-gray-800'}
                            `}>
                                <div className="flex items-start space-x-2">
                                    {message.role === 'assistant' && (
                                        <div className="flex-shrink-0 w-6 h-6">
                                            <svg className="w-full h-full text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                            </svg>
                                        </div>
                                    )}
                                    <div className="flex-1 space-y-2">
                                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                                        {message.sources && message.sources.length > 0 && (
                                            <div className={`mt-2 text-xs ${message.role === 'user' ? 'text-blue-100' : 'text-gray-500'}`}>
                                                <p className="font-medium">Sources:</p>
                                                <ul className="list-disc list-inside mt-1 space-y-1">
                                                    {message.sources.map((source, idx) => (
                                                        <li key={idx} className="truncate">
                                                            {source.fileName} 
                                                            {source.score && ` (${(source.score * 100).toFixed(1)}% match)`}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                    </div>
                                </div>
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
                        className={`
                            px-4 py-2 rounded-lg flex items-center justify-center min-w-[5rem]
                            ${isLoading || !input.trim()
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                : 'bg-blue-600 text-white hover:bg-blue-700'}
                        `}
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
