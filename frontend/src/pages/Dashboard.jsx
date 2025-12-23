
// frontend/src/pages/Dashboard.jsx
import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useMigration } from '../contexts/MigrationContext'
import {
    Cloud,
    Mail,
    Users,
    Calendar,
    FileText,
    TrendingUp,
    Clock,
    CheckCircle,
    AlertCircle,
    Play,
    ArrowRight,
    BarChart3,
    Shield,
    Zap,
    Wifi,
    WifiOff,
    Sparkles,
    Database,
    Server
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const Dashboard = () => {
    const { user, tokens } = useAuth()
    const { jobs, currentJob, isWebSocketConnected } = useMigration()
    const navigate = useNavigate()
    const [stats, setStats] = useState({
        totalMigrations: 0,
        successful: 0,
        inProgress: 0,
        dataMigrated: 0
    })
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        if (!user) return

        const timer = setTimeout(() => setIsLoading(false), 1000)

        const totalJobs = jobs.length
        const completed = jobs.filter(j => ['completed', 'success'].includes((j.status || '').toLowerCase())).length
        const inProgress = jobs.filter(j => ['in_progress', 'in-progress', 'running', 'processing'].includes((j.status || '').toLowerCase())).length

        setStats({
            totalMigrations: totalJobs,
            successful: completed,
            inProgress,
            dataMigrated: completed * 150
        })

        return () => clearTimeout(timer)
    }, [jobs, user])

    const quickActions = [
        {
            title: 'Start New Migration',
            description: 'Begin migrating your data from Outlook to Gmail',
            icon: Play,
            color: 'from-blue-500 to-blue-600',
            action: () => navigate('/migrate'),
            enabled: tokens.outlook && tokens.gmail
        },
        {
            title: 'View Migration History',
            description: 'Check status of previous migrations',
            icon: Clock,
            color: 'from-green-500 to-green-600',
            action: () => navigate('/history'),
            enabled: true
        },
        {
            title: 'Account Settings',
            description: 'Manage connected accounts and preferences',
            icon: Shield,
            color: 'from-purple-500 to-purple-600',
            action: () => navigate('/profile'),
            enabled: true
        }
    ]

    const migrationTypes = [
        {
            type: 'mail',
            name: 'Emails',
            icon: Mail,
            description: 'Migrate emails and folders',
            migrated: 45,
            color: 'bg-blue-500'
        },
        {
            type: 'contacts',
            name: 'Contacts',
            icon: Users,
            description: 'Transfer contact lists',
            migrated: 23,
            color: 'bg-green-500'
        },
        {
            type: 'calendar',
            name: 'Calendar',
            icon: Calendar,
            description: 'Move events and appointments',
            migrated: 15,
            color: 'bg-purple-500'
        },
        {
            type: 'drive',
            name: 'Drive Files',
            icon: FileText,
            description: 'Transfer documents and files',
            migrated: 8,
            color: 'bg-orange-500'
        }
    ]

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

    const statCardVariants = {
        hidden: { opacity: 0, scale: 0.8 },
        visible: {
            opacity: 1,
            scale: 1,
            transition: {
                type: "spring",
                stiffness: 300,
                damping: 30
            }
        }
    }

    if (!user) {
        return (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="min-h-screen flex items-center justify-center"
            >
                <div className="text-center">
                    <Cloud className="h-16 w-16 text-slate-400 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-slate-900 mb-2">Welcome to CloudMigrator Pro</h2>
                    <p className="text-slate-600 mb-6">Please sign in to access your dashboard</p>
                    <Link
                        to="/login"
                        className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl inline-flex items-center"
                    >
                        Sign In
                        <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                </div>
            </motion.div>
        )
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="max-w-7xl mx-auto px-4 py-8"
        >
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8"
            >
                <div className="flex justify-between items-start">
                    <div>
                        <motion.h1
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.1 }}
                            className="text-4xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent mb-2"
                        >
                            Welcome back, {user.name || user.email?.split('@')[0]}! 👋
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="text-slate-600 text-lg"
                        >
                            Ready to migrate your data? Everything is looking good.
                        </motion.p>
                    </div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.3 }}
                        className={`flex items-center px-4 py-2 rounded-xl font-medium ${
                            isWebSocketConnected
                                ? 'bg-green-50 text-green-700 border border-green-200'
                                : 'bg-red-50 text-red-700 border border-red-200'
                        }`}
                    >
                        {isWebSocketConnected ? (
                            <>
                                <Wifi className="h-4 w-4 mr-2" />
                                <span className="text-sm">Live Updates</span>
                            </>
                        ) : (
                            <>
                                <WifiOff className="h-4 w-4 mr-2" />
                                <span className="text-sm">Offline</span>
                            </>
                        )}
                    </motion.div>
                </div>
            </motion.div>

            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
            >
                <motion.div variants={statCardVariants}>
                    <div className="premium-card p-6 relative overflow-hidden group">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-semibold text-slate-600 mb-1">Total Migrations</p>
                                <p className="text-3xl font-bold text-slate-900">{stats.totalMigrations}</p>
                            </div>
                            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                <TrendingUp className="h-6 w-6 text-blue-600" />
                            </div>
                        </div>
                        <div className="mt-4 flex items-center text-sm text-green-600">
                            <TrendingUp className="h-4 w-4 mr-1" />
                            <span>All systems operational</span>
                        </div>
                    </div>
                </motion.div>

                <motion.div variants={statCardVariants}>
                    <div className="premium-card p-6 relative overflow-hidden group">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-semibold text-slate-600 mb-1">Successful</p>
                                <p className="text-3xl font-bold text-green-600">{stats.successful}</p>
                            </div>
                            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                <CheckCircle className="h-6 w-6 text-green-600" />
                            </div>
                        </div>
                        <div className="mt-4">
                            <div className="w-full bg-slate-200 rounded-full h-2">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${stats.totalMigrations > 0 ? (stats.successful / stats.totalMigrations) * 100 : 0}%` }}
                                    transition={{ duration: 1, delay: 0.5 }}
                                    className="bg-green-500 h-2 rounded-full"
                                />
                            </div>
                        </div>
                    </div>
                </motion.div>

                <motion.div variants={statCardVariants}>
                    <div className="premium-card p-6 relative overflow-hidden group">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-semibold text-slate-600 mb-1">In Progress</p>
                                <p className="text-3xl font-bold text-blue-600">{stats.inProgress}</p>
                            </div>
                            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                <Clock className="h-6 w-6 text-blue-600" />
                            </div>
                        </div>
                        <div className="mt-4 text-sm text-blue-600 font-semibold">
                            Active migrations running
                        </div>
                    </div>
                </motion.div>

                <motion.div variants={statCardVariants}>
                    <div className="premium-card p-6 relative overflow-hidden group">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-semibold text-slate-600 mb-1">Data Migrated</p>
                                <p className="text-3xl font-bold text-purple-600">{stats.dataMigrated}+ MB</p>
                            </div>
                            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                <Database className="h-6 w-6 text-purple-600" />
                            </div>
                        </div>
                        <div className="mt-4 text-sm text-slate-600">
                            Across all migrations
                        </div>
                    </div>
                </motion.div>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                    >
                        <div className="premium-card p-6">
                            <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center">
                                <Zap className="h-5 w-5 text-yellow-500 mr-2" />
                                Quick Actions
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {quickActions.map((action, index) => {
                                    const Icon = action.icon
                                    return (
                                        <motion.button
                                            key={index}
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={action.action}
                                            disabled={!action.enabled}
                                            className={`p-4 rounded-xl border-2 text-left transition-all duration-300 group ${
                                                action.enabled
                                                    ? 'border-slate-200 hover:border-blue-300 bg-white hover-lift'
                                                    : 'border-slate-100 bg-slate-50 opacity-50 cursor-not-allowed'
                                            }`}
                                        >
                                            <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${action.color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300`}>
                                                <Icon className="h-6 w-6 text-white" />
                                            </div>
                                            <h3 className="font-semibold text-slate-900 mb-1">{action.title}</h3>
                                            <p className="text-sm text-slate-600">{action.description}</p>
                                            {!action.enabled && (
                                                <p className="text-xs text-red-500 mt-2 flex items-center">
                                                    <AlertCircle className="h-3 w-3 mr-1" />
                                                    Connect accounts first
                                                </p>
                                            )}
                                        </motion.button>
                                    )
                                })}
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                    >
                        <div className="premium-card p-6">
                            <h2 className="text-xl font-bold text-slate-900 mb-6">Recent Activity</h2>
                            <AnimatePresence>
                                {jobs.length > 0 ? (
                                    <div className="space-y-4">
                                        {jobs.slice(0, 5).map((job, index) => (
                                            <motion.div
                                                key={job.jobId}
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: index * 0.1 }}
                                                className="flex items-center justify-between p-4 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
                                            >
                                                <div className="flex items-center space-x-4">
                                                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                                                        job.status === 'completed' ? 'bg-green-100' :
                                                            job.status === 'failed' ? 'bg-red-100' :
                                                                'bg-blue-100'
                                                    }`}>
                                                        <Cloud className={`h-5 w-5 ${
                                                            job.status === 'completed' ? 'text-green-600' :
                                                                job.status === 'failed' ? 'text-red-600' :
                                                                    'text-blue-600'
                                                        }`} />
                                                    </div>
                                                    <div>
                                                        <h4 className="font-semibold text-slate-900 capitalize">
                                                            {job.migrationType} Migration
                                                        </h4>
                                                        <p className="text-sm text-slate-600">{job.message}</p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${
                                                        job.status === 'completed' ? 'bg-green-100 text-green-800' :
                                                            job.status === 'failed' ? 'bg-red-100 text-red-800' :
                                                                'bg-blue-100 text-blue-800'
                                                    }`}>
                                                        {job.status.replace('_', ' ')}
                                                    </span>
                                                    <p className="text-xs text-slate-500 mt-1">
                                                        {new Date(job.startedAt).toLocaleDateString()}
                                                    </p>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                ) : (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="text-center py-8"
                                    >
                                        <Cloud className="h-12 w-12 text-slate-400 mx-auto mb-3" />
                                        <p className="text-slate-600">No migration history yet</p>
                                        <p className="text-sm text-slate-500 mt-1">Start your first migration to see activity here</p>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </motion.div>
                </div>

                <div className="space-y-6">
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5 }}
                    >
                        <div className="premium-card p-6">
                            <h2 className="text-xl font-bold text-slate-900 mb-4">Account Status</h2>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-3 border border-slate-200 rounded-xl">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                                            <Mail className="h-5 w-5 text-white" />
                                        </div>
                                        <span className="font-semibold text-slate-900">Outlook</span>
                                    </div>
                                    <div className={`w-3 h-3 rounded-full ${tokens.outlook ? 'bg-green-500' : 'bg-red-500'}`} />
                                </div>

                                <div className="flex items-center justify-between p-3 border border-slate-200 rounded-xl">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-10 h-10 bg-red-500 rounded-lg flex items-center justify-center">
                                            <Mail className="h-5 w-5 text-white" />
                                        </div>
                                        <span className="font-semibold text-slate-900">Gmail</span>
                                    </div>
                                    <div className={`w-3 h-3 rounded-full ${tokens.gmail ? 'bg-green-500' : 'bg-red-500'}`} />
                                </div>
                            </div>

                            {(!tokens.outlook || !tokens.gmail) && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg"
                                >
                                    <div className="flex items-center">
                                        <AlertCircle className="h-4 w-4 text-yellow-600 mr-2" />
                                        <p className="text-sm text-yellow-800">
                                            Connect both accounts to start migration
                                        </p>
                                    </div>
                                </motion.div>
                            )}
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.6 }}
                    >
                        <div className="premium-card p-6">
                            <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center">
                                <Server className="h-5 w-5 text-blue-500 mr-2" />
                                System Status
                            </h2>
                            <div className="space-y-3">
                                {[
                                    { name: 'Migration Service', status: 'Operational' },
                                    { name: 'API Gateway', status: 'Operational' },
                                    { name: 'Database', status: 'Operational' },
                                    { name: 'OAuth Services', status: 'Operational' }
                                ].map((service, index) => (
                                    <motion.div
                                        key={service.name}
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.7 + index * 0.1 }}
                                        className="flex items-center justify-between"
                                    >
                                        <span className="text-slate-700">{service.name}</span>
                                        <span className="flex items-center text-green-600 text-sm font-semibold">
                                            <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                                            {service.status}
                                        </span>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.7 }}
                    >
                        <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-xl p-6 text-white relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
                            <div className="relative z-10">
                                <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center mb-4">
                                    <Sparkles className="h-6 w-6" />
                                </div>
                                <h3 className="font-bold text-lg mb-2">Need Help?</h3>
                                <p className="text-blue-100 text-sm mb-4">
                                    Our support team is here to help you with any questions.
                                </p>
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="w-full bg-white text-blue-600 py-2.5 px-4 rounded-xl font-semibold hover:bg-blue-50 transition-colors shadow-lg"
                                >
                                    Contact Support
                                </motion.button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </motion.div>
    )
}

export default Dashboard