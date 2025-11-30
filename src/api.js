// src/axiosInstance.js
import axios from 'axios';

// Створюємо інстанс axios
const axiosInstance = axios.create({
  baseURL: 'http://127.0.0.1:8000/api/v1', // Ваша базова URL-адреса
  headers: {
    'Content-Type': 'application/json',
  },
});

// Інтерсептор для додавання токена авторизації
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Інтерсептор для обробки помилок та автоматичного оновлення токена
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Перевірка, чи це помилка авторизації
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        // Отримуємо рефреш токен
        const refreshToken = localStorage.getItem('refreshToken');
        const { data } = await axios.post('http://127.0.0.1:8000/api/v1/token/refresh/', { refresh: refreshToken });

        // Оновлюємо токен у локальному сховищі
        localStorage.setItem('accessToken', data.access);

        // Оновлюємо заголовок та повторюємо оригінальний запит
        axiosInstance.defaults.headers['Authorization'] = `Bearer ${data.access}`;
        originalRequest.headers['Authorization'] = `Bearer ${data.access}`;

        return axiosInstance(originalRequest);
      } catch (err) {
        console.error('Failed to refresh token', err);
        // Логаут або інше оброблення, наприклад, перенаправлення на сторінку входу
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login'; // Редірект на сторінку входу
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
