import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";

export async function splitTextIntoChunks(text, metadata = {}) {
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 200,  // Adding some overlap to maintain context between chunks
    separators: ["\n\n", "\n", ".", "!", "?", ",", " ", ""],
  });

  // Create documents with metadata
  const docs = await splitter.createDocuments(
    [text],
    [metadata]  // Metadata will be added to each chunk
  );

  return docs;
}
