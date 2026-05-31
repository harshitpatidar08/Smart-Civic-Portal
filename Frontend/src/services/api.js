import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to add the auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Auth Services
export const login = async (email, password) => {
  const response = await api.post('/auth/login', { email, password });
  return response.data;
};

export const registerUser = async (userData) => {
  const response = await api.post('/auth/register', userData);
  return response.data;
};

export const getUserProfile = async () => {
  const response = await api.get('/auth/profile');
  return response.data;
};

// Complaint Services
export const submitComplaint = async (complaintData) => {
  const response = await api.post('/complaints', complaintData);
  return response.data;
};

export const getMyComplaints = async () => {
  const response = await api.get('/complaints');
  return response.data;
};

// Admin Services
export const getDistrictComplaints = async (district) => {
  const response = await api.get(`/admin/complaints?district=${district}`);
  return response.data;
};

export const updateComplaintStatus = async (id, statusData) => {
  const response = await api.put(`/admin/complaints/${id}/status`, statusData);
  return response.data;
};

export const getEscalatedComplaints = async () => {
  const response = await api.get('/admin/complaints/escalated');
  return response.data;
};

// Admin Account Management Services (SA-4)
export const getDistrictAdmins = async () => {
  const response = await api.get('/admin/district-admins');
  return response.data;
};

export const createDistrictAdmin = async (adminData) => {
  const response = await api.post('/admin/district-admins', adminData);
  return response.data;
};

export const updateDistrictAdmin = async (id, updateData) => {
  const response = await api.put(`/admin/district-admins/${id}`, updateData);
  return response.data;
};

// Announcement Services (SA-5)
// Using local storage for mock immediate feedback if backend not ready
export const publishAnnouncement = async (announcementData) => {
  try {
    const response = await api.post('/admin/announcements', announcementData);
    return response.data;
  } catch (err) {
    localStorage.setItem('smart_civic_announcement', JSON.stringify({ ...announcementData, date: new Date().toISOString() }));
    return { success: true, mock: true };
  }
};

export const getLatestAnnouncement = async () => {
  try {
    const response = await api.get('/announcements/latest');
    return response.data;
  } catch (err) {
    const local = localStorage.getItem('smart_civic_announcement');
    return local ? { success: true, data: JSON.parse(local) } : { success: false };
  }
};

export const getFieldOfficers = async () => {
  const response = await api.get('/admin/field-officers');
  return response.data;
};

export const assignComplaint = async (id, officerId) => {
  const response = await api.put(`/admin/complaints/${id}/assign`, { officer_id: officerId });
  return response.data;
};

export const getAdminNotes = async (id) => {
  const response = await api.get(`/admin/complaints/${id}/notes`);
  return response.data;
};

export const addAdminNote = async (id, note, adminId) => {
  const response = await api.post(`/admin/complaints/${id}/notes`, { note, admin_id: adminId });
  return response.data;
};

export const getSlaStats = async (district) => {
  const response = await api.get(`/admin/sla-stats?district=${district}`);
  return response.data;
};

// Analytics Services
export const getSystemOverview = async () => {
  const response = await api.get('/analytics/overview');
  return response.data;
};

export const getDistrictPerformance = async () => {
  const response = await api.get('/analytics/district-performance');
  return response.data;
};

export const getHotspots = async () => {
  const response = await api.get('/analytics/hotspots');
  return response.data;
};

export default api;
