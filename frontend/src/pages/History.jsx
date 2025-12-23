// frontend/src/pages/History.jsx
import React, { useState, useEffect } from 'react'
import { useMigration } from '../contexts/MigrationContext'
import { useAuth } from '../contexts/AuthContext'
import {
    Calendar,
    Filter,
    Download,
    Play,
    Pause,
    StopCircle,
    CheckCircle,
    XCircle,
    Clock,
    Search,
    RefreshCw,
    BarChart3,
    FileText
} from 'lucide-react'

const History = () => {
    const { jobs, getJobStatus, pauseMigration, resumeMigration, cancelMigration, getUserJobs } = useMigration()
    const { user } = useAuth()
    const [filter, setFilter] = useState('all')
    const [searchTerm, setSearchTerm] = useState('')
    const [loading, setLoading] = useState({})
    const [refreshing, setRefreshing] = useState(false)

    useEffect(() => {
        if (user) {
            loadJobs()
        }
    }, [user])

    const loadJobs = async () => {
        setRefreshing(true)
        try {
            await getUserJobs()
        } catch (error) {
            console.error('Failed to load jobs:', error)
        } finally {
            setRefreshing(false)
        }
    }

    const statusFilters = [
        { value: 'all', label: 'All Migrations', color: 'bg-slate-100 text-slate-800' },
        { value: 'completed', label: 'Completed', color: 'bg-green-100 text-green-800' },
        { value: 'in_progress', label: 'In Progress', color: 'bg-blue-100 text-blue-800' },
        { value: 'failed', label: 'Failed', color: 'bg-red-100 text-red-800' },
        { value: 'pending', label: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
        { value: 'paused', label: 'Paused', color: 'bg-orange-100 text-orange-800' },
        { value: 'cancelled', label: 'Cancelled', color: 'bg-gray-100 text-gray-800' }
    ]

    const migrationTypeLabels = {
        mail: 'Emails',
        contacts: 'Contacts',
        calendar: 'Calendar',
        drive: 'Drive Files',
        all: 'All Data'
    }

    const statusColors = {
        completed: 'bg-green-100 text-green-800',
        in_progress: 'bg-blue-100 text-blue-800',
        failed: 'bg-red-100 text-red-800',
        pending: 'bg-yellow-100 text-yellow-800',
        paused: 'bg-orange-100 text-orange-800',
        cancelled: 'bg-gray-100 text-gray-800'
    }

    const statusIcons = {
        completed: CheckCircle,
        in_progress: Play,
        failed: XCircle,
        pending: Clock,
        paused: Pause,
        cancelled: StopCircle
    }

    const filteredJobs = jobs.filter(job => {
        const matchesFilter = filter === 'all' || job.status === filter
        const matchesSearch = job.migrationType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            job.message?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            job.jobId?.toLowerCase().includes(searchTerm.toLowerCase())
        return matchesFilter && matchesSearch
    })

    const handleRefreshJob = async (jobId) => {
        setLoading(prev => ({ ...prev, [jobId]: true }))
        try {
            await getJobStatus(jobId)
        } catch (error) {
            console.error('Failed to refresh job:', error)
        } finally {
            setLoading(prev => ({ ...prev, [jobId]: false }))
        }
    }

    const handlePause = async (jobId) => {
        setLoading(prev => ({ ...prev, [jobId]: true }))
        try {
            await pauseMigration(jobId)
        } catch (error) {
            console.error('Failed to pause job:', error)
        } finally {
            setLoading(prev => ({ ...prev, [jobId]: false }))
        }
    }

    const handleResume = async (jobId) => {
        setLoading(prev => ({ ...prev, [jobId]: true }))
        try {
            await resumeMigration(jobId)
        } catch (error) {
            console.error('Failed to resume job:', error)
        } finally {
            setLoading(prev => ({ ...prev, [jobId]: false }))
        }
    }

    const handleCancel = async (jobId) => {
        setLoading(prev => ({ ...prev, [jobId]: true }))
        try {
            await cancelMigration(jobId)
        } catch (error) {
            console.error('Failed to cancel job:', error)
        } finally {
            setLoading(prev => ({ ...prev, [jobId]: false }))
        }
    }

    const getStats = () => {
        const total = jobs.length
        const completed = jobs.filter(j => j.status === 'completed').length
        const inProgress = jobs.filter(j => j.status === 'in_progress').length
        const failed = jobs.filter(j => j.status === 'failed').length

        return { total, completed, inProgress, failed }
    }

    const stats = getStats()

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center animate-fade-in">
                <div className="text-center">
                    <Calendar className="h-16 w-16 text-slate-400 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-slate-900 mb-2">Please Sign In</h2>
                    <p className="text-slate-600">Sign in to view your migration history</p>
                </div>
            </div>
        )
    }

    return (
        <div className="max-w-7xl mx-auto px-4 py-8 animate-fade-in">
            <div className="mb-8">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent mb-2">
                            Migration History
                        </h1>
                        <p className="text-slate-600 text-lg">Track and manage all your migration jobs</p>
                    </div>
                    <button
                        onClick={loadJobs}
                        disabled={refreshing}
                        className="bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white px-4 py-2.5 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl flex items-center hover-scale"
                    >
                        <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                        Refresh
                    </button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 animate-stagger">
                    {[
                        { label: 'Total', value: stats.total, color: 'bg-blue-500', icon: BarChart3 },
                        { label: 'Completed', value: stats.completed, color: 'bg-green-500', icon: CheckCircle },
                        { label: 'In Progress', value: stats.inProgress, color: 'bg-blue-500', icon: Play },
                        { label: 'Failed', value: stats.failed, color: 'bg-red-500', icon: XCircle }
                    ].map((stat, index) => {
                        const Icon = stat.icon
                        return (
                            <div
                                key={stat.label}
                                className="bg-white rounded-2xl p-4 shadow-lg border border-slate-200 animate-fade-in"
                                style={{ animationDelay: `${index * 100}ms` }}
                            >
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-semibold text-slate-600">{stat.label}</p>
                                        <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
                                    </div>
                                    <div className={`w-10 h-10 ${stat.color} rounded-xl flex items-center justify-center`}>
                                        <Icon className="h-5 w-5 text-white" />
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>

            <div className="premium-card p-6 mb-6 animate-slide-up">
                <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
                    <div className="flex flex-wrap gap-2">
                        {statusFilters.map((status) => (
                            <button
                                key={status.value}
                                onClick={() => setFilter(status.value)}
                                className={`px-4 py-2 rounded-xl font-semibold transition-all duration-300 hover-scale ${
                                    filter === status.value
                                        ? 'bg-blue-500 text-white shadow-lg'
                                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                                }`}
                            >
                                {status.label}
                            </button>
                        ))}
                    </div>

                    <div className="relative w-full md:w-64">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search migrations..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 bg-white/50 backdrop-blur-sm"
                        />
                    </div>
                </div>
            </div>

            <div className="premium-card overflow-hidden animate-fade-in">
                {filteredJobs.length > 0 ? (
                    <div className="divide-y divide-slate-200">
                        {filteredJobs.map((job, index) => {
                            const StatusIcon = statusIcons[job.status] || Clock
                            return (
                                <div
                                    key={job.jobId}
                                    className="p-6 hover:bg-slate-50 transition-colors duration-300 animate-fade-in"
                                    style={{ animationDelay: `${index * 50}ms` }}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-4">
                                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                                                job.status === 'completed' ? 'bg-green-100' :
                                                    job.status === 'failed' ? 'bg-red-100' :
                                                        job.status === 'in_progress' ? 'bg-blue-100' :
                                                            'bg-slate-100'
                                            }`}>
                                                <StatusIcon className={`h-6 w-6 ${
                                                    job.status === 'completed' ? 'text-green-600' :
                                                        job.status === 'failed' ? 'text-red-600' :
                                                            job.status === 'in_progress' ? 'text-blue-600' :
                                                                'text-slate-600'
                                                }`} />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-slate-900 text-lg capitalize">
                                                    {migrationTypeLabels[job.migrationType] || job.migrationType} Migration
                                                </h3>
                                                <p className="text-slate-600">{job.message}</p>
                                                <div className="flex items-center space-x-4 mt-1 text-sm text-slate-500">
                                                    <span>Started: {new Date(job.startedAt).toLocaleString()}</span>
                                                    {job.updatedAt && (
                                                        <span>Updated: {new Date(job.updatedAt).toLocaleString()}</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center space-x-4">
                                            <span className={`px-3 py-1.5 rounded-full text-sm font-semibold capitalize ${
                                                statusColors[job.status] || 'bg-slate-100 text-slate-800'
                                            }`}>
                                                {job.status.replace('_', ' ')}
                                            </span>

                                            {job.status === 'in_progress' && (
                                                <div className="w-24 bg-slate-200 rounded-full h-2">
                                                    <div
                                                        className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                                                        style={{ width: `${job.progress}%` }}
                                                    />
                                                </div>
                                            )}

                                            <div className="flex items-center space-x-2">
                                                {job.status === 'in_progress' && (
                                                    <button
                                                        onClick={() => handlePause(job.jobId)}
                                                        disabled={loading[job.jobId]}
                                                        className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors duration-300 hover-scale"
                                                        title="Pause"
                                                    >
                                                        <Pause className="h-4 w-4" />
                                                    </button>
                                                )}

                                                {job.status === 'paused' && (
                                                    <button
                                                        onClick={() => handleResume(job.jobId)}
                                                        disabled={loading[job.jobId]}
                                                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors duration-300 hover-scale"
                                                        title="Resume"
                                                    >
                                                        <Play className="h-4 w-4" />
                                                    </button>
                                                )}

                                                {(job.status === 'in_progress' || job.status === 'paused') && (
                                                    <button
                                                        onClick={() => handleCancel(job.jobId)}
                                                        disabled={loading[job.jobId]}
                                                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-300 hover-scale"
                                                        title="Cancel"
                                                    >
                                                        <StopCircle className="h-4 w-4" />
                                                    </button>
                                                )}

                                                <button
                                                    onClick={() => handleRefreshJob(job.jobId)}
                                                    disabled={loading[job.jobId]}
                                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-300 hover-scale"
                                                    title="Refresh"
                                                >
                                                    <RefreshCw className={`h-4 w-4 ${loading[job.jobId] ? 'animate-spin' : ''}`} />
                                                </button>

                                                <button
                                                    className="p-2 text-slate-600 hover:bg-slate-50 rounded-lg transition-colors duration-300 hover-scale"
                                                    title="Download Report"
                                                >
                                                    <Download className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {(job.totalItems > 0 || job.processedItems > 0) && (
                                        <div className="mt-4 flex items-center space-x-4 text-sm text-slate-600">
                                            <span>Processed: {job.processedItems} of {job.totalItems} items</span>
                                            <span>Progress: {job.progress}%</span>
                                        </div>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                ) : (
                    <div className="text-center py-12 animate-fade-in">
                        <FileText className="h-16 w-16 text-slate-400 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-slate-900 mb-2">No migrations found</h3>
                        <p className="text-slate-600 mb-6">
                            {searchTerm || filter !== 'all'
                                ? 'Try adjusting your search or filter criteria'
                                : 'Get started by creating your first migration job'
                            }
                        </p>
                        {!searchTerm && filter === 'all' && (
                            <button
                                onClick={() => window.location.href = '/migrate'}
                                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl hover-scale"
                            >
                                Start Your First Migration
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}

export default History