export const MIGRATION_TYPES = {
    MAIL: 'mail',
    CONTACTS: 'contacts',
    CALENDAR: 'calendar',
    DRIVE: 'drive',
    ALL: 'all'
}

export const JOB_STATUS = {
    PENDING: 'pending',
    IN_PROGRESS: 'in_progress',
    COMPLETED: 'completed',
    FAILED: 'failed',
    PAUSED: 'paused',
    CANCELLED: 'cancelled'
}

export const API_ENDPOINTS = {
    AUTH: {
        LOGIN: '/api/auth/login',
        SIGNUP: '/api/auth/signup',
        VALIDATE_TOKEN: '/api/auth/validate-token',
        OAUTH_TOKENS: '/api/oauth/tokens'
    },
    MIGRATION: {
        START: '/api/migration/start',
        STATUS: '/api/migration/status',
        OUTLOOK_FOLDERS: '/api/migration/outlook/folders',
        OUTLOOK_EMAILS_PREVIEW: '/api/migration/outlook/emails/preview',
        OUTLOOK_CONTACTS_PREVIEW: '/api/migration/outlook/contacts/preview'
    },
    STATUS: {
        JOB: '/api/status/job',
        USER_JOBS: '/api/status/user/jobs'
    }
}

export const OAUTH_PROVIDERS = {
    OUTLOOK: 'outlook',
    GMAIL: 'gmail'
}