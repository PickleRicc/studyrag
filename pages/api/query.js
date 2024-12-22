import { searchDocuments } from '../../utils/queryUtils';
import { generateAnswer } from '../../utils/ragUtils';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { query, activeFiles = [] } = req.body;

        if (!query) {
            return res.status(400).json({ error: 'Query is required' });
        }

        console.log('Query API Request:');
        console.log('- Query:', query);
        console.log('- Active Files:', activeFiles);

        if (activeFiles.length === 0) {
            return res.status(200).json({
                answer: 'No active files to search through. Please upload or activate some files.',
                sources: []
            });
        }

        // Scale topK based on number of files (5 results per file)
        const scaledTopK = Math.max(5, 5 * activeFiles.length);

        // First get relevant documents from active files only
        const searchResults = await searchDocuments(query, { 
            topK: scaledTopK,
            fileNames: activeFiles 
        });

        // Generate answer using RAG
        const response = await generateAnswer(query, searchResults);
        
        console.log('Query API Response:');
        console.log('- Sources:', response.sources);

        return res.status(200).json({
            answer: response.answer,
            sources: response.sources
        });
    } catch (error) {
        console.error('Query error:', error);
        return res.status(500).json({ 
            answer: 'Failed to process query',
            sources: []
        });
    }
}
