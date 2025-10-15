import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080';
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  // withCredentials: true,
});
export const UserService = {
  getAll: () => api.get('/members'),
  getById: (id: Number) => api.get(`/members/${id}`),
  create: (data: any) => api.post('/members', data),
  update: (id: Number, data: any) => api.put(`/members/${id}`, data),
  delete: (id: Number) => api.delete(`/members/${id}`)
};

export const ShiftService = {
  getAll: () => api.get('/shifts'),
  // getById: (id: Number) => api.get(`/members/${id}`),
  create: (data: any) => api.post('/shifts', data),
  // update: (id: Number, data: any) => api.put(`/members/${id}`, data),
  // delete: (id: Number) => api.delete(`/members/${id}`)
};

export default api;