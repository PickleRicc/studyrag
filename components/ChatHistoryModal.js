export default function ChatHistoryModal({ isOpen, onClose, messages }) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
            <div className="bg-[var(--background-dark)] rounded-xl shadow-xl w-full max-w-2xl h-[80vh] flex flex-col border border-[#3a3a3a]">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-[#3a3a3a]">
                    <h2 className="text-lg font-medium text-[var(--text-primary)]">Chat History</h2>
                    <button
                        onClick={onClose}
                        className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors duration-200 p-2 rounded-lg hover:bg-[var(--card-dark)]"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                    {messages.length === 0 ? (
                        <div className="h-full flex items-center justify-center">
                            <div className="text-center space-y-4">
                                <div className="w-16 h-16 mx-auto">
                                    <svg className="w-full h-full text-[var(--text-secondary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                                              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                    </svg>
                                </div>
                                <p className="text-[var(--text-secondary)]">No messages in this conversation</p>
                            </div>
                        </div>
                    ) : (
                        messages.map((message, index) => (
                            <div
                                key={index}
                                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div className={`
                                    max-w-[80%] p-4 rounded-lg
                                    ${message.role === 'user'
                                        ? 'bg-[var(--accent-green)] bg-opacity-10 text-[var(--text-primary)]'
                                        : 'bg-[var(--card-dark)] text-[var(--text-primary)]'}
                                `}>
                                    <div className="flex items-start space-x-3">
                                        {message.role === 'assistant' && (
                                            <div className="flex-shrink-0 w-6 h-6 mt-1">
                                                <svg className="w-full h-full text-[var(--text-secondary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                                                          d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                                </svg>
                                            </div>
                                        )}
                                        <div className="flex-1">
                                            <p className="whitespace-pre-wrap">{message.content}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
