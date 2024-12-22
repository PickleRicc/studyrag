import { index } from './pineconeUtils';
import { generateEmbedding } from './embeddingUtils';

/**
 * Query Pinecone index for similar vectors
 */
async function queryPineconeIndex(queryVector, options = {}) {
    const { topK = 5, includeValues = false, fileNames = [] } = options;

    try {
        // Clean up filenames - decode URL encoding
        const cleanFileNames = fileNames.map(name => decodeURIComponent(name));
        console.log('Querying Pinecone for files:', cleanFileNames);
        
        const queryOptions = {
            vector: queryVector,
            topK: topK,
            includeValues: includeValues,
            includeMetadata: true
        };

        if (cleanFileNames.length > 0) {
            queryOptions.filter = {
                fileName: { $in: cleanFileNames }
            };
            console.log('Filtering by file names:', cleanFileNames);
            console.log('Filter query:', queryOptions.filter);
        }

        console.log('Pinecone query options:', queryOptions);
        const queryResponse = await index.query(queryOptions);
        console.log('Raw Pinecone response:', JSON.stringify(queryResponse, null, 2));
        
        return queryResponse;
    } catch (error) {
        console.error('Error querying Pinecone:', error);
        throw error;
    }
}

/**
 * Search documents using a text query
 */
async function searchDocuments(queryText, options = {}) {
    try {
        console.log('Starting document search for:', queryText);
        console.log('Search options:', options);
        
        const queryVector = await generateEmbedding(queryText);
        
        const queryResponse = await queryPineconeIndex(queryVector, {
            ...options,
            includeValues: false
        });

        if (!queryResponse.matches || queryResponse.matches.length === 0) {
            console.log('No matches found in Pinecone');
            return { results: [] };
        }

        const results = queryResponse.matches.map(match => {
            console.log('Processing match:', match);
            return {
                id: match.id,
                score: match.score,
                fileName: match.metadata.fileName,
                text: match.metadata.text
            };
        });

        console.log('Processed results:', results);
        return { results };
    } catch (error) {
        console.error('Error searching documents:', error);
        throw error;
    }
}

export { queryPineconeIndex, searchDocuments };
