import axios from 'axios';

const API = axios.create({
  baseURL: 'http://192.168.1.66:5000/api', 
});

API.interceptors.request.use((req) => {
  const token = localStorage.getItem('adminToken');
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

export default API;