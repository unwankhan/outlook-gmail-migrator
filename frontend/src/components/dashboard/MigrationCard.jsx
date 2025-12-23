// frontend/src/components/dashboard/MigrationCard.jsx
import React from 'react'
import { Play, Settings, Clock, Cloud, Zap } from 'lucide-react'
import { motion } from 'framer-motion'

const MigrationCard = ({ title, description, icon: Icon, status, progress, onStart, onConfigure }) => {
    const statusConfig = {
        completed: { color: 'from-green-500 to-green-600', bg: 'bg-green-100', text: 'text-green-800' },
        in_progress: { color: 'from-blue-500 to-blue-600', bg: 'bg-blue-100', text: 'text-blue-800' },
        pending: { color: 'from-yellow-500 to-yellow-600', bg: 'bg-yellow-100', text: 'text-yellow-800' },
        failed: { color: 'from-red-500 to-red-600', bg: 'bg-red-100', text: 'text-red-800' }
    }

    const config = statusConfig[status] || { color: 'from-slate-500 to-slate-600', bg: 'bg-slate-100', text: 'text-slate-800' }

    return (
        <motion.div
            whileHover={{ scale: 1.02 }}
            className="premium-card p-6 relative overflow-hidden group"
        >
            {/* Background Gradient Effect */}
            <div className={`absolute inset-0 bg-gradient-to-br ${config.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}></div>

            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                    <motion.div
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg"
                    >
                        <Icon className="h-6 w-6 text-white" />
                    </motion.div>
                    <div>
                        <h3 className="font-bold text-slate-900 text-lg">{title}</h3>
                        <p className="text-sm text-slate-600">{description}</p>
                    </div>
                </div>

                {status && (
                    <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${config.bg} ${config.text} border`}
                    >
                        {status.replace('_', ' ')}
                    </motion.span>
                )}
            </div>

            {progress !== undefined && (
                <div className="mb-4">
                    <div className="flex justify-between text-sm text-slate-600 mb-2">
                        <span className="font-medium">Progress</span>
                        <span className="font-semibold">{progress}%</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 1, ease: "easeOut" }}
                            className={`h-2 rounded-full bg-gradient-to-r ${config.color} relative`}
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -skew-x-12 transform translate-x-[-100%] animate-shimmer"></div>
                        </motion.div>
                    </div>
                </div>
            )}

            <div className="flex space-x-3">
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={onStart}
                    className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white py-2.5 px-4 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center group"
                >
                    <Play className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform" />
                    Start Migration
                </motion.button>
                <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={onConfigure}
                    className="bg-slate-500 hover:bg-slate-600 text-white p-2.5 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center"
                >
                    <Settings className="h-4 w-4" />
                </motion.button>
            </div>

            {/* Active State Indicator */}
            {status === 'in_progress' && (
                <motion.div
                    animate={{ opacity: [1, 0.5, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute top-3 right-3 w-2 h-2 bg-green-500 rounded-full"
                />
            )}
        </motion.div>
    )
}

export default MigrationCard