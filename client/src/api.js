import axios from 'axios';

export const api = axios.create({
  baseURL: import.meta.env.VITE_SERVER_URL || 'http://localhost:5000/api',
});

export function setAuthToken(token) {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
}