import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
});

export const staffApi = {
  getAll: (params) => api.get('/staffs', { params }).then((r) => r.data),
  getById: (id) => api.get(`/staffs/${id}`).then((r) => r.data.data),
  create: (payload) => api.post('/staffs', payload).then((r) => r.data),
  update: (id, payload) => api.patch(`/staffs/${id}`, payload).then((r) => r.data),
  toggleLock: ({ id, reason }) => api.patch(`/staffs/${id}/lock`, { reason }).then((r) => r.data),
  remove: (id) => api.delete(`/staffs/${id}`).then((r) => r.data),
  resendEmail: (id) => api.post(`/staffs/${id}/resend-email`).then((r) => r.data),
  resetPassword: (id) => api.patch(`/staffs/${id}/reset-password`).then((r) => r.data),
  login: (payload) => api.post('/auth/login', payload).then((r) => r.data),
  activate: (payload) => api.post('/auth/activate', payload).then((r) => r.data),
  checkAppointments: (id) => api.get(`/staffs/${id}/check-appointments`).then((r) => r.data),
  reassignAndSuspend: (id, payload) => api.post(`/staffs/${id}/reassign-suspend`, payload).then((r) => r.data),
};
