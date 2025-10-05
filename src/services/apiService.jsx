import axios from 'axios';

const api = axios.create({
  baseURL: 'https://apollo-terra-backend.vercel.app/api',
  headers: { "Content-Type": "application/json" },
});

export default api;