import axios from 'axios';

const api = axios.create({
  baseURL: (import.meta as any).env?.REACT_APP_API_URL || '',
  withCredentials: true,
});

// Добавляем токен во все запросы, кроме /telegram_auth
api.interceptors.request.use((config) => {
  if (config.url && !config.url.includes('/telegram_auth')) {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers = config.headers || {};
      config.headers['Authorization'] = `Bearer ${token}`;
    }
  }
  return config;
});

// Обработка 401 — сброс токена и редирект на /login
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
