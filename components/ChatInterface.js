import { useState, useEffect } from 'react';

export default function ChatInterface({ activeFiles = [] }) {
    const [messages, setMessages] = useState([]);
    const [threadId, setThreadId] = useState(null);
    const [inputMessage, setInputMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        console.log('Active files in ChatInterface:', activeFiles);
    }, [activeFiles]);

    const sendMessage = async (e) => {
        e.preventDefault();
        if (!inputMessage.trim() || isLoading) return;

        const userMessage = {
            role: 'user',
            content: inputMessage.trim()
        };

        // Add user message to chat immediately
        setMessages(prev => [...prev, userMessage]);
        setInputMessage('');
        setIsLoading(true);

        try {
            console.log('Sending message with active files:', activeFiles);
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: userMessage.content,
                    threadId,
                    messageHistory: messages,
                    activeFiles
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log('Received response from server:', data);

            if (data.error) {
                throw new Error(data.error);
            }

            setMessages(data.messages);
            setThreadId(data.threadId);

        } catch (error) {
            console.error('Error sending message:', error);
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: 'Sorry, there was an error processing your message. Please try again.'
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    // Auto-scroll to bottom when new messages arrive
    useEffect(() => {
        const messagesDiv = document.querySelector('.messages-container');
        if (messagesDiv) {
            messagesDiv.scrollTop = messagesDiv.scrollHeight;
        }
    }, [messages]);

    return (
        <div className="w-full max-w-4xl mx-auto bg-white rounded-lg shadow-sm">
            <div className="messages-container h-[400px] overflow-y-auto p-4 space-y-4">
                {messages.map((message, index) => (
                    <div
                        key={index}
                        className={`flex ${
                            message.role === 'user' ? 'justify-end' : 'justify-start'
                        }`}
                    >
                        <div
                            className={`max-w-[70%] rounded-lg p-3 ${
                                message.role === 'user'
                                    ? 'bg-blue-500 text-white'
                                    : 'bg-gray-100'
                            }`}
                        >
                            <p className="whitespace-pre-wrap">{message.content}</p>
                        </div>
                    </div>
                ))}
                {isLoading && (
                    <div className="flex justify-start">
                        <div className="bg-gray-100 rounded-lg p-3">
                            <p>Thinking...</p>
                        </div>
                    </div>
                )}
            </div>

            <form onSubmit={sendMessage} className="border-t p-4">
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        placeholder={activeFiles?.length > 0 
                            ? "Ask a question about your documents..." 
                            : "Upload a document first to ask questions about it"}
                        className="flex-1 rounded-lg border p-2"
                        disabled={isLoading || !activeFiles?.length}
                    />
                    <button
                        type="submit"
                        disabled={isLoading || !activeFiles?.length || !inputMessage.trim()}
                        className="bg-blue-500 text-white px-4 py-2 rounded-lg disabled:opacity-50"
                    >
                        {isLoading ? 'Sending...' : 'Send'}
                    </button>
                </div>
            </form>
        </div>
    );
}
