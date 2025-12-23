// frontend/src/components/migration/MigrationWizard.jsx
import React from 'react'
import { CheckCircle, ArrowRight } from 'lucide-react'
import { motion } from 'framer-motion'

const MigrationWizard = ({ currentStep, steps, onStepChange }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-center mb-8"
        >
            <div className="flex items-center space-x-8">
                {steps.map((step, index) => (
                    <div key={step.id} className="flex items-center">
                        <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => onStepChange(step.id)}
                            className={`flex items-center justify-center w-14 h-14 rounded-2xl border-2 font-bold text-lg transition-all duration-300 relative ${
                                currentStep >= step.id
                                    ? 'bg-gradient-to-br from-blue-500 to-purple-600 border-transparent text-white shadow-lg'
                                    : 'border-slate-300 text-slate-500 bg-white'
                            }`}
                        >
                            {currentStep > step.id ? (
                                <CheckCircle className="h-6 w-6" />
                            ) : (
                                step.number
                            )}

                            {/* Active step glow */}
                            {currentStep === step.id && (
                                <motion.div
                                    animate={{ scale: [1, 1.2, 1] }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                    className="absolute -inset-1 bg-blue-500 rounded-2xl opacity-20 -z-10"
                                />
                            )}
                        </motion.button>

                        {/* Connector line */}
                        {index < steps.length - 1 && (
                            <motion.div
                                initial={{ scaleX: 0 }}
                                animate={{ scaleX: 1 }}
                                transition={{ delay: index * 0.1 }}
                                className={`w-24 h-1 rounded-full ${
                                    currentStep > step.id
                                        ? 'bg-gradient-to-r from-blue-500 to-purple-600'
                                        : 'bg-slate-300'
                                }`}
                            />
                        )}
                    </div>
                ))}
            </div>
        </motion.div>
    )
}

export default MigrationWizard