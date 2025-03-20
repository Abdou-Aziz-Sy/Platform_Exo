import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL, API_ROUTES } from '../../config/api';

const ProfessorDashboard = () => {
    const [exercises, setExercises] = useState([]);
    const [submissions, setSubmissions] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem('token');
                const headers = { Authorization: `Bearer ${token}` };

                // Récupérer les exercices créés par le professeur
                const exercisesResponse = await axios.get(
                    `${API_URL}${API_ROUTES.EXERCISES.LIST}`,
                    { headers }
                );
                setExercises(exercisesResponse.data);

                // Récupérer les soumissions récentes
                const submissionsResponse = await axios.get(
                    `${API_URL}${API_ROUTES.SUBMISSIONS.LIST}`,
                    { headers }
                );
                setSubmissions(submissionsResponse.data);

                setLoading(false);
            } catch (err) {
                setError('Erreur lors du chargement des données');
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const handleCreateExercise = () => {
        window.location.href = '/exercises/create';
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
                <h1 className="text-3xl font-bold">Tableau de bord professeur</h1>
                <button
                    onClick={handleCreateExercise}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
                >
                    Créer un exercice
                </button>
            </div>

            {/* Statistiques globales */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h3 className="text-lg font-semibold mb-2">Total des exercices</h3>
                    <p className="text-3xl font-bold text-indigo-600">{exercises.length}</p>
                </div>
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h3 className="text-lg font-semibold mb-2">Soumissions en attente</h3>
                    <p className="text-3xl font-bold text-indigo-600">
                        {submissions.filter(s => !s.score).length}
                    </p>
                </div>
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h3 className="text-lg font-semibold mb-2">Note moyenne</h3>
                    <p className="text-3xl font-bold text-indigo-600">
                        {submissions.length > 0
                            ? (submissions.reduce((acc, s) => acc + (s.score || 0), 0) / submissions.length).toFixed(2)
                            : 'N/A'}
                    </p>
                </div>
            </div>

            {/* Liste des exercices */}
            <div className="mb-12">
                <h2 className="text-2xl font-semibold mb-4">Mes exercices</h2>
                <div className="bg-white shadow-md rounded-lg overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Titre
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Date de création
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Soumissions
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
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-500">
                                            {new Date(exercise.created_at).toLocaleDateString()}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">
                                            {submissions.filter(s => s.exercise_id === exercise.id).length}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <button
                                            className="text-indigo-600 hover:text-indigo-900 mr-4"
                                            onClick={() => window.location.href = `/exercises/${exercise.id}`}
                                        >
                                            Voir
                                        </button>
                                        <button
                                            className="text-red-600 hover:text-red-900"
                                            onClick={() => window.location.href = `/exercises/${exercise.id}/edit`}
                                        >
                                            Modifier
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Soumissions récentes */}
            <div>
                <h2 className="text-2xl font-semibold mb-4">Soumissions récentes</h2>
                <div className="bg-white shadow-md rounded-lg overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Étudiant
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Exercice
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Date
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
                                            {submission.student_name}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">
                                            {submission.exercise_title}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-500">
                                            {new Date(submission.submitted_at).toLocaleDateString()}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">
                                            {submission.score ? `${submission.score}/20` : 'En attente'}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <button
                                            className="text-indigo-600 hover:text-indigo-900"
                                            onClick={() => window.location.href = `/submissions/${submission.id}`}
                                        >
                                            Évaluer
                                        </button>
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

export default ProfessorDashboard; 