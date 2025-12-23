// frontend/src/components/migration/DataPreview.jsx
import React from 'react'
import { Download, Eye, FileText, Mail, Users, Calendar, Cloud } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const DataPreview = ({ data, type, onSelect }) => {
    const getIcon = (itemType) => {
        const icons = {
            email: Mail,
            contact: Users,
            event: Calendar,
            file: FileText
        }
        return icons[itemType] || FileText
    }

    const formatData = (item, itemType) => {
        const formats = {
            email: {
                title: item.subject,
                subtitle: `From: ${item.from}`,
                date: item.receivedDateTime,
                meta: `Size: ${item.size || 'N/A'}`
            },
            contact: {
                title: item.name,
                subtitle: item.email,
                date: null,
                meta: `Phone: ${item.phone || 'N/A'}`
            },
            event: {
                title: item.title,
                subtitle: item.location,
                date: item.startTime,
                meta: `Duration: ${item.duration || 'N/A'}`
            },
            file: {
                title: item.name,
                subtitle: `Type: ${item.type || 'Unknown'}`,
                date: item.createdTime,
                meta: `Size: ${item.size ? `${(item.size / 1024).toFixed(1)}KB` : 'N/A'}`
            }
        }
        return formats[itemType] || { title: item.name || item.title, subtitle: '', date: null, meta: '' }
    }

    const getTypeColor = (itemType) => {
        const colors = {
            email: 'bg-blue-500',
            contact: 'bg-green-500',
            event: 'bg-purple-500',
            file: 'bg-orange-500'
        }
        return colors[itemType] || 'bg-slate-500'
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="premium-card p-6"
        >
            <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-slate-900 text-xl">Data Preview</h3>
                <div className="flex space-x-2">
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="bg-slate-500 hover:bg-slate-600 text-white px-4 py-2.5 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl flex items-center"
                    >
                        <Eye className="h-4 w-4 mr-2" />
                        Preview
                    </motion.button>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-4 py-2.5 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl flex items-center"
                    >
                        <Download className="h-4 w-4 mr-2" />
                        Export
                    </motion.button>
                </div>
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                <AnimatePresence>
                    {data.map((item, index) => {
                        const Icon = getIcon(type)
                        const formatted = formatData(item, type)
                        const colorClass = getTypeColor(type)

                        return (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                transition={{ delay: index * 0.05 }}
                                onClick={() => onSelect && onSelect(item)}
                                className="flex items-center space-x-4 p-4 border border-slate-200 rounded-xl hover:bg-slate-50 cursor-pointer transition-all duration-300 group hover-lift"
                            >
                                <div className={`w-12 h-12 ${colorClass} rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                                    <Icon className="h-6 w-6 text-white" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-semibold text-slate-900 truncate group-hover:text-blue-600 transition-colors">
                                        {formatted.title}
                                    </h4>
                                    {formatted.subtitle && (
                                        <p className="text-sm text-slate-600 truncate">{formatted.subtitle}</p>
                                    )}
                                    {formatted.meta && (
                                        <p className="text-xs text-slate-500 mt-1">{formatted.meta}</p>
                                    )}
                                </div>
                                {formatted.date && (
                                    <div className="text-sm text-slate-500 whitespace-nowrap">
                                        {new Date(formatted.date).toLocaleDateString()}
                                    </div>
                                )}
                            </motion.div>
                        )
                    })}
                </AnimatePresence>
            </div>

            {data.length === 0 && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-8"
                >
                    <Cloud className="h-12 w-12 text-slate-400 mx-auto mb-3" />
                    <p className="text-slate-600 font-medium">No data available for preview</p>
                    <p className="text-sm text-slate-500 mt-1">Start migration to see data here</p>
                </motion.div>
            )}

            {/* Summary */}
            {data.length > 0 && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-200"
                >
                    <p className="text-sm text-slate-600 text-center">
                        Showing {data.length} items • Ready for migration
                    </p>
                </motion.div>
            )}
        </motion.div>
    )
}

export default DataPreview