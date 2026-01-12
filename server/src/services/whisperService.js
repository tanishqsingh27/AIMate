import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Lazy initialization of OpenAI client
let openai = null;

const getOpenAIClient = () => {
  if (!openai) {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY is not set in environment variables');
    }
    openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }
  return openai;
};

/**
 * Transcribe audio file using Whisper API
 * @param {string} audioFilePath - Path to audio file
 * @returns {Promise<string>} Transcription text
 */
export const transcribeAudio = async (audioFilePath) => {
  try {
    // Check if file exists
    if (!fs.existsSync(audioFilePath)) {
      throw new Error('Audio file not found');
    }

    // Get file stats to check size
    const stats = fs.statSync(audioFilePath);
    if (stats.size === 0) {
      throw new Error('Audio file is empty');
    }

    // Create a readable stream from the file
    const audioStream = fs.createReadStream(audioFilePath);

    // Transcribe using Whisper API
    const client = getOpenAIClient();
    const response = await client.audio.transcriptions.create({
      file: audioStream,
      model: 'whisper-1',
      language: 'en', // Optional: specify language
      response_format: 'text',
    });

    // Handle response - if it's a string, return it; if it's an object, extract text
    let transcriptionText = '';
    if (typeof response === 'string') {
      transcriptionText = response;
    } else if (response && typeof response === 'object') {
      // If response_format is 'text' but returns object, try to get text property
      transcriptionText = response.text || response.transcription || JSON.stringify(response);
    } else {
      transcriptionText = String(response);
    }

    if (!transcriptionText || transcriptionText.trim().length === 0) {
      throw new Error('Transcription returned empty result');
    }

    return transcriptionText.trim();
  } catch (error) {
    console.error('Error transcribing audio:', error.message || error);
    if (error.message?.includes('API key') || error.message?.includes('OPENAI_API_KEY')) {
      throw new Error('OpenAI API key is not configured. Please add OPENAI_API_KEY to your .env file.');
    }
    if (error.message?.includes('file size') || error.message?.includes('too large')) {
      throw new Error('Audio file is too large. Maximum size is 25MB.');
    }
    if (error.message?.includes('Invalid file')) {
      throw new Error('Invalid audio file format. Supported formats: MP3, WAV, M4A, WebM.');
    }
    throw new Error(`Failed to transcribe audio: ${error.message || 'Unknown error'}`);
  }
};

/**
 * Transcribe audio from buffer (for direct upload)
 * @param {Buffer} audioBuffer - Audio file buffer
 * @param {string} filename - Original filename
 * @returns {Promise<string>} Transcription text
 */
export const transcribeAudioBuffer = async (audioBuffer, filename) => {
  let tempPath = null;
  try {
    // Validate buffer
    if (!audioBuffer || audioBuffer.length === 0) {
      throw new Error('Audio buffer is empty');
    }

    // Sanitize filename to prevent path traversal
    const sanitizedFilename = filename.replace(/[^a-zA-Z0-9._-]/g, '_');
    
    // Create a temporary file with proper extension
    const ext = path.extname(sanitizedFilename) || '.mp3';
    tempPath = path.join(__dirname, '../../uploads', `temp_${Date.now()}_${sanitizedFilename}${ext}`);
    
    // Ensure uploads directory exists
    const uploadsDir = path.dirname(tempPath);
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    // Write buffer to file
    fs.writeFileSync(tempPath, audioBuffer);

    // Verify file was written
    if (!fs.existsSync(tempPath)) {
      throw new Error('Failed to write temporary audio file');
    }

    // Transcribe
    const transcription = await transcribeAudio(tempPath);
    
    return transcription;
  } catch (error) {
    console.error('Error transcribing audio buffer:', error.message || error);
    throw error; // Re-throw to preserve error context
  } finally {
    // Clean up temp file
    if (tempPath && fs.existsSync(tempPath)) {
      try {
        fs.unlinkSync(tempPath);
      } catch (cleanupError) {
        console.error('Error cleaning up temp file:', cleanupError);
      }
    }
  }
};

