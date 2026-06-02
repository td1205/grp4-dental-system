import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
});

export const staffApi = {
  getAll: (params) => api.get('/staffs', { params }).then((r) => r.data),
  getById: (id) => api.get(`/staffs/${id}`).then((r) => r.data.data),
  create: (payload) => api.post('/staffs', payload).then((r) => r.data),
  update: (id, payload) => api.patch(`/staffs/${id}`, payload).then((r) => r.data),
  toggleLock: (id) => api.patch(`/staffs/${id}/lock`).then((r) => r.data),
  remove: (id) => api.delete(`/staffs/${id}`).then((r) => r.data),
};
