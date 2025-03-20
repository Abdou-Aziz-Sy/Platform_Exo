export const isAdmin = process.env.REACT_APP_IS_ADMIN === 'true';

export const routes = {
    // Routes communes
    login: '/login',
    register: '/register',
    profile: '/profile',

    // Routes Frontoffice (étudiants)
    student: {
        dashboard: '/student/dashboard',
        exercises: '/student/exercises',
        submissions: '/student/submissions',
        results: '/student/results',
    },

    // Routes Backoffice (professeurs)
    admin: {
        dashboard: '/admin/dashboard',
        exercises: '/admin/exercises',
        students: '/admin/students',
        submissions: '/admin/submissions',
        statistics: '/admin/statistics',
    }
};

export const getBaseUrl = () => {
    return isAdmin ? process.env.REACT_APP_ADMIN_URL : process.env.REACT_APP_FRONTEND_URL;
}; 