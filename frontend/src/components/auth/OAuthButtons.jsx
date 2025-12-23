// frontend/src/components/auth/OAuthButtons.jsx
import React from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { Mail, Microsoft, Google } from 'lucide-react'
import { motion } from 'framer-motion'

const OAuthButtons = () => {
    const { connectOutlook, connectGmail } = useAuth()

    const oauthProviders = [
        {
            name: 'Microsoft Outlook',
            provider: 'outlook',
            icon: Microsoft,
            color: 'from-blue-500 to-blue-600',
            bgColor: 'bg-blue-500',
            action: connectOutlook
        },
        {
            name: 'Google Gmail',
            provider: 'gmail',
            icon: Google,
            color: 'from-red-500 to-red-600',
            bgColor: 'bg-red-500',
            action: connectGmail
        }
    ]

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-4"
        >
            <div className="relative">
                <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-slate-500 font-medium">Or continue with</span>
                </div>
            </div>

            <div className="space-y-3">
                {oauthProviders.map((provider, index) => {
                    const Icon = provider.icon
                    return (
                        <motion.button
                            key={provider.provider}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.4 + index * 0.1 }}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={provider.action}
                            className="w-full flex items-center justify-center px-4 py-3.5 border-2 border-slate-200 rounded-xl shadow-sm bg-white text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all duration-300 group"
                        >
                            <div className={`w-8 h-8 ${provider.bgColor} rounded-lg flex items-center justify-center mr-3 group-hover:scale-110 transition-transform duration-300`}>
                                <Icon className="h-4 w-4 text-white" />
                            </div>
                            Connect {provider.name}
                        </motion.button>
                    )
                })}
            </div>
        </motion.div>
    )
}

export default OAuthButtons