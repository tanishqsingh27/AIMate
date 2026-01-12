import api from './auth';

export const expensesAPI = {
  getExpenses: (params = {}) => api.get('/expenses', { params }),

  getExpense: (id) => api.get(`/expenses/${id}`),

  createExpense: (data) => api.post('/expenses', data),

  getBudgetInsights: (params = {}) =>
    api.get('/expenses/insights', { params }),

  updateExpense: (id, data) => api.put(`/expenses/${id}`, data),

  deleteExpense: (id) => api.delete(`/expenses/${id}`),
};

