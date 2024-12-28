import { initAzureStorage, generateBlobName } from '../../../utils/azureStorage';
import { Fields, Files, IncomingForm } from 'formidable';
import { extractTextFromPDF } from '../../../utils/pdfUtils';
import { transcribeAudio } from '../../../utils/audioUtils';
import { splitTextIntoChunks } from '../../../utils/textProcessing';
import { generateEmbedding } from '../../../utils/embeddingUtils';
import { upsertVectors } from '../../../utils/pineconeUtils';
import fs from 'fs';
import path from 'path';

export const config = {
  api: {
    bodyParser: false,
    responseLimit: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  let filePath;
  try {
    const form = new IncomingForm({
      keepExtensions: true,
      maxFileSize: 25 * 1024 * 1024, // 25MB limit
      maxFieldsSize: 100 * 1024 * 1024,
      allowEmptyFiles: false,
      multiples: false,
    });
    
    const [fields, files] = await new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err);
        resolve([fields, files]);
      });
    });

    const file = files.file[0];
    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Get original file extension
    const originalName = file.originalFilename || '';
    const fileExt = path.extname(originalName).toLowerCase();
    
    // Validate file type
    const validAudioExts = ['.mp3', '.wav', '.m4a', '.ogg', '.mpeg', '.mpga'];
    const validPdfExts = ['.pdf'];
    
    if (!validAudioExts.includes(fileExt) && !validPdfExts.includes(fileExt)) {
      return res.status(400).json({ 
        error: `Unsupported file type: ${fileExt}. Supported types: PDF, MP3, WAV, M4A, OGG` 
      });
    }

    filePath = file.filepath;

    // Upload to Azure
    const blobServiceClient = await initAzureStorage();
    const containerClient = blobServiceClient.getContainerClient(
      process.env.AZURE_STORAGE_CONTAINER_NAME
    );
    const blobName = generateBlobName();
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);
    
    console.log('Uploading to Azure:', file.originalFilename);
    await blockBlobClient.uploadFile(filePath);

    // Extract text based on file type
    let extractedText;
    if (file.mimetype.includes('pdf')) {
      console.log('Processing PDF:', file.originalFilename);
      const pdfData = await extractTextFromPDF(filePath);
      extractedText = pdfData.text;
    } else if (file.mimetype.includes('audio')) {
      console.log('Transcribing audio:', file.originalFilename);
      const audioData = await transcribeAudio(filePath);
      extractedText = audioData.text;
    } else {
      throw new Error('Unsupported file type');
    }

    // Process for vector store
    console.log('Generating embeddings for:', file.originalFilename);
    const chunks = await splitTextIntoChunks(extractedText);
    const chunksWithEmbeddings = await Promise.all(
      chunks.map(async (chunk) => ({
        text: chunk.pageContent,
        embedding: await generateEmbedding(chunk.pageContent)
      }))
    );

    // Store in Pinecone
    console.log('Storing vectors in Pinecone:', file.originalFilename);
    await upsertVectors(chunksWithEmbeddings, file.originalFilename);

    return res.status(200).json({
      success: true,
      fileName: file.originalFilename,
      url: blockBlobClient.url
    });

  } catch (error) {
    console.error('Upload error:', error);
    return res.status(500).json({ error: error.message });
  } finally {
    // Clean up temp file
    if (filePath) {
      try {
        fs.unlinkSync(filePath);
      } catch (err) {
        console.error('Error cleaning up temp file:', err);
      }
    }
  }
}
