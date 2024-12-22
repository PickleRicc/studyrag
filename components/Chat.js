'use client';

import { useState, useRef, useEffect } from 'react';
import { useActiveFiles } from '../hooks/useActiveFiles';

export default function Chat() {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const { activeFiles } = useActiveFiles();
    const messagesEndRef = useRef(null);

    // Auto scroll to bottom of chat
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
            // Add user message immediately
            setMessages(prev => [...prev, { role: 'user', content: userMessage }]);

            // Send to API
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
            
            // Update messages with the complete history
            setMessages(data.messages);

        } catch (err) {
            console.error('Chat error:', err);
            setError('Failed to get response. Please try again.');
            // Remove the user message if we failed
            setMessages(prev => prev.slice(0, -1));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-full max-h-screen">
            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((message, index) => (
                    <div 
                        key={index} 
                        className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                        <div 
                            className={`max-w-[80%] p-3 rounded-lg ${
                                message.role === 'user' 
                                    ? 'bg-blue-500 text-white' 
                                    : 'bg-gray-200 text-gray-800'
                            }`}
                        >
                            <p className="whitespace-pre-wrap">{message.content}</p>
                            {message.sources && message.sources.length > 0 && (
                                <div className="mt-2 text-sm opacity-75">
                                    <p>Sources:</p>
                                    <ul className="list-disc list-inside">
                                        {message.sources.map((source, idx) => (
                                            <li key={idx}>
                                                {source.fileName} 
                                                {source.score && ` (${(source.score * 100).toFixed(1)}% match)`}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>

            {/* Error Message */}
            {error && (
                <div className="p-3 text-red-500 text-center bg-red-100">
                    {error}
                </div>
            )}

            {/* Input Form */}
            <form onSubmit={handleSubmit} className="p-4 border-t">
                <div className="flex space-x-4">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Ask a question..."
                        disabled={isLoading}
                        className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                        type="submit"
                        disabled={isLoading || !input.trim()}
                        className={`px-4 py-2 rounded-lg bg-blue-500 text-white ${
                            isLoading || !input.trim() 
                                ? 'opacity-50 cursor-not-allowed' 
                                : 'hover:bg-blue-600'
                        }`}
                    >
                        {isLoading ? 'Sending...' : 'Send'}
                    </button>
                </div>
            </form>
        </div>
    );
}
