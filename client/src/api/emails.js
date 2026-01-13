import api from './auth';

export const emailsAPI = {
  getEmails: (params = {}) => api.get('/emails', { params }),

  getEmail: (id) => api.get(`/emails/${id}`),

  syncEmails: () => api.get('/emails/sync'),

  // Sync in background without blocking UI
  syncEmailsAsync: async () => {
    try {
      // Fire and forget - don't wait for response
      api.get('/emails/sync').catch(err => console.log('Background sync failed'));
      return Promise.resolve();
    } catch (error) {
      console.log('Sync started in background');
    }
  },

  generateReply: (id, context = '') =>
    api.post(`/emails/${id}/generate-reply`, { context }),

  generateReplyManual: (emailData) =>
    api.post('/emails/generate-reply-manual', emailData),

  sendReply: (id, replyText) =>
    api.post(`/emails/${id}/send`, { replyText }),

  updateEmail: (id, data) => api.put(`/emails/${id}`, data),

  deleteEmail: (id) => api.delete(`/emails/${id}`),
};

