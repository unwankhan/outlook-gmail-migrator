// frontend/src/components/dashboard/StatsCard.jsx
import React from 'react'
import { motion } from 'framer-motion'

const StatsCard = ({ title, value, icon: Icon, color, trend, description, delay = 0 }) => {
    const colorConfig = {
        blue: { gradient: 'from-blue-500 to-blue-600', bg: 'bg-blue-100', text: 'text-blue-600' },
        green: { gradient: 'from-green-500 to-green-600', bg: 'bg-green-100', text: 'text-green-600' },
        purple: { gradient: 'from-purple-500 to-purple-600', bg: 'bg-purple-100', text: 'text-purple-600' },
        orange: { gradient: 'from-orange-500 to-orange-600', bg: 'bg-orange-100', text: 'text-orange-600' },
        red: { gradient: 'from-red-500 to-red-600', bg: 'bg-red-100', text: 'text-red-600' }
    }

    const config = colorConfig[color] || colorConfig.blue

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay }}
            whileHover={{ scale: 1.02, y: -2 }}
            className="premium-card p-6 relative overflow-hidden group"
        >
            {/* Background Gradient Effect */}
            <div className={`absolute inset-0 bg-gradient-to-br ${config.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}></div>

            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-semibold text-slate-600 mb-1">{title}</p>
                    <p className="text-2xl font-bold text-slate-900">{value}</p>
                    {trend && (
                        <p className={`text-sm font-medium ${trend.startsWith('+') ? 'text-green-600' : 'text-red-600'} flex items-center mt-1`}>
                            {trend.startsWith('+') ? '↗' : '↘'} {trend}
                        </p>
                    )}
                </div>
                <motion.div
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    className={`w-12 h-12 ${config.bg} rounded-xl flex items-center justify-center group-hover:shadow-lg transition-all duration-300`}
                >
                    <Icon className={`h-6 w-6 ${config.text}`} />
                </motion.div>
            </div>
            {description && (
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: delay + 0.1 }}
                    className="text-xs text-slate-500 mt-3"
                >
                    {description}
                </motion.p>
            )}

            {/* Active Pulse Effect */}
            {trend && trend.startsWith('+') && (
                <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute top-2 right-2 w-2 h-2 bg-green-500 rounded-full"
                />
            )}
        </motion.div>
    )
}

export default StatsCard