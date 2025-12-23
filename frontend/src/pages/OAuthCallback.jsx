// frontend/src/pages/OAuthCallback.jsx
import React, { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useNotification } from '../contexts/NotificationContext'
import { CheckCircle, XCircle, Loader, Cloud } from 'lucide-react'
import { motion } from 'framer-motion'

const OAuthCallback = () => {
    // const [searchParams] = useSearchParams()
    // const navigate = useNavigate()
    // const { refreshTokens } = useAuth()
    // const { showSuccess, showError } = useNotification()
    //
    // const code = searchParams.get('code')
    // const error = searchParams.get('error')
    // const state = searchParams.get('state')
    // const provider = searchParams.get('provider')
    //
    // useEffect(() => {
    //     const handleOAuthCallback = async () => {
    //         try {
    //             if (error) {
    //                 showError(`OAuth failed: ${error}`)
    //                 setTimeout(() => navigate('/profile'), 2000)
    //                 return
    //             }
    //
    //             if (code) {
    //                 showSuccess(`${provider ? provider.charAt(0).toUpperCase() + provider.slice(1) : 'Account'} connected successfully!`)
    //
    //                 // Refresh the tokens list
    //                 await refreshTokens()
    //
    //                 setTimeout(() => navigate('/profile'), 1500)
    //             }
    //         } catch (err) {
    //             console.error('OAuth callback error:', err)
    //             showError('Failed to complete OAuth connection')
    //             setTimeout(() => navigate('/profile'), 2000)
    //         }
    //     }
    //
    //     handleOAuthCallback()
    // }, [code, error, state, navigate, showSuccess, showError, refreshTokens, provider])

    const [searchParams] = useSearchParams()
    const navigate = useNavigate()
    const { refreshTokens } = useAuth()
    const { showSuccess, showError } = useNotification()

    const code = searchParams.get('code')
    const error = searchParams.get('error')
    const state = searchParams.get('state')
    const provider = searchParams.get('provider')

    useEffect(() => {
        const handleOAuthCallback = async () => {
            try {
                if (error) {
                    console.error('OAuth error:', error)
                    showError(`OAuth failed: ${error}`)
                    // Redirect immediately on error
                    navigate('/profile', { replace: true })
                    return
                }

                if (code) {
                    console.log('OAuth code received, refreshing tokens...')

                    // Show success message immediately
                    showSuccess(`${provider ? provider.charAt(0).toUpperCase() + provider.slice(1) : 'Account'} connected successfully!`)

                    // Refresh tokens and wait for completion
                    await refreshTokens()

                    console.log('Tokens refreshed, redirecting to profile...')
                    // Use replace: true to prevent going back to callback page
                    navigate('/profile', { replace: true })
                } else {
                    console.log('No code found in URL, redirecting to profile...')
                    // If no code after a short delay, redirect anyway
                    setTimeout(() => {
                        navigate('/profile', { replace: true })
                    }, 2000)
                }
            } catch (err) {
                console.error('OAuth callback error:', err)
                showError('Failed to complete OAuth connection')
                // Always redirect even on error
                navigate('/profile', { replace: true })
            }
        }

        handleOAuthCallback()
    }, [code, error, state, navigate, showSuccess, showError, refreshTokens, provider])

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.2
            }
        }
    }

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                type: "spring",
                stiffness: 300,
                damping: 30
            }
        }
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4"
        >
            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="glass-card rounded-3xl p-8 shadow-2xl max-w-md w-full mx-4 text-center"
            >
                <motion.div variants={itemVariants} className="mb-6">
                    <div className="flex justify-center mb-4">
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                            <Cloud className="h-8 w-8 text-white" />
                        </div>
                    </div>

                    {error ? (
                        <>
                            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <XCircle className="h-10 w-10 text-red-600" />
                            </div>
                            <h2 className="text-2xl font-bold text-slate-900 mb-2">Connection Failed</h2>
                            <p className="text-slate-600 mb-6">
                                We couldn't connect your account. Please try again.
                            </p>
                        </>
                    ) : code ? (
                        <>
                            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <CheckCircle className="h-10 w-10 text-green-600" />
                            </div>
                            <h2 className="text-2xl font-bold text-slate-900 mb-2">Successfully Connected!</h2>
                            <p className="text-slate-600 mb-6">
                                Your {provider || 'account'} has been connected successfully.
                            </p>
                        </>
                    ) : (
                        <>
                            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Loader className="h-10 w-10 text-blue-600 animate-spin" />
                            </div>
                            <h2 className="text-2xl font-bold text-slate-900 mb-2">Completing Connection</h2>
                            <p className="text-slate-600 mb-6">
                                Please wait while we connect your account...
                            </p>
                        </>
                    )}
                </motion.div>

                <motion.div variants={itemVariants} className="flex justify-center space-x-3 mb-6">
                    <div className={`w-2 h-2 rounded-full bg-blue-500 animate-pulse`}></div>
                    <div className={`w-2 h-2 rounded-full bg-blue-500 animate-pulse`} style={{ animationDelay: '0.2s' }}></div>
                    <div className={`w-2 h-2 rounded-full bg-blue-500 animate-pulse`} style={{ animationDelay: '0.4s' }}></div>
                </motion.div>

                <motion.p variants={itemVariants} className="text-sm text-slate-500">
                    Redirecting you back to the application...
                </motion.p>
            </motion.div>
        </motion.div>
    )
}

export default OAuthCallback