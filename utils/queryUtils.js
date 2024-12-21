import { index } from './pineconeUtils';
import { generateEmbedding } from './embeddingUtils';

/**
 * Query Pinecone index for similar vectors
 */
async function queryPineconeIndex(queryVector, options = {}) {
    const { topK = 5, includeValues = false, fileNames = [] } = options;

    try {
        const queryOptions = {
            vector: queryVector,
            topK: topK,
            includeValues: includeValues,
            includeMetadata: true
        };

        if (fileNames.length > 0) {
            queryOptions.filter = {
                fileName: { $in: fileNames }
            };
        }

        const queryResponse = await index.query(queryOptions);
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
        const queryVector = await generateEmbedding(queryText);
        const queryResponse = await queryPineconeIndex(queryVector, {
            ...options,
            includeValues: false
        });

        const results = queryResponse.matches.map(match => ({
            id: match.id,
            score: match.score,
            fileName: match.metadata.fileName,
            text: match.metadata.text
        }));

        return {
            results,
            usage: queryResponse.usage
        };
    } catch (error) {
        console.error('Error searching documents:', error);
        throw error;
    }
}

export { queryPineconeIndex, searchDocuments };
