import mongoose from 'mongoose';

const meetingSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Please add a meeting title'],
      trim: true,
    },
    audioFileUrl: {
      type: String,
      // URL to uploaded audio file
    },
    transcription: {
      type: String,
      // Full transcription from Whisper API
    },
    summary: {
      type: String,
      // AI-generated summary using GPT
    },
    keyPoints: [{
      type: String,
      // Array of key points extracted by AI
    }],
    actionItems: [{
      description: {
        type: String,
        required: true,
      },
      assignedTo: {
        type: String,
        trim: true,
      },
      dueDate: {
        type: Date,
      },
      status: {
        type: String,
        enum: ['pending', 'in-progress', 'completed'],
        default: 'pending',
      },
      convertedToTask: {
        type: Boolean,
        default: false,
      },
    }],
    participants: [{
      type: String,
      trim: true,
    }],
    date: {
      type: Date,
      required: true,
      default: Date.now,
    },
    duration: {
      type: Number,
      // Duration in seconds
    },
    isAIGenerated: {
      type: Boolean,
      default: false,
      // Track if meeting description was AI-generated
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries
meetingSchema.index({ user: 1, date: -1 });

const Meeting = mongoose.model('Meeting', meetingSchema);

export default Meeting;

