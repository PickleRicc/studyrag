import OpenAI from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Generate embeddings for a text string using OpenAI's API
 * @param {string} text - The text to generate embeddings for
 * @returns {Promise<Array<number>>} The embedding vector
 */
export async function generateEmbedding(text) {
    try {
        if (!text || typeof text !== 'string') {
            throw new Error('Invalid input: text must be a non-empty string');
        }

        const response = await openai.embeddings.create({
            model: "text-embedding-3-small",
            input: text.slice(0, 8191), // Ensure we don't exceed token limit
            dimensions: 1536
        });
        
        return response.data[0].embedding;
    } catch (error) {
        console.error('Error generating embedding:', error);
        
        // Handle specific OpenAI API errors
        if (error?.error?.type === 'insufficient_quota') {
            throw new Error('OpenAI API quota exceeded. Please check your API usage limits and billing settings.');
        } else if (error?.status === 401) {
            throw new Error('Invalid OpenAI API key. Please check your API key configuration.');
        } else if (error?.status === 429) {
            throw new Error('Too many requests. Please try again in a few moments.');
        }
        
        // Generic error fallback
        throw new Error('Failed to generate embedding: ' + (error.message || 'Unknown error'));
    }
}
