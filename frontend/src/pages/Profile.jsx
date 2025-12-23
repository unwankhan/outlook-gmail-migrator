
// frontend/src/pages/Profile.jsx
import React, { useState, useEffect } from 'react'  // Added useEffect import
import { useAuth } from '../contexts/AuthContext'
import { useNotification } from '../contexts/NotificationContext'
import {
    User,
    Mail,
    Shield,
    LogOut,
    Trash2,
    CheckCircle,
    XCircle,
    Link,
    Unlink,
    RefreshCw,
    Settings,
    Bell,
    Key,
    Sparkles
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const Profile = () => {
    const {
        user,
        tokens,
        logout,
        connectOutlook,
        connectGmail,
        disconnectService,
        updateUserProfile
    } = useAuth()
    const { showSuccess, showError } = useNotification()
    const [activeTab, setActiveTab] = useState('accounts')
    const [loading, setLoading] = useState({})
    const [editMode, setEditMode] = useState(false)
    const [userData, setUserData] = useState({
        name: '',
        email: ''
    })

    useEffect(() => {
        if (user) {
            setUserData({
                name: user.name || '',
                email: user.email || ''
            })
        }
    }, [user])

    const handleSaveProfile = () => {
        if (userData.name.trim()) {
            updateUserProfile({ name: userData.name.trim() })
            showSuccess('Profile updated successfully!')
            setEditMode(false)
        } else {
            showError('Name cannot be empty')
        }
    }

    const handleDisconnect = async (service) => {
        setLoading(prev => ({ ...prev, [service]: true }))
        try {
            const result = await disconnectService(service)
            if (result.success) {
                showSuccess(`${service.charAt(0).toUpperCase() + service.slice(1)} disconnected successfully`)
            } else {
                showError(result.message || `Failed to disconnect ${service}`)
            }
        } catch (error) {
            showError(`Failed to disconnect ${service}: ${error.message}`)
        } finally {
            setLoading(prev => ({ ...prev, [service]: false }))
        }
    }

    const handleReconnect = (service) => {
        if (service === 'outlook') {
            connectOutlook()
        } else {
            connectGmail()
        }
    }

    const accountStatus = [
        {
            name: 'Microsoft Outlook',
            provider: 'outlook',
            icon: Mail,
            color: 'bg-blue-500',
            description: 'Connected to your Outlook account',
            connected: !!tokens.outlook,
            scopes: ['Read emails', 'Read contacts', 'Read calendar', 'Read files']
        },
        {
            name: 'Google Gmail',
            provider: 'gmail',
            icon: Mail,
            color: 'bg-red-500',
            description: 'Connected to your Gmail account',
            connected: !!tokens.gmail,
            scopes: ['Read emails', 'Manage contacts', 'Manage calendar', 'Manage drive files']
        }
    ]

    if (!user) {
        return (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="min-h-screen flex items-center justify-center"
            >
                <div className="text-center">
                    <User className="h-16 w-16 text-slate-400 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-slate-900 mb-2">Please Sign In</h2>
                    <p className="text-slate-600">Sign in to view your profile</p>
                </div>
            </motion.div>
        )
    }

    const tabVariants = {
        hidden: { opacity: 0, x: 20 },
        visible: {
            opacity: 1,
            x: 0,
            transition: {
                type: "spring",
                stiffness: 300,
                damping: 30
            }
        }
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="max-w-6xl mx-auto px-4 py-8"
        >
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="premium-card p-8 mb-8"
            >
                <div className="flex items-center space-x-6">
                    <motion.div
                        whileHover={{ scale: 1.1 }}
                        className="relative"
                    >
                        <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-xl">
                            <User className="h-10 w-10 text-white" />
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white"></div>
                    </motion.div>
                    <div className="flex-1">
                        <div className="flex items-center justify-between mb-4">
                            <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                                {editMode ? (
                                    <input
                                        type="text"
                                        value={userData.name}
                                        onChange={(e) => setUserData(prev => ({ ...prev, name: e.target.value }))}
                                        className="bg-transparent border-b-2 border-blue-500 outline-none text-4xl font-bold text-slate-800"
                                        placeholder="Enter your name"
                                    />
                                ) : (
                                    user.name || 'User Profile'
                                )}
                            </h1>
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => editMode ? handleSaveProfile() : setEditMode(true)}
                                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl flex items-center"
                            >
                                {editMode ? (
                                    <>
                                        <CheckCircle className="h-4 w-4 mr-2" />
                                        Save
                                    </>
                                ) : (
                                    <>
                                        <User className="h-4 w-4 mr-2" />
                                        Edit
                                    </>
                                )}
                            </motion.button>
                        </div>
                        <p className="text-slate-600 text-lg mb-1">Email: {user.email}</p>
                        <p className="text-slate-600 text-lg">User ID: {user.userId}</p>
                    </div>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={logout}
                        className="bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white px-8 py-3.5 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl flex items-center"
                    >
                        <LogOut className="h-5 w-5 mr-2" />
                        Sign Out
                    </motion.button>
                </div>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Sidebar */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                    className="lg:col-span-1"
                >
                    <div className="premium-card p-6 sticky top-8">
                        <nav className="space-y-2">
                            {[
                                { id: 'accounts', name: 'Connected Accounts', icon: Settings },
                                { id: 'security', name: 'Security', icon: Shield },
                                { id: 'preferences', name: 'Preferences', icon: Bell }
                            ].map((tab) => {
                                const Icon = tab.icon
                                return (
                                    <motion.button
                                        key={tab.id}
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`w-full flex items-center space-x-3 px-4 py-3.5 rounded-xl text-left transition-all duration-300 ${
                                            activeTab === tab.id
                                                ? 'bg-blue-50 text-blue-600 border border-blue-200 shadow-md'
                                                : 'text-slate-600 hover:text-blue-600 hover:bg-slate-50'
                                        }`}
                                    >
                                        <Icon className="h-5 w-5" />
                                        <span className="font-semibold">{tab.name}</span>
                                    </motion.button>
                                )
                            })}
                        </nav>
                    </div>
                </motion.div>

                {/* Main Content */}
                <div className="lg:col-span-3">
                    <AnimatePresence mode="wait">
                        {/* Accounts Tab */}
                        {activeTab === 'accounts' && (
                            <motion.div
                                key="accounts"
                                variants={tabVariants}
                                initial="hidden"
                                animate="visible"
                                exit="hidden"
                                className="premium-card p-8"
                            >
                                <div className="flex items-center justify-between mb-8">
                                    <div>
                                        <h2 className="text-3xl font-bold text-slate-900 mb-2">Connected Accounts</h2>
                                        <p className="text-slate-600 text-lg">
                                            Manage your connected Outlook and Gmail accounts for data migration
                                        </p>
                                    </div>
                                    <motion.div
                                        whileHover={{ scale: 1.1 }}
                                        className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center"
                                    >
                                        <Sparkles className="h-6 w-6 text-white" />
                                    </motion.div>
                                </div>

                                <div className="space-y-6">
                                    {accountStatus.map((account) => {
                                        const Icon = account.icon
                                        return (
                                            <motion.div
                                                key={account.provider}
                                                whileHover={{ scale: 1.01 }}
                                                className="border border-slate-200 rounded-2xl p-6 hover:shadow-lg transition-all duration-300"
                                            >
                                                <div className="flex items-center justify-between mb-6">
                                                    <div className="flex items-center space-x-4">
                                                        <div className={`w-14 h-14 ${account.color} rounded-xl flex items-center justify-center shadow-lg`}>
                                                            <Icon className="h-7 w-7 text-white" />
                                                        </div>
                                                        <div>
                                                            <h3 className="font-bold text-slate-900 text-xl">{account.name}</h3>
                                                            <p className="text-slate-600">{account.description}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center space-x-2">
                                                        {account.connected ? (
                                                            <>
                                                                <CheckCircle className="h-6 w-6 text-green-500" />
                                                                <span className="text-green-600 font-semibold">Connected</span>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <XCircle className="h-6 w-6 text-red-500" />
                                                                <span className="text-red-600 font-semibold">Not Connected</span>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>

                                                {account.connected && (
                                                    <motion.div
                                                        initial={{ opacity: 0, height: 0 }}
                                                        animate={{ opacity: 1, height: 'auto' }}
                                                        className="mb-6"
                                                    >
                                                        <h4 className="font-semibold text-slate-900 mb-3">Permissions Granted:</h4>
                                                        <div className="flex flex-wrap gap-2">
                                                            {account.scopes.map((scope, index) => (
                                                                <motion.span
                                                                    key={index}
                                                                    initial={{ opacity: 0, scale: 0.8 }}
                                                                    animate={{ opacity: 1, scale: 1 }}
                                                                    transition={{ delay: index * 0.1 }}
                                                                    className="bg-slate-100 text-slate-700 px-3 py-1.5 rounded-full text-sm font-medium"
                                                                >
                                                                    {scope}
                                                                </motion.span>
                                                            ))}
                                                        </div>
                                                    </motion.div>
                                                )}

                                                <div className="flex justify-end space-x-3">
                                                    {account.connected ? (
                                                        <>
                                                            <motion.button
                                                                whileHover={{ scale: 1.05 }}
                                                                whileTap={{ scale: 0.95 }}
                                                                onClick={() => handleReconnect(account.provider)}
                                                                disabled={loading[account.provider]}
                                                                className="bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white px-5 py-2.5 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl flex items-center"
                                                            >
                                                                <RefreshCw className="h-4 w-4 mr-2" />
                                                                Reconnect
                                                            </motion.button>
                                                            <motion.button
                                                                whileHover={{ scale: 1.05 }}
                                                                whileTap={{ scale: 0.95 }}
                                                                onClick={() => handleDisconnect(account.provider)}
                                                                disabled={loading[account.provider]}
                                                                className="bg-red-500 hover:bg-red-600 disabled:bg-red-300 text-white px-5 py-2.5 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl flex items-center"
                                                            >
                                                                <Unlink className="h-4 w-4 mr-2" />
                                                                {loading[account.provider] ? 'Disconnecting...' : 'Disconnect'}
                                                            </motion.button>
                                                        </>
                                                    ) : (
                                                        <motion.button
                                                            whileHover={{ scale: 1.05 }}
                                                            whileTap={{ scale: 0.95 }}
                                                            onClick={() => handleReconnect(account.provider)}
                                                            className="bg-green-500 hover:bg-green-600 text-white px-6 py-2.5 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl flex items-center"
                                                        >
                                                            <Link className="h-4 w-4 mr-2" />
                                                            Connect
                                                        </motion.button>
                                                    )}
                                                </div>
                                            </motion.div>
                                        )
                                    })}
                                </div>

                                {/* Connection Status Summary */}
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.4 }}
                                    className="mt-8 p-6 bg-slate-50 rounded-2xl border border-slate-200"
                                >
                                    <h3 className="font-bold text-slate-900 text-lg mb-4">Connection Status</h3>
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
                            </motion.div>
                        )}

                        {/* Security Tab */}
                        {activeTab === 'security' && (
                            <motion.div
                                key="security"
                                variants={tabVariants}
                                initial="hidden"
                                animate="visible"
                                exit="hidden"
                                className="premium-card p-8"
                            >
                                <h2 className="text-3xl font-bold text-slate-900 mb-8">Security Settings</h2>
                                <div className="space-y-6">
                                    <div className="border border-slate-200 rounded-2xl p-6">
                                        <div className="flex items-center space-x-4 mb-4">
                                            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                                                <Key className="h-6 w-6 text-blue-600" />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-slate-900 text-xl">Change Password</h3>
                                                <p className="text-slate-600">Update your password to keep your account secure.</p>
                                            </div>
                                        </div>
                                        <motion.button
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl"
                                        >
                                            Change Password
                                        </motion.button>
                                    </div>

                                    <div className="border border-slate-200 rounded-2xl p-6">
                                        <div className="flex items-center space-x-4 mb-4">
                                            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                                                <Shield className="h-6 w-6 text-purple-600" />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-slate-900 text-xl">Two-Factor Authentication</h3>
                                                <p className="text-slate-600">Add an extra layer of security to your account.</p>
                                            </div>
                                        </div>
                                        <motion.button
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl"
                                        >
                                            Enable 2FA
                                        </motion.button>
                                    </div>

                                    <motion.div
                                        whileHover={{ scale: 1.01 }}
                                        className="border border-red-200 rounded-2xl p-6 bg-red-50"
                                    >
                                        <div className="flex items-center space-x-4 mb-4">
                                            <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                                                <Trash2 className="h-6 w-6 text-red-600" />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-red-900 text-xl">Danger Zone</h3>
                                                <p className="text-red-700">Once you delete your account, there is no going back. Please be certain.</p>
                                            </div>
                                        </div>
                                        <motion.button
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl flex items-center"
                                        >
                                            <Trash2 className="h-4 w-4 mr-2" />
                                            Delete Account
                                        </motion.button>
                                    </motion.div>
                                </div>
                            </motion.div>
                        )}

                        {/* Preferences Tab */}
                        {activeTab === 'preferences' && (
                            <motion.div
                                key="preferences"
                                variants={tabVariants}
                                initial="hidden"
                                animate="visible"
                                exit="hidden"
                                className="premium-card p-8"
                            >
                                <h2 className="text-3xl font-bold text-slate-900 mb-8">Preferences</h2>
                                <div className="space-y-6">
                                    <div className="border border-slate-200 rounded-2xl p-6">
                                        <div className="flex items-center space-x-4 mb-6">
                                            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                                                <Bell className="h-6 w-6 text-green-600" />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-slate-900 text-xl">Notification Settings</h3>
                                                <p className="text-slate-600">Manage how you receive notifications.</p>
                                            </div>
                                        </div>
                                        <div className="space-y-4">
                                            {[
                                                { label: 'Email notifications', defaultChecked: true },
                                                { label: 'Migration completion alerts', defaultChecked: true },
                                                { label: 'Weekly reports', defaultChecked: false }
                                            ].map((item, index) => (
                                                <motion.label
                                                    key={item.label}
                                                    initial={{ opacity: 0, x: -20 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ delay: index * 0.1 }}
                                                    className="flex items-center space-x-3 p-3 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer"
                                                >
                                                    <input
                                                        type="checkbox"
                                                        defaultChecked={item.defaultChecked}
                                                        className="w-4 h-4 text-blue-600 bg-slate-100 border-slate-300 rounded focus:ring-blue-500 focus:ring-2"
                                                    />
                                                    <span className="text-slate-700 font-medium">{item.label}</span>
                                                </motion.label>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="border border-slate-200 rounded-2xl p-6">
                                        <div className="flex items-center space-x-4 mb-6">
                                            <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                                                <Settings className="h-6 w-6 text-orange-600" />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-slate-900 text-xl">Migration Preferences</h3>
                                                <p className="text-slate-600">Customize your migration experience.</p>
                                            </div>
                                        </div>
                                        <div className="space-y-4">
                                            {[
                                                { label: 'Auto-start migration after account connection', defaultChecked: true },
                                                { label: 'Pause on error', defaultChecked: false },
                                                { label: 'Preserve folder structure', defaultChecked: true }
                                            ].map((item, index) => (
                                                <motion.label
                                                    key={item.label}
                                                    initial={{ opacity: 0, x: -20 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ delay: index * 0.1 }}
                                                    className="flex items-center space-x-3 p-3 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer"
                                                >
                                                    <input
                                                        type="checkbox"
                                                        defaultChecked={item.defaultChecked}
                                                        className="w-4 h-4 text-blue-600 bg-slate-100 border-slate-300 rounded focus:ring-blue-500 focus:ring-2"
                                                    />
                                                    <span className="text-slate-700 font-medium">{item.label}</span>
                                                </motion.label>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </motion.div>
    )
}

export default Profile