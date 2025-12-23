// frontend/src/components/common/Header.jsx
import React, { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { useMigration } from '../../contexts/MigrationContext'
import {
    Cloud,
    Menu,
    X,
    User,
    LogOut,
    Wifi,
    WifiOff,
    RefreshCw,
    Settings,
    History,
    Home
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const Header = () => {
    const { user, logout, backendStatus, checkBackendStatus } = useAuth()
    const { isWebSocketConnected } = useMigration()
    const location = useLocation()
    const navigate = useNavigate()
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const [scrolled, setScrolled] = useState(false)



    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20)
        }
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    const navigation = [
        { name: 'Dashboard', href: '/', icon: Home },
        { name: 'Migrate', href: '/migrate', icon: Cloud },
        { name: 'History', href: '/history', icon: History },
        { name: 'Profile', href: '/profile', icon: User },
    ]

    const isActive = (path) => location.pathname === path

    const mobileMenuVariants = {
        closed: {
            opacity: 0,
            scale: 0.95,
            transition: {
                duration: 0.2
            }
        },
        open: {
            opacity: 1,
            scale: 1,
            transition: {
                duration: 0.3
            }
        }
    }

    return (
        <motion.header
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
                scrolled
                    ? 'bg-white/80 backdrop-blur-xl shadow-lg border-b border-slate-200'
                    : 'bg-transparent'
            }`}
        >
            <div className="container mx-auto px-4">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <motion.div whileHover={{ scale: 1.05 }} className="flex items-center space-x-3">
                        <Link to="/" className="flex items-center space-x-3 no-underline">
                            <div className="relative">
                                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                                    <Cloud className="h-6 w-6 text-white" />
                                </div>
                                <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl blur opacity-20"></div>
                            </div>
                            <div>
                                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                    CloudMigrator Pro
                                </h1>
                            </div>
                        </Link>
                    </motion.div>

                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex items-center space-x-1">
                        {navigation.map((item) => {
                            const Icon = item.icon
                            return (
                                <Link
                                    key={item.name}
                                    to={item.href}
                                    className={`relative px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 group ${
                                        isActive(item.href)
                                            ? 'text-blue-600 bg-blue-50 border border-blue-200'
                                            : 'text-slate-600 hover:text-blue-600 hover:bg-slate-50'
                                    }`}
                                >
                                    <div className="flex items-center space-x-2">
                                        <Icon className="h-4 w-4" />
                                        <span>{item.name}</span>
                                    </div>
                                    {isActive(item.href) && (
                                        <motion.div
                                            layoutId="activeIndicator"
                                            className="absolute inset-0 bg-blue-50 border border-blue-200 rounded-xl -z-10"
                                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                        />
                                    )}
                                </Link>
                            )
                        })}
                    </nav>

                    {/* Right Section */}
                    <div className="flex items-center space-x-4">
                        {/* WebSocket Status - Medium screens pe */}
                        <div className="hidden lg:flex items-center">
                            <div className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-sm font-medium ${
                                isWebSocketConnected
                                    ? 'bg-green-50 text-green-700 border border-green-200'
                                    : 'bg-red-50 text-red-700 border border-red-200'
                            }`}>
                                {isWebSocketConnected ? (
                                    <>
                                        <Wifi className="h-3 w-3" />
                                        <span>Live Updates</span>
                                    </>
                                ) : (
                                    <>
                                        <WifiOff className="h-3 w-3" />
                                        <span>Offline</span>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Backend Status - Large screens pe */}
                        <div className="hidden xl:flex items-center space-x-4">
                            {backendStatus === 'offline' && (
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className="flex items-center space-x-2 bg-red-50 text-red-700 px-3 py-1.5 rounded-lg border border-red-200"
                                >
                                    <WifiOff className="h-4 w-4" />
                                    <span className="text-sm font-medium">Backend Offline</span>
                                    <button
                                        onClick={checkBackendStatus}
                                        className="text-red-600 hover:text-red-800 transition-colors"
                                    >
                                        <RefreshCw className="h-3 w-3" />
                                    </button>
                                </motion.div>
                            )}

                            {backendStatus === 'online' && (
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className="flex items-center space-x-2 bg-green-50 text-green-700 px-3 py-1.5 rounded-lg border border-green-200"
                                >
                                    <Wifi className="h-4 w-4" />
                                    <span className="text-sm font-medium">Backend Online</span>
                                </motion.div>
                            )}
                        </div>

                        <div className="flex items-center space-x-3">
                            {user ? (
                                <>
                                    <div className="hidden md:flex items-center space-x-3">
                    <span className="text-sm text-slate-700 font-medium">
                      Welcome, {user.name || user.email?.split('@')[0]}
                    </span>
                                        <motion.button
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={logout}
                                            className="bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white px-4 py-2 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl flex items-center"
                                        >
                                            <LogOut className="h-4 w-4 mr-2" />
                                            Sign Out
                                        </motion.button>
                                    </div>
                                </>
                            ) : (
                                <div className="hidden md:flex items-center space-x-3">
                                    <Link
                                        to="/login"
                                        className="text-slate-600 hover:text-blue-600 font-semibold transition-colors px-4 py-2 rounded-xl hover:bg-slate-50"
                                    >
                                        Sign In
                                    </Link>
                                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                        <Link
                                            to="/signup"
                                            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-6 py-2.5 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl"
                                        >
                                            Sign Up
                                        </Link>
                                    </motion.div>
                                </div>
                            )}

                            {/* Mobile Menu Button */}
                            <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => setIsMenuOpen(!isMenuOpen)}
                                className="md:hidden p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
                            >
                                {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                            </motion.button>
                        </div>
                    </div>
                </div>

                {/* Mobile Menu */}
                <AnimatePresence>
                    {isMenuOpen && (
                        <motion.div
                            variants={mobileMenuVariants}
                            initial="closed"
                            animate="open"
                            exit="closed"
                            className="md:hidden absolute top-16 left-4 right-4 bg-white/95 backdrop-blur-xl rounded-2xl shadow-xl border border-slate-200 p-6"
                        >
                            <div className="space-y-4">
                                {navigation.map((item) => {
                                    const Icon = item.icon
                                    return (
                                        <Link
                                            key={item.name}
                                            to={item.href}
                                            onClick={() => setIsMenuOpen(false)}
                                            className={`flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-300 ${
                                                isActive(item.href)
                                                    ? 'text-blue-600 bg-blue-50 border border-blue-200'
                                                    : 'text-slate-600 hover:text-blue-600 hover:bg-slate-50'
                                            }`}
                                        >
                                            <Icon className="h-5 w-5" />
                                            <span>{item.name}</span>
                                        </Link>
                                    )
                                })}

                                {/* Mobile User Section */}
                                <div className="pt-4 border-t border-slate-200">
                                    {user ? (
                                        <div className="space-y-3">
                                            <div className="flex items-center space-x-3 px-4 py-3">
                                                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                                                    <User className="h-4 w-4 text-white" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-semibold text-slate-900 truncate">
                                                        {user.name || user.email}
                                                    </p>
                                                    <p className="text-xs text-slate-500">{user.email}</p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => {
                                                    logout()
                                                    setIsMenuOpen(false)
                                                }}
                                                className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-semibold text-red-600 bg-red-50 border border-red-200 hover:bg-red-100 transition-colors"
                                            >
                                                <LogOut className="h-5 w-5" />
                                                <span>Sign Out</span>
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            <Link
                                                to="/login"
                                                onClick={() => setIsMenuOpen(false)}
                                                className="block w-full text-center px-4 py-3 rounded-xl text-sm font-semibold text-slate-600 bg-slate-50 border border-slate-200 hover:bg-slate-100 transition-colors"
                                            >
                                                Sign In
                                            </Link>
                                            <Link
                                                to="/signup"
                                                onClick={() => setIsMenuOpen(false)}
                                                className="block w-full text-center px-4 py-3 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 transition-all duration-300 shadow-lg"
                                            >
                                                Sign Up
                                            </Link>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </motion.header>
    )
}

export default Header