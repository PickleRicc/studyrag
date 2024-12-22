import { generateChatResponse } from '../../utils/chatUtils';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { message, messageHistory = [], activeFiles = [] } = req.body;

        if (!message) {
            return res.status(400).json({ error: 'Message is required' });
        }

        console.log('=== Chat API Request ===');
        console.log('Message:', message);
        console.log('Active Files:', activeFiles);

        const response = await generateChatResponse(message, messageHistory, activeFiles);
        console.log('=== Chat API Response ===');
        console.log('Response:', response);

        // Ensure we're sending the exact format the frontend expects
        const responseData = {
            message: response.content,
            sources: response.sources || []
        };
        console.log('=== Sending to Frontend ===');
        console.log('Response Data:', responseData);

        res.status(200).json(responseData);

    } catch (error) {
        console.error('Error in chat endpoint:', error);
        res.status(500).json({ 
            error: 'Failed to process message',
            details: error.message 
        });
    }
}
