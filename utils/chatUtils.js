import { ChatOpenAI } from "@langchain/openai";
import { HumanMessage, AIMessage, SystemMessage } from "@langchain/core/messages";
import { searchDocuments } from './queryUtils';

const llm = new ChatOpenAI({
    model: "gpt-4",
    temperature: 0,
    maxTokens: 1000, // Limit response length
    timeout: 65000, // 65 second timeout for OpenAI (slightly less than our total to allow for error handling)
});

/**
 * Format chat history into a readable string
 */
function formatChatHistory(messages, limit = 3) {
    if (!Array.isArray(messages) || messages.length === 0) {
        return '';
    }
    
    // Take the last N messages
    const recentMessages = messages.slice(-limit);
    return recentMessages
        .map(msg => `${msg.role}: ${msg.content}`)
        .join('\n');
}

/**
 * Group search results by file
 */
function groupResultsByFile(results) {
    const groupedResults = {};
    results.forEach(result => {
        if (!groupedResults[result.fileName]) {
            groupedResults[result.fileName] = [];
        }
        groupedResults[result.fileName].push(result);
    });
    return groupedResults;
}

/**
 * Get relevant document context for a query
 */
async function getDocumentContext(query, activeFiles) {
    console.log('Getting document context for:', query);
    console.log('Active files:', activeFiles);

    if (!Array.isArray(activeFiles) || activeFiles.length === 0) {
        console.log('No active files available');
        return { error: 'No active files available' };
    }

    try {
        // Scale topK based on number of files (5 chunks per file, minimum 5)
        const topK = Math.max(5, 5 * activeFiles.length);
        console.log(`Using topK of ${topK} for ${activeFiles.length} files`);

        const searchResponse = await searchDocuments(query, {
            fileNames: activeFiles,
            topK
        });

        if (!searchResponse.results?.length) {
            console.log('No relevant content found');
            return { error: 'No relevant content found' };
        }

        // Group results by file
        const groupedResults = groupResultsByFile(searchResponse.results);
        console.log('Results grouped by file:', Object.keys(groupedResults));

        return { 
            context: groupedResults,
            raw: searchResponse.results // Keep raw results for source attribution
        };
    } catch (error) {
        console.error('Error getting document context:', error);
        return { error: error.message };
    }
}

/**
 * Create a system prompt for the chat
 */
function createSystemPrompt(chatHistory, documentContext) {
    // Format each file's content
    const fileContexts = Object.entries(documentContext)
        .map(([fileName, chunks]) => (
            `Content from ${fileName}:\n${chunks.map(chunk => chunk.text).join('\n\n')}`
        )).join('\n\n---\n\n');

    return `You are a helpful AI assistant analyzing multiple documents and maintaining a conversation.

${chatHistory ? `Previous Chat Context:\n${chatHistory}\n\n` : ''}

Document Contexts:
${fileContexts}

Instructions:
1. Consider content from ALL documents in your response
2. Compare and contrast information between documents when relevant
3. Clearly reference which document you're drawing information from
4. If a document isn't relevant to the query, you can say so
5. Maintain conversation continuity with the chat history
6. Keep responses focused and relevant`;
}

/**
 * Generate a chat response
 */
async function generateChatResponse(query, messages = [], activeFiles = []) {
    try {
        console.log('\n=== Generating Chat Response ===');
        
        // Set a timeout for the entire operation (70 seconds)
        const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Operation timed out')), 70000)
        );
        
        // Get document context with timeout
        const contextPromise = getDocumentContext(query, activeFiles);
        const { context, error, raw } = await Promise.race([contextPromise, timeoutPromise]);
        
        if (error) {
            return {
                content: error === 'No active files available' 
                    ? "I don't have access to any documents. Please upload a document first."
                    : "I couldn't find any relevant information in the documents for your question.",
                sources: []
            };
        }

        // Format chat history
        const chatHistory = formatChatHistory(messages);
        
        // Create system prompt with grouped context
        const systemPrompt = createSystemPrompt(chatHistory, context);

        // Create message array for LLM
        const llmMessages = [
            new SystemMessage(systemPrompt),
            ...messages.slice(-3).map(msg => 
                msg.role === 'user' ? new HumanMessage(msg.content) : new AIMessage(msg.content)
            ),
            new HumanMessage(query)
        ];

        // Get LLM response with timeout
        const responsePromise = llm.invoke(llmMessages);
        const response = await Promise.race([responsePromise, timeoutPromise]);
        
        console.log('Generated response:', response.content);

        // Return response with sources from raw results
        return {
            content: response.content,
            sources: raw ? raw.slice(0, 5).map(result => ({
                fileName: result.fileName,
                score: parseFloat(result.score)
            })) : []
        };
    } catch (error) {
        console.error('Error generating chat response:', error);
        if (error.message === 'Operation timed out') {
            return {
                content: "I apologize, but the request took too long to process. Please try again with a shorter question or fewer documents.",
                sources: []
            };
        }
        throw error;
    }
}

export { generateChatResponse, formatChatHistory, getDocumentContext };
