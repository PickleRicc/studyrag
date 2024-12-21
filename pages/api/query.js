import { searchDocuments } from '../../utils/queryUtils';
import { generateAnswer } from '../../utils/ragUtils';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { query, fileNames = [] } = req.body;

        if (!query) {
            return res.status(400).json({ error: 'Query is required' });
        }

        // Scale topK based on number of files (5 results per file)
        const scaledTopK = Math.max(5, 5 * fileNames.length);

        // First get relevant documents
        const searchResults = await searchDocuments(query, { 
            topK: scaledTopK,
            fileNames 
        });

        // Generate answer using RAG
        const ragResponse = await generateAnswer(query, searchResults);
        
        // Return both the RAG response and the search results
        return res.status(200).json({
            ...ragResponse,
            searchResults
        });
    } catch (error) {
        console.error('Query error:', error);
        return res.status(500).json({ error: 'Failed to process query' });
    }
}
