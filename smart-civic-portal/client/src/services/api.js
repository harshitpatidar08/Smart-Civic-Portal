import axios from 'axios';

// Use proxy in development, or explicit URL if provided
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 
(import.meta.env.DEV ? '/api' : 'https://server-5jf0.onrender.com/api');


export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('scp_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const authAPI = {
  register: (payload) => api.post('/auth/register', payload),
  login: (payload) => api.post('/auth/login', payload),
  profile: () => api.get('/auth/profile'),
  logout: () => api.post('/auth/logout'),
};

export const complaintAPI = {
  create: (payload) =>
    api.post('/complaints', payload, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }),
  list: (params) => api.get('/complaints', { params }),
  getById: (id) => api.get(`/complaints/${id}`),
  listByUser: (userId) => api.get(`/complaints/user/${userId}`),
  update: (id, payload) => api.patch(`/complaints/${id}`, payload),
  remove: (id) => api.delete(`/complaints/${id}`),
  adminList: () => api.get('/complaints/admin/complaints'),
};

