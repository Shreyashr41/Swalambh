import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth APIs
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
  updateMedicalHistory: (data) => api.put('/auth/medical-history', data),
  changePassword: (data) => api.put('/auth/change-password', data),
};

// Chat APIs
export const chatAPI = {
  startSession: () => api.post('/chat/start'),
  sendMessage: (consultationId, message) => 
    api.post('/chat/message', { consultationId, message }),
  getFollowUpQuestions: (symptoms) => 
    api.post('/chat/follow-up-questions', { symptoms }),
  addSymptom: (consultationId, symptom) => 
    api.post('/chat/symptom', { consultationId, symptom }),
  getHistory: (consultationId) => api.get(`/chat/history/${consultationId}`),
  endSession: (consultationId) => 
    api.post('/chat/end-session', { consultationId }),
};

// Analysis APIs
export const analysisAPI = {
  uploadImage: (consultationId, imageFile, symptoms) => {
    const formData = new FormData();
    formData.append('image', imageFile);
    formData.append('consultationId', consultationId);
    if (symptoms) formData.append('symptoms', symptoms);
    
    return api.post('/analysis/upload-image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  getFullAnalysis: (consultationId) => 
    api.post('/analysis/full-analysis', { consultationId }),
  getResults: (consultationId) => 
    api.get(`/analysis/results/${consultationId}`),
};

// Patient APIs
export const patientAPI = {
  getDashboard: () => api.get('/patient/dashboard'),
  getConsultations: (params) => api.get('/patient/consultations', { params }),
  getConsultation: (id) => api.get(`/patient/consultations/${id}`),
  getSymptomProgress: (days) => 
    api.get('/patient/symptom-progress', { params: { days } }),
  getHealthSummary: () => api.get('/patient/health-summary'),
};

// Reminder APIs
export const reminderAPI = {
  create: (data) => api.post('/reminders', data),
  getAll: (params) => api.get('/reminders', { params }),
  getUpcoming: (limit) => api.get('/reminders/upcoming', { params: { limit } }),
  getNotifications: () => api.get('/reminders/notifications'),
  getById: (id) => api.get(`/reminders/${id}`),
  update: (id, data) => api.put(`/reminders/${id}`, data),
  complete: (id) => api.post(`/reminders/${id}/complete`),
  snooze: (id, minutes) => api.post(`/reminders/${id}/snooze`, { minutes }),
  delete: (id) => api.delete(`/reminders/${id}`),
  createMedication: (data) => api.post('/reminders/medication', data),
  createAppointment: (data) => api.post('/reminders/appointment', data),
  clearNotification: (reminderId) => 
    api.delete(`/reminders/notifications/${reminderId}`),
};

// Report APIs
export const reportAPI = {
  generate: (consultationId, options) => 
    api.post('/reports/generate', { consultationId, options }),
  getAll: () => api.get('/reports'),
  getById: (reportId) => api.get(`/reports/${reportId}`),
  getHTML: (reportId) => api.get(`/reports/${reportId}/html`),
  download: (reportId) => api.get(`/reports/${reportId}/download`, {
    responseType: 'blob',
  }),
  share: (reportId, email) => 
    api.post(`/reports/${reportId}/share`, { email }),
  delete: (reportId) => api.delete(`/reports/${reportId}`),
};

export default api;
