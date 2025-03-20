import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL, API_ROUTES } from '../../config/api';

const SubmissionsList = () => {
    const [submissions, setSubmissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const previewLength = 100; // Nombre de caractères à afficher dans l'aperçu

    useEffect(() => {
        fetchSubmissions();
    }, []);

    const fetchSubmissions = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(
                `${API_URL}${API_ROUTES.SUBMISSIONS.LIST}`,
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );
            setSubmissions(response.data);
        } catch (err) {
            setError('Erreur lors du chargement des soumissions');
            console.error('Erreur:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleDownload = (filePath) => {
        window.open(`${API_URL.replace('/api', '')}/uploads/${filePath}`, '_blank');
    };

    const getFeedbackPreview = (feedback) => {
        if (!feedback) return '';
        if (feedback.length <= previewLength) return feedback;
        return feedback.substring(0, previewLength) + '...';
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
            <div className="container mx-auto px-4 py-8">
                <div className="bg-red-50 text-red-700 p-4 rounded-md">
                    {error}
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-2xl font-bold mb-6">Mes Soumissions</h1>
            <div className="grid gap-6">
                {submissions.map((submission) => (
                    <div key={submission.id} className="bg-white rounded-lg shadow-md p-6">
                        <div className="flex justify-between items-start">
                            <div className="flex-grow">
                                <h2 className="text-xl font-semibold mb-2">{submission.exercise_title}</h2>
                                <div className="text-sm text-gray-500 mb-2">
                                    Soumis le {new Date(submission.created_at).toLocaleDateString()}
                                </div>
                                <div className="flex items-center space-x-2 mb-4">
                                    <span className={`px-2 py-1 text-sm rounded ${
                                        submission.status === 'pending' 
                                            ? 'bg-yellow-100 text-yellow-800' 
                                            : 'bg-green-100 text-green-800'
                                    }`}>
                                        {submission.status === 'pending' ? 'En attente' : 'Noté'}
                                    </span>
                                    {submission.grade && (
                                        <span className="px-2 py-1 text-sm bg-blue-100 text-blue-800 rounded">
                                            Note: {submission.grade}/20
                                        </span>
                                    )}
                                </div>
                                
                                {submission.feedback && (
                                    <div className="mt-4 p-4 bg-gray-50 rounded-md">
                                        <h3 className="text-sm font-semibold mb-2">Feedback :</h3>
                                        <p className="text-sm text-gray-600">{getFeedbackPreview(submission.feedback)}</p>
                                        {submission.feedback.length > previewLength && (
                                            <a
                                                href={`/submissions/${submission.id}`}
                                                className="mt-2 inline-block text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                                            >
                                                Voir l'analyse complète...
                                            </a>
                                        )}
                                    </div>
                                )}
                            </div>
                            <button
                                onClick={() => handleDownload(submission.file_path)}
                                className="px-3 py-1 text-sm bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                            >
                                Voir ma réponse
                            </button>
                        </div>
                    </div>
                ))}
                {submissions.length === 0 && (
                    <div className="text-center text-gray-500">
                        Vous n'avez pas encore soumis d'exercices.
                    </div>
                )}
            </div>
        </div>
    );
};

export default SubmissionsList; 