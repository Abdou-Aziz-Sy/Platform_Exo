import axios from 'axios';

// URL de base de l'API
export const API_URL = 'http://localhost:8000/api';
export const UPLOADS_URL = 'http://localhost:8000/api/uploads';

// Configuration par défaut d'Axios
axios.defaults.withCredentials = true;
axios.defaults.headers.common['Content-Type'] = 'application/json';

export const API_ROUTES = {
    // Routes d'authentification
    AUTH: {
        LOGIN: '/auth/token',
        REGISTER: '/auth/register',
        ME: '/auth/me',
    },
    // Routes des exercices
    EXERCISES: {
        LIST: '/exercises',
        CREATE: '/exercises',
        GET: (id) => `/exercises/${id}`,
        UPDATE: (id) => `/exercises/${id}`,
        DELETE: (id) => `/exercises/${id}`,
        SEARCH: '/exercises/search',
        FILE: (path) => `${UPLOADS_URL}/exercises/${path}`,
    },
    // Routes des soumissions
    SUBMISSIONS: {
        LIST: '/submissions',
        CREATE: '/submissions',
        GET: (id) => `/submissions/${id}`,
        UPDATE: (id) => `/submissions/${id}`,
        DELETE: (id) => `/submissions/${id}`,
        SEARCH: '/submissions/search',
        DETAILS: '/submissions',
        FILE: (path) => `${UPLOADS_URL}/submissions/${path}`,
    },
    // Routes des notifications
    NOTIFICATIONS: {
        LIST: '/notifications',
        UNREAD: '/notifications/unread',
        MARK_READ: (id) => `/notifications/${id}/read`,
    },
    // Routes des statistiques
    STATISTICS: {
        GLOBAL: '/statistics/global',
        EXERCISE: (id) => `/statistics/exercise/${id}`,
        STUDENT: (id) => `/statistics/student/${id}`,
    }
}; 