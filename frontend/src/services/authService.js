import axios from 'axios';
import { API_URL, API_ROUTES } from '../config/api';

// Configuration de l'intercepteur Axios
axios.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

axios.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (error.response?.status === 401) {
            // Token expiré ou invalide
            localStorage.removeItem('token');
            localStorage.removeItem('userRole');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

const authService = {
    // Fonction de connexion
    login: async (email, password) => {
        const formData = new FormData();
        formData.append('username', email);
        formData.append('password', password);
        
        try {
            const response = await axios.post(
                `${API_URL}${API_ROUTES.AUTH.LOGIN}`,
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                }
            );
            
            if (response.data.access_token) {
                localStorage.setItem('token', response.data.access_token);
                // Récupérer et stocker le rôle de l'utilisateur
                const user = await authService.getCurrentUser();
                if (user) {
                    localStorage.setItem('userRole', user.role);
                }
            }
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // Fonction d'inscription
    register: async (userData) => {
        try {
            const response = await axios.post(
                `${API_URL}${API_ROUTES.AUTH.REGISTER}`,
                {
                    email: userData.email,
                    password: userData.password,
                    full_name: userData.full_name,
                    role: userData.role
                }
            );
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // Fonction de déconnexion
    logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('userRole');
        window.location.href = '/login';
    },

    // Fonction pour récupérer l'utilisateur courant
    getCurrentUser: async () => {
        const token = localStorage.getItem('token');
        if (!token) return null;

        try {
            const response = await axios.get(
                `${API_URL}${API_ROUTES.AUTH.ME}`
            );
            return response.data;
        } catch (error) {
            console.error('Erreur lors de la récupération de l\'utilisateur:', error);
            if (error.response?.status === 401) {
                authService.logout();
            }
            return null;
        }
    },

    // Fonction pour vérifier si l'utilisateur est connecté
    isAuthenticated: () => {
        return !!localStorage.getItem('token');
    },

    // Fonction pour obtenir le rôle de l'utilisateur
    getUserRole: () => {
        return localStorage.getItem('userRole');
    }
};

export default authService; 