import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach JWT Token if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor for handling global auth errors
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
    return Promise.reject(error.response?.data || error.message);
  }
);

export const authService = {
  login: (credentials) => api.post('/auth/login', credentials),
  getStaff: () => api.get('/auth/staff'),
};

export const bloodGroupService = {
  getAll: () => api.get('/blood-groups'),
};

export const donorService = {
  getAll: () => api.get('/donors'),
  getById: (id) => api.get(`/donors/${id}`),
  create: (donorData) => api.post('/donors', donorData),
  update: (id, donorData) => api.put(`/donors/${id}`, donorData),
  delete: (id) => api.delete(`/donors/${id}`),
};

export const donationService = {
  getAll: () => api.get('/donations'),
  getById: (id) => api.get(`/donations/${id}`),
  create: (donationData) => api.post('/donations', donationData),
  updateScreening: (id, screeningData) => api.put(`/donations/${id}/screening`, screeningData),
};

export const inventoryService = {
  getSummary: () => api.get('/inventory'),
  getByGroup: (bloodGroup) => api.get(`/inventory/${encodeURIComponent(bloodGroup)}`),
  getAvailableUnits: (bloodGroupId) => api.get('/inventory/units/available', { params: { blood_group_id: bloodGroupId } }),
};

export const hospitalService = {
  getAll: () => api.get('/hospitals'),
  create: (hospitalData) => api.post('/hospitals', hospitalData),
  getById: (id) => api.get(`/hospitals/${id}`),
  update: (id, hospitalData) => api.put(`/hospitals/${id}`, hospitalData),
  delete: (id) => api.delete(`/hospitals/${id}`),
};


export const requestService = {
  getAll: (params) => api.get('/requests', { params }),
  getById: (id) => api.get(`/requests/${id}`),
  create: (requestData) => api.post('/requests', requestData),
  updateStatus: (id, statusData) => api.put(`/requests/${id}`, statusData),
};

export const issueService = {
  getAll: () => api.get('/issues'),
  getById: (id) => api.get(`/issues/${id}`),
  issueUnits: (issueData) => api.post('/issues', issueData),
};

export const dashboardService = {
  getStats: () => api.get('/dashboard/stats'),
};

export default api;
