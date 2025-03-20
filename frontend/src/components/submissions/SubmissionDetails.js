import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { API_URL, API_ROUTES } from '../../config/api';

const SubmissionDetails = () => {
    const { id } = useParams();
    const [submission, setSubmission] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showFullFeedback, setShowFullFeedback] = useState(false);
    const previewLength = 150; // Nombre de caractères à afficher dans l'aperçu

    useEffect(() => {
        const fetchSubmission = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get(
                    `${API_URL}${API_ROUTES.SUBMISSIONS.DETAILS}/${id}`,
                    {
                        headers: { Authorization: `Bearer ${token}` }
                    }
                );
                setSubmission(response.data);
            } catch (err) {
                let errorMessage = 'Erreur lors du chargement de la soumission';
                
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

        fetchSubmission();
    }, [id]);

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
            <div className="bg-red-50 p-4 rounded-md">
                <div className="text-red-700">{error}</div>
            </div>
        );
    }

    if (!submission) {
        return (
            <div className="text-center text-gray-500">
                Soumission non trouvée
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="bg-white rounded-lg shadow-md p-6">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold mb-2">
                        {submission.exercise_title}
                    </h1>
                    <div className="text-sm text-gray-500">
                        Soumis le {new Date(submission.created_at).toLocaleDateString()}
                    </div>
                </div>

                {/* Statut et Note */}
                <div className="flex items-center space-x-4 mb-6">
                    <span className={`px-3 py-1 text-sm rounded-full ${
                        submission.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-green-100 text-green-800'
                    }`}>
                        {submission.status === 'pending' ? 'En attente' : 'Évalué'}
                    </span>
                    {submission.grade && (
                        <span className="px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded-full">
                            Note: {submission.grade}/20
                        </span>
                    )}
                </div>

                {/* Feedback de l'évaluation */}
                {submission.feedback && (
                    <div className="mb-6">
                        <h2 className="text-lg font-semibold mb-3">Feedback de l'évaluation</h2>
                        <div className="bg-gray-50 rounded-lg p-4">
                            <div className="prose max-w-none">
                                {showFullFeedback ? (
                                    submission.feedback.split('\n').map((line, index) => (
                                        <p key={index} className="mb-2">
                                            {line}
                                        </p>
                                    ))
                                ) : (
                                    <>
                                        <p>{getFeedbackPreview(submission.feedback)}</p>
                                        {submission.feedback.length > previewLength && (
                                            <button
                                                onClick={() => setShowFullFeedback(true)}
                                                className="mt-2 text-indigo-600 hover:text-indigo-800 font-medium"
                                            >
                                                Voir plus...
                                            </button>
                                        )}
                                    </>
                                )}
                                {showFullFeedback && (
                                    <button
                                        onClick={() => setShowFullFeedback(false)}
                                        className="mt-2 text-indigo-600 hover:text-indigo-800 font-medium"
                                    >
                                        Voir moins
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Suggestions d'amélioration */}
                {submission.improvement_suggestions && submission.improvement_suggestions.length > 0 && (
                    <div className="mb-6">
                        <h2 className="text-lg font-semibold mb-3">Suggestions d'amélioration</h2>
                        <ul className="list-disc list-inside space-y-2 bg-indigo-50 rounded-lg p-4">
                            {submission.improvement_suggestions.map((suggestion, index) => (
                                <li key={index} className="text-indigo-900">
                                    {suggestion}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* Bouton pour télécharger la soumission */}
                <div className="mt-6">
                    <button
                        onClick={() => window.open(`${API_URL}/uploads/${submission.file_path}`, '_blank')}
                        className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
                    >
                        Voir ma réponse
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SubmissionDetails; 