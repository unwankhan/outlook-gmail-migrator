// frontend/src/components/common/LoadingSpinner.jsx
import React from 'react'
import { motion } from 'framer-motion'

const LoadingSpinner = ({ size = 'medium', color = 'blue', className = '' }) => {
    const sizeClasses = {
        small: 'w-4 h-4',
        medium: 'w-8 h-8',
        large: 'w-12 h-12',
        xl: 'w-16 h-16'
    }

    const colorClasses = {
        blue: 'border-blue-500',
        white: 'border-white',
        gray: 'border-slate-400',
        purple: 'border-purple-500'
    }

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className={`inline-block ${sizeClasses[size]} ${colorClasses[color]} ${className}`}
        >
            <motion.div
                animate={{ rotate: 360 }}
                transition={{
                    duration: 1,
                    repeat: Infinity,
                    ease: "linear"
                }}
                className={`w-full h-full rounded-full border-2 border-t-transparent ${colorClasses[color]}`}
            />
        </motion.div>
    )
}

export default LoadingSpinner