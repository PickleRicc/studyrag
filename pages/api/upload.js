import formidable from 'formidable';
import fs from 'fs';
import path from 'path';
import { extractTextFromPDF } from '../../utils/pdfUtils';
import { transcribeAudio } from '../../utils/audioUtils';
import { splitTextIntoChunks } from '../../utils/textProcessing';

export const config = {
  api: {
    bodyParser: false,
  },
};

const uploadDir = path.join(process.cwd(), 'tmp/uploads');

// Ensure upload directory exists
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

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

    // Validate file type
    if (!fileType.includes('pdf') && !fileType.includes('audio')) {
      fs.unlinkSync(file.filepath);
      return res.status(400).json({ error: 'Invalid file type' });
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

      return res.status(200).json({
        message: 'File uploaded and processed successfully',
        filename: file.originalFilename,
        filepath: file.filepath,
        fileType: fileType.includes('pdf') ? 'pdf' : 'audio',
        extracted: {
          text: extractedData.text,
          ...(fileType.includes('pdf') ? {
            numPages: extractedData.numPages,
            info: extractedData.info
          } : {
            duration: extractedData.duration,
            info: extractedData.info
          }),
          chunks: chunks.map(doc => ({
            text: doc.pageContent,
            metadata: doc.metadata
          }))
        }
      });
    } catch (error) {
      console.error('Processing error:', error);
      return res.status(500).json({ error: `Failed to process ${fileType.includes('pdf') ? 'PDF' : 'audio'} file` });
    } finally {
      // Clean up: delete the temporary file
      try {
        fs.unlinkSync(file.filepath);
      } catch (err) {
        console.error('Error deleting temporary file:', err);
      }
    }
  } catch (error) {
    console.error('Upload error:', error);
    return res.status(500).json({ error: 'Upload failed' });
  }
}
