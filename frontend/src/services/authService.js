import axios from 'axios';
import { API_URL, API_ROUTES } from '../config/api';

/**
 * Service d'authentification simplifié - uniquement des fonctions utilitaires
 * Les fonctions principales d'authentification sont gérées par AuthContext
 */
const authService = {
    /**
     * Vérifie si l'utilisateur est authentifié
     * @returns {boolean} Vrai si l'utilisateur est authentifié
     */
    isAuthenticated: () => {
        return !!localStorage.getItem('token');
    },

    /**
     * Obtient le rôle de l'utilisateur
     * @returns {string|null} Le rôle de l'utilisateur ou null s'il n'est pas connecté
     */
    getUserRole: () => {
        return localStorage.getItem('userRole');
    },

    /**
     * Obtient l'ID de l'utilisateur
     * @returns {string|null} L'ID de l'utilisateur ou null s'il n'est pas connecté
     */
    getUserId: () => {
        return localStorage.getItem('userId');
    },
    
    /**
     * Obtient le token d'authentification
     * @returns {string|null} Le token d'authentification ou null s'il n'est pas connecté
     */
    getToken: () => {
        return localStorage.getItem('token');
    }
};

export default authService; 