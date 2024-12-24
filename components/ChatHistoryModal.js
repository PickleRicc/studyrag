export default function ChatHistoryModal({ isOpen, onClose, messages }) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl h-[80vh] flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b">
                    <h2 className="text-lg font-semibold text-gray-800">Chat History</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700"
                    >
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                    {messages.length === 0 ? (
                        <p className="text-center text-gray-500">No messages in this conversation.</p>
                    ) : (
                        messages.map((message, index) => (
                            <div
                                key={index}
                                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div className={`max-w-[80%] rounded-lg px-4 py-2 ${
                                    message.role === 'user'
                                        ? 'bg-blue-100 text-blue-900'
                                        : 'bg-gray-100 text-gray-800'
                                }`}>
                                    <div className="flex items-start space-x-2">
                                        {message.role === 'assistant' && (
                                            <div className="flex-shrink-0 w-6 h-6">
                                                <svg className="w-full h-full text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                                </svg>
                                            </div>
                                        )}
                                        <div className="flex-1">
                                            <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                                            {message.sources && message.sources.length > 0 && (
                                                <div className="mt-2 text-xs text-gray-500">
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
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t bg-gray-50">
                    <p className="text-sm text-gray-500 text-center">
                        This is a read-only view of your chat history
                    </p>
                </div>
            </div>
        </div>
    );
}
