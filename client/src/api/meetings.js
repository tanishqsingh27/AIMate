import api from './auth';

export const meetingsAPI = {
  getMeetings: () => api.get('/meetings'),

  getMeeting: (id) => api.get(`/meetings/${id}`),

  createMeeting: (data) => api.post('/meetings', data),

  createMeetingWithAI: (data) => api.post('/meetings/create-with-ai', data),

  uploadAudio: (id, audioFile) => {
    const formData = new FormData();
    formData.append('audio', audioFile);
    return api.post(`/meetings/${id}/upload-audio`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  convertActionItemToTask: (meetingId, actionItemId) =>
    api.post(`/meetings/${meetingId}/action-items/${actionItemId}/convert`),

  updateMeeting: (id, data) => api.put(`/meetings/${id}`, data),

  deleteMeeting: (id) => api.delete(`/meetings/${id}`),
};

