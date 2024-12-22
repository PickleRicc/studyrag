import { generateChatResponse } from '../../utils/chatUtils';
import { getIndexStats } from '../../utils/pineconeUtils';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { message, threadId, messageHistory = [], activeFiles = [] } = req.body;

        // Validate request
        if (!message) {
            return res.status(400).json({ error: 'Message is required' });
        }

        // Log request details
        console.log('\n=== Chat Request ===');
        console.log('Message:', message);
        console.log('Thread ID:', threadId);
        console.log('History Length:', messageHistory.length);
        console.log('Active Files:', activeFiles);

        // Check Pinecone status
        const stats = await getIndexStats();
        console.log('Pinecone Stats:', stats);

        // Generate response
        const response = await generateChatResponse(message, messageHistory, activeFiles);

        // Create new message
        const newMessage = {
            role: 'assistant',
            content: response.content,
            sources: response.sources
        };

        // Return response
        res.status(200).json({
            threadId: threadId || Date.now().toString(),
            messages: [...messageHistory, { role: 'user', content: message }, newMessage]
        });

    } catch (error) {
        console.error('Error in chat endpoint:', error);
        res.status(500).json({
            error: 'Failed to process message',
            details: error.message
        });
    }
}
