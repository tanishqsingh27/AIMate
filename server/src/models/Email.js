import mongoose from 'mongoose';

const emailSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    gmailEmail: {
      type: String,
      // Email address of the Gmail account this email belongs to
    },
    gmailMessageId: {
      type: String,
      // Gmail message ID
    },
    threadId: {
      type: String,
      // Gmail thread ID
    },
    from: {
      type: String,
      required: true,
    },
    to: {
      type: String,
      required: true,
    },
    receivedAt: {
      type: Date,
      // When the email was received in Gmail
    },
    subject: {
      type: String,
      required: true,
    },
    originalBody: {
      type: String,
      // Original email body received
    },
    aiReply: {
      type: String,
      // AI-generated reply
    },
    sentReply: {
      type: String,
      // Actual reply that was sent
    },
    status: {
      type: String,
      enum: ['draft', 'sent', 'failed'],
      default: 'draft',
    },
    sentAt: {
      type: Date,
    },
    aiGenerated: {
      type: Boolean,
      default: false,
    },
    tags: [{
      type: String,
      trim: true,
    }],
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries
emailSchema.index({ user: 1, createdAt: -1 });
emailSchema.index({ user: 1, status: 1 });

const Email = mongoose.model('Email', emailSchema);

export default Email;

