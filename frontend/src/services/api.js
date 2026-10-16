/**
 * Central API client using axios.
 *
 * Why an API service layer instead of calling fetch() directly in components?
 * - All API calls go through one place → easy to add logging, retries, etc.
 * - Interceptors automatically attach the JWT token to every request
 * - Interceptors automatically handle 401 (token expired → redirect to login)
 * - Components just call api.get('/journeys') — they don't deal with headers
 */
import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
});

// REQUEST interceptor: attach JWT from localStorage to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// RESPONSE interceptor: handle token expiry globally
api.interceptors.response.use(
  (response) => response.data, // unwrap the axios envelope — callers get data directly
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error.response?.data || error);
  }
);

export default api;
