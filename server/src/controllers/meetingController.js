import Meeting from '../models/Meeting.js';
import Task from '../models/Task.js';
import { transcribeAudioBuffer } from '../services/whisperService.js';
import { summarizeMeeting, generateMeetingDescription } from '../services/openaiService.js';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure multer for file uploads
const storage = multer.memoryStorage();
export const upload = multer({
  storage,
  limits: {
    fileSize: 25 * 1024 * 1024, // 25MB limit
  },
  fileFilter: (req, file, cb) => {
    // More permissive MIME types and check file extension as fallback
    const allowedMimeTypes = [
      'audio/mpeg', 
      'audio/mp3', 
      'audio/wav', 
      'audio/x-wav',
      'audio/m4a',
      'audio/x-m4a',
      'audio/webm',
      'audio/ogg',
      'audio/opus',
      'audio/flac',
      'audio/aac',
      'audio/x-aac',
      'application/octet-stream' // Some browsers send this for audio
    ];
    
    // Also check file extension as fallback
    const allowedExtensions = ['.mp3', '.wav', '.m4a', '.webm', '.ogg', '.opus', '.flac', '.aac'];
    const fileExt = path.extname(file.originalname).toLowerCase();
    
    if (allowedMimeTypes.includes(file.mimetype) || allowedExtensions.includes(fileExt)) {
      cb(null, true);
    } else {
      cb(new Error(`Invalid file type. Allowed types: ${allowedExtensions.join(', ')}`));
    }
  },
});

/**
 * @route   GET /api/meetings
 * @desc    Get all meetings for user
 * @access  Private
 */
