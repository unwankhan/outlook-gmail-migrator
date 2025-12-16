📧 Outlook to Gmail Migrator - Enterprise Edition
<div align="center">
https://img.shields.io/badge/Java-11+-orange
https://img.shields.io/badge/Spring%2520Boot-2.7+-green
https://img.shields.io/badge/React-18-blue
https://img.shields.io/badge/MongoDB-5.0+-brightgreen
https://img.shields.io/badge/Docker-20.10+-blue
https://img.shields.io/badge/License-MIT-yellow

🚀 Enterprise-grade migration tool for transferring data from Outlook to Gmail

Features • Quick Start • Architecture • Documentation

</div>
📖 Overview
Outlook-Gmail Migrator is a full-stack application that enables seamless migration of emails, contacts, calendar events, and drive files from Microsoft Outlook/Office 365 to Google Workspace. Built with microservices architecture, it provides a secure, scalable, and user-friendly interface for data migration.

✨ Key Features
🔐 Secure OAuth Authentication - Microsoft 365 & Google OAuth 2.0 integration

📦 Multi-Data Migration - Emails, Contacts, Calendar, Drive files

⚡ Real-time Progress Tracking - Live WebSocket updates

🎯 Selective Migration - Choose specific data types to transfer

🔄 Pause/Resume/Cancel - Control migration jobs on-the-fly

📊 Dashboard Analytics - Visual migration statistics and history

🐳 Docker Support - Easy deployment with Docker Compose

🔒 Enterprise Security - JWT tokens, encrypted credentials

🏗️ Architecture
System Architecture
text
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (React + Vite)                   │
│                    http://localhost:5173                     │
└──────────────────────────────┬──────────────────────────────┘
                               │
┌──────────────────────────────▼──────────────────────────────┐
│                    API Gateway (Spring Boot)                 │
│                    http://localhost:8080                     │
└─────┬──────────────────┬──────────────────┬─────────────────┘
      │                  │                  │
┌─────▼─────┐    ┌──────▼──────┐    ┌──────▼──────┐
│  Auth     │    │  Migration  │    │   Status    │
│ Service   │    │  Service    │    │   Service   │
│ :8081     │    │  :8082      │    │   :8083     │
└─────┬─────┘    └──────┬──────┘    └──────┬──────┘
      │                  │                  │
      └──────────────────┼──────────────────┘
                         │
                ┌────────▼────────┐
                │   MongoDB       │
                │   :27017        │
                └─────────────────┘
Technology Stack
Component	Technology Stack
Frontend	React 18, Vite, Tailwind CSS, Framer Motion, React Hot Toast
Backend	Spring Boot 2.7, Java 11, Spring Security, Spring WebSocket
Database	MongoDB 5.0+
API Gateway	Spring Cloud Gateway
Authentication	JWT, OAuth 2.0 (Microsoft & Google)
Real-time	WebSocket (STOMP), SockJS
Container	Docker, Docker Compose
Build Tools	Maven, npm
🚀 Quick Start
Prerequisites
Java 11 or higher

Node.js 18 or higher

MongoDB 5.0+ (local or Atlas)

Docker & Docker Compose (optional)

OAuth Credentials from Azure Portal and Google Cloud Console
