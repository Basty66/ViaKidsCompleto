import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || '/api',
    headers: { 'Content-Type': 'application/json' },
    timeout: 15000,
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('viakids_token_v3');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => Promise.reject(error));

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('viakids_token_v3');
            localStorage.removeItem('viakids_role_v3');
            localStorage.removeItem('viakids_name_v3');
            localStorage.removeItem('viakids_id_v3');
            window.location.href = '/';
        }
        return Promise.reject(error);
    }
);

export default api;
