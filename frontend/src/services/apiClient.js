/**
 * Axios instance chuẩn cho toàn dự án.
 * Tự động gắn Bearer token từ localStorage vào mỗi request.
 */
import axios from 'axios';

const apiClient = axios.create({
  baseURL: '/api',
});

// Request interceptor: tự động thêm Authorization header
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default apiClient;
