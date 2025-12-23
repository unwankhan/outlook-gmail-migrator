// import axios from 'axios'
//
// const API_BASE_URL = 'http://localhost:8080'
//
// const api = axios.create({
//     baseURL: API_BASE_URL,
//     headers: {
//         'Content-Type': 'application/json',
//     },
// })
//
// // Request interceptor to add auth token
// api.interceptors.request.use(
//     (config) => {
//         const token = localStorage.getItem('authToken')
//         if (token) {
//             config.headers.Authorization = `Bearer ${token}`
//         }
//         return config
//     },
//     (error) => {
//         return Promise.reject(error)
//     }
// )
//
// // Response interceptor to handle errors
// api.interceptors.response.use(
//     (response) => response,
//     (error) => {
//         if (error.response?.status === 401) {
//             localStorage.removeItem('authToken')
//             window.location.href = '/login'
//         }
//         return Promise.reject(error)
//     }
// )
//
// export default api
import axios from 'axios';

// ✅ DEVELOPMENT: Use direct service URLs
// ✅ PRODUCTION: Use relative paths (vite proxy)
const getBaseURL = (service) => {
    if (import.meta.env.PROD) {
        return ''; // Production mein relative paths use karo
    }

    // Development mein direct service URLs use karo
    switch(service) {
        case 'migration':
            return 'http://localhost:8082';
        case 'status':
            return 'http://localhost:8083';
        case 'auth':
            return 'http://localhost:8081';
        default:
            return '';
    }
};

// Create axios instance
const api = axios.create({
    // No baseURL - hum manually URLs set karenge
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 30000,
});

// Request interceptor to add auth token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('authToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        // ✅ Log requests for debugging
        console.log(`🔄 API Call: ${config.method?.toUpperCase()} ${config.url}`);

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor to handle errors
api.interceptors.response.use(
    (response) => {
        console.log(`✅ API Success: ${response.status} ${response.config.url}`);
        return response;
    },
    (error) => {
        console.error(`❌ API Error: ${error.response?.status} ${error.config?.url}`, error);
        if (error.response?.status === 401) {
            localStorage.removeItem('authToken');
            localStorage.removeItem('userId');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default api;