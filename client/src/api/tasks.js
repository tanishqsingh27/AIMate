import api from './auth';

export const tasksAPI = {
  getTasks: (params = {}) => api.get('/tasks', { params }),

  getTask: (id) => api.get(`/tasks/${id}`),

  createTask: (data) => api.post('/tasks', data),

  generateTasksFromGoal: (goal) =>
    api.post('/tasks/generate', { goal }),

  updateTask: (id, data) => api.put(`/tasks/${id}`, data),

  deleteTask: (id) => api.delete(`/tasks/${id}`),
};

