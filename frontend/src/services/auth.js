// src/services/auth.js
import axios from 'axios'

const AUTH_BASE = import.meta.env.PROD ? '' : 'http://localhost:8081';
const authApi = axios.create({
    baseURL: AUTH_BASE, // Direct auth service
    headers: {
        'Content-Type': 'application/json',
    },
})

const gatewayApi = axios.create({
    baseURL: 'http://localhost:8080', // Gateway service
    headers: {
        'Content-Type': 'application/json',
    },
})

// Request interceptor to add auth token
authApi.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('authToken')
        if (token) {
            config.headers.Authorization = `Bearer ${token}`
        }
        return config
    },
    (error) => {
        return Promise.reject(error)
    }
)

// Response interceptor to handle errors
authApi.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('authToken')
            localStorage.removeItem('userId')
            window.location.href = '/login'
        }
        return Promise.reject(error)
    }
)

export const authService = {
    async login(email, password) {
        try {
            console.log('Sending login request...', { email })

            const response = await authApi.post('/api/auth/login', {
                email,
                password
            })

            console.log('Login response:', response.data)
            return response.data
        } catch (error) {
            console.error('Login API error:', error)
            throw new Error(error.response?.data?.message || 'Login failed. Please try again.')
        }
    },

    async signup(userData) {
        try {
            console.log('Sending signup request...', {
                email: userData.email,
                password: userData.password,
                name: userData.name
            })

            const response = await authApi.post('/api/auth/signup', {
                email: userData.email,
                password: userData.password,
                name: userData.name
            })

            console.log('Signup response:', response.data)
            return response.data
        } catch (error) {
            console.error('Signup API error:', error)
            throw new Error(error.response?.data?.message || 'Signup failed. Please try again.')
        }
    },

    async validateToken(token) {
        try {
            const response = await authApi.post('/api/auth/validate-token', { token })
            return response.data
        } catch (error) {
            console.error('Token validation error:', error)
            return { valid: false, message: 'Token validation failed' }
        }
    },

    async getUserTokens(userId) {
        try {
            const response = await authApi.get(`/api/oauth/tokens/${userId}`)
            return response.data
        } catch (error) {
            console.error('Get user tokens error:', error)
            return { outlook: null, gmail: null }
        }
    },

    async disconnectService(userId, service) {
        try {
            const response = await authApi.delete(`/api/oauth/tokens/${userId}?service=${service}`)
            return response.data
        } catch (error) {
            console.error('Disconnect service error:', error)
            throw error
        }
    },

    // ✅ ADDED: OAuth initiation methods
    async initiateOutlookOAuth(userId) {
        try {
            // This will redirect to Outlook OAuth
            window.location.href = `http://localhost:8081/callback/auth/outlook?userId=${userId}`
        } catch (error) {
            console.error('Outlook OAuth initiation error:', error)
            throw error
        }
    },

    async initiateGmailOAuth(userId) {
        try {
            // This will redirect to Gmail OAuth
            window.location.href = `http://localhost:8081/callback/auth/gmail?userId=${userId}`
        } catch (error) {
            console.error('Gmail OAuth initiation error:', error)
            throw error
        }
    }
}