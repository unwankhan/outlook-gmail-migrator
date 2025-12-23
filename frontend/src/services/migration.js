
// frontend/src/services/migration.js
import api from './api';

// ✅ Service base URLs
const MIGRATION_BASE = import.meta.env.PROD ? '' : 'http://localhost:8082';
const STATUS_BASE = import.meta.env.PROD ? '' : 'http://localhost:8083';

export const migrationService = {
    startMigration: async (migrationType, tokens) => {
        try {
            console.log('🚀 Starting migration:', migrationType);

            const response = await api.post(`${MIGRATION_BASE}/api/migration/start`, {
                migrationType,
                outlookAccessToken: tokens.outlook.accessToken,
                gmailAccessToken: tokens.gmail.accessToken
            });

            console.log('✅ Migration started:', response.data);
            return response.data;
        } catch (error) {
            console.error('❌ Migration start error:', error);
            throw new Error(error.response?.data?.message || 'Migration start failed');
        }
    },

    getJobStatus: async (jobId) => {
        try {
            const userId = localStorage.getItem('userId');
            console.log('🔄 Getting job status:', jobId, 'for user:', userId);

            // ✅ FIXED: Add user ID header for status service
            const response = await api.get(`${STATUS_BASE}/api/status/job/${jobId}`, {
                headers: {
                    'X-User-Id': userId
                }
            });

            console.log('✅ Job status received:', response.data);
            return response.data;
        } catch (error) {
            console.error('❌ Get job status error:', error);
            console.log('Error response:', error.response?.data);
            throw error;
        }
    },

    getUserJobs: async () => {
        try {
            const userId = localStorage.getItem('userId');
            console.log('🔄 Fetching jobs for user:', userId);

            const response = await api.get(`${STATUS_BASE}/api/status/user/jobs/${userId}`);
            console.log('✅ User jobs received:', response.data);

            return response.data;
        } catch (error) {
            console.error('❌ Error fetching user jobs:', error);
            console.log('Error details:', error.response?.data);
            return [];
        }
    },

    pauseMigration: async (jobId) => {
        try {
            const response = await api.post(`${MIGRATION_BASE}/api/migration/pause/${jobId}`);
            return response.data;
        } catch (error) {
            console.error('❌ Pause migration error:', error);
            throw error;
        }
    },

    resumeMigration: async (jobId) => {
        try {
            const response = await api.post(`${MIGRATION_BASE}/api/migration/resume/${jobId}`);
            return response.data;
        } catch (error) {
            console.error('❌ Resume migration error:', error);
            throw error;
        }
    },

    cancelMigration: async (jobId) => {
        try {
            const response = await api.post(`${MIGRATION_BASE}/api/migration/cancel/${jobId}`);
            return response.data;
        } catch (error) {
            console.error('❌ Cancel migration error:', error);
            throw error;
        }
    }
};