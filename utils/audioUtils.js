import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';

// Validate environment variables
if (!process.env.OPENAI_API_KEY) {
  throw new Error('Missing OPENAI_API_KEY environment variable. Please check your .env file.');
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const SUPPORTED_FORMATS = ['mp3', 'mp4', 'mpeg', 'mpga', 'm4a', 'wav', 'webm'];

export async function transcribeAudio(filePath) {
  try {
    // Get file extension and validate format
    const ext = path.extname(filePath).toLowerCase().replace('.', '');
    console.log('File extension:', ext);
    
    if (!SUPPORTED_FORMATS.includes(ext)) {
      throw new Error(`Unsupported audio format: ${ext}. Supported formats: ${SUPPORTED_FORMATS.join(', ')}`);
    }

    // Ensure file exists and is readable
    if (!fs.existsSync(filePath)) {
      throw new Error('Audio file not found');
    }

    const stats = fs.statSync(filePath);
    console.log('File size:', stats.size);

    // Check file size (OpenAI limit is 25MB)
    if (stats.size > 25 * 1024 * 1024) {
      throw new Error('Audio file size exceeds 25MB limit');
    }

    // Create file object for OpenAI
    const file = fs.createReadStream(filePath);
    
    console.log('Sending file to OpenAI:', {
      path: filePath,
      size: stats.size,
      extension: ext
    });

    const response = await openai.audio.transcriptions.create({
      file: file,
      model: "whisper-1",
      response_format: "text",
      language: "en"
    });

    return {
      text: response,
      duration: null, // We could add audio duration detection if needed
      info: {
        model: "whisper-1",
        type: "audio_transcription"
      }
    };

  } catch (error) {
    console.error('Error transcribing audio:', error);
    
    // Handle specific error cases
    if (error.error?.message) {
      throw new Error(`Transcription failed: ${error.error.message}`);
    } else if (error.message) {
      throw new Error(error.message);
    }
    
    throw new Error('Failed to transcribe audio file');
  }
}
