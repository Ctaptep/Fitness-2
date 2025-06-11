import axios, { AxiosInstance } from 'axios';

const api: AxiosInstance = axios.create({
  baseURL: process.env.REACT_APP_API_URL || '',
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

/**
 * Экземпляр axios для работы с API
 */
export default api;
/**
 * Выполнить GET-запрос (мокается в тестах через jest.spyOn(get))
 */
export const get = api.get.bind(api);
/**
 * Выполнить POST-запрос (мокается в тестах через jest.spyOn(post))
 */
export const post = api.post.bind(api);
/**
 * Выполнить PUT-запрос (мокается в тестах через jest.spyOn(put))
 */
export const put = api.put.bind(api);
/**
 * Выполнить DELETE-запрос (мокается в тестах через jest.spyOn(del))
 */
export const del = api.delete.bind(api);
