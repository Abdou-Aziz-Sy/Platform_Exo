import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaEnvelope, FaLock, FaExclamationTriangle } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';

const Login = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const { login } = useAuth();

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Validation de base
        if (!formData.email || !formData.password) {
            setError('Veuillez remplir tous les champs');
            return;
        }
        
        try {
            setIsSubmitting(true);
            setError('');
            
            console.log('Tentative de connexion avec l\'email:', formData.email);
            
            // Utilise directement le contexte d'authentification au lieu du service
            const userData = await login(formData.email, formData.password);
            
            console.log('Connexion réussie, utilisateur:', {
                id: userData?.id,
                role: userData?.role,
                email: userData?.email
            });
            
            navigate('/dashboard');
        } catch (err) {
            console.error('Erreur détaillée:', {
                message: err.message,
                status: err.response?.status,
                statusText: err.response?.statusText,
                data: err.response?.data
            });
            
            // Messages d'erreur plus précis
            if (err.response?.status === 401) {
                setError('Email ou mot de passe incorrect');
            } else if (err.response?.status === 404) {
                setError('Service indisponible. Veuillez réessayer ultérieurement.');
            } else {
                setError(err.response?.data?.detail || 'Erreur lors de la connexion');
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-900 via-blue-900 to-blue-800 py-12 px-4 sm:px-6 lg:px-8">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="max-w-md w-full space-y-8 bg-white bg-opacity-10 backdrop-filter backdrop-blur-lg p-10 rounded-xl shadow-xl"
            >
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
                        Connexion
                    </h2>
                    <p className="mt-2 text-center text-sm text-indigo-200">
                        Accédez à votre espace personnel
                    </p>
                </div>

                {error && (
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md"
                    >
                        <div className="flex items-center">
                            <FaExclamationTriangle className="h-5 w-5 text-red-500 mr-2" />
                            <p>{error}</p>
                        </div>
                    </motion.div>
                )}

                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="rounded-md shadow-sm space-y-4">
                        <div>
                            <label htmlFor="email" className="sr-only">Email</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <FaEnvelope className="h-5 w-5 text-indigo-300" />
                                </div>
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    required
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="appearance-none relative block w-full px-3 py-3 pl-10 border border-gray-400 border-opacity-30 placeholder-gray-300 text-white bg-transparent rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                                    placeholder="Adresse email"
                                />
                            </div>
                        </div>
                        <div>
                            <label htmlFor="password" className="sr-only">Mot de passe</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <FaLock className="h-5 w-5 text-indigo-300" />
                                </div>
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    required
                                    value={formData.password}
                                    onChange={handleChange}
                                    className="appearance-none relative block w-full px-3 py-3 pl-10 border border-gray-400 border-opacity-30 placeholder-gray-300 text-white bg-transparent rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                                    placeholder="Mot de passe"
                                />
                            </div>
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className={`group relative w-full flex justify-center py-3 px-4 border border-transparent rounded-md text-white ${
                                isSubmitting
                                    ? 'bg-indigo-400'
                                    : 'bg-indigo-600 hover:bg-indigo-700'
                            } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200`}
                        >
                            {isSubmitting ? 'Connexion en cours...' : 'Se connecter'}
                        </button>
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="text-sm">
                            <Link to="/register" className="font-medium text-indigo-200 hover:text-white transition-colors duration-200">
                                Pas encore de compte ? S'inscrire
                            </Link>
                        </div>
                        <div className="text-sm">
                            <a href="#" className="font-medium text-indigo-200 hover:text-white transition-colors duration-200">
                                Mot de passe oublié ?
                            </a>
                        </div>
                    </div>
                </form>
            </motion.div>
        </div>
    );
};

export default Login; 