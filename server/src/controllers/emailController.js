import Email from '../models/Email.js';
import User from '../models/User.js';
import { getRecentEmails, sendEmailReply } from '../services/gmailService.js';
import { generateEmailReply } from '../services/openaiService.js';

/**
 * @route   GET /api/emails
 * @desc    Get all emails for user with pagination
 * @access  Private
 */
export const getEmails = async (req, res, next) => {
  try {
    const { status, limit = 50, skip = 0 } = req.query;
    const user = await User.findById(req.user.id);
    
    const query = { user: req.user.id };
    
    // Only show emails from the currently connected Gmail account
    if (user.gmailEmail) {
      query.gmailEmail = user.gmailEmail;
    } else {
      // If no Gmail is connected, return empty array
      return res.json({
        success: true,
        count: 0,
        emails: [],
      });
    }

    if (status) query.status = status;

    // Get total count and paginated results
    const total = await Email.countDocuments(query);
    const emails = await Email.find(query)
      .sort({ receivedAt: -1, createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip));

    res.json({
      success: true,
      count: emails.length,
      total,
      emails,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/emails/:id
 * @desc    Get single email
 * @access  Private
 */
export const getEmail = async (req, res, next) => {
  try {
    const email = await Email.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!email) {
      return res.status(404).json({
        success: false,
        error: 'Email not found',
      });
    }

    res.json({
      success: true,
      email,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/emails/sync
 * @desc    Sync emails from Gmail
 * @access  Private
 */
export const syncEmails = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('+gmailRefreshToken +gmailAccessToken');

    if (!user.gmailRefreshToken) {
      return res.status(400).json({
        success: false,
        error: 'Gmail not connected. Please connect Gmail first.',
      });
    }

    // Fetch 20 newest emails from Gmail
    const gmailEmails = await getRecentEmails(user.gmailRefreshToken, user.gmailAccessToken, 20);

    // Normalize email addresses (e.g., "Name <email@domain>")
    const normalizeEmail = (value) => {
      if (!value) return '';
      const match = value.match(/<([^>]+)>/);
      const addr = match ? match[1] : value;
      return addr.trim().toLowerCase();
    };

    // Get the Gmail email address from the first email or from user profile
    let gmailEmail = user.gmailEmail;
    if (!gmailEmail && gmailEmails.length > 0) {
      // Extract email from the 'to' field of the first email to identify current account
      gmailEmail = normalizeEmail(gmailEmails[0].to);
    }

    // Always normalize stored gmailEmail
    gmailEmail = normalizeEmail(gmailEmail);

    // Update user with connected Gmail email
    if (gmailEmail && user.gmailEmail !== gmailEmail) {
      user.gmailEmail = gmailEmail;
      await user.save();
    }

    // Delete all old emails from other Gmail accounts to ensure only current account's emails are shown
    if (gmailEmail) {
      await Email.deleteMany({
        user: req.user.id,
        gmailEmail: { $ne: gmailEmail },
      });
    }

    // Save or update emails in database
    const savedEmails = [];
    for (const gmailEmailObj of gmailEmails) {
      const existingEmail = await Email.findOne({
        gmailMessageId: gmailEmailObj.id,
        user: req.user.id,
      });

      if (!existingEmail) {
        const normalizedTo = normalizeEmail(gmailEmailObj.to) || gmailEmail;
        const email = await Email.create({
          user: req.user.id,
          gmailEmail: normalizedTo,
          gmailMessageId: gmailEmailObj.id,
          threadId: gmailEmailObj.threadId,
          from: gmailEmailObj.from,
          to: gmailEmailObj.to,
          receivedAt: gmailEmailObj.receivedAt || (gmailEmailObj.date ? new Date(gmailEmailObj.date) : undefined),
          subject: gmailEmailObj.subject,
          originalBody: gmailEmailObj.body,
          status: 'draft',
        });
        savedEmails.push(email);
      }
    }

    // Remove any older emails not in the latest fetch for this Gmail account
    const keepIds = gmailEmails.map((e) => e.id);
    if (gmailEmail && keepIds.length > 0) {
      await Email.deleteMany({
        user: req.user.id,
        gmailEmail,
        gmailMessageId: { $nin: keepIds },
      });
    }

    res.json({
      success: true,
      count: savedEmails.length,
      emails: savedEmails,
      message: 'Emails synced successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/emails/:id/generate-reply
 * @desc    Generate AI reply for an email
 * @access  Private
 */
export const generateReply = async (req, res, next) => {
  try {
    const email = await Email.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!email) {
      return res.status(404).json({
        success: false,
        error: 'Email not found',
      });
    }

    // Generate reply using AI
    const aiReply = await generateEmailReply(email.originalBody, req.body.context);

    // Update email with AI reply
    email.aiReply = aiReply;
    email.aiGenerated = true;
    await email.save();

    res.json({
      success: true,
      email,
      aiReply,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/emails/:id/send
 * @desc    Send email reply via Gmail
 * @access  Private
 */
export const sendReply = async (req, res, next) => {
  try {
    const { replyText } = req.body;

    console.log('Send reply request:', { emailId: req.params.id, hasReplyText: !!replyText });

    if (!replyText) {
      return res.status(400).json({
        success: false,
        error: 'Reply text is required',
      });
    }

    const email = await Email.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!email) {
      console.log('Email not found:', req.params.id);
      return res.status(404).json({
        success: false,
        error: 'Email not found',
      });
    }

    console.log('Email found:', { from: email.from, subject: email.subject, threadId: email.threadId });

    const user = await User.findById(req.user.id).select('+gmailRefreshToken +gmailAccessToken');

    if (!user.gmailRefreshToken) {
      console.log('Gmail not connected for user:', req.user.id);
      return res.status(400).json({
        success: false,
        error: 'Gmail not connected. Please connect Gmail first.',
      });
    }

    console.log('User has Gmail refresh token, attempting to send email...');

    // Send email via Gmail API
    const subject = email.subject.startsWith('Re:') ? email.subject : `Re: ${email.subject}`;
    
    try {
      const sentMessage = await sendEmailReply(
        user.gmailRefreshToken,
        email.from,
        subject,
        replyText,
        email.threadId,
        user.gmailAccessToken,
        user.email
      );
      console.log('Email sent successfully:', sentMessage.id);
    } catch (gmailError) {
      console.error('Gmail API error:', gmailError.message, gmailError.stack);
      return res.status(500).json({
        success: false,
        error: `Failed to send email via Gmail: ${gmailError.message}`,
      });
    }

    // Update email record
    email.sentReply = replyText;
    email.status = 'sent';
    email.sentAt = new Date();
    await email.save();

    res.json({
      success: true,
      email,
      message: 'Email sent successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/emails/generate-reply-manual
 * @desc    Generate AI reply for manually pasted email (no database save)
 * @access  Private
 */
export const generateReplyManual = async (req, res, next) => {
  try {
    const { originalBody, subject, from } = req.body;

    if (!originalBody || !subject || !from) {
      return res.status(400).json({
        success: false,
        error: 'Email body, subject, and from are required',
      });
    }

    // Generate reply using AI
    const aiReply = await generateEmailReply(originalBody, '');

    res.json({
      success: true,
      aiReply,
      message: 'AI reply generated successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PUT /api/emails/:id
 * @desc    Update an email
 * @access  Private
 */
export const updateEmail = async (req, res, next) => {
  try {
    let email = await Email.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!email) {
      return res.status(404).json({
        success: false,
        error: 'Email not found',
      });
    }

    email = await Email.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    res.json({
      success: true,
      email,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   DELETE /api/emails/:id
 * @desc    Delete an email
 * @access  Private
 */
export const deleteEmail = async (req, res, next) => {
  try {
    const email = await Email.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!email) {
      return res.status(404).json({
        success: false,
        error: 'Email not found',
      });
    }

    await Email.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Email deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

