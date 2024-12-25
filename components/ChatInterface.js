'use client';

import { useState, useEffect } from 'react';

export default function ChatInterface({ activeFiles = [] }) {
    const [messages, setMessages] = useState(() => {
        // Initialize messages from localStorage if available
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('chatMessages');
            if (saved) {
                try {
                    return JSON.parse(saved);
                } catch (e) {
                    console.error('Error parsing saved messages:', e);
                    return [];
                }
            }
        }
        return [];
    });
    const [inputMessage, setInputMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // Save messages to localStorage whenever they change
    useEffect(() => {
        if (typeof window !== 'undefined') {
            localStorage.setItem('chatMessages', JSON.stringify(messages));
        }
    }, [messages]);

    useEffect(() => {
        console.log('Active files in ChatInterface:', activeFiles);
    }, [activeFiles]);

    const sendMessage = async (e) => {
        e.preventDefault();
        if (!inputMessage.trim() || isLoading) return;

        if (!activeFiles || activeFiles.length === 0) {
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: 'Please select one or more documents to chat about.'
            }]);
            return;
        }

        const userMessage = {
            role: 'user',
            content: inputMessage.trim()
        };

        setMessages(prev => [...prev, userMessage]);
        setInputMessage('');
        setIsLoading(true);

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: userMessage.content,
                    messageHistory: messages,
                    activeFiles: activeFiles
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log('Received chat response:', data);

            if (data.error) {
                throw new Error(data.error);
            }

            // Format sources before adding to messages
            let formattedSources = data.sources;
            if (typeof data.sources === 'string') {
                try {
                    formattedSources = JSON.parse(data.sources);
                } catch (e) {
                    console.error('Error parsing sources:', e);
                    formattedSources = [];
                }
            }

            // Ensure sources are properly formatted
            formattedSources = (formattedSources || []).slice(0, 5).map(source => ({
                fileName: source.fileName,
                score: typeof source.score === 'string' ? parseFloat(source.score) : source.score
            }));

            setMessages(prev => [...prev, {
                role: 'assistant',
                content: data.message,
                sources: formattedSources
            }]);

        } catch (error) {
            console.error('Error in chat:', error);
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: 'Sorry, there was an error processing your message. Please try again.'
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    const renderSources = (sources) => {
        if (!sources) return null;
        
        // If sources is a string, try to parse it
        let sourcesArray;
        if (typeof sources === 'string') {
            try {
                sourcesArray = JSON.parse(sources);
            } catch (e) {
                console.error('Error parsing sources:', e);
                return null;
            }
        } else {
            sourcesArray = sources;
        }

        // Ensure we have an array of valid sources
        if (!Array.isArray(sourcesArray) || sourcesArray.length === 0) return null;

        return (
            <div className="mt-4 border-t border-[#3a3a3a] pt-2">
                <p className="text-sm font-medium text-[var(--text-secondary)] mb-2">Sources:</p>
                <div className="space-y-1.5">
                    {sourcesArray.slice(0, 5).map((source, idx) => {
                        const score = typeof source.score === 'string' 
                            ? parseFloat(source.score) 
                            : source.score;
                        
                        return (
                            <div key={idx} className="flex justify-between items-center text-xs">
                                <span className="text-[var(--text-secondary)]">{source.fileName}</span>
                                <span className="text-[var(--accent-green)] bg-[var(--accent-green-dim)] px-2 py-0.5 rounded">
                                    {Math.round(score * 100)}% relevant
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };

    return (
        <div className="flex flex-col h-full">
            <div className="flex-1 overflow-y-auto p-4 space-y-4 messages-container">
                {messages.length === 0 ? (
                    <div className="h-full flex items-center justify-center">
                        <div className="text-center space-y-4">
                            <div className="w-16 h-16 mx-auto">
                                <svg className="w-full h-full text-[var(--text-secondary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                                          d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                </svg>
                            </div>
                            <p className="text-[var(--text-secondary)]">
                                {activeFiles.length === 0 
                                    ? 'Please select one or more documents to start chatting'
                                    : 'Start a conversation by asking a question about your documents'
                                }
                            </p>
                        </div>
                    </div>
                ) : (
                    messages.map((message, index) => (
                        <div key={index} className={`message-fade-in flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} mb-4`}>
                            {message.role === 'assistant' && (
                                <div className="flex-shrink-0 mr-3">
                                    <div className="w-8 h-8 rounded-full bg-[var(--accent-green-dim)] flex items-center justify-center pulse-animation">
                                        <svg className="w-5 h-5 text-[var(--accent-green)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                        </svg>
                                    </div>
                                </div>
                            )}
                            <div className={`
                                max-w-2xl p-4 rounded-lg relative glass-effect
                                ${message.role === 'user' 
                                    ? 'bg-[var(--accent-green)] bg-opacity-10' 
                                    : 'bg-[#2a2a2a]'}
                            `}>
                                <p className="whitespace-pre-wrap text-[var(--text-primary)]">{message.content}</p>
                                {message.role === 'assistant' && renderSources(message.sources)}
                                <span className="hover-reveal absolute bottom-1 right-2 text-xs text-[var(--text-secondary)] opacity-60">
                                    {new Date().toLocaleTimeString()}
                                </span>
                            </div>
                            {message.role === 'user' && (
                                <div className="flex-shrink-0 ml-3">
                                    <div className="w-8 h-8 rounded-full bg-[var(--accent-green-dim)] flex items-center justify-center">
                                        <svg className="w-5 h-5 text-[var(--accent-green)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        </svg>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))
                )}
                
                {isLoading && (
                    <div className="message-fade-in flex justify-start mb-4">
                        <div className="flex-shrink-0 mr-3">
                            <div className="w-8 h-8 rounded-full bg-[var(--accent-green-dim)] flex items-center justify-center">
                                <svg className="w-5 h-5 text-[var(--accent-green)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                </svg>
                            </div>
                        </div>
                        <div className="typing-indicator">
                            <span></span>
                            <span></span>
                            <span></span>
                        </div>
                    </div>
                )}
            </div>

            <div className="p-4 border-t border-[#3a3a3a]">
                <form onSubmit={sendMessage} className="relative">
                    <input
                        type="text"
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        placeholder={activeFiles.length === 0 
                            ? 'Please select documents first...' 
                            : 'Ask a question about your documents...'}
                        className="w-full p-4 pr-12 rounded-lg bg-[var(--card-dark)] text-[var(--text-primary)] placeholder-[var(--text-secondary)]
                                 border border-[#3a3a3a] focus:border-[var(--accent-green)] focus:ring-1 focus:ring-[var(--accent-green)]
                                 transition-colors duration-200 glow-focus"
                        disabled={isLoading || activeFiles.length === 0}
                    />
                    <button
                        type="submit"
                        disabled={isLoading || !inputMessage.trim() || activeFiles.length === 0}
                        className={`absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg
                                  ${isLoading || !inputMessage.trim() || activeFiles.length === 0
                                    ? 'text-[var(--text-secondary)]' 
                                    : 'text-[var(--accent-green)] hover:bg-[var(--accent-green-dim)]'
                                  } transition-all duration-200`}
                    >
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                        </svg>
                    </button>
                </form>
            </div>
        </div>
    );
}
