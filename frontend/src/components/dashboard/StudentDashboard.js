import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL, API_ROUTES } from '../../config/api';

const StudentDashboard = () => {
    const [submissions, setSubmissions] = useState([]);
    const [exercises, setExercises] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem('token');
                const headers = { Authorization: `Bearer ${token}` };

                // Récupérer les soumissions de l'étudiant
                const submissionsResponse = await axios.get(
                    `${API_URL}${API_ROUTES.SUBMISSIONS.LIST}`,
                    { headers }
                );
                setSubmissions(submissionsResponse.data);

                // Récupérer les exercices disponibles
                const exercisesResponse = await axios.get(
                    `${API_URL}${API_ROUTES.EXERCISES.LIST}`,
                    { headers }
                );
                setExercises(exercisesResponse.data);

                setLoading(false);
            } catch (err) {
                let errorMessage = 'Erreur lors du chargement des données';
                
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
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const handleCancelSubmission = async (submissionId) => {
        if (!window.confirm('Êtes-vous sûr de vouloir annuler cette soumission ?')) {
            return;
        }

        try {
            const token = localStorage.getItem('token');
            await axios.delete(
                `${API_URL}${API_ROUTES.SUBMISSIONS.DELETE}/${submissionId}`,
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );
            
            // Mettre à jour la liste des soumissions
            setSubmissions(submissions.filter(s => s.id !== submissionId));
            
            // Afficher une notification de succès (vous pouvez implémenter votre propre système de notification)
            alert('La soumission a été annulée avec succès');
            
        } catch (err) {
            console.error('Erreur lors de l\'annulation de la soumission:', err);
            alert('Une erreur est survenue lors de l\'annulation de la soumission');
        }
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
            <h1 className="text-3xl font-bold mb-8">Tableau de bord étudiant</h1>

            {/* Section des exercices disponibles */}
            <div className="mb-12">
                <h2 className="text-2xl font-semibold mb-4">Exercices disponibles</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {exercises.map((exercise) => (
                        <div key={exercise.id} className="bg-white rounded-lg shadow-md p-6">
                            <h3 className="text-xl font-semibold mb-2">{exercise.title}</h3>
                            <p className="text-gray-600 mb-4">{exercise.description}</p>
                            <button
                                className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
                                onClick={() => window.location.href = `/exercises/${exercise.id}`}
                            >
                                Voir l'exercice
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            {/* Section des soumissions récentes */}
            <div>
                <h2 className="text-2xl font-semibold mb-4">Mes soumissions récentes</h2>
                <div className="bg-white shadow-md rounded-lg overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Exercice
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Date de soumission
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Note
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {submissions.map((submission) => (
                                <tr key={submission.id}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">
                                            {submission.exercise_title}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-500">
                                            {new Date(submission.submitted_at || submission.created_at).toLocaleString('fr-FR', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">
                                            {submission.grade ? `${submission.grade}/20` : (
                                                <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">
                                                    En attente
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-4">
                                        <button
                                            className="text-indigo-600 hover:text-indigo-900"
                                            onClick={() => window.location.href = `/submissions/${submission.id}`}
                                        >
                                            Voir les détails
                                        </button>
                                        {!submission.grade && (
                                            <button
                                                className="text-red-600 hover:text-red-900"
                                                onClick={() => handleCancelSubmission(submission.id)}
                                            >
                                                Annuler
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default StudentDashboard; 