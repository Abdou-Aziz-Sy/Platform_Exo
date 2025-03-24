import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../config/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        try {
            const token = localStorage.getItem('token');
            if (token) {
                const response = await axios.get(`${API_URL}/auth/me`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                setUser(response.data);
            }
        } catch (err) {
            console.error('Auth check failed:', err);
            localStorage.removeItem('token');
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    const login = async (email, password) => {
        try {
            console.log('AuthContext: préparation de la requête de login');
            
            // Créer les données au format FormData (attendu par FastAPI OAuth2)
            const formData = new FormData();
            formData.append('username', email);    // Le backend attend "username", pas "email"
            formData.append('password', password);
            
            console.log('AuthContext: envoi de la requête de login');
            
            const response = await axios.post(`${API_URL}/auth/token`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            
            console.log('AuthContext: réponse reçue', { success: !!response.data.access_token });
            
            if (response.data.access_token) {
                localStorage.setItem('token', response.data.access_token);
                
                // Récupérer les infos utilisateur
                console.log('AuthContext: récupération des infos utilisateur');
                const userInfo = await axios.get(`${API_URL}/auth/me`, {
                    headers: { 'Authorization': `Bearer ${response.data.access_token}` }
                });
                
                console.log('AuthContext: infos utilisateur reçues', { 
                    id: userInfo.data.id,
                    role: userInfo.data.role,
                    email: userInfo.data.email
                });
                
                localStorage.setItem('userId', userInfo.data.id);
                localStorage.setItem('userRole', userInfo.data.role);
                setUser(userInfo.data);
                return userInfo.data;
            } else {
                throw new Error('Token non reçu dans la réponse');
            }
        } catch (err) {
            console.error('AuthContext: erreur login', { 
                message: err.message,
                status: err.response?.status,
                data: err.response?.data 
            });
            setError(err.response?.data?.detail || 'Erreur de connexion');
            throw err;
        }
    };

    const register = async (userData) => {
        try {
            const response = await axios.post(`${API_URL}/auth/register`, userData, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            // Se connecter automatiquement après l'inscription
            if (response.data && response.data.email) {
                await login(userData.email, userData.password);
                return response.data;
            }
            return response.data;
        } catch (err) {
            setError(err.response?.data?.detail || 'Erreur d\'inscription');
            throw err;
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        localStorage.removeItem('userRole');
        setUser(null);
        setError(null);
    };

    // Ajouter un intercepteur Axios pour gérer les tokens expirés
    useEffect(() => {
        const interceptor = axios.interceptors.response.use(
            response => response,
            async error => {
                // Si erreur 401, déconnexion automatique
                if (error.response?.status === 401) {
                    setUser(null);
                    localStorage.removeItem('token');
                    localStorage.removeItem('userId');
                    localStorage.removeItem('userRole');
                }
                return Promise.reject(error);
            }
        );

        return () => axios.interceptors.response.eject(interceptor);
    }, []);

    const value = {
        user,
        loading,
        error,
        login,
        register,
        logout,
        checkAuth
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export default AuthContext; 