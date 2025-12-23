// frontend/src/pages/Migration.jsx
import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useMigration } from '../contexts/MigrationContext'
import { useNotification } from '../contexts/NotificationContext'
import {
    Mail,
    Users,
    Calendar,
    FileText,
    Cloud,
    CheckCircle,
    Play,
    Pause,
    RotateCcw,
    ArrowRight,
    ArrowLeft,
    Wifi,
    WifiOff,
    RefreshCw,
    Sparkles,
    Shield,
    Database,
    StopCircle
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const Migration = () => {
    const { user, tokens, connectOutlook, connectGmail } = useAuth()
    const {
        startMigration,
        setCurrentJob,
        currentJob,
        isWebSocketConnected,
        reconnectWebSocket,
        pauseMigration,
        resumeMigration,
        cancelMigration,
        loading
    } = useMigration()
    const { showSuccess, showError } = useNotification()

    const [currentStep, setCurrentStep] = useState(1)
    const [selectedTypes, setSelectedTypes] = useState([])

    const ConnectionStatus = () => (
        <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-center mb-6"
        >
            {isWebSocketConnected ? (
                <div className="flex items-center text-green-600 bg-green-50 px-4 py-3 rounded-xl border border-green-200">
                    <Wifi className="h-5 w-5 mr-2" />
                    <span className="text-sm font-semibold">Live updates connected</span>
                </div>
            ) : (
                <div className="flex items-center text-red-600 bg-red-50 px-4 py-3 rounded-xl border border-red-200">
                    <WifiOff className="h-5 w-5 mr-2" />
                    <span className="text-sm font-semibold">Live updates disconnected</span>
                    <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={reconnectWebSocket}
                        className="ml-3 text-red-700 hover:text-red-800 p-1 rounded-lg bg-red-100"
                    >
                        <RefreshCw className="h-4 w-4" />
                    </motion.button>
                </div>
            )}
        </motion.div>
    )

    const migrationTypes = [
        {
            id: 'mail',
            name: 'Emails',
            icon: Mail,
            description: 'Migrate all your emails and folders',
            color: 'from-blue-500 to-blue-600',
            features: ['Complete inbox transfer', 'Folder structure preservation', 'Read status sync']
        },
        {
            id: 'contacts',
            name: 'Contacts',
            icon: Users,
            description: 'Transfer your contact list',
            color: 'from-green-500 to-green-600',
            features: ['All contact fields', 'Group organization', 'Profile pictures']
        },
        {
            id: 'calendar',
            name: 'Calendar',
            icon: Calendar,
            description: 'Move your calendar events and appointments',
            color: 'from-purple-500 to-purple-600',
            features: ['Events & meetings', 'Recurring events', 'Attendee lists']
        },
        {
            id: 'drive',
            name: 'Drive Files',
            icon: FileText,
            description: 'Transfer your documents and files',
            color: 'from-orange-500 to-orange-600',
            features: ['All file types', 'Folder hierarchy', 'Sharing permissions']
        }
    ]

    useEffect(() => {
        if (currentJob) {
            console.log('Current job active, waiting for WebSocket updates...')
        }
    }, [currentJob])

    const handleTypeSelect = (typeId) => {
        setSelectedTypes(prev =>
            prev.includes(typeId)
                ? prev.filter(id => id !== typeId)
                : [...prev, typeId]
        )
    }

    const handleStartMigration = async () => {
        if (selectedTypes.length === 0) {
            showError('Please select at least one migration type')
            return
        }

        if (!tokens.outlook || !tokens.gmail) {
            showError('Please connect both Outlook and Gmail accounts before starting migration')
            setCurrentStep(1)
            return
        }

        try {
            if (selectedTypes.includes('all') || selectedTypes.length > 1) {
                await startMigration('all')
            } else {
                await startMigration(selectedTypes[0])
            }

            setCurrentStep(3)
        } catch (error) {
            console.error('Migration error:', error)
            showError(error.message || 'Failed to start migration')
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
                    <h2 className="text-2xl font-bold text-slate-900 mb-2">Please Sign In</h2>
                    <p className="text-slate-600">Sign in to start migration</p>
                </div>
            </motion.div>
        )
    }

    const stepVariants = {
        hidden: { opacity: 0, x: 50 },
        visible: {
            opacity: 1,
            x: 0,
            transition: {
                type: "spring",
                stiffness: 300,
                damping: 30
            }
        },
        exit: {
            opacity: 0,
            x: -50,
            transition: { duration: 0.2 }
        }
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="max-w-6xl mx-auto px-4 py-8"
        >
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mb-12"
            >
                <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent mb-4">
                    Data Migration Wizard
                </h1>
                <p className="text-xl text-slate-600 max-w-2xl mx-auto">
                    Seamlessly transfer your data from Outlook to Gmail with our intelligent migration platform
                </p>

                <ConnectionStatus />
            </motion.div>

            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="flex justify-center mb-12"
            >
                <div className="flex items-center space-x-8">
                    {[1, 2, 3].map((step) => (
                        <div key={step} className="flex items-center">
                            <motion.div
                                whileHover={{ scale: 1.1 }}
                                className={`flex items-center justify-center w-14 h-14 rounded-full border-2 font-bold text-lg ${
                                    currentStep >= step
                                        ? 'bg-gradient-to-br from-blue-500 to-purple-600 border-transparent text-white shadow-lg'
                                        : 'border-slate-300 text-slate-500 bg-white'
                                } transition-all duration-300 relative`}
                            >
                                {currentStep > step ? <CheckCircle className="h-6 w-6" /> : step}
                                {currentStep === step && (
                                    <motion.div
                                        animate={{ scale: [1, 1.2, 1] }}
                                        transition={{ duration: 2, repeat: Infinity }}
                                        className="absolute -inset-1 bg-blue-500 rounded-full opacity-20 -z-10"
                                    />
                                )}
                            </motion.div>
                            {step < 3 && (
                                <div className={`w-24 h-1 rounded-full ${
                                    currentStep > step ? 'bg-gradient-to-r from-blue-500 to-purple-600' : 'bg-slate-300'
                                }`} />
                            )}
                        </div>
                    ))}
                </div>
            </motion.div>

            <AnimatePresence mode="wait">
                {currentStep === 1 && (
                    <motion.div
                        key="step-1"
                        variants={stepVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        className="premium-card p-8"
                    >
                        <div className="text-center mb-8">
                            <h2 className="text-3xl font-bold text-slate-900 mb-3">Connect Your Accounts</h2>
                            <p className="text-slate-600 text-lg">
                                First, connect both your Outlook and Gmail accounts to proceed with migration
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                            <motion.div
                                whileHover={{ scale: 1.02 }}
                                className={`p-6 rounded-2xl border-2 transition-all duration-300 ${
                                    tokens.outlook
                                        ? 'border-green-500 bg-green-50 shadow-lg'
                                        : 'border-slate-300 bg-white hover:border-blue-300'
                                }`}
                            >
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center space-x-4">
                                        <div className="w-14 h-14 bg-blue-500 rounded-xl flex items-center justify-center shadow-lg">
                                            <Mail className="h-7 w-7 text-white" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-slate-900 text-xl">Microsoft Outlook</h3>
                                            <p className="text-slate-600">
                                                {tokens.outlook ? 'Connected' : 'Not connected'}
                                            </p>
                                        </div>
                                    </div>
                                    <div className={`w-4 h-4 rounded-full ${tokens.outlook ? 'bg-green-500' : 'bg-slate-400'}`} />
                                </div>

                                {!tokens.outlook && (
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={connectOutlook}
                                        className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3.5 px-4 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center"
                                    >
                                        <Cloud className="h-5 w-5 mr-2" />
                                        Connect Outlook
                                    </motion.button>
                                )}
                            </motion.div>

                            <motion.div
                                whileHover={{ scale: 1.02 }}
                                className={`p-6 rounded-2xl border-2 transition-all duration-300 ${
                                    tokens.gmail
                                        ? 'border-green-500 bg-green-50 shadow-lg'
                                        : 'border-slate-300 bg-white hover:border-red-300'
                                }`}
                            >
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center space-x-4">
                                        <div className="w-14 h-14 bg-red-500 rounded-xl flex items-center justify-center shadow-lg">
                                            <Mail className="h-7 w-7 text-white" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-slate-900 text-xl">Google Gmail</h3>
                                            <p className="text-slate-600">
                                                {tokens.gmail ? 'Connected' : 'Not connected'}
                                            </p>
                                        </div>
                                    </div>
                                    <div className={`w-4 h-4 rounded-full ${tokens.gmail ? 'bg-green-500' : 'bg-slate-400'}`} />
                                </div>

                                {!tokens.gmail && (
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={connectGmail}
                                        className="w-full bg-red-500 hover:bg-red-600 text-white py-3.5 px-4 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center"
                                    >
                                        <Cloud className="h-5 w-5 mr-2" />
                                        Connect Gmail
                                    </motion.button>
                                )}
                            </motion.div>
                        </div>

                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.3 }}
                            className="mb-6 p-6 bg-slate-50 rounded-2xl border border-slate-200"
                        >
                            <h3 className="font-bold text-slate-900 text-lg mb-4 flex items-center">
                                <Shield className="h-5 w-5 text-blue-500 mr-2" />
                                Connection Status
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-slate-200">
                                    <span className="font-semibold text-slate-700">Outlook</span>
                                    <span className={`px-3 py-1.5 rounded-full text-sm font-semibold ${
                                        tokens.outlook ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                    }`}>
                                        {tokens.outlook ? 'Connected' : 'Not Connected'}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-slate-200">
                                    <span className="font-semibold text-slate-700">Gmail</span>
                                    <span className={`px-3 py-1.5 rounded-full text-sm font-semibold ${
                                        tokens.gmail ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                    }`}>
                                        {tokens.gmail ? 'Connected' : 'Not Connected'}
                                    </span>
                                </div>
                            </div>
                        </motion.div>

                        <div className="flex justify-end">
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setCurrentStep(2)}
                                disabled={!tokens.outlook || !tokens.gmail}
                                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:from-slate-400 disabled:to-slate-500 disabled:cursor-not-allowed text-white py-3.5 px-8 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl flex items-center"
                            >
                                Continue
                                <ArrowRight className="h-5 w-5 ml-2" />
                            </motion.button>
                        </div>
                    </motion.div>
                )}

                {currentStep === 2 && (
                    <motion.div
                        key="step-2"
                        variants={stepVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        className="premium-card p-8"
                    >
                        <div className="text-center mb-8">
                            <h2 className="text-3xl font-bold text-slate-900 mb-3">Select Data to Migrate</h2>
                            <p className="text-slate-600 text-lg">
                                Choose what you want to migrate from Outlook to Gmail
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                            {migrationTypes.map((type) => {
                                const Icon = type.icon
                                const isSelected = selectedTypes.includes(type.id)
                                return (
                                    <motion.div
                                        key={type.id}
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => handleTypeSelect(type.id)}
                                        className={`p-6 rounded-2xl border-2 cursor-pointer transition-all duration-300 relative overflow-hidden group ${
                                            isSelected
                                                ? 'border-blue-500 bg-blue-50 shadow-lg'
                                                : 'border-slate-300 bg-white hover:border-slate-400'
                                        }`}
                                    >
                                        {isSelected && (
                                            <motion.div
                                                initial={{ scale: 0 }}
                                                animate={{ scale: 1 }}
                                                className="absolute top-3 right-3 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center"
                                            >
                                                <CheckCircle className="h-4 w-4 text-white" />
                                            </motion.div>
                                        )}
                                        <div className={`w-14 h-14 rounded-xl bg-gradient-to-r ${type.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                                            <Icon className="h-7 w-7 text-white" />
                                        </div>
                                        <h3 className="font-bold text-slate-900 text-lg mb-2">{type.name}</h3>
                                        <p className="text-slate-600 text-sm mb-4">{type.description}</p>
                                        <ul className="space-y-1">
                                            {type.features.map((feature, index) => (
                                                <li key={index} className="text-xs text-slate-500 flex items-center">
                                                    <div className="w-1 h-1 bg-slate-400 rounded-full mr-2"></div>
                                                    {feature}
                                                </li>
                                            ))}
                                        </ul>
                                    </motion.div>
                                )
                            })}
                        </div>

                        <motion.div
                            whileHover={{ scale: 1.02 }}
                            className="mb-8"
                        >
                            <div
                                onClick={() => {
                                    if (selectedTypes.length === migrationTypes.length) {
                                        setSelectedTypes([])
                                    } else {
                                        setSelectedTypes(migrationTypes.map(type => type.id))
                                    }
                                }}
                                className={`p-6 rounded-2xl border-2 cursor-pointer transition-all duration-300 ${
                                    selectedTypes.length === migrationTypes.length
                                        ? 'border-green-500 bg-green-50 shadow-lg'
                                        : 'border-slate-300 bg-white hover:border-slate-400'
                                }`}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-4">
                                        <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
                                            <Database className="h-6 w-6 text-white" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-slate-900 text-lg">Migrate Everything</h3>
                                            <p className="text-slate-600">Transfer all data types at once</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        {selectedTypes.length === migrationTypes.length ? (
                                            <CheckCircle className="h-6 w-6 text-green-500" />
                                        ) : (
                                            <div className="w-6 h-6 border-2 border-slate-400 rounded-lg" />
                                        )}
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        <div className="flex justify-between">
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setCurrentStep(1)}
                                className="bg-slate-500 hover:bg-slate-600 text-white py-3 px-6 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl flex items-center"
                            >
                                <ArrowLeft className="h-5 w-5 mr-2" />
                                Back
                            </motion.button>

                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={handleStartMigration}
                                disabled={selectedTypes.length === 0 || loading}
                                className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 disabled:from-slate-400 disabled:to-slate-500 disabled:cursor-not-allowed text-white py-3.5 px-8 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl flex items-center"
                            >
                                {loading ? (
                                    <>
                                        <motion.div
                                            animate={{ rotate: 360 }}
                                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                            className="rounded-full h-5 w-5 border-b-2 border-white mr-2"
                                        />
                                        Starting...
                                    </>
                                ) : (
                                    <>
                                        <Play className="h-5 w-5 mr-2" />
                                        Start Migration
                                    </>
                                )}
                            </motion.button>
                        </div>
                    </motion.div>
                )}

                {currentStep === 3 && (
                    <motion.div
                        key="step-3"
                        variants={stepVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        className="premium-card p-8"
                    >
                        <div className="text-center mb-8">
                            <h2 className="text-3xl font-bold text-slate-900 mb-3">Migration Progress</h2>
                            <p className="text-slate-600 text-lg">
                                Your data is being securely transferred
                            </p>
                        </div>

                        <div className="mb-8">
                            <ConnectionStatus />
                        </div>

                        {currentJob ? (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="space-y-8"
                            >
                                <div className="text-center">
                                    <motion.h3
                                        initial={{ scale: 0.9 }}
                                        animate={{ scale: 1 }}
                                        className="text-2xl font-bold text-slate-900 mb-2"
                                    >
                                        {selectedTypes[0] ? selectedTypes[0].charAt(0).toUpperCase() + selectedTypes[0].slice(1) : 'All'} Migration
                                    </motion.h3>
                                    <p className="text-slate-600">Job ID: {currentJob.jobId}</p>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex justify-between text-sm font-semibold text-slate-700">
                                        <span>Progress</span>
                                        <span>{currentJob.progress || 0}%</span>
                                    </div>
                                    <div className="w-full bg-slate-200 rounded-full h-4 overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${currentJob.progress || 0}%` }}
                                            transition={{ duration: 1, ease: "easeOut" }}
                                            className={`h-full rounded-full ${
                                                currentJob.status === 'completed' ? 'bg-green-500' :
                                                    currentJob.status === 'failed' ? 'bg-red-500' :
                                                        'bg-gradient-to-r from-blue-500 to-purple-600'
                                            } relative`}
                                        >
                                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -skew-x-12 transform translate-x-[-100%] animate-shimmer"></div>
                                        </motion.div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                    <div className="text-center p-4 bg-slate-50 rounded-xl border border-slate-200">
                                        <p className="text-sm text-slate-600 mb-1">Status</p>
                                        <p className={`text-lg font-semibold capitalize ${
                                            currentJob.status === 'completed' ? 'text-green-600' :
                                                currentJob.status === 'failed' ? 'text-red-600' :
                                                    currentJob.status === 'paused' ? 'text-orange-600' :
                                                        'text-blue-600'
                                        }`}>
                                            {currentJob.status?.replace('_', ' ') || 'Unknown'}
                                        </p>
                                    </div>

                                    <div className="text-center p-4 bg-slate-50 rounded-xl border border-slate-200">
                                        <p className="text-sm text-slate-600 mb-1">Progress</p>
                                        <p className="text-lg font-semibold text-slate-900">{currentJob.progress || 0}%</p>
                                    </div>

                                    <div className="text-center p-4 bg-slate-50 rounded-xl border border-slate-200">
                                        <p className="text-sm text-slate-600 mb-1">Items Processed</p>
                                        <p className="text-lg font-semibold text-slate-900">
                                            {currentJob.processedItems || 0} / {currentJob.totalItems || 'Calculating...'}
                                        </p>
                                    </div>

                                    <div className="text-center p-4 bg-slate-50 rounded-xl border border-slate-200">
                                        <p className="text-sm text-slate-600 mb-1">Connection</p>
                                        <p className={`text-lg font-semibold ${
                                            isWebSocketConnected ? 'text-green-600' : 'text-red-600'
                                        }`}>
                                            {isWebSocketConnected ? 'Live' : 'Offline'}
                                        </p>
                                    </div>
                                </div>

                                {currentJob.message && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className={`p-4 rounded-xl border ${
                                            currentJob.status === 'completed' ? 'bg-green-50 border-green-200' :
                                                currentJob.status === 'failed' ? 'bg-red-50 border-red-200' :
                                                    'bg-blue-50 border-blue-200'
                                        }`}
                                    >
                                        <p className={`font-semibold text-center ${
                                            currentJob.status === 'completed' ? 'text-green-800' :
                                                currentJob.status === 'failed' ? 'text-red-800' :
                                                    'text-blue-800'
                                        }`}>
                                            {currentJob.message}
                                        </p>
                                    </motion.div>
                                )}

                                {isWebSocketConnected && currentJob.status === 'in_progress' && (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="flex items-center justify-center text-blue-600"
                                    >
                                        <div className="animate-pulse flex space-x-1">
                                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                            <div className="w-2 h-2 bg-blue-500 rounded-full" style={{ animationDelay: '0.2s' }}></div>
                                            <div className="w-2 h-2 bg-blue-500 rounded-full" style={{ animationDelay: '0.4s' }}></div>
                                        </div>
                                        <span className="ml-2 text-sm font-semibold">Receiving live updates...</span>
                                    </motion.div>
                                )}

                                {/* ✅ YAHAN PAR ACTION BUTTONS ADD KARO */}
                                <div className="flex justify-center space-x-4">
                                    {currentJob?.status === 'in_progress' && (
                                        <motion.button
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => pauseMigration(currentJob.jobId)}
                                            disabled={loading}
                                            className="bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl flex items-center"
                                        >
                                            <Pause className="h-5 w-5 mr-2" />
                                            Pause
                                        </motion.button>
                                    )}

                                    {currentJob?.status === 'paused' && (
                                        <motion.button
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => resumeMigration(currentJob.jobId)}
                                            disabled={loading}
                                            className="bg-green-500 hover:bg-green-600 disabled:bg-green-300 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl flex items-center"
                                        >
                                            <Play className="h-5 w-5 mr-2" />
                                            Resume
                                        </motion.button>
                                    )}

                                    {(currentJob?.status === 'in_progress' || currentJob?.status === 'paused') && (
                                        <motion.button
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => cancelMigration(currentJob.jobId)}
                                            disabled={loading}
                                            className="bg-red-500 hover:bg-red-600 disabled:bg-red-300 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl flex items-center"
                                        >
                                            <StopCircle className="h-5 w-5 mr-2" />
                                            Cancel
                                        </motion.button>
                                    )}

                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => {
                                            setCurrentStep(1)
                                            setSelectedTypes([])
                                            setCurrentJob(null)
                                        }}
                                        className="bg-slate-500 hover:bg-slate-600 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl"
                                    >
                                        New Migration
                                    </motion.button>
                                </div>
                                {/* ✅ ACTION BUTTONS END YAHAN TAK */}

                                {/*<div className="flex justify-center space-x-4">*/}
                                {/*    {currentJob?.status === 'in_progress' && (*/}
                                {/*        <motion.button*/}
                                {/*            whileHover={{ scale: 1.05 }}*/}
                                {/*            whileTap={{ scale: 0.95 }}*/}
                                {/*            onClick={() => pauseMigration(currentJob.jobId)}*/}
                                {/*            disabled={loading}*/}
                                {/*            className="bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl flex items-center"*/}
                                {/*        >*/}
                                {/*            <Pause className="h-5 w-5 mr-2" />*/}
                                {/*            Pause*/}
                                {/*        </motion.button>*/}
                                {/*    )}*/}

                                {/*    {currentJob?.status === 'paused' && (*/}
                                {/*        <motion.button*/}
                                {/*            whileHover={{ scale: 1.05 }}*/}
                                {/*            whileTap={{ scale: 0.95 }}*/}
                                {/*            onClick={() => resumeMigration(currentJob.jobId)}*/}
                                {/*            disabled={loading}*/}
                                {/*            className="bg-green-500 hover:bg-green-600 disabled:bg-green-300 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl flex items-center"*/}
                                {/*        >*/}
                                {/*            <Play className="h-5 w-5 mr-2" />*/}
                                {/*            Resume*/}
                                {/*        </motion.button>*/}
                                {/*    )}*/}

                                {/*    {(currentJob?.status === 'in_progress' || currentJob?.status === 'paused') && (*/}
                                {/*        <motion.button*/}
                                {/*            whileHover={{ scale: 1.05 }}*/}
                                {/*            whileTap={{ scale: 0.95 }}*/}
                                {/*            onClick={() => cancelMigration(currentJob.jobId)}*/}
                                {/*            disabled={loading}*/}
                                {/*            className="bg-red-500 hover:bg-red-600 disabled:bg-red-300 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl flex items-center"*/}
                                {/*        >*/}
                                {/*            <StopCircle className="h-5 w-5 mr-2" />*/}
                                {/*            Cancel*/}
                                {/*        </motion.button>*/}
                                {/*    )}*/}

                                {/*    <motion.button*/}
                                {/*        whileHover={{ scale: 1.05 }}*/}
                                {/*        whileTap={{ scale: 0.95 }}*/}
                                {/*        onClick={() => {*/}
                                {/*            setCurrentStep(1)*/}
                                {/*            setSelectedTypes([])*/}
                                {/*        }}*/}
                                {/*        className="bg-slate-500 hover:bg-slate-600 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl"*/}
                                {/*    >*/}
                                {/*        New Migration*/}
                                {/*    </motion.button>*/}
                                {/*</div>*/}
                            </motion.div>
                        ) : (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="text-center py-12"
                            >
                                <Cloud className="h-16 w-16 text-slate-400 mx-auto mb-4" />
                                <p className="text-slate-600 text-lg mb-4">No active migration</p>
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => {
                                        setCurrentStep(1)
                                        setSelectedTypes([])
                                    }}
                                    className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-8 py-3.5 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl"
                                >
                                    Start New Migration
                                </motion.button>
                            </motion.div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    )
}

export default Migration
