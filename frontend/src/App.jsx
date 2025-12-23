// frontend/src/App.jsx
import React from 'react'
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { NotificationProvider } from './contexts/NotificationContext'
import { MigrationProvider } from './contexts/MigrationContext'
import ToastNotification from './components/common/ToastNotification'
import Header from './components/common/Header'
import Footer from './components/common/Footer'
import { AnimatePresence, motion } from 'framer-motion'

// Pages
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Migration from './pages/Migration'
import History from './pages/History'
import Profile from './pages/Profile'
import OAuthCallback from './pages/OAuthCallback'
import Signup from './pages/Signup'

// Page transition component
const PageTransition = ({ children }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{
                type: "spring",
                stiffness: 300,
                damping: 30,
                duration: 0.3
            }}
        >
            {children}
        </motion.div>
    )
}

function AnimatedRoutes() {
    const location = useLocation()

    return (
        <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>
                <Route path="/" element={<PageTransition><Dashboard /></PageTransition>} />
                <Route path="/login" element={<PageTransition><Login /></PageTransition>} />
                <Route path="/signup" element={<PageTransition><Signup /></PageTransition>} />
                <Route path="/migrate" element={<PageTransition><Migration /></PageTransition>} />
                <Route path="/history" element={<PageTransition><History /></PageTransition>} />
                <Route path="/profile" element={<PageTransition><Profile /></PageTransition>} />
                <Route path="/oauth/callback" element={<PageTransition><OAuthCallback /></PageTransition>} />
            </Routes>
        </AnimatePresence>
    )
}

function App() {
    return (
        <Router>
            <NotificationProvider>
                <AuthProvider>
                    <MigrationProvider>
                        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex flex-col">
                            <Header />
                            {/* CHANGED: Added pt-16 to account for fixed header height */}
                            <main className="flex-1 pt-16">
                                <AnimatedRoutes />
                            </main>
                            <Footer />
                            <ToastNotification />
                        </div>
                    </MigrationProvider>
                </AuthProvider>
            </NotificationProvider>
        </Router>
    )
}

export default App