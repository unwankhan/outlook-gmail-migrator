// frontend/src/components/common/ToastNotification.jsx
import React from 'react'
import { Toaster } from 'react-hot-toast'
import { CheckCircle, XCircle, AlertCircle, Info, Loader } from 'lucide-react'

const ToastNotification = () => {
    return (
        <Toaster
            position="top-right"
            toastOptions={{
                duration: 4000,
                style: {
                    background: '#fff',
                    color: '#374151',
                    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                    borderRadius: '16px',
                    border: '1px solid #e5e7eb',
                    padding: '16px 20px',
                    fontSize: '14px',
                    fontWeight: '500',
                    maxWidth: '480px',
                    backdropFilter: 'blur(8px)'
                },
                success: {
                    iconTheme: {
                        primary: '#10b981',
                        secondary: '#fff',
                    },
                    style: {
                        borderLeft: '4px solid #10b981',
                        background: 'rgba(16, 185, 129, 0.05)',
                    },
                    icon: <CheckCircle className="h-5 w-5 text-green-500" />,
                },
                error: {
                    iconTheme: {
                        primary: '#ef4444',
                        secondary: '#fff',
                    },
                    style: {
                        borderLeft: '4px solid #ef4444',
                        background: 'rgba(239, 68, 68, 0.05)',
                    },
                    icon: <XCircle className="h-5 w-5 text-red-500" />,
                },
                loading: {
                    iconTheme: {
                        primary: '#3b82f6',
                        secondary: '#fff',
                    },
                    style: {
                        borderLeft: '4px solid #3b82f6',
                        background: 'rgba(59, 130, 246, 0.05)',
                    },
                    icon: <Loader className="h-5 w-5 text-blue-500 animate-spin" />,
                },
                custom: {
                    style: {
                        borderLeft: '4px solid #8b5cf6',
                        background: 'rgba(139, 92, 246, 0.05)',
                    },
                    icon: <Info className="h-5 w-5 text-purple-500" />,
                },
            }}
        />
    )
}

export default ToastNotification