export const getMeetings = async (req, res, next) => {
  try {
    const meetings = await Meeting.find({ user: req.user.id })
      .sort({ date: -1 });

    res.json({
      success: true,
      count: meetings.length,
      meetings,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/meetings/:id
 * @desc    Get single meeting
 * @access  Private
 */
export const getMeeting = async (req, res, next) => {
  try {
    const meeting = await Meeting.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!meeting) {
      return res.status(404).json({
        success: false,
        error: 'Meeting not found',
      });
    }

    res.json({
      success: true,
      meeting,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/meetings
 * @desc    Create a new meeting (with or without audio)
 * @access  Private
 */
export const createMeeting = async (req, res, next) => {
  try {
    const { title, participants, date, summary } = req.body;

    if (!title) {
      return res.status(400).json({
        success: false,
        error: 'Please provide a meeting title',
      });
    }

    const meeting = await Meeting.create({
      user: req.user.id,
      title,
      participants: participants || [],
      date: date || new Date(),
      summary: summary || '',
      isAIGenerated: false,
    });

    res.status(201).json({
      success: true,
      meeting,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/meetings/create-with-ai
 * @desc    Create a new meeting with AI-generated description
 * @access  Private
 */
export const createMeetingWithAI = async (req, res, next) => {
  try {
    const { title, participants, date } = req.body;

    if (!title) {
      return res.status(400).json({
        success: false,
        error: 'Please provide a meeting title',
      });
    }

    // Generate AI description, agenda, and action items
    const aiContent = await generateMeetingDescription(title, participants || []);

    // Create meeting with AI-generated content
    const meeting = await Meeting.create({
      user: req.user.id,
      title,
      participants: participants || [],
      date: date || new Date(),
      summary: aiContent.summary,
      keyPoints: aiContent.keyPoints,
      actionItems: aiContent.actionItems.map((item, index) => ({
        description: item,
        assignedTo: participants && participants[index % participants.length] || '',
        convertedToTask: false,
      })),
      isAIGenerated: true,
    });

    res.status(201).json({
      success: true,
      meeting,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/meetings/:id/upload-audio
 * @desc    Upload and transcribe meeting audio
 * @access  Private
 */
export const uploadAndTranscribe = async (req, res, next) => {
  try {
    const meeting = await Meeting.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!meeting) {
      return res.status(404).json({
        success: false,
        error: 'Meeting not found',
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'Audio file is required',
      });
    }

    // Validate file
    if (!req.file.buffer || req.file.buffer.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Audio file is empty or corrupted',
      });
    }

    console.log(`Processing audio file: ${req.file.originalname}, Size: ${req.file.buffer.length} bytes`);

    // Transcribe audio
    let transcription;
    try {
      transcription = await transcribeAudioBuffer(
        req.file.buffer,
        req.file.originalname
      );
      
      if (!transcription || transcription.trim().length === 0) {
        throw new Error('Transcription returned empty result');
      }
      
      console.log(`Transcription successful. Length: ${transcription.length} characters`);
    } catch (transcriptionError) {
      console.error('Transcription error:', transcriptionError);
      return res.status(500).json({
        success: false,
        error: transcriptionError.message || 'Failed to transcribe audio file',
      });
    }

    // Summarize using AI
    let summaryData;
    try {
      summaryData = await summarizeMeeting(transcription);
      
      // Validate summary data structure
      if (!summaryData || typeof summaryData !== 'object') {
        throw new Error('Invalid summary data format');
      }
    } catch (summaryError) {
      console.error('Summary error:', summaryError);
      // Still save transcription even if summary fails
      meeting.transcription = transcription;
      await meeting.save();
      
      return res.status(500).json({
        success: false,
        error: summaryError.message || 'Failed to generate summary. Transcription saved.',
        meeting, // Return meeting with transcription even if summary failed
      });
    }

    // Update meeting
    meeting.transcription = transcription;
    meeting.summary = summaryData.summary || '';
    meeting.keyPoints = summaryData.keyPoints || [];
    
    // Add action items if found
    if (summaryData.actionItems && Array.isArray(summaryData.actionItems) && summaryData.actionItems.length > 0) {
      meeting.actionItems = summaryData.actionItems.map(item => {
        // Handle both string and object formats
        const description = typeof item === 'string' ? item : (item.description || item.text || '');
        return {
          description,
          status: 'pending',
          assignedTo: typeof item === 'object' ? (item.assignedTo || '') : '',
        };
      });
    }

    await meeting.save();

    res.json({
      success: true,
      meeting,
      message: 'Audio transcribed and summarized successfully',
    });
  } catch (error) {
    console.error('Error in uploadAndTranscribe:', error);
    next(error);
  }
};

/**
 * @route   POST /api/meetings/:id/action-items/:actionItemId/convert
 * @desc    Convert action item to task
 * @access  Private
 */
export const convertActionItemToTask = async (req, res, next) => {
  try {
    const meeting = await Meeting.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!meeting) {
      return res.status(404).json({
        success: false,
        error: 'Meeting not found',
      });
    }

    const actionItem = meeting.actionItems.id(req.params.actionItemId);
    if (!actionItem) {
      return res.status(404).json({
        success: false,
        error: 'Action item not found',
      });
    }

    // Create task from action item
    const task = await Task.create({
      user: req.user.id,
      title: actionItem.description,
      description: `Action item from meeting: ${meeting.title}`,
      status: 'pending',
      priority: 'medium',
      dueDate: actionItem.dueDate || null,
    });

    // Mark action item as converted
    actionItem.convertedToTask = true;
    await meeting.save();

    res.json({
      success: true,
      task,
      message: 'Action item converted to task successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PUT /api/meetings/:id
 * @desc    Update a meeting
 * @access  Private
 */
export const updateMeeting = async (req, res, next) => {
  try {
    let meeting = await Meeting.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!meeting) {
      return res.status(404).json({
        success: false,
        error: 'Meeting not found',
      });
    }

    meeting = await Meeting.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    res.json({
      success: true,
      meeting,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   DELETE /api/meetings/:id
 * @desc    Delete a meeting
 * @access  Private
 */
export const deleteMeeting = async (req, res, next) => {
  try {
    const meeting = await Meeting.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!meeting) {
      return res.status(404).json({
        success: false,
        error: 'Meeting not found',
      });
    }

    await Meeting.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Meeting deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

