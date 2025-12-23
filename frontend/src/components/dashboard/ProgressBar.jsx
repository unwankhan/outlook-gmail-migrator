// frontend/src/components/dashboard/ProgressBar.jsx
import React from 'react'
import { motion } from 'framer-motion'

const ProgressBar = ({ progress, color = 'blue', size = 'medium', showLabel = false, className = '' }) => {
    const heightClasses = {
        small: 'h-1',
        medium: 'h-2',
        large: 'h-4'
    }

    const colorClasses = {
        blue: 'from-blue-500 to-blue-600',
        green: 'from-green-500 to-green-600',
        red: 'from-red-500 to-red-600',
        yellow: 'from-yellow-500 to-yellow-600',
        purple: 'from-purple-500 to-purple-600'
    }

    return (
        <div className={`w-full ${className}`}>
            {showLabel && (
                <div className="flex justify-between text-sm text-slate-600 mb-2">
                    <span className="font-medium">Progress</span>
                    <span className="font-semibold">{progress}%</span>
                </div>
            )}
            <div className={`w-full bg-slate-200 rounded-full ${heightClasses[size]} overflow-hidden relative`}>
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className={`h-full rounded-full bg-gradient-to-r ${colorClasses[color]} relative overflow-hidden`}
                >
                    {/* Shimmer Effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -skew-x-12 transform translate-x-[-100%] animate-shimmer"></div>
                </motion.div>

                {/* Pulsing glow for active progress */}
                {progress > 0 && progress < 100 && (
                    <motion.div
                        animate={{ opacity: [0.3, 0.7, 0.3] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className={`absolute inset-0 rounded-full bg-gradient-to-r ${colorClasses[color]} blur-sm`}
                        style={{ width: `${progress}%` }}
                    />
                )}
            </div>
        </div>
    )
}

export default ProgressBar








