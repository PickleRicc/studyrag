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
        <div className="flex flex-col h-[calc(100vh-16rem)] bg-[var(--background-dark)] rounded-xl border border-[#3a3a3a]">
            {/* End Chat Button */}
            {activeSession && (
                <div className="px-4 py-2 border-b border-[#3a3a3a]">
                    <button
                        onClick={async () => {
                            if (window.confirm('Are you sure you want to end this chat session? It will be saved to your chat history.')) {
                                await endSession();
                            }
                        }}
                        className="px-4 py-2 text-sm text-red-500 hover:bg-red-500/10 rounded-md transition-all duration-200 flex items-center"
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
                    <div className="h-full flex items-center justify-center">
                        <div className="text-center space-y-4">
                            <div className="w-16 h-16 mx-auto">
                                <svg className="w-full h-full text-[var(--text-secondary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                                          d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                </svg>
                            </div>
                            <p className="text-[var(--text-secondary)]">
                                Start a conversation by asking a question about your documents
                            </p>
                        </div>
                    </div>
                ) : (
                    messages.map((message, index) => (
                        <div key={index} className={`message-fade-in flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} mb-4`}>
                            {message.role === 'assistant' && (
                                <div className="flex-shrink-0 mr-3">
                                    <div className="w-8 h-8 rounded-full bg-[var(--accent-green-dim)] flex items-center justify-center">
                                        <svg className="w-5 h-5 text-[var(--accent-green)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                        </svg>
                                    </div>
                                </div>
                            )}
                            <div className={`
                                max-w-2xl p-4 rounded-lg relative
                                ${message.role === 'user' 
                                    ? 'message-user mr-3' 
                                    : 'message-assistant'}
                            `}>
                                <div className="space-y-2">
                                    <p className="whitespace-pre-wrap">{message.content}</p>
                                    {message.sources && (
                                        <div className="mt-2 space-y-2">
                                            <div className="text-sm font-medium text-[var(--text-secondary)]">Sources:</div>
                                            <div className="space-y-1">
                                                {(() => {
                                                    let sourcesArray;
                                                    if (typeof message.sources === 'string') {
                                                        try {
                                                            sourcesArray = JSON.parse(message.sources);
                                                        } catch (e) {
                                                            console.error('Error parsing sources:', e);
                                                            return null;
                                                        }
                                                    } else if (Array.isArray(message.sources)) {
                                                        sourcesArray = message.sources;
                                                    } else {
                                                        return null;
                                                    }

                                                    return sourcesArray.map((source, idx) => (
                                                        <div key={idx} className="flex justify-between items-center text-xs">
                                                            <span className="text-[var(--text-secondary)]">{source.fileName}</span>
                                                            <span className="text-[var(--accent-green)] bg-[var(--accent-green-dim)] px-2 py-0.5 rounded">
                                                                {Math.round(Number(source.score) * 100)}% relevant
                                                            </span>
                                                        </div>
                                                    ));
                                                })()}
                                            </div>
                                        </div>
                                    )}
                                </div>
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
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 border-t border-[#3a3a3a]">
                <form onSubmit={handleSubmit} className="relative">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder={activeFiles.length > 0 
                            ? "Ask a question about your documents..." 
                            : "Upload a document first to ask questions"}
                        disabled={isLoading || activeFiles.length === 0}
                        className="w-full p-4 pr-12 rounded-lg bg-[var(--card-dark)] text-[var(--text-primary)] 
                                 placeholder-[var(--text-secondary)] border border-[#3a3a3a] 
                                 focus:border-[var(--accent-green)] focus:ring-1 focus:ring-[var(--accent-green)]
                                 transition-colors duration-200"
                    />
                    <button
                        type="submit"
                        disabled={!input.trim() || isLoading || activeFiles.length === 0}
                        className={`absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg
                                  ${(!input.trim() || isLoading || activeFiles.length === 0)
                                    ? 'text-[var(--text-secondary)]'
                                    : 'text-[var(--accent-green)] hover:bg-[var(--accent-green)] hover:bg-opacity-10'
                                  } transition-all duration-200`}
                    >
                        {isLoading ? (
                            <div className="flex space-x-1">
                                <div className="w-1.5 h-1.5 bg-current rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                                <div className="w-1.5 h-1.5 bg-current rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                                <div className="w-1.5 h-1.5 bg-current rounded-full animate-bounce"></div>
                            </div>
                        ) : (
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                            </svg>
                        )}
                    </button>
                </form>
                {error && (
                    <div className="mt-2 p-2 text-red-500 text-sm bg-red-500/10 rounded">
                        {error}
                    </div>
                )}
            </div>
        </div>
    );
}
