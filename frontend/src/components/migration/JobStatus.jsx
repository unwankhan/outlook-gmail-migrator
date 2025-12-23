// frontend/src/components/migration/JobStatus.jsx
import React from 'react'
import { Play, Pause, StopCircle, RefreshCw, Clock, AlertCircle, CheckCircle } from 'lucide-react'
import { motion } from 'framer-motion'
import ProgressBar from '../dashboard/ProgressBar'

const JobStatus = ({ job, onPause, onResume, onCancel, onRefresh }) => {
    const getStatusConfig = (status) => {
        const configs = {
            completed: {
                color: 'green',
                icon: CheckCircle,
                bg: 'bg-green-100',
                text: 'text-green-800',
                gradient: 'from-green-500 to-green-600'
            },
            in_progress: {
                color: 'blue',
                icon: Play,
                bg: 'bg-blue-100',
                text: 'text-blue-800',
                gradient: 'from-blue-500 to-blue-600'
            },
            failed: {
                color: 'red',
                icon: AlertCircle,
                bg: 'bg-red-100',
                text: 'text-red-800',
                gradient: 'from-red-500 to-red-600'
            },
            pending: {
                color: 'yellow',
                icon: Clock,
                bg: 'bg-yellow-100',
                text: 'text-yellow-800',
                gradient: 'from-yellow-500 to-yellow-600'
            },
            paused: {
                color: 'orange',
                icon: Pause,
                bg: 'bg-orange-100',
                text: 'text-orange-800',
                gradient: 'from-orange-500 to-orange-600'
            },
            cancelled: {
                color: 'gray',
                icon: StopCircle,
                bg: 'bg-gray-100',
                text: 'text-gray-800',
                gradient: 'from-gray-500 to-gray-600'
            }
        }
        return configs[status] || configs.pending
    }

    const getStatusIcon = (status) => {
        const icons = {
            completed: '✅',
            in_progress: '🔄',
            failed: '❌',
            pending: '⏳',
            paused: '⏸️',
            cancelled: '🚫'
        }
        return icons[status] || '❓'
    }

    const config = getStatusConfig(job.status)

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="premium-card p-6"
        >
            <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-slate-900 text-xl">Migration Status</h3>
                <div className="flex items-center space-x-2">
                    <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className={`px-4 py-2 rounded-xl text-sm font-semibold capitalize ${config.bg} ${config.text} border flex items-center space-x-2`}
                    >
                        <span>{getStatusIcon(job.status)}</span>
                        <span>{job.status.replace('_', ' ')}</span>
                    </motion.span>
                </div>
            </div>

            <div className="space-y-6">
                {/* Progress Bar */}
                <div>
                    <ProgressBar
                        progress={job.progress}
                        color={config.color}
                        showLabel={true}
                        size="large"
                    />
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                        <span className="text-slate-600 font-medium">Processed Items:</span>
                        <span className="font-semibold text-slate-900 ml-2">{job.processedItems} / {job.totalItems}</span>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                        <span className="text-slate-600 font-medium">Started:</span>
                        <span className="font-semibold text-slate-900 ml-2">
              {new Date(job.startedAt).toLocaleString()}
            </span>
                    </div>
                </div>

                {/* Status Message */}
                {job.message && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`p-4 rounded-xl border ${
                            job.status === 'completed' ? 'bg-green-50 border-green-200' :
                                job.status === 'failed' ? 'bg-red-50 border-red-200' :
                                    job.status === 'paused' ? 'bg-orange-50 border-orange-200' :
                                        'bg-blue-50 border-blue-200'
                        }`}
                    >
                        <p className={`font-semibold text-center ${
                            job.status === 'completed' ? 'text-green-800' :
                                job.status === 'failed' ? 'text-red-800' :
                                    job.status === 'paused' ? 'text-orange-800' :
                                        'text-blue-800'
                        }`}>
                            {job.message}
                        </p>
                    </motion.div>
                )}

                {/* Action Buttons */}
                <div className="flex justify-center space-x-3">
                    {job.status === 'in_progress' && (
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => onPause(job.jobId)}
                            className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2.5 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl flex items-center"
                        >
                            <Pause className="h-4 w-4 mr-2" />
                            Pause
                        </motion.button>
                    )}

                    {job.status === 'paused' && (
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => onResume(job.jobId)}
                            className="bg-green-500 hover:bg-green-600 text-white px-6 py-2.5 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl flex items-center"
                        >
                            <Play className="h-4 w-4 mr-2" />
                            Resume
                        </motion.button>
                    )}

                    {(job.status === 'in_progress' || job.status === 'paused') && (
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => onCancel(job.jobId)}
                            className="bg-red-500 hover:bg-red-600 text-white px-6 py-2.5 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl flex items-center"
                        >
                            <StopCircle className="h-4 w-4 mr-2" />
                            Cancel
                        </motion.button>
                    )}

                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => onRefresh(job.jobId)}
                        className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-6 py-2.5 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl flex items-center"
                    >
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Refresh
                    </motion.button>
                </div>

                {/* Additional Info */}
                {job.estimatedTime && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center text-sm text-slate-600"
                    >
                        <Clock className="h-4 w-4 inline mr-1" />
                        Estimated time remaining: {job.estimatedTime}
                    </motion.div>
                )}
            </div>
        </motion.div>
    )
}

export default JobStatus