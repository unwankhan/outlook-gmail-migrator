# 📧 Outlook to Gmail Migrator - Enterprise Edition

<div align="center">

![Java](https://img.shields.io/badge/Java-11+-orange)
![Spring Boot](https://img.shields.io/badge/Spring%20Boot-2.7+-green)
![React](https://img.shields.io/badge/React-18-blue)
![MongoDB](https://img.shields.io/badge/MongoDB-5.0+-brightgreen)
![Docker](https://img.shields.io/badge/Docker-20.10+-blue)

🚀 **Enterprise-grade migration tool for transferring data from Outlook to Gmail**

[Features](#-features) • [Quick Start](#-quick-start) • [Architecture](#-architecture) • [Documentation](#-documentation)

</div>

## 📖 Overview

**Outlook-Gmail Migrator** is a full-stack application that enables seamless migration of emails, contacts, calendar events, and drive files from Microsoft Outlook/Office 365 to Google Workspace. Built with microservices architecture, it provides a secure, scalable, and user-friendly interface for data migration.

### ✨ Key Features

- **🔐 Secure OAuth Authentication** - Microsoft 365 & Google OAuth 2.0 integration
- **📦 Multi-Data Migration** - Emails, Contacts, Calendar, Drive files
- **⚡ Real-time Progress Tracking** - Live WebSocket updates
- **🎯 Selective Migration** - Choose specific data types to transfer
- **🔄 Pause/Resume/Cancel** - Control migration jobs on-the-fly
- **📊 Dashboard Analytics** - Visual migration statistics and history
- **🐳 Docker Support** - Easy deployment with Docker Compose
- **🔒 Enterprise Security** - JWT tokens, encrypted credentials

## 🏗️ Architecture

### System Architecture

```
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
```

### Technology Stack

| Component       | Technology Stack |
|-----------------|------------------|
| **Frontend**    | React 18, Vite, Tailwind CSS, Framer Motion, React Hot Toast |
| **Backend**     | Spring Boot 2.7, Java 11, Spring Security, Spring WebSocket |
| **Database**    | MongoDB 5.0+ |
| **API Gateway** | Spring Cloud Gateway |
| **Authentication** | JWT, OAuth 2.0 (Microsoft & Google) |
| **Real-time**   | WebSocket (STOMP), SockJS |
| **Container**   | Docker, Docker Compose |
| **Build Tools** | Maven, npm |

## 🚀 Quick Start

### Prerequisites

- **Java 11** or higher
- **Node.js 18** or higher
- **MongoDB 5.0+** (local or Atlas)
- **Docker** & **Docker Compose** (optional)
- **OAuth Credentials** from [Azure Portal](https://portal.azure.com) and [Google Cloud Console](https://console.cloud.google.com)

### Option 1: Docker (Recommended)

```bash
# 1. Clone the repository
git clone https://github.com/yourusername/outlook-gmail-migrator.git
cd outlook-gmail-migrator

# 2. Copy environment template and configure
cp .env.example .env
# Edit .env file with your credentials
# nano .env or vscode .env

# 3. Start all services
docker-compose up -d

# 4. Access the application
# Frontend: http://localhost:5173
# API Gateway: http://localhost:8080
```

### Option 2: Manual Setup

```bash
# 1. Clone and setup environment
git clone https://github.com/yourusername/outlook-gmail-migrator.git
cd outlook-gmail-migrator
cp .env.example .env
# Edit .env with your credentials

# 2. Start MongoDB
# Option A: Local MongoDB
mongod --dbpath ./data/db

# Option B: MongoDB Atlas
# Update MONGODB_URI in .env file

# 3. Start backend services (each in separate terminal)
cd auth-service && ./mvnw spring-boot:run
cd ../migration-service && ./mvnw spring-boot:run
cd ../status-service && ./mvnw spring-boot:run
cd ../gateway-service && ./mvnw spring-boot:run

# 4. Start frontend
cd ../frontend
npm install
npm run dev

# 5. Access the application
# Frontend: http://localhost:5173
```

## ⚙️ Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
# ============ DATABASE ============
MONGODB_URI=mongodb://localhost:27017/migrator
# For MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/migrator

# ============ OUTLOOK OAUTH ============
# Register at: https://portal.azure.com/#blade/Microsoft_AAD_RegisteredApps/ApplicationsListBlade
OUTLOOK_CLIENT_ID=your_azure_app_client_id
OUTLOOK_CLIENT_SECRET=your_azure_app_client_secret
OUTLOOK_TENANT_ID=common

# ============ GMAIL OAUTH ============
# Register at: https://console.cloud.google.com/apis/credentials
GMAIL_CLIENT_ID=your_google_cloud_client_id
GMAIL_CLIENT_SECRET=your_google_cloud_client_secret

# ============ JWT SECRET ============
# Generate with: openssl rand -base64 32
JWT_SECRET=your-32-character-secret-key-here

# ============ SERVICE PORTS ============
AUTH_SERVICE_PORT=8081
MIGRATION_SERVICE_PORT=8082
STATUS_SERVICE_PORT=8083
GATEWAY_SERVICE_PORT=8080
FRONTEND_PORT=5173

# ============ FRONTEND ============
VITE_API_BASE_URL=http://localhost:8080
VITE_WS_URL=http://localhost:8083

# ============ MIGRATION SETTINGS ============
MIGRATION_BATCH_SIZE=50
MIGRATION_RATE_LIMIT_DELAY=1000
```

### OAuth Setup Instructions

#### Microsoft Outlook Setup:
1. Go to [Azure Portal](https://portal.azure.com)
2. Create a new App Registration
3. Add API permissions:
   - `Mail.Read`, `Mail.Send`
   - `Contacts.Read`
   - `Calendars.Read`
   - `Files.Read`
   - `User.Read`
4. Set redirect URI: `http://localhost:8081/callback/outlook`

#### Google Gmail Setup:
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project
3. Enable APIs:
   - Gmail API
   - People API (Contacts)
   - Calendar API
   - Drive API
4. Create OAuth 2.0 credentials
5. Set redirect URI: `http://localhost:8081/callback/gmail`

## 📁 Project Structure

```
outlook-gmail-migrator/
├── frontend/                    # React frontend application
│   ├── src/
│   │   ├── components/          # React components
│   │   ├── contexts/            # React contexts (Auth, Migration, Notification)
│   │   ├── hooks/              # Custom React hooks
│   │   ├── pages/              # Application pages
│   │   ├── services/           # API services
│   │   └── utils/              # Utility functions
│   ├── public/
│   ├── package.json
│   └── vite.config.js
│
├── auth-service/                # Authentication & OAuth service
│   ├── src/main/java/com/unwan/auth/
│   │   ├── config/             # Security & CORS config
│   │   ├── controller/         # REST controllers
│   │   ├── model/              # Data models
│   │   ├── repository/         # MongoDB repositories
│   │   ├── service/            # Business logic
│   │   └── AuthServiceApplication.java
│   └── pom.xml
│
├── migration-service/           # Core migration service
│   ├── src/main/java/com/unwan/migration/
│   │   ├── controller/         # Migration endpoints
│   │   ├── model/              # Data models
│   │   ├── service/            # Migration logic (Outlook & Gmail APIs)
│   │   └── MigrationServiceApplication.java
│   └── pom.xml
│
├── status-service/              # Job status & WebSocket service
│   ├── src/main/java/com/unwan/status/
│   │   ├── config/             # WebSocket config
│   │   ├── controller/         # Status endpoints
│   │   ├── model/              # Job models
│   │   ├── repository/         # MongoDB repositories
│   │   ├── service/            # Status tracking
│   │   └── StatusServiceApplication.java
│   └── pom.xml
│
├── gateway-service/             # API Gateway
│   ├── src/main/java/com/unwan/gateway/
│   │   ├── config/             # Gateway config
│   │   ├── controller/         # Gateway endpoints
│   │   ├── model/              # DTOs
│   │   ├── resolver/           # GraphQL resolvers
│   │   └── GatewayServiceApplication.java
│   └── pom.xml
│
├── docker-compose.yml          # Docker Compose configuration
├── .env.example                # Environment variables template
├── .gitignore                  # Git ignore rules
└── README.md                   # This file
```

## 🔧 API Documentation

### REST API Endpoints

| Service | Endpoint | Method | Description |
|---------|----------|--------|-------------|
| **Auth** | `/api/auth/login` | POST | User login |
| **Auth** | `/api/auth/signup` | POST | User registration |
| **Auth** | `/api/oauth/tokens/{userId}` | GET | Get user OAuth tokens |
| **Migration** | `/api/migration/start` | POST | Start migration job |
| **Migration** | `/api/migration/status/{jobId}` | GET | Get job status |
| **Migration** | `/api/migration/pause/{jobId}` | POST | Pause migration |
| **Migration** | `/api/migration/resume/{jobId}` | POST | Resume migration |
| **Migration** | `/api/migration/cancel/{jobId}` | POST | Cancel migration |
| **Status** | `/api/status/job/{jobId}` | GET | Get detailed job status |
| **Status** | `/api/status/user/jobs/{userId}` | GET | Get user's migration history |

### WebSocket Endpoints

- **Connection URL**: `ws://localhost:8083/ws`
- **Subscribe to user updates**: `/user/queue/progress`
- **Broadcast updates**: `/topic/migration-progress`

## 🎯 Usage Guide

### 1. User Registration/Login
- Create an account or login with existing credentials
- Dashboard will show your migration statistics

### 2. Connect Accounts
- Connect your Microsoft Outlook account
- Connect your Google Gmail account
- Both accounts must be connected before migration

### 3. Select Migration Type
- Choose what to migrate:
  - 📧 **Emails**: All emails and folders
  - 👥 **Contacts**: Contact lists and groups
  - 📅 **Calendar**: Events and appointments
  - 📁 **Drive Files**: Documents and files
  - 🚀 **Everything**: Complete data transfer

### 4. Start Migration
- Click "Start Migration"
- Monitor real-time progress
- Pause/Resume/Cancel as needed

### 5. View History
- Check migration history
- View detailed logs
- Download reports

## 🐛 Troubleshooting

### Common Issues

1. **OAuth Connection Failed**
   - Check client ID/secret in `.env`
   - Verify redirect URIs in Azure/Google console
   - Ensure scopes are properly configured

2. **MongoDB Connection Error**
   - Check if MongoDB is running
   - Verify connection string in `.env`
   - Check firewall settings for MongoDB Atlas

3. **Migration Stuck/Error**
   - Check token expiration (tokens expire in 1 hour)
   - Verify sufficient permissions in OAuth scopes
   - Check rate limits for Outlook/Gmail APIs

4. **WebSocket Not Connecting**
   - Ensure status-service is running
   - Check CORS configuration
   - Verify frontend WebSocket URL

### Logs

```bash
# Docker logs
docker-compose logs -f [service_name]

# Individual service logs
docker-compose logs -f auth-service
docker-compose logs -f migration-service
docker-compose logs -f status-service
docker-compose logs -f gateway-service
docker-compose logs -f frontend
```

## 📈 Performance & Scalability

- **Batch Processing**: Migrates data in batches to avoid rate limits
- **Parallel Processing**: Handles multiple migration types concurrently
- **Resume Capability**: Can resume from last checkpoint if interrupted
- **Rate Limiting**: Built-in delays to respect API rate limits
- **Error Handling**: Comprehensive error handling and retry logic

## 🔒 Security Features

- **End-to-end Encryption**: All data encrypted in transit
- **Token-based Authentication**: JWT for API security
- **OAuth 2.0**: Secure account connections
- **No Data Storage**: Credentials are not stored, only OAuth tokens
- **Input Validation**: Protection against injection attacks
- **CORS Protection**: Configured for specific origins

## 🧪 Testing

```bash
# Run backend tests
cd auth-service && ./mvnw test
cd ../migration-service && ./mvnw test
cd ../status-service && ./mvnw test
cd ../gateway-service && ./mvnw test

# Run frontend tests
cd ../frontend
npm test
```

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Commit your changes**
   ```bash
   git commit -m 'Add some amazing feature'
   ```
4. **Push to the branch**
   ```bash
   git push origin feature/amazing-feature
   ```
5. **Open a Pull Request**

### Development Guidelines

- Follow existing code style and patterns
- Write meaningful commit messages
- Add tests for new features
- Update documentation as needed
- Ensure no secrets are committed


## 🙏 Acknowledgments

- **Microsoft Graph API** for Outlook integration
- **Google APIs** for Gmail integration
- **Spring Boot** for robust backend framework
- **React** for modern frontend development
- **MongoDB** for flexible data storage

## 📞 Support

For support, please:
1. Check the [Troubleshooting](#-troubleshooting) section
2. Search existing [Issues](https://github.com/yourusername/outlook-gmail-migrator/issues)
3. Create a new issue with detailed description

---

<div align="center">

### Made with ❤️ by [Unwan Khan]

**Star this repo if you found it useful!** ⭐

</div>
