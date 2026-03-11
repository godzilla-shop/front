import { auth } from './firebase';
import axios, { InternalAxiosRequestConfig } from 'axios';

const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

const api = axios.create({
    baseURL: baseUrl,
});

api.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
    const user = auth.currentUser;
    if (user) {
        const token = await user.getIdToken();
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default api;
