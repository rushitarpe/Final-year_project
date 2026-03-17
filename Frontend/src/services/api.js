import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Configure interceptors
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        // CRITICAL FIX: When sending FormData, let axios set the Content-Type
        // automatically (including the multipart boundary). 
        // The global 'application/json' header breaks file uploads.
        if (config.data instanceof FormData) {
            delete config.headers['Content-Type'];
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

api.interceptors.response.use(
    (response) => {
        return response;
    },
    async (error) => {
        // Handle global errors, e.g. 401 Unauthorized
        if (error.response && error.response.status === 401) {
            // Do not redirect if the error comes from an auth route (like login or register)
            // otherwise the user won't be able to see the invalid credentials message.
            if (error.config && error.config.url && !error.config.url.includes('/auth/')) {
                localStorage.removeItem('token');
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default api;
