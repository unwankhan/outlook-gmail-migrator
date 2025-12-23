// frontend/src/components/auth/SignupForm.jsx - UPDATED
import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { Eye, EyeOff, Mail, Lock, User, ArrowRight, Cloud, Sparkles } from 'lucide-react'
import { motion } from 'framer-motion'

const SignupForm = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: ''
    })
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [loading, setLoading] = useState(false)
    const [errors, setErrors] = useState({})
    const [isFocused, setIsFocused] = useState({})
    const { signup } = useAuth()
    const navigate = useNavigate()

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: value
        }))

        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }))
        }
    }

    const handleFocus = (field) => {
        setIsFocused(prev => ({ ...prev, [field]: true }))
    }

    const handleBlur = (field) => {
        setIsFocused(prev => ({ ...prev, [field]: false }))
    }

    const validateForm = () => {
        const newErrors = {}

        if (!formData.name.trim()) {
            newErrors.name = 'Name is required'
        } else if (formData.name.trim().length < 2) {
            newErrors.name = 'Name must be at least 2 characters'
        }

        if (!formData.email.trim()) {
            newErrors.email = 'Email is required'
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Email is invalid'
        }

        if (!formData.password) {
            newErrors.password = 'Password is required'
        } else if (formData.password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters'
        } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
            newErrors.password = 'Password must contain uppercase, lowercase, and number'
        }

        if (!formData.confirmPassword) {
            newErrors.confirmPassword = 'Please confirm your password'
        } else if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match'
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!validateForm()) {
            return
        }

        setLoading(true)

        try {
            const result = await signup({
                name: formData.name,
                email: formData.email,
                password: formData.password
            })

            if (result.success) {
                // Redirect to dashboard after successful signup
                navigate('/login')
            }
        } catch (error) {
            console.error('Signup error:', error)
            // Error is already handled in AuthContext
        } finally {
            setLoading(false)
        }
    }

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
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

    const features = [
        { name: 'Secure Migration', description: 'Enterprise-grade security' },
        { name: 'Real-time Progress', description: 'Live status updates' },
        { name: 'Multi-platform', description: 'Outlook to Gmail' }
    ]

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8"
        >
            <div className="max-w-md w-full space-y-8">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="text-center"
                >
                    <div className="flex justify-center mb-6">
                        <motion.div
                            animate={{
                                rotate: [0, 5, -5, 0],
                                scale: [1, 1.1, 1]
                            }}
                            transition={{
                                duration: 2,
                                repeat: Infinity,
                                repeatType: "reverse"
                            }}
                            className="relative"
                        >
                            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-xl">
                                <Cloud className="h-8 w-8 text-white" />
                            </div>
                            <div className="absolute -top-1 -right-1">
                                <Sparkles className="h-5 w-5 text-yellow-400" />
                            </div>
                        </motion.div>
                    </div>
                    <h2 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent mb-2">
                        Create Account
                    </h2>
                    <p className="text-slate-600 text-lg">
                        Join CloudMigrator Pro today
                    </p>
                </motion.div>

                {/* Signup Form */}
                <motion.form
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    onSubmit={handleSubmit}
                    className="mt-8 space-y-6 glass-card rounded-3xl p-8 shadow-2xl"
                >
                    {/* Name Field */}
                    <motion.div variants={itemVariants}>
                        <label htmlFor="name" className="block text-sm font-semibold text-slate-700 mb-3">
                            Full Name
                        </label>
                        <div className="relative">
                            <div className={`absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none transition-colors ${
                                isFocused.name ? 'text-blue-500' : errors.name ? 'text-red-500' : 'text-slate-400'
                            }`}>
                                <User className="h-5 w-5" />
                            </div>
                            <input
                                id="name"
                                name="name"
                                type="text"
                                required
                                value={formData.name}
                                onChange={handleChange}
                                onFocus={() => handleFocus('name')}
                                onBlur={() => handleBlur('name')}
                                className={`block w-full pl-10 pr-4 py-4 border-2 rounded-xl placeholder-slate-400 focus:outline-none transition-all duration-300 bg-white/50 backdrop-blur-sm ${
                                    errors.name
                                        ? 'border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-200'
                                        : 'border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500'
                                }`}
                                placeholder="Enter your full name"
                            />
                        </div>
                        {errors.name && (
                            <motion.p
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                className="mt-2 text-sm text-red-600"
                            >
                                {errors.name}
                            </motion.p>
                        )}
                    </motion.div>

                    {/* Email Field */}
                    <motion.div variants={itemVariants}>
                        <label htmlFor="email" className="block text-sm font-semibold text-slate-700 mb-3">
                            Email Address
                        </label>
                        <div className="relative">
                            <div className={`absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none transition-colors ${
                                isFocused.email ? 'text-blue-500' : errors.email ? 'text-red-500' : 'text-slate-400'
                            }`}>
                                <Mail className="h-5 w-5" />
                            </div>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                required
                                value={formData.email}
                                onChange={handleChange}
                                onFocus={() => handleFocus('email')}
                                onBlur={() => handleBlur('email')}
                                className={`block w-full pl-10 pr-4 py-4 border-2 rounded-xl placeholder-slate-400 focus:outline-none transition-all duration-300 bg-white/50 backdrop-blur-sm ${
                                    errors.email
                                        ? 'border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-200'
                                        : 'border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500'
                                }`}
                                placeholder="Enter your email"
                            />
                        </div>
                        {errors.email && (
                            <motion.p
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                className="mt-2 text-sm text-red-600"
                            >
                                {errors.email}
                            </motion.p>
                        )}
                    </motion.div>

                    {/* Password Field */}
                    <motion.div variants={itemVariants}>
                        <label htmlFor="password" className="block text-sm font-semibold text-slate-700 mb-3">
                            Password
                        </label>
                        <div className="relative">
                            <div className={`absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none transition-colors ${
                                isFocused.password ? 'text-blue-500' : errors.password ? 'text-red-500' : 'text-slate-400'
                            }`}>
                                <Lock className="h-5 w-5" />
                            </div>
                            <input
                                id="password"
                                name="password"
                                type={showPassword ? 'text' : 'password'}
                                required
                                value={formData.password}
                                onChange={handleChange}
                                onFocus={() => handleFocus('password')}
                                onBlur={() => handleBlur('password')}
                                className={`block w-full pl-10 pr-12 py-4 border-2 rounded-xl placeholder-slate-400 focus:outline-none transition-all duration-300 bg-white/50 backdrop-blur-sm ${
                                    errors.password
                                        ? 'border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-200'
                                        : 'border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500'
                                }`}
                                placeholder="Create a password"
                            />
                            <motion.button
                                type="button"
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                            >
                                {showPassword ? (
                                    <EyeOff className="h-5 w-5" />
                                ) : (
                                    <Eye className="h-5 w-5" />
                                )}
                            </motion.button>
                        </div>
                        {errors.password && (
                            <motion.p
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                className="mt-2 text-sm text-red-600"
                            >
                                {errors.password}
                            </motion.p>
                        )}
                    </motion.div>

                    {/* Confirm Password Field */}
                    <motion.div variants={itemVariants}>
                        <label htmlFor="confirmPassword" className="block text-sm font-semibold text-slate-700 mb-3">
                            Confirm Password
                        </label>
                        <div className="relative">
                            <div className={`absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none transition-colors ${
                                isFocused.confirmPassword ? 'text-blue-500' : errors.confirmPassword ? 'text-red-500' : 'text-slate-400'
                            }`}>
                                <Lock className="h-5 w-5" />
                            </div>
                            <input
                                id="confirmPassword"
                                name="confirmPassword"
                                type={showConfirmPassword ? 'text' : 'password'}
                                required
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                onFocus={() => handleFocus('confirmPassword')}
                                onBlur={() => handleBlur('confirmPassword')}
                                className={`block w-full pl-10 pr-12 py-4 border-2 rounded-xl placeholder-slate-400 focus:outline-none transition-all duration-300 bg-white/50 backdrop-blur-sm ${
                                    errors.confirmPassword
                                        ? 'border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-200'
                                        : 'border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500'
                                }`}
                                placeholder="Confirm your password"
                            />
                            <motion.button
                                type="button"
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                            >
                                {showConfirmPassword ? (
                                    <EyeOff className="h-5 w-5" />
                                ) : (
                                    <Eye className="h-5 w-5" />
                                )}
                            </motion.button>
                        </div>
                        {errors.confirmPassword && (
                            <motion.p
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                className="mt-2 text-sm text-red-600"
                            >
                                {errors.confirmPassword}
                            </motion.p>
                        )}
                    </motion.div>

                    {/* Submit Button */}
                    <motion.div variants={itemVariants}>
                        <motion.button
                            type="submit"
                            disabled={loading}
                            whileHover={{ scale: loading ? 1 : 1.02 }}
                            whileTap={{ scale: loading ? 1 : 0.98 }}
                            className="group relative w-full flex justify-center py-4 px-4 border border-transparent text-sm font-semibold rounded-xl text-white bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-xl overflow-hidden"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 transform translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>

                            {loading ? (
                                <div className="flex items-center">
                                    <motion.div
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                        className="rounded-full h-5 w-5 border-b-2 border-white mr-3"
                                    />
                                    Creating account...
                                </div>
                            ) : (
                                <div className="flex items-center">
                                    Create Account
                                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                </div>
                            )}
                        </motion.button>
                    </motion.div>

                    {/* Sign In Link */}
                    <motion.div variants={itemVariants} className="text-center pt-4">
                        <p className="text-slate-600">
                            Already have an account?{' '}
                            <Link
                                to="/login"
                                className="font-semibold text-blue-600 hover:text-blue-500 transition-colors duration-300 hover:underline"
                            >
                                Sign in here
                            </Link>
                        </p>
                    </motion.div>
                </motion.form>

                {/* Features Grid */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8"
                >
                    {features.map((feature, index) => (
                        <motion.div
                            key={feature.name}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.7 + index * 0.1 }}
                            className="text-center p-4 bg-white/50 backdrop-blur-sm rounded-xl border border-slate-200 hover-lift"
                        >
                            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mx-auto mb-2">
                                <Cloud className="h-4 w-4 text-white" />
                            </div>
                            <h3 className="text-sm font-semibold text-slate-900">{feature.name}</h3>
                            <p className="text-xs text-slate-600 mt-1">{feature.description}</p>
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </motion.div>
    )
}

export default SignupForm