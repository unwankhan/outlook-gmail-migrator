// frontend/src/contexts/AuthContext.jsx
import React, { createContext, useState, useContext, useEffect } from 'react'
import { authService } from '../services/auth'
import { useNotification } from './NotificationContext'

const AuthContext = createContext()

export const useAuth = () => {
    const context = useContext(AuthContext)
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
}

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null)
    const [tokens, setTokens] = useState({ outlook: null, gmail: null })
    const [loading, setLoading] = useState(true)
    const [backendStatus, setBackendStatus] = useState('checking')
    const { showSuccess, showError } = useNotification()

    useEffect(() => {
        checkAuth()
        checkBackendStatus()
    }, [])

    // Load tokens when user changes
    useEffect(() => {
        if (user) {
            loadUserTokens()
        }
    }, [user])

    const checkBackendStatus = async () => {
        try {
            const response = await fetch('/api/health')
            if (response.ok) {
                setBackendStatus('online')
            } else {
                setBackendStatus('offline')
            }
        } catch (error) {
            setBackendStatus('offline')
        }
    }

    const checkAuth = async () => {
        try {
            const token = localStorage.getItem('authToken')
            const userId = localStorage.getItem('userId')
            const userName = localStorage.getItem('userName')
            const userEmail = localStorage.getItem('userEmail')

            if (token && userId) {
                // Validate token with backend
                const response = await authService.validateToken(token)
                if (response.valid) {
                    setUser({
                        name: userName || response.name || userEmail?.split('@')[0] || 'User',
                        email: userEmail || response.email,
                        userId: userId
                    })
                    showSuccess('Welcome back!')
                } else {
                    logout()
                }
            }
        } catch (error) {
            console.error('Auth check failed:', error)
            // Don't logout on network errors, use stored data
            const token = localStorage.getItem('authToken')
            const userId = localStorage.getItem('userId')
            const userName = localStorage.getItem('userName')
            const userEmail = localStorage.getItem('userEmail')

            if (token && userId) {
                setUser({
                    name: userName || userEmail?.split('@')[0] || 'User',
                    email: userEmail,
                    userId: userId
                })
            }
        } finally {
            setLoading(false)
        }
    }

    const loadUserTokens = async () => {
        try {
            if (user && user.userId) {
                const tokenData = await authService.getUserTokens(user.userId)
                setTokens(tokenData)
            }
        } catch (error) {
            console.error('Error loading user tokens:', error)
        }
    }

    const login = async (email, password) => {
        try {
            const response = await authService.login(email, password)
            if (response.success) {
                localStorage.setItem('authToken', response.token)
                localStorage.setItem('userId', response.userId)
                localStorage.setItem('userEmail', email)

                // Store name if available in response, otherwise use email prefix
                const userName = response.name || email.split('@')[0]
                localStorage.setItem('userName', userName)

                setUser({
                    name: userName,
                    email: email,
                    userId: response.userId
                })
                showSuccess('Successfully signed in!')
                return { success: true }
            } else {
                showError(response.message || 'Login failed')
                return { success: false, message: response.message }
            }
        } catch (error) {
            showError(error.message || 'Login failed')
            return { success: false, message: error.message }
        }
    }

    const signup = async (userData) => {
        try {
            const response = await authService.signup(userData)
            if (response.success) {
                localStorage.setItem('authToken', response.token)
                localStorage.setItem('userId', response.userId)
                localStorage.setItem('userEmail', userData.email)

                // Store the name from signup form
                localStorage.setItem('userName', userData.name)

                setUser({
                    name: userData.name,
                    email: userData.email,
                    userId: response.userId
                })
                showSuccess('Account created successfully!')
                return { success: true }
            } else {
                showError(response.message || 'Signup failed')
                return { success: false, message: response.message }
            }
        } catch (error) {
            showError(error.message || 'Signup failed')
            return { success: false, message: error.message }
        }
    }

    const logout = () => {
        localStorage.removeItem('authToken')
        localStorage.removeItem('userId')
        localStorage.removeItem('userName')
        localStorage.removeItem('userEmail')
        setUser(null)
        setTokens({ outlook: null, gmail: null })
        showSuccess('Successfully signed out')
    }

    const connectOutlook = () => {
        const userId = localStorage.getItem('userId')
        if (!userId) {
            showError('Please sign in first')
            return
        }
        authService.initiateOutlookOAuth(userId)
    }

    const connectGmail = () => {
        const userId = localStorage.getItem('userId')
        if (!userId) {
            showError('Please sign in first')
            return
        }
        authService.initiateGmailOAuth(userId)
    }

    const disconnectService = async (service) => {
        try {
            const userId = localStorage.getItem('userId')
            if (!userId) throw new Error('No user ID found')

            await authService.disconnectService(userId, service)
            setTokens(prev => ({ ...prev, [service]: null }))
            showSuccess(`${service.charAt(0).toUpperCase() + service.slice(1)} disconnected successfully`)
            return { success: true }
        } catch (error) {
            console.error('Disconnect service error:', error)
            showError(`Failed to disconnect ${service}`)
            return { success: false, message: error.message }
        }
    }

    const refreshTokens = async () => {
        await loadUserTokens()
    }

    const updateUserProfile = (updates) => {
        if (updates.name) {
            localStorage.setItem('userName', updates.name)
        }
        setUser(prev => prev ? { ...prev, ...updates } : null)
    }

    const value = {
        user,
        tokens,
        backendStatus,
        login,
        signup,
        logout,
        loading,
        connectOutlook,
        connectGmail,
        disconnectService,
        refreshTokens,
        checkBackendStatus,
        updateUserProfile
    }

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )
}