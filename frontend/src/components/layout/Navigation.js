import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import authService from '../../services/authService';

const Navigation = ({ userRole }) => {
    const navigate = useNavigate();
    const isAuthenticated = authService.isAuthenticated();

    const handleLogout = () => {
        authService.logout();
        navigate('/login');
    };

    return (
        <nav className="bg-indigo-600 text-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center">
                        <Link to="/" className="text-xl font-bold">
                            Plateforme d'Évaluation
                        </Link>
                    </div>
                    <div className="flex items-center space-x-4">
                        {isAuthenticated ? (
                            <>
                                <Link to="/dashboard" className="hover:text-gray-200">
                                    Tableau de bord
                                </Link>
                                {userRole === 'professor' && (
                                    <Link to="/exercises/create" className="hover:text-gray-200">
                                        Créer un exercice
                                    </Link>
                                )}
                                <button
                                    onClick={handleLogout}
                                    className="hover:text-gray-200"
                                >
                                    Déconnexion
                                </button>
                            </>
                        ) : (
                            <>
                                <Link to="/login" className="hover:text-gray-200">
                                    Connexion
                                </Link>
                                <Link to="/register" className="hover:text-gray-200">
                                    Inscription
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navigation; 