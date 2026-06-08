import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
});

export const customerApi = {
  getAll: (params) => api.get('/customers', { params }).then((r) => r.data),
  getById: (id) => api.get(`/customers/${id}`).then((r) => r.data.data),
  create: (payload) => api.post('/customers', payload).then((r) => r.data),
  update: (id, payload) => api.patch(`/customers/${id}`, payload).then((r) => r.data),
  remove: (id) => api.delete(`/customers/${id}`).then((r) => r.data),
  restore: (id) => api.patch(`/customers/${id}/restore`).then((r) => r.data),
};
