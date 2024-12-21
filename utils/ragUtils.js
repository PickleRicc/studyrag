import { ChatOpenAI } from "@langchain/openai";
import { isVagueQuery, handleSpecificQuery, handleVagueQuery } from './queryHandlers';

const llm = new ChatOpenAI({
    model: "gpt-4",
    temperature: 0
});

/**
 * Format search results into a context string for the LLM
 */
function formatContext(searchResults) {
    return searchResults.results
        .map(result => `[From ${result.fileName}]:\n${result.content}\n`)
        .join('\n');
}

/**
 * Generate an answer using the LLM based on search results
 */
async function generateAnswer(query, searchResults) {
    try {
        // Determine if the query is vague
        const isVague = isVagueQuery(query);

        // Handle query based on its type
        const response = isVague 
            ? await handleVagueQuery(query, searchResults)
            : await handleSpecificQuery(query, searchResults);

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

export { generateAnswer };
