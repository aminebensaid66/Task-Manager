import axios from 'axios';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api/v1',
  withCredentials: true,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

export const apiErrorMessage = (error, fallback = 'Request failed. Please try again.') => {
  const message = error?.response?.data?.message;
  if (Array.isArray(message)) return message.join(' ');
  if (typeof message === 'string') return message;
  if (error?.code === 'ECONNABORTED') return 'The server took too long to respond.';
  return fallback;
};
