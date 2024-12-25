import { ChatOpenAI } from "@langchain/openai";
import { isVagueQuery, handleSpecificQuery, handleVagueQuery } from './queryHandlers';
import { searchDocuments } from './queryUtils';

const llm = new ChatOpenAI({
    model: "gpt-4-turbo-preview",
    temperature: 0
});

/**
 * Format search results into a context string for the LLM
 */
function formatContext(searchResults) {
    if (!searchResults || !searchResults.results || searchResults.results.length === 0) {
        return '';
    }
    return searchResults.results
        .map(result => `[From ${result.fileName}]:\n${result.text}\n`)
        .join('\n');
}

/**
 * Get relevant context from documents for a given query
 */
async function getRelevantContext(query, activeFiles) {
    try {
        if (!activeFiles || activeFiles.length === 0) {
            console.log('No active files provided');
            return '';
        }

        console.log('Searching documents with query:', query, 'in files:', activeFiles);

        // Search for relevant content using existing search function
        const searchResults = await searchDocuments(query, {
            fileNames: activeFiles.map(f => f.trim()),  // Clean filenames
            topK: 3 // Limit to top 3 most relevant chunks
        });
        
        if (!searchResults || !searchResults.results || searchResults.results.length === 0) {
            console.log('No relevant content found for query:', query);
            return '';
        }

        // Format the search results into a context string
        const context = formatContext(searchResults);
        console.log('Retrieved context:', context);
        return context;

    } catch (error) {
        console.error('Error getting relevant context:', error);
        return '';
    }
}

/**
 * Generate an answer using the LLM based on search results
 */
async function generateAnswer(query, searchResults) {
    try {
        console.log('Generating answer for query:', query);
        console.log('Search results:', JSON.stringify(searchResults, null, 2));

        // Determine if the query is vague
        const isVague = isVagueQuery(query);
        console.log('Query type:', isVague ? 'vague' : 'specific');

        // Handle query based on its type
        const response = isVague 
            ? await handleVagueQuery(query, searchResults)
            : await handleSpecificQuery(query, searchResults);

        console.log('Generated response:', response);

        return {
            ...response,
            queryType: isVague ? 'vague' : 'specific',
            totalResults: searchResults.results.length
        };
    } catch (error) {
        console.error('Error generating answer:', error);
        throw error;
    }
}

export { generateAnswer, getRelevantContext };
