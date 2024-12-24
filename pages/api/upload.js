import formidable from 'formidable';
import fs from 'fs';
import path from 'path';
import { extractTextFromPDF } from '../../utils/pdfUtils';
import { transcribeAudio } from '../../utils/audioUtils';
import { splitTextIntoChunks } from '../../utils/textProcessing';
import { generateEmbedding } from '../../utils/embeddingUtils';
import { upsertVectors, getIndexStats } from '../../utils/pineconeUtils';
import { addFileToActive, getActiveFiles, clearActiveFiles } from '../../utils/fileManagement';
import { supabase } from '../../utils/supabase';

// Validate environment variables
if (!process.env.OPENAI_API_KEY) {
  throw new Error('Missing OPENAI_API_KEY environment variable. Please check your .env file.');
}

const uploadDir = path.join(process.cwd(), 'tmp/uploads');

// Ensure upload directory exists
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const form = formidable({
      uploadDir,
      keepExtensions: true,
      maxFileSize: 25 * 1024 * 1024, // 25MB limit
    });

    const [fields, files] = await new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err);
        resolve([fields, files]);
      });
    });

    const file = files.file[0];
    const fileType = fields.fileType?.[0] || file.mimetype;
    const isFirstFile = fields.isFirstFile?.[0] === 'true';
    const userId = fields.userId?.[0];

    if (!userId) {
      fs.unlinkSync(file.filepath);
      return res.status(400).json({ error: 'User ID is required' });
    }

    // Validate file type
    if (!fileType.includes('pdf') && !fileType.includes('audio')) {
      fs.unlinkSync(file.filepath);
      return res.status(400).json({ error: 'Invalid file type' });
    }

    // Clear active files if this is the first file in a new session
    if (isFirstFile) {
      clearActiveFiles();
      console.log('Cleared active files for new session');
    }

    // Create document record in Supabase
    const { data: document, error: documentError } = await supabase
      .from('documents')
      .insert({
        user_id: userId,
        file_name: file.originalFilename,
        file_path: file.filepath,
        file_size: file.size,
        embedding_status: 'processing'
      })
      .select()
      .single();

    if (documentError) {
      console.error('Error creating document record:', documentError);
      fs.unlinkSync(file.filepath);
      return res.status(500).json({ error: 'Failed to create document record' });
    }

    let extractedData;
    try {
      if (fileType.includes('pdf')) {
        // Process PDF
        extractedData = await extractTextFromPDF(file.filepath);
      } else {
        // Process Audio
        extractedData = await transcribeAudio(file.filepath);
      }

      // Split the text into chunks using LangChain
      const chunks = await splitTextIntoChunks(extractedData.text, {
        filename: file.originalFilename,
        fileType: fileType.includes('pdf') ? 'pdf' : 'audio',
        ...(fileType.includes('pdf') ? {
          pageCount: extractedData.numPages,
          documentInfo: extractedData.info
        } : {
          duration: extractedData.duration,
          transcriptionInfo: extractedData.info
        })
      });

      // Generate embeddings for each chunk
      const chunksWithEmbeddings = await Promise.all(
        chunks.map(async (chunk) => {
          try {
            const embedding = await generateEmbedding(chunk.pageContent);
            return {
              text: chunk.pageContent,
              metadata: chunk.metadata,
              embedding
            };
          } catch (error) {
            console.error('Error generating embedding for chunk:', error);
            return {
              text: chunk.pageContent,
              metadata: chunk.metadata,
              embedding: null
            };
          }
        })
      );

      // Store embeddings in Pinecone
      try {
        const result = await upsertVectors(chunksWithEmbeddings, file.originalFilename);
        console.log('Pinecone upsert result:', result);
        
        // Update document status in Supabase
        const { error: updateError } = await supabase
          .from('documents')
          .update({ 
            embedding_status: 'completed',
            pinecone_namespace: file.originalFilename
          })
          .eq('id', document.id);

        if (updateError) {
          console.error('Error updating document status:', updateError);
        }

        // Get updated index stats
        const stats = await getIndexStats();
        console.log('Pinecone Index Stats:', {
          totalVectors: stats.totalRecordCount,
          dimension: stats.dimension,
          namespaces: stats.namespaces,
          indexFullness: `${(stats.indexFullness * 100).toFixed(2)}%`
        });
      } catch (error) {
        console.error('Error storing vectors in Pinecone:', error);
        // Update document status to error
        await supabase
          .from('documents')
          .update({ embedding_status: 'error' })
          .eq('id', document.id);
      }

      // Add to active files
      addFileToActive(file.originalFilename);
      console.log('Added file to active files:', file.originalFilename);
      console.log('Current active files:', getActiveFiles());

      console.log(`File uploaded and processed successfully: ${file.originalFilename} (${fileType})`);

      return res.status(200).json({
        message: 'File uploaded and processed successfully',
        fileName: file.originalFilename,
        type: fileType,
        documentId: document.id
      });
    } catch (error) {
      console.error('Processing error:', error);
      // Update document status to error
      await supabase
        .from('documents')
        .update({ embedding_status: 'error' })
        .eq('id', document.id);
      return res.status(500).json({ error: `Failed to process ${fileType.includes('pdf') ? 'PDF' : 'audio'} file` });
    }
  } catch (error) {
    console.error('Upload error:', error);
    return res.status(500).json({ error: 'Upload failed' });
  }
}
