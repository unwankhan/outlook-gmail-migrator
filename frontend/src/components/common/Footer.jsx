// frontend/src/components/common/Footer.jsx
import React from 'react'
import { Link } from 'react-router-dom'
import { Cloud, Mail, Github, Twitter, Heart } from 'lucide-react'
import { motion } from 'framer-motion'

const Footer = () => {
    const currentYear = new Date().getFullYear()

    const footerLinks = {
        product: [
            { name: 'Features', href: '/features' },
            { name: 'Migration', href: '/migrate' },
            { name: 'Pricing', href: '/pricing' },
            { name: 'API', href: '/api' }
        ],
        support: [
            { name: 'Documentation', href: '/docs' },
            { name: 'Help Center', href: '/help' },
            { name: 'Contact', href: '/contact' },
            { name: 'Status', href: '/status' }
        ],
        company: [
            { name: 'About', href: '/about' },
            { name: 'Blog', href: '/blog' },
            { name: 'Careers', href: '/careers' },
            { name: 'Privacy', href: '/privacy' }
        ]
    }

    const socialLinks = [
        { name: 'GitHub', icon: Github, href: 'https://github.com' },
        { name: 'Twitter', icon: Twitter, href: 'https://twitter.com' },
        { name: 'Email', icon: Mail, href: 'mailto:support@cloudmigrator.com' }
    ]

    return (
        <motion.footer
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="bg-gradient-to-br from-slate-900 to-slate-800 text-white mt-20"
        >
            <div className="container mx-auto px-4 py-12">
                {/* Main Footer Content */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-8">
                    {/* Brand Section */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="lg:col-span-2"
                    >
                        <Link to="/" className="flex items-center space-x-3 mb-6 no-underline">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                                <Cloud className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold">CloudMigrator Pro</h3>
                                <p className="text-slate-400 text-sm">Enterprise Migration Suite</p>
                            </div>
                        </Link>
                        <p className="text-slate-400 mb-6 max-w-md">
                            The most advanced cloud migration platform. Seamlessly transfer your data
                            between cloud services with enterprise-grade security and reliability.
                        </p>
                        <div className="flex space-x-4">
                            {socialLinks.map((social, index) => {
                                const Icon = social.icon
                                return (
                                    <motion.a
                                        key={social.name}
                                        href={social.href}
                                        whileHover={{ scale: 1.1, y: -2 }}
                                        whileTap={{ scale: 0.9 }}
                                        className="w-10 h-10 bg-slate-800 hover:bg-slate-700 rounded-xl flex items-center justify-center transition-colors duration-300 group"
                                    >
                                        <Icon className="h-5 w-5 text-slate-400 group-hover:text-white" />
                                    </motion.a>
                                )
                            })}
                        </div>
                    </motion.div>

                    {/* Links Sections */}
                    {Object.entries(footerLinks).map(([category, links], categoryIndex) => (
                        <motion.div
                            key={category}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: categoryIndex * 0.1 }}
                        >
                            <h4 className="font-semibold text-white mb-4 capitalize">
                                {category}
                            </h4>
                            <ul className="space-y-3">
                                {links.map((link, linkIndex) => (
                                    <motion.li
                                        key={link.name}
                                        initial={{ opacity: 0, x: -10 }}
                                        whileInView={{ opacity: 1, x: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: (categoryIndex * 0.1) + (linkIndex * 0.05) }}
                                    >
                                        <Link
                                            to={link.href}
                                            className="text-slate-400 hover:text-white transition-colors duration-300 text-sm font-medium"
                                        >
                                            {link.name}
                                        </Link>
                                    </motion.li>
                                ))}
                            </ul>
                        </motion.div>
                    ))}
                </div>

                {/* Bottom Bar */}
                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    className="border-t border-slate-700 pt-8 flex flex-col md:flex-row justify-between items-center"
                >
                    <div className="flex items-center space-x-2 text-slate-400 mb-4 md:mb-0">
                        <span>© {currentYear} CloudMigrator Pro. All rights reserved.</span>
                        <span className="hidden md:inline">•</span>
                        <span className="flex items-center">
              Made with <Heart className="h-4 w-4 text-red-500 mx-1" /> for the cloud
            </span>
                    </div>

                    <div className="flex items-center space-x-6 text-sm text-slate-400">
                        <Link to="/privacy" className="hover:text-white transition-colors">
                            Privacy Policy
                        </Link>
                        <Link to="/terms" className="hover:text-white transition-colors">
                            Terms of Service
                        </Link>
                        <Link to="/cookies" className="hover:text-white transition-colors">
                            Cookie Policy
                        </Link>
                    </div>
                </motion.div>
            </div>
        </motion.footer>
    )
}

export default Footer