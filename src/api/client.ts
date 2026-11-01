import axios from 'axios';

const client = axios.create({ baseURL: 'https://expense-repository.onrender.com' });

client.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

client.interceptors.response.use(
  (r) => r,
  (err) => {
    if (err.response?.status === 401) {
      // Clear stored credentials
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Dispatch a custom event — App.tsx listens and does a React Router redirect.
      // This avoids a hard page reload and keeps SPA navigation consistent.
      window.dispatchEvent(new CustomEvent('auth:unauthorized'));
    }
    return Promise.reject(err);
  },
);

export default client;
