import OpenAI from 'openai';
import fs from 'fs';

// Validate environment variables
if (!process.env.OPENAI_API_KEY) {
  throw new Error('Missing OPENAI_API_KEY environment variable. Please check your .env file.');
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function transcribeAudio(filePath) {
  try {
    const response = await openai.audio.transcriptions.create({
      file: fs.createReadStream(filePath),
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
    throw new Error('Failed to transcribe audio file');
  }
}
