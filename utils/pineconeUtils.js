import { Pinecone } from '@pinecone-database/pinecone';

// Validate environment variables
if (!process.env.PINECONE_API_KEY) {
  throw new Error('Missing PINECONE_API_KEY environment variable');
}
if (!process.env.PINECONE_INDEX_NAME) {
  throw new Error('Missing PINECONE_INDEX_NAME environment variable');
}
if (!process.env.PINECONE_INDEX_HOST) {
  throw new Error('Missing PINECONE_INDEX_HOST environment variable');
}

// Initialize Pinecone client
const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY,
});

// Get index instance
const index = pinecone.index(process.env.PINECONE_INDEX_NAME, process.env.PINECONE_INDEX_HOST);

/**
 * Clean metadata object to ensure it only contains valid Pinecone values
 * @param {Object} metadata - The metadata object to clean
 * @returns {Object} Cleaned metadata object
 */
function cleanMetadata(metadata) {
  const cleaned = {};
  
  for (const [key, value] of Object.entries(metadata)) {
    // Only include simple types that Pinecone accepts
    if (typeof value === 'string' || 
        typeof value === 'number' || 
        typeof value === 'boolean' ||
        Array.isArray(value) && value.every(item => typeof item === 'string')) {
      cleaned[key] = value;
    }
  }
  
  return cleaned;
}

function sanitizeId(str) {
  // Replace non-ASCII characters and spaces with underscores
  return str.replace(/[^\x00-\x7F]/g, '')  // Remove non-ASCII
           .replace(/[^a-zA-Z0-9-_]/g, '_') // Replace special chars with underscore
           .replace(/_+/g, '_')             // Replace multiple underscores with single
           .replace(/^_|_$/g, '')           // Remove leading/trailing underscores
           .toLowerCase();                   // Convert to lowercase
}

/**
 * Upsert vectors to Pinecone index
 * @param {Array} chunks - Array of chunks with text and embeddings
 * @param {string} fileName - Name of the file these chunks belong to
 */
async function upsertVectors(chunks, fileName) {
  try {
    // Prepare vectors with proper structure
    const vectors = chunks.map((chunk, i) => ({
      id: `${sanitizeId(fileName)}_${i}`, // Create unique ID using filename and chunk index
      values: chunk.embedding,
      metadata: cleanMetadata({
        text: chunk.text,
        fileName: fileName,
        chunkIndex: i,
        // Include cleaned metadata from chunk
        ...(chunk.metadata ? cleanMetadata(chunk.metadata) : {})
      })
    }));

    // Upsert to default namespace
    await index.upsert(vectors);
    
    return {
      vectorCount: vectors.length,
      message: `Successfully upserted ${vectors.length} vectors for ${fileName}`
    };
  } catch (error) {
    console.error('Error upserting vectors:', error);
    throw error;
  }
}

/**
 * Get index statistics
 * @returns {Object} Index statistics including namespaces, dimension, and total record count
 */
async function getIndexStats() {
  try {
    const describeIndexStats = await index.describeIndexStats();
    return describeIndexStats;
  } catch (error) {
    console.error('Error getting index stats:', error);
    throw error;
  }
}

/**
 * Delete all vectors associated with a specific file
 * @param {string} fileName - Name of the file whose vectors should be deleted
 */
async function deleteVectors(fileName) {
  try {
    // Delete all vectors where metadata.fileName matches
    await index.deleteMany({
      filter: {
        fileName: { $eq: fileName }
      }
    });
  } catch (error) {
    console.error('Error deleting vectors:', error);
    throw error;
  }
}

export { index, upsertVectors, getIndexStats, deleteVectors };
