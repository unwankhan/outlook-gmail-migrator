// frontend/src/components/common/Sidebar.jsx
import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
    Cloud,
    Home,
    Settings,
    History,
    User,
    Mail,
    Zap,
    Shield
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const Sidebar = () => {
    const location = useLocation()

    const navigation = [
        { name: 'Dashboard', href: '/', icon: Home },
        { name: 'Migration', href: '/migrate', icon: Cloud },
        { name: 'History', href: '/history', icon: History },
        { name: 'Profile', href: '/profile', icon: User },
        { name: 'Settings', href: '/settings', icon: Settings },
    ]

    const isActive = (path) => location.pathname === path

    return (
        <motion.div
            initial={{ x: -100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="bg-white/80 backdrop-blur-xl shadow-xl border-r border-slate-200 w-64 h-screen fixed left-0 top-0 overflow-y-auto"
        >
            {/* Logo */}
            <div className="p-6 border-b border-slate-200">
                <Link to="/" className="flex items-center space-x-3 no-underline">
                    <motion.div
                        whileHover={{ scale: 1.1 }}
                        className="bg-gradient-to-br from-blue-500 to-purple-600 p-2 rounded-xl shadow-lg"
                    >
                        <Cloud className="h-6 w-6 text-white" />
                    </motion.div>
                    <div>
                        <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                            CloudMigrator Pro
                        </h1>
                        <p className="text-xs text-slate-500 font-medium">Enterprise Suite</p>
                    </div>
                </Link>
            </div>

            {/* Navigation */}
            <nav className="p-4 space-y-2">
                <AnimatePresence>
                    {navigation.map((item, index) => {
                        const Icon = item.icon
                        const active = isActive(item.href)
                        return (
                            <motion.div
                                key={item.name}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.1 }}
                            >
                                <Link
                                    to={item.href}
                                    className={`flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-300 group relative ${
                                        active
                                            ? 'text-blue-600 bg-blue-50 border border-blue-200 shadow-md'
                                            : 'text-slate-600 hover:text-blue-600 hover:bg-slate-50'
                                    }`}
                                >
                                    {active && (
                                        <motion.div
                                            layoutId="sidebarActive"
                                            className="absolute inset-0 bg-blue-50 border border-blue-200 rounded-xl -z-10"
                                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                        />
                                    )}
                                    <Icon className={`h-5 w-5 ${active ? 'text-blue-600' : 'text-slate-500 group-hover:text-blue-600'}`} />
                                    <span>{item.name}</span>
                                </Link>
                            </motion.div>
                        )
                    })}
                </AnimatePresence>
            </nav>

            {/* Support Section */}
            <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-200">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl p-4 text-white relative overflow-hidden"
                >
                    <div className="absolute top-0 right-0 w-16 h-16 bg-white/10 rounded-full -translate-y-8 translate-x-8"></div>
                    <div className="relative z-10">
                        <div className="flex items-center space-x-3 mb-2">
                            <Zap className="h-5 w-5 text-yellow-300" />
                            <span className="font-semibold text-sm">Need Help?</span>
                        </div>
                        <p className="text-blue-100 text-xs mb-3">
                            Our support team is here to help you.
                        </p>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="w-full bg-white text-blue-600 text-xs font-semibold py-2.5 rounded-xl transition-colors hover:bg-blue-50 shadow-lg"
                        >
                            Contact Support
                        </motion.button>
                    </div>
                </motion.div>
            </div>
        </motion.div>
    )
}

export default Sidebar