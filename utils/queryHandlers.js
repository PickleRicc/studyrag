import { index } from './pineconeUtils';
import { generateEmbedding } from './embeddingUtils';
import { ChatOpenAI } from "@langchain/openai";

const llm = new ChatOpenAI({
    model: "gpt-4-turbo-preview",
    temperature: 0.7
});

const VAGUE_KEYWORDS = [
    'overview', 'summary', 'about', 'tell me about',
    'what is', 'explain', 'describe', 'compare',
    'relationship between', 'difference between'
];

function isVagueQuery(query) {
    query = query.toLowerCase();
    return VAGUE_KEYWORDS.some(keyword => query.includes(keyword.toLowerCase()));
}

async function handleSpecificQuery(query, searchResults) {
    const prompt = `Answer the following specific question based only on the provided context.
    If the context doesn't contain enough information, say so.

    Context:
    ${searchResults.results.map(r => `[From ${r.fileName}]: ${r.text}`).join('\n\n')}

    Question: ${query}

    Instructions:
    - Answer based only on the provided context
    - Cite specific documents
    - Be precise and direct in your answer`;

    const response = await llm.invoke(prompt);

    // Process and deduplicate sources
    const uniqueSources = Array.from(new Set(
        searchResults.results.map(r => r.fileName)
    )).map(fileName => {
        const relevantResults = searchResults.results.filter(r => r.fileName === fileName);
        const highestScore = Math.max(...relevantResults.map(r => r.score));
        return {
            fileName,
            relevance: `${Math.round(highestScore * 100)}%`
        };
    });

    return {
        answer: response.content,
        type: 'specific',
        sources: uniqueSources
    };
}

async function handleVagueQuery(query, searchResults) {
    // Group results by file
    const fileOverviews = {};
    searchResults.results.forEach(result => {
        if (!fileOverviews[result.fileName]) {
            fileOverviews[result.fileName] = {
                texts: [],
                score: 0
            };
        }
        fileOverviews[result.fileName].texts.push(result.text);
        fileOverviews[result.fileName].score = Math.max(fileOverviews[result.fileName].score, result.score);
    });

    // Ensure we have at least 2 entries per file
    Object.keys(fileOverviews).forEach(fileName => {
        const texts = fileOverviews[fileName].texts;
        if (texts.length > 2) {
            fileOverviews[fileName].texts = texts.slice(0, 2);
        }
    });

    const prompt = `You are analyzing multiple documents. Here are relevant excerpts:

    ${Object.entries(fileOverviews).map(([filename, data]) => 
        `Document: ${filename}\nContent:\n${data.texts.join('\n')}`
    ).join('\n\n')}

    Question: ${query}

    Please provide:
    1. A comprehensive answer using information from ALL provided documents
    2. Key points from each document
    3. Any connections between documents (if applicable)

    Note: Ensure you reference ALL documents in your answer.`;

    const response = await llm.invoke(prompt);

    return {
        answer: response.content,
        type: 'vague',
        sources: Object.entries(fileOverviews).map(([fileName, data]) => ({
            fileName,
            relevance: `${Math.round(data.score * 100)}%`,
            excerpts: data.texts.length
        }))
    };
}

export { isVagueQuery, handleSpecificQuery, handleVagueQuery };
