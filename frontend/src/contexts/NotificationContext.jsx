// frontend/src/contexts/NotificationContext.jsx
import React, { createContext, useContext } from 'react'
import toast, { Toaster } from 'react-hot-toast'
import { CheckCircle, XCircle, AlertCircle, Info, Loader } from 'lucide-react'

const NotificationContext = createContext()

export const useNotification = () => {
    const context = useContext(NotificationContext)
    if (!context) {
        throw new Error('useNotification must be used within NotificationProvider')
    }
    return context
}

export const NotificationProvider = ({ children }) => {
    const showSuccess = (message, options = {}) => {
        return toast.success(message, {
            duration: 4000,
            position: 'top-right',
            icon: <CheckCircle className="h-5 w-5 text-green-500" />,
            ...options
        })
    }

    const showError = (message, options = {}) => {
        return toast.error(message, {
            duration: 5000,
            position: 'top-right',
            icon: <XCircle className="h-5 w-5 text-red-500" />,
            ...options
        })
    }

    const showLoading = (message, options = {}) => {
        return toast.loading(message, {
            position: 'top-right',
            icon: <Loader className="h-5 w-5 text-blue-500 animate-spin" />,
            ...options
        })
    }

    const showInfo = (message, options = {}) => {
        return toast(message, {
            duration: 3000,
            position: 'top-right',
            icon: <Info className="h-5 w-5 text-blue-500" />,
            ...options
        })
    }

    const showWarning = (message, options = {}) => {
        return toast(message, {
            duration: 4000,
            position: 'top-right',
            icon: <AlertCircle className="h-5 w-5 text-orange-500" />,
            ...options
        })
    }

    const dismiss = (toastId) => toast.dismiss(toastId)

    const dismissAll = () => toast.dismiss()

    const updateToast = (toastId, options) => {
        toast.dismiss(toastId)
        return toast(options)
    }

    const value = {
        showSuccess,
        showError,
        showLoading,
        showInfo,
        showWarning,
        dismiss,
        dismissAll,
        updateToast
    }

    return (
        <NotificationContext.Provider value={value}>
            {children}
            <Toaster
                position="top-right"
                toastOptions={{
                    duration: 4000,
                    style: {
                        background: 'rgba(255, 255, 255, 0.9)',
                        backdropFilter: 'blur(8px)',
                        color: '#374151',
                        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                        borderRadius: '16px',
                        border: '1px solid #e5e7eb',
                        padding: '16px 20px',
                        fontSize: '14px',
                        fontWeight: '500',
                        maxWidth: '480px',
                    },
                    success: {
                        duration: 3000,
                        style: {
                            borderLeft: '4px solid #10b981',
                            background: 'rgba(16, 185, 129, 0.05)',
                        },
                        iconTheme: {
                            primary: '#10b981',
                            secondary: '#fff',
                        },
                    },
                    error: {
                        duration: 5000,
                        style: {
                            borderLeft: '4px solid #ef4444',
                            background: 'rgba(239, 68, 68, 0.05)',
                        },
                        iconTheme: {
                            primary: '#ef4444',
                            secondary: '#fff',
                        },
                    },
                    loading: {
                        duration: Infinity,
                        style: {
                            borderLeft: '4px solid #3b82f6',
                            background: 'rgba(59, 130, 246, 0.05)',
                        },
                    },
                }}
            />
        </NotificationContext.Provider>
    )
}
