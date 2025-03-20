import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_URL, API_ROUTES } from '../../config/api';

const ExerciseManagement = () => {
    const navigate = useNavigate();
    const [exercises, setExercises] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchExercises();
    }, []);

    const fetchExercises = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(
                `${API_URL}${API_ROUTES.EXERCISES.LIST}`,
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );
            setExercises(response.data);
        } catch (err) {
            let errorMessage = 'Erreur lors du chargement des exercices';
            
            if (err.response?.data) {
                if (typeof err.response.data === 'string') {
                    errorMessage = err.response.data;
                } else if (err.response.data.detail) {
                    errorMessage = err.response.data.detail;
                } else if (Array.isArray(err.response.data)) {
                    errorMessage = err.response.data[0].msg;
                } else if (err.response.data.msg) {
                    errorMessage = err.response.data.msg;
                }
            }
            
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Êtes-vous sûr de vouloir supprimer cet exercice ?')) {
            return;
        }

        try {
            const token = localStorage.getItem('token');
            await axios.delete(
                `${API_URL}${API_ROUTES.EXERCISES.DELETE(id)}`,
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );
            setExercises(exercises.filter(exercise => exercise.id !== id));
        } catch (err) {
            let errorMessage = 'Erreur lors de la suppression de l\'exercice';
            
            if (err.response?.data) {
                if (typeof err.response.data === 'string') {
                    errorMessage = err.response.data;
                } else if (err.response.data.detail) {
                    errorMessage = err.response.data.detail;
                } else if (Array.isArray(err.response.data)) {
                    errorMessage = err.response.data[0].msg;
                } else if (err.response.data.msg) {
                    errorMessage = err.response.data.msg;
                }
            }
            
            setError(errorMessage);
        }
    };

    const handleDownload = (filePath) => {
        window.open(`${API_URL.replace('/api', '')}/uploads/${filePath}`, '_blank');
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-lg">Chargement...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 p-4 rounded-md">
                <div className="text-red-700">{error}</div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">Gestion des exercices</h1>
                <button
                    onClick={() => navigate('/exercises/create')}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
                >
                    Créer un exercice
                </button>
            </div>

            <div className="bg-white shadow-md rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Titre
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Description
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Date de création
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {exercises.map((exercise) => (
                            <tr key={exercise.id}>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-gray-900">
                                        {exercise.title}
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="text-sm text-gray-500">
                                        {exercise.description}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-500">
                                        {new Date(exercise.created_at).toLocaleDateString()}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    <button
                                        onClick={() => handleDownload(exercise.file_path)}
                                        className="text-green-600 hover:text-green-900 mr-4"
                                    >
                                        Télécharger
                                    </button>
                                    <button
                                        onClick={() => navigate(`/exercises/${exercise.id}`)}
                                        className="text-indigo-600 hover:text-indigo-900 mr-4"
                                    >
                                        Voir
                                    </button>
                                    <button
                                        onClick={() => navigate(`/exercises/edit/${exercise.id}`)}
                                        className="text-yellow-600 hover:text-yellow-900 mr-4"
                                    >
                                        Modifier
                                    </button>
                                    <button
                                        onClick={() => handleDelete(exercise.id)}
                                        className="text-red-600 hover:text-red-900"
                                    >
                                        Supprimer
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ExerciseManagement; 