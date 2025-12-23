// frontend/src/contexts/MigrationContext.jsx
import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react'
import { migrationService } from '../services/migration'
import { useNotification } from './NotificationContext'
import { useWebSocket } from '../hooks/useWebSocket'
import { useAuth } from './AuthContext'

const MigrationContext = createContext()

export const useMigration = () => {
    const context = useContext(MigrationContext)
    if (!context) {
        throw new Error('useMigration must be used within MigrationProvider')
    }
    return context
}

export const MigrationProvider = ({ children }) => {
    const [currentJob, setCurrentJob] = useState(null)
    const [jobs, setJobs] = useState([])
    const [loading, setLoading] = useState(false)
    const { showSuccess, showError, showLoading, dismiss, showInfo, showWarning } = useNotification()
    const { tokens } = useAuth()
    const migratingToastRef = useRef(null)

    // const handleWebSocketMessage = useCallback((data) => {
    //     console.log('🔄 WebSocket update received:', data)
    //
    //     // Update jobs list
    //     setJobs(prev => prev.map(job =>
    //         job.jobId === data.jobId ? { ...job, ...data } : job
    //     ))
    //
    //     // If this update is for the current job, update UI
    //     if (currentJob && data.jobId === currentJob.jobId) {
    //         setCurrentJob(prev => ({ ...prev, ...data }))
    //     }
    //
    //     // Handle job completion/failure
    //     if (data.status === 'completed' || data.status === 'failed' || data.status === 'cancelled') {
    //         try {
    //             if (migratingToastRef.current) {
    //                 dismiss(migratingToastRef.current)
    //                 migratingToastRef.current = null
    //             }
    //
    //             if (data.status === 'completed') {
    //                 showSuccess(`Migration completed! ${data.message || ''}`)
    //             } else if (data.status === 'failed') {
    //                 showError(`Migration failed: ${data.message || 'Unknown error'}`)
    //             } else if (data.status === 'cancelled') {
    //                 showWarning('Migration cancelled')
    //             }
    //         } catch (e) {
    //             console.error('Error handling job completion:', e)
    //         }
    //     }
    // }, [currentJob, dismiss, showSuccess, showError, showWarning])
    const getUserJobs = async () => {
        try {
            const userJobs = await migrationService.getUserJobs()
            setJobs(userJobs)
            return userJobs
        } catch (error) {
            console.error('Failed to fetch user jobs:', error)
            showError('Failed to load migration history')
            return []
        }
    }

    const handleWebSocketMessage = useCallback((data) => {
        console.log('🔄 WebSocket update received:', data)

        // Update jobs list
        setJobs(prev => prev.map(job =>
            job.jobId === data.jobId ? { ...job, ...data } : job
        ))

        // If this update is for the current job, update UI
        if (currentJob && data.jobId === currentJob.jobId) {
            console.log('🎯 Updating current job with WebSocket data:', data)
            setCurrentJob(prev => ({ ...prev, ...data }))
        } else if (data.jobId) {
            // If we don't have current job but received update, set it
            console.log('🎯 Setting new current job from WebSocket:', data)
            setCurrentJob(data)
        }

        // Handle job completion/failure
        if (data.status === 'completed' || data.status === 'failed' || data.status === 'cancelled') {
            try {
                if (migratingToastRef.current) {
                    dismiss(migratingToastRef.current)
                    migratingToastRef.current = null
                }

                if (data.status === 'completed') {
                    showSuccess(`Migration completed! ${data.message || ''}`)
                    // Refresh jobs list
                    getUserJobs()
                } else if (data.status === 'failed') {
                    showError(`Migration failed: ${data.message || 'Unknown error'}`)
                } else if (data.status === 'cancelled') {
                    showWarning('Migration cancelled')
                }
            } catch (e) {
                console.error('Error handling job completion:', e)
            }
        }
    }, [currentJob, dismiss, showSuccess, showError, showWarning, getUserJobs])

    const { isConnected, sendMessage, reconnect } = useWebSocket(handleWebSocketMessage)

    useEffect(() => {
        if (isConnected && tokens) {
            getUserJobs()
        }
    }, [isConnected, tokens])

    const startMigration = async (migrationType) => {
        setLoading(true)

        try {
            if (!tokens?.outlook || !tokens?.gmail) {
                throw new Error('OAuth tokens not found. Please connect both accounts.')
            }

            const migratingToast = showLoading(`Starting ${migrationType} migration...`)
            migratingToastRef.current = migratingToast

            const result = await migrationService.startMigration(migrationType, {
                outlook: tokens.outlook,
                gmail: tokens.gmail
            })

            if (result.jobId) {
                // Set current job immediately
                setCurrentJob({
                    jobId: result.jobId,
                    status: 'in_progress',
                    progress: 0,
                    message: 'Migration starting...',
                    migrationType: migrationType
                })

                // Poll for initial job status
                setTimeout(() => {
                    getJobStatus(result.jobId)
                }, 1000)
            }

            return result
        } catch (error) {
            console.error("Migration failed:", error)
            if (migratingToastRef.current) {
                dismiss(migratingToastRef.current)
                migratingToastRef.current = null
            }
            showError(error?.message || 'Failed to start migration')
            throw error
        } finally {
            setLoading(false)
        }
    }

    const getJobStatus = async (jobId) => {
        try {
            const status = await migrationService.getJobStatus(jobId)
            setCurrentJob(status)
            return status
        } catch (error) {
            console.error('Failed to get job status:', error)
            // Don't throw error here, just log it
            return null
        }
    }



    const pauseMigration = async (jobId) => {
        try {
            const result = await migrationService.pauseMigration(jobId)
            showInfo('Migration paused')
            setTimeout(() => getJobStatus(jobId), 1000)
            return result
        } catch (error) {
            console.error('Failed to pause migration:', error)
            showError(`Failed to pause migration: ${error.message}`)
        }
    }

    const resumeMigration = async (jobId) => {
        try {
            const result = await migrationService.resumeMigration(jobId)
            showInfo('Migration resumed')
            setTimeout(() => getJobStatus(jobId), 1000)
            return result
        } catch (error) {
            console.error('Failed to resume migration:', error)
            showError(`Failed to resume migration: ${error.message}`)
        }
    }

    const cancelMigration = async (jobId) => {
        try {
            const result = await migrationService.cancelMigration(jobId)
            showWarning('Migration cancelled')
            setCurrentJob(null)
            if (migratingToastRef.current) {
                dismiss(migratingToastRef.current)
                migratingToastRef.current = null
            }
            getUserJobs()
            return result
        } catch (error) {
            console.error('Failed to cancel migration:', error)
            showError(`Failed to cancel migration: ${error.message}`)
        }
    }

    const value = {
        currentJob,
        setCurrentJob, // ✅ ADDED: Expose setCurrentJob
        jobs,
        loading,
        startMigration,
        getJobStatus,
        getUserJobs,
        pauseMigration,
        resumeMigration,
        cancelMigration,
        isWebSocketConnected: isConnected,
        reconnectWebSocket: reconnect
    }

    return (
        <MigrationContext.Provider value={value}>
            {children}
        </MigrationContext.Provider>
    )
}
