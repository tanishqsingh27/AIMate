import { useEffect, useState } from 'react';
import { emailsAPI } from '../api/emails';
import { authAPI } from '../api/auth';
import toast from 'react-hot-toast';
import { useTheme } from '../context/ThemeContext';

const Emails = () => {
  const { theme } = useTheme();
  const [emails, setEmails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [gmailConnected, setGmailConnected] = useState(false);
  const [showManualEmail, setShowManualEmail] = useState(false);
  const [manualEmail, setManualEmail] = useState({
    subject: '',
    from: '',
    to: '',
    originalBody: '',
  });

  const toPlainText = (html) => {
    if (!html) return '';
    try {
      // Pre-replace common block separators with newlines to preserve structure
      const normalized = html
        .replace(/<(br|BR)\s*\/?>/g, '\n')
        .replace(/<\/(p|div|li|tr|h[1-6])>/gi, '\n')
        .replace(/<(li)>/gi, '- ');

      const parser = new DOMParser();
      const doc = parser.parseFromString(normalized, 'text/html');

      // Remove style/script/noscript tags to avoid showing CSS/JS noise
      ['style', 'script', 'noscript'].forEach((tag) => {
        doc.querySelectorAll(tag).forEach((el) => el.remove());
      });

      const text = (doc.body.textContent || '')
        // Normalize CRLF
        .replace(/\r\n?/g, '\n')
        // Collapse 3+ newlines to max 2
        .replace(/\n{3,}/g, '\n\n')
        // Trim whitespace on each line
        .split('\n')
        .map((line) => line.trimEnd())
        .join('\n')
        .trim();

      return text;
    } catch (e) {
      return html
        .replace(/<style[\s\S]*?<\/style>/gi, '')
        .replace(/<script[\s\S]*?<\/script>/gi, '')
        .replace(/<(br|BR)\s*\/?>/g, '\n')
        .replace(/<\/(p|div|li|tr|h[1-6])>/gi, '\n')
        .replace(/<(li)>/gi, '- ')
        .replace(/<[^>]*>/g, '')
        .replace(/\r\n?/g, '\n')
        .replace(/\n{3,}/g, '\n\n')
        .split('\n')
        .map((line) => line.trimEnd())
        .join('\n')
        .trim();
    }
  };

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    
    if (code) {
      // If there's an OAuth callback code, handle it first
      handleGmailCallback(code);
      // Clean URL
      window.history.replaceState({}, document.title, window.location.pathname);
    } else {
      // Normal page load - check connection first
      checkGmailConnectionAndFetchEmails();
    }
  }, []);

  const checkGmailConnectionAndFetchEmails = async () => {
    try {
      const response = await authAPI.getMe();
      const isConnected = response.data.user?.gmailConnected || false;
      setGmailConnected(isConnected);
      
      // Only fetch emails if Gmail is connected
      if (isConnected) {
        await fetchEmails();
      } else {
        setEmails([]);
        setLoading(false);
      }
    } catch (error) {
      console.error('Error checking Gmail connection:', error);
      setGmailConnected(false);
      setEmails([]);
      setLoading(false);
    }
  };

  const handleGmailCallback = async (code) => {
    try {
      toast.loading('Connecting Gmail...');
      await authAPI.handleGmailCallback(code);
      toast.dismiss();
      toast.success('Gmail connected successfully!');
      await checkGmailConnectionAndFetchEmails();
    } catch (error) {
      toast.dismiss();
      toast.error(error.response?.data?.error || 'Failed to connect Gmail');
      // Ensure loading is set to false even on error
      setLoading(false);
    }
  };

  const fetchEmails = async () => {
    try {
      const response = await emailsAPI.getEmails();
      setEmails(response.data.emails || []);
    } catch (error) {
      console.error('Error fetching emails:', error);
      // Don't show toast on initial load if there's an auth issue
      if (error.response?.status !== 401) {
        toast.error('Failed to load emails');
      }
    } finally {
      setLoading(false);
    }
  };

  const checkGmailConnection = async () => {
    try {
      const response = await authAPI.getMe();
      setGmailConnected(response.data.user?.gmailConnected || false);
    } catch (error) {
      console.error('Error checking Gmail connection:', error);
      setGmailConnected(false);
    }
  };

  const handleSyncEmails = async () => {
    try {
      toast.loading('Syncing emails...');
      const response = await emailsAPI.syncEmails();
      toast.dismiss();
      toast.success(`Synced ${response.data.count} emails!`);
      fetchEmails();
    } catch (error) {
      toast.dismiss();
      toast.error(error.response?.data?.error || 'Failed to sync emails');
    }
  };

  const handleConnectGmail = async () => {
    try {
      const response = await authAPI.getGmailAuthUrl();
      window.location.href = response.data.authUrl;
    } catch (error) {
      toast.error('Failed to get Gmail auth URL');
    }
  };

  const handleDisconnectGmail = async () => {
    if (!window.confirm('Are you sure you want to disconnect Gmail? You will need to reconnect to sync and send emails.')) {
      return;
    }
    
    try {
      toast.loading('Disconnecting Gmail...');
      await authAPI.disconnectGmail();
      toast.dismiss();
      toast.success('Gmail disconnected successfully!');
      setGmailConnected(false);
      setEmails([]);
    } catch (error) {
      toast.dismiss();
      toast.error(error.response?.data?.error || 'Failed to disconnect Gmail');
    }
  };

  const handleGenerateReply = async (emailId) => {
    try {
      toast.loading('AI is generating a professional email reply...');
      const response = await emailsAPI.generateReply(emailId);
      toast.dismiss();
      setReplyText(response.data.aiReply || '');
      setSelectedEmail(response.data.email);
      toast.success('AI reply generated successfully!');
    } catch (error) {
      toast.dismiss();
      const errorMsg = error.response?.data?.error || 'Failed to generate reply';
      if (errorMsg.includes('OPENAI') || errorMsg.includes('API')) {
        toast.error('AI service unavailable. Please check your OpenAI API key.');
      } else {
        toast.error(errorMsg);
      }
    }
  };

  const handleSendReply = async (emailId) => {
    if (!replyText.trim()) {
      toast.error('Please enter a reply');
      return;
    }

    try {
      toast.loading('Sending email...');
      await emailsAPI.sendReply(emailId, replyText);
      toast.dismiss();
      toast.success('Email sent successfully!');
      setReplyText('');
      setSelectedEmail(null);
      fetchEmails();
    } catch (error) {
      toast.dismiss();
      toast.error(error.response?.data?.error || 'Failed to send email');
    }
  };

  const handleDeleteEmail = async (id) => {
    if (!window.confirm('Are you sure you want to delete this email?')) return;

    try {
      await emailsAPI.deleteEmail(id);
      toast.success('Email deleted!');
      fetchEmails();
    } catch (error) {
      toast.error('Failed to delete email');
    }
  };

  const handleManualEmailSubmit = async (e) => {
    e.preventDefault();
    if (!manualEmail.subject.trim() || !manualEmail.from.trim() || !manualEmail.originalBody.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      toast.loading('AI is generating a professional email reply...');
      const response = await emailsAPI.generateReplyManual({
        subject: manualEmail.subject,
        from: manualEmail.from,
        to: manualEmail.to,
        originalBody: manualEmail.originalBody,
      });
      toast.dismiss();
      setReplyText(response.data.aiReply);
      setSelectedEmail({
        _id: `manual-${Date.now()}`,
        subject: manualEmail.subject,
        from: manualEmail.from,
        to: manualEmail.to || 'You',
        originalBody: manualEmail.originalBody,
        aiReply: response.data.aiReply,
        status: 'draft',
        isManual: true,
      });
      toast.success('AI reply generated successfully! See the reply below.');
    } catch (error) {
      toast.dismiss();
      const errorMsg = error.response?.data?.error || 'Failed to generate reply';
      if (errorMsg.includes('OPENAI') || errorMsg.includes('API')) {
        toast.error('AI service unavailable. Please check your OpenAI API key.');
      } else {
        toast.error(errorMsg);
      }
    }
  };

  if (loading) {
    return <div className="text-center py-12">Loading emails...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1
            className={`text-3xl font-bold ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}
          >
            Emails
          </h1>
          <p
            className={`mt-1 ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
            }`}
          >
            Generate AI-powered email replies
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowManualEmail(!showManualEmail)}
            className="btn-secondary"
          >
            {showManualEmail ? 'Cancel' : '+ Compose Email'}
          </button>
          {gmailConnected ? (
            <>
              <button onClick={handleSyncEmails} className="btn-primary">
                Sync Gmail
              </button>
              <button onClick={handleDisconnectGmail} className="btn-secondary text-red-600 hover:text-red-700">
                Disconnect Gmail
              </button>
            </>
          ) : (
            <button onClick={handleConnectGmail} className="btn-primary">
              Connect Gmail
            </button>
          )}
        </div>
      </div>

      {/* Manual Email Form */}
      {showManualEmail && (
        <div className={`card ${theme === 'dark' ? 'bg-gray-800 border border-gray-700' : 'border border-blue-200 bg-blue-50'}`}>
          <h2 className={`text-xl font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            Paste an Email for AI Reply
          </h2>
          <form onSubmit={handleManualEmailSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  Subject *
                </label>
                <input
                  type="text"
                  value={manualEmail.subject}
                  onChange={(e) => setManualEmail({ ...manualEmail, subject: e.target.value })}
                  className="input-field"
                  placeholder="Email subject"
                  required
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  From *
                </label>
                <input
                  type="email"
                  value={manualEmail.from}
                  onChange={(e) => setManualEmail({ ...manualEmail, from: e.target.value })}
                  className="input-field"
                  placeholder="Sender email address"
                  required
                />
              </div>
            </div>
            <div>
              <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                To (Optional)
              </label>
              <input
                type="email"
                value={manualEmail.to}
                onChange={(e) => setManualEmail({ ...manualEmail, to: e.target.value })}
                className="input-field"
                placeholder="Your email address"
              />
            </div>
            <div>
              <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                Email Body *
              </label>
              <textarea
                value={manualEmail.originalBody}
                onChange={(e) => setManualEmail({ ...manualEmail, originalBody: e.target.value })}
                className="input-field"
                rows={6}
                placeholder="Paste the email content here..."
                required
              />
            </div>
            <button type="submit" className="btn-primary flex items-center gap-2">
              <span>🤖</span>
              <span>Generate AI Reply</span>
            </button>
          </form>

          {/* Show AI Generated Reply for Manual Email */}
          {selectedEmail?.isManual && selectedEmail.aiReply && (
            <div className="mt-6 pt-6 border-t">
              <div className="flex items-center gap-2 mb-2">
                <h4 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>🤖 AI Generated Reply</h4>
                <span className="px-2 py-0.5 bg-primary-100 text-primary-700 rounded text-xs">
                  GPT-4 Generated
                </span>
              </div>
              <div className={`p-3 rounded text-sm whitespace-pre-wrap leading-relaxed border ${theme === 'dark' ? 'bg-blue-900/30 text-gray-200 border-blue-700' : 'bg-primary-50 text-gray-700 border-primary-200'}`}>
                {selectedEmail.aiReply}
              </div>
              <p className={`mt-2 text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                💡 Copy this reply and use it in your email client, or modify the Email Body above and generate again.
              </p>
            </div>
          )}
        </div>
      )}

      {!gmailConnected && (
        <div className={`card ${theme === 'dark' ? 'bg-blue-900/30 border border-blue-700' : 'bg-blue-50 border border-blue-200'}`}>
          <p className={theme === 'dark' ? 'text-blue-200' : 'text-blue-800'}>
            💡 <strong>Tip:</strong> Connect your Gmail account to automatically sync emails, or use "Compose Email" to paste an email manually.
          </p>
        </div>
      )}


      {/* Emails List */}
      <div className="card">
        <h2
          className={`text-xl font-semibold mb-4 ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}
        >
          Your Emails
        </h2>
        {emails.length === 0 ? (
          <p
            className={`text-center py-8 ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
            }`}
          >
            {gmailConnected
              ? 'No emails yet. Click "Sync Emails" to fetch from Gmail.'
              : 'Connect Gmail to get started.'}
          </p>
        ) : (
          <div className="space-y-4">
            {emails.map((email) => (
              <div
                key={email._id}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{email.subject}</h3>
                      {email.status === 'sent' && (
                        <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">
                          Sent
                        </span>
                      )}
                    </div>
                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      From: {email.from} • To: {email.to}
                    </p>
                    <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                      {new Date(email.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        if (selectedEmail?._id === email._id) {
                          setSelectedEmail(null);
                          setReplyText('');
                        } else {
                          setSelectedEmail(email);
                          setReplyText('');
                        }
                      }}
                      className="text-sm btn-secondary"
                    >
                      {selectedEmail?._id === email._id ? 'Hide' : 'View'}
                    </button>
                    {email.status === 'draft' && (
                      <button
                        onClick={() => handleGenerateReply(email._id)}
                        className="text-sm btn-primary flex items-center gap-1"
                      >
                        <span>🤖</span>
                        <span>Generate AI Reply</span>
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteEmail(email._id)}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </div>

                {/* Email Details & Reply */}
                {selectedEmail?._id === email._id && (
                  <div className="mt-4 pt-4 border-t space-y-4">
                    <div>
                      <h4 className={`font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Original Email</h4>
                      <div className={`p-3 rounded text-sm whitespace-pre-wrap ${theme === 'dark' ? 'bg-gray-900 text-gray-300 border border-gray-700' : 'bg-gray-50 text-gray-700'}`}>
                        {toPlainText(email.originalBody)}
                      </div>
                    </div>

                    {email.aiReply && (
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>🤖 AI Generated Reply</h4>
                          <span className="px-2 py-0.5 bg-primary-100 text-primary-700 rounded text-xs">
                            GPT-4 Generated
                          </span>
                        </div>
                        <div className={`p-3 rounded text-sm whitespace-pre-wrap leading-relaxed border ${theme === 'dark' ? 'bg-blue-900/30 text-gray-200 border-blue-700' : 'bg-primary-50 text-gray-700 border-primary-200'}`}>
                          {email.aiReply}
                        </div>
                      </div>
                    )}

                    {email.status === 'draft' && (
                      <div>
                        <h4 className={`font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Reply</h4>
                        <textarea
                          value={replyText || ''}
                          onChange={(e) => setReplyText(e.target.value)}
                          className="input-field"
                          rows={6}
                          placeholder="Enter your reply or generate one with AI..."
                        />
                        <div className="flex gap-2 mt-2">
                          <button
                            onClick={() => handleGenerateReply(email._id)}
                            className="btn-secondary text-sm flex items-center gap-1"
                          >
                            <span>🤖</span>
                            <span>Regenerate with AI</span>
                          </button>
                          <button
                            onClick={() => handleSendReply(email._id)}
                            className="btn-primary text-sm"
                          >
                            Send Reply
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Emails;

