import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';

/**
 * Initialize Gmail OAuth2 client
 */
const getOAuth2Client = (refreshToken, accessToken) => {
  const oauth2Client = new OAuth2Client(
    process.env.GMAIL_CLIENT_ID,
    process.env.GMAIL_CLIENT_SECRET,
    process.env.GMAIL_REDIRECT_URI
  );

  if (refreshToken) {
    const credentials = {
      refresh_token: refreshToken,
    };
    
    if (accessToken) {
      credentials.access_token = accessToken;
    }
    
    oauth2Client.setCredentials(credentials);
  }

  return oauth2Client;
};

/**
 * Get Gmail API instance
 * @param {string} refreshToken - User's refresh token
 * @param {string} accessToken - User's access token (optional)
 * @returns {google.gmail_v1.Gmail} Gmail API instance
 */
export const getGmailClient = (refreshToken, accessToken) => {
  const oauth2Client = getOAuth2Client(refreshToken, accessToken);
  return google.gmail({ version: 'v1', auth: oauth2Client });
};

/**
 * Get OAuth2 authorization URL
 * @returns {string} Authorization URL
 */
export const getAuthUrl = () => {
  const oauth2Client = getOAuth2Client();
  const scopes = [
    'https://www.googleapis.com/auth/gmail.readonly',
    'https://www.googleapis.com/auth/gmail.send',
    'https://www.googleapis.com/auth/gmail.modify',
  ];

  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes,
    prompt: 'consent',
  });
};

/**
 * Exchange authorization code for tokens
 * @param {string} code - Authorization code
 * @returns {Promise<Object>} Tokens object
 */
export const getTokensFromCode = async (code) => {
  const oauth2Client = getOAuth2Client();
  const { tokens } = await oauth2Client.getToken(code);
  return tokens;
};

/**
 * Get recent emails
 * @param {string} refreshToken - User's refresh token
 * @param {string} accessToken - User's access token (optional)
 * @param {number} maxResults - Maximum number of emails to fetch
 * @returns {Promise<Array>} Array of email objects
 */
export const getRecentEmails = async (refreshToken, accessToken, maxResults = 10) => {
  try {
    const gmail = getGmailClient(refreshToken, accessToken);
    
    const response = await gmail.users.messages.list({
      userId: 'me',
      maxResults,
      orderBy: 'time', // newest first
    });

    const messages = response.data.messages || [];
    const emails = [];

    for (const message of messages) {
      const email = await getEmailById(refreshToken, accessToken, message.id);
      emails.push(email);
    }

    // Ensure newest first and only keep the first maxResults
    emails.sort((a, b) => (b.receivedAt || 0) - (a.receivedAt || 0));
    return emails.slice(0, maxResults);
  } catch (error) {
    console.error('Error fetching emails:', error);
    throw new Error('Failed to fetch emails');
  }
};

/**
 * Get email by ID
 * @param {string} refreshToken - User's refresh token
 * @param {string} accessToken - User's access token (optional)
 * @param {string} messageId - Gmail message ID
 * @returns {Promise<Object>} Email object
 */
export const getEmailById = async (refreshToken, accessToken, messageId) => {
  try {
    const gmail = getGmailClient(refreshToken, accessToken);
    
    const response = await gmail.users.messages.get({
      userId: 'me',
      id: messageId,
      format: 'full',
    });

    const message = response.data;
    const headers = message.payload.headers;
    
    const getHeader = (name) => {
      const header = headers.find(h => h.name.toLowerCase() === name.toLowerCase());
      return header ? header.value : '';
    };

    // Extract email body
    let body = '';
    if (message.payload.body && message.payload.body.data) {
      body = Buffer.from(message.payload.body.data, 'base64').toString('utf-8');
    } else if (message.payload.parts) {
      for (const part of message.payload.parts) {
        if (part.mimeType === 'text/plain' && part.body && part.body.data) {
          body = Buffer.from(part.body.data, 'base64').toString('utf-8');
          break;
        }
      }
    }

    const dateHeader = getHeader('date');
    const internalDateMs = message.internalDate ? Number(message.internalDate) : undefined;
    const receivedAt = internalDateMs ? new Date(internalDateMs) : (dateHeader ? new Date(dateHeader) : undefined);

    return {
      id: message.id,
      threadId: message.threadId,
      from: getHeader('from'),
      to: getHeader('to'),
      subject: getHeader('subject'),
      date: dateHeader,
      receivedAt,
      body,
    };
  } catch (error) {
    console.error('Error fetching email:', error);
    throw new Error('Failed to fetch email');
  }
};

/**
 * Send email reply
 * @param {string} refreshToken - User's refresh token
 * @param {string} to - Recipient email
 * @param {string} subject - Email subject
 * @param {string} body - Email body
 * @param {string} threadId - Optional thread ID for reply
 * @returns {Promise<Object>} Sent message object
 */
export const sendEmailReply = async (refreshToken, to, subject, body, threadId = null, accessToken = null, fromEmail = null) => {
  try {
    console.log('Attempting to send email:', { to, subject, hasThreadId: !!threadId, hasAccessToken: !!accessToken });
    
    const gmail = getGmailClient(refreshToken, accessToken);

    // Get authenticated user's email if not provided
    let from = fromEmail;
    if (!from) {
      try {
        const profile = await gmail.users.getProfile({ userId: 'me' });
        from = profile.data.emailAddress;
        console.log('Using authenticated email:', from);
      } catch (err) {
        console.error('Failed to get user profile:', err.message);
      }
    }

    // Create email message in RFC 2822 format
    const messageParts = [];
    if (from) {
      messageParts.push(`From: ${from}`);
    }
    messageParts.push(
      `To: ${to}`,
      `Subject: ${subject}`,
      'Content-Type: text/plain; charset=utf-8',
      'MIME-Version: 1.0',
      '',
      body
    );

    const message = messageParts.join('\n');
    const encodedMessage = Buffer.from(message)
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    const requestBody = {
      raw: encodedMessage,
    };

    if (threadId) {
      requestBody.threadId = threadId;
    }

    console.log('Sending email to Gmail API...');
    const response = await gmail.users.messages.send({
      userId: 'me',
      requestBody,
    });

    console.log('Email sent successfully via Gmail API:', response.data.id);
    return response.data;
  } catch (error) {
    console.error('Gmail API send error:', {
      message: error.message,
      code: error.code,
      errors: error.errors,
      stack: error.stack
    });
    
    // Check for specific Gmail API errors
    if (error.code === 401 || error.code === 403) {
      throw new Error('Gmail authentication failed. Please reconnect your Gmail account.');
    } else if (error.code === 400) {
      throw new Error('Invalid email format or parameters.');
    }
    
    throw new Error(`Gmail API error: ${error.message}`);
  }
};

