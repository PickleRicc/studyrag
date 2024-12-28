import formidable from 'formidable';
import { put } from '@vercel/blob';
import { extractTextFromPDF } from '../../utils/pdfUtils';
import { transcribeAudio } from '../../utils/audioUtils';
import { splitTextIntoChunks } from '../../utils/textProcessing';
import { generateEmbedding } from '../../utils/embeddingUtils';
import { upsertVectors } from '../../utils/pineconeUtils';
import { addFileToActive } from '../../utils/fileManagement';
import { supabaseServer } from '../../utils/supabase';

// Validate environment variables
if (!process.env.BLOB_READ_WRITE_TOKEN) {
  throw new Error('Missing BLOB_READ_WRITE_TOKEN environment variable');
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
    console.log('BLOB token available:', !!process.env.BLOB_READ_WRITE_TOKEN);
    
    const form = formidable({
      keepExtensions: true,
      maxFileSize: 25 * 1024 * 1024, // 25MB limit
    });

    const [fields, files] = await new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err);
        resolve([fields, files]);
      });
    });

    const file = Array.isArray(files.file) ? files.file[0] : files.file;
    const fileType = file.mimetype;
    
    let text;
    if (fileType.includes('pdf')) {
      text = await extractTextFromPDF(file.filepath);
    } else if (fileType.includes('audio')) {
      text = await transcribeAudio(file.filepath);
    } else {
      throw new Error('Unsupported file type');
    }

    // Upload to Vercel Blob
    const blobToken = process.env.BLOB_READ_WRITE_TOKEN;
    console.log('Using blob token:', blobToken ? 'Token exists' : 'Token missing');
    
    const blob = await put(file.originalFilename, file, {
      access: 'public',
      token: blobToken,
    });

    // Process text and generate embeddings
    const chunks = splitTextIntoChunks(text);
    const embeddings = await Promise.all(
      chunks.map(chunk => generateEmbedding(chunk))
    );

    // Store vectors in Pinecone
    await upsertVectors(chunks, embeddings, file.originalFilename);

    // Get user from session
    const { data: { session }, error: sessionError } = await supabaseServer.auth.getSession();
    if (sessionError) throw sessionError;

    // Store file metadata in Supabase
    const { data: document, error } = await supabaseServer
      .from('documents')
      .insert([
        {
          name: file.originalFilename,
          url: blob.url,
          size: file.size,
          type: fileType,
          user_id: session.user.id
        }
      ])
      .select()
      .single();

    if (error) throw error;

    // Add to active files
    addFileToActive(file.originalFilename);

    res.status(200).json({ 
      success: true, 
      document,
      url: blob.url
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: error.message });
  }
}
