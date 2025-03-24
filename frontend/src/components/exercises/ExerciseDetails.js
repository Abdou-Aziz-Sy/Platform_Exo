import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../../config/api';
import { motion } from 'framer-motion';
import { FaDownload, FaUpload, FaChartBar, FaCheck, FaClock, FaEdit, FaTrash } from 'react-icons/fa';

const ExerciseDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [exercise, setExercise] = useState(null);
    const [submissions, setSubmissions] = useState([]);
    const [selectedFile, setSelectedFile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [submitStatus, setSubmitStatus] = useState('');
    const userRole = localStorage.getItem('userRole');
    const isStudent = userRole === 'student';

    useEffect(() => {
        const fetchExerciseDetails = async () => {
            try {
                const token = localStorage.getItem('token');
                const [exerciseResponse, submissionsResponse] = await Promise.all([
                    axios.get(`${API_URL}/exercises/${id}`, {
                        headers: { Authorization: `Bearer ${token}` }
                    }),
                    axios.get(`${API_URL}/submissions?exercise_id=${id}`, {
                        headers: { Authorization: `Bearer ${token}` }
                    })
                ]);

                setExercise(exerciseResponse.data);
                setSubmissions(submissionsResponse.data);
                setLoading(false);
            } catch (error) {
                console.error('Erreur lors de la récupération des détails:', error);
                setError('Erreur lors du chargement des données');
                setLoading(false);
            }
        };

        fetchExerciseDetails();
    }, [id]);

    const handleFileChange = (event) => {
        setSelectedFile(event.target.files[0]);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!selectedFile) {
            setSubmitStatus('Veuillez sélectionner un fichier');
            return;
        }

        const formData = new FormData();
        formData.append('file', selectedFile);
        formData.append('exercise_id', id);

        try {
            const token = localStorage.getItem('token');
            await axios.post(`${API_URL}/submissions`, formData, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data'
                    }
            });
            setSubmitStatus('Soumission réussie !');
            // Rafraîchir la liste des soumissions
            const submissionsResponse = await axios.get(`${API_URL}/submissions?exercise_id=${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setSubmissions(submissionsResponse.data);
            setSelectedFile(null);
        } catch (error) {
            console.error('Erreur lors de la soumission:', error);
            setSubmitStatus('Erreur lors de la soumission');
        }
    };

    const handleDelete = async () => {
        if (window.confirm('Êtes-vous sûr de vouloir supprimer cet exercice ?')) {
            try {
                const token = localStorage.getItem('token');
                await axios.delete(`${API_URL}/exercises/${id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                navigate('/exercises');
            } catch (error) {
                console.error('Erreur lors de la suppression:', error);
                setError('Erreur lors de la suppression de l\'exercice');
            }
        }
    };

    const downloadFile = async (path, filename) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/uploads/${path}`, {
                headers: { Authorization: `Bearer ${token}` },
                responseType: 'blob'
            });
            
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', filename);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.error('Erreur lors du téléchargement:', error);
            setError('Erreur lors du téléchargement du fichier');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-blue-900 to-blue-800 flex items-center justify-center">
                <div className="text-white text-xl">Chargement...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-blue-900 to-blue-800 p-8">
                <div className="bg-red-50 text-red-700 p-4 rounded-lg shadow-lg">
                    {error}
                </div>
            </div>
        );
    }

    if (!exercise) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-blue-900 to-blue-800 p-8">
                <div className="bg-red-50 text-red-700 p-4 rounded-lg shadow-lg">
                    Exercice non trouvé
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-blue-900 to-blue-800">
            <div className="max-w-7xl mx-auto px-4 py-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    {/* En-tête de l'exercice */}
                    <div className="bg-gradient-to-br from-indigo-800/50 to-blue-900/50 backdrop-blur-sm rounded-xl p-6 mb-6 border border-indigo-700/30">
                        <div className="flex justify-between items-start mb-4">
                            <h1 className="text-3xl font-bold text-white">{exercise.title}</h1>
                            {!isStudent && (
                                <div className="flex space-x-2">
                                    <button
                                        onClick={() => navigate(`/exercises/${id}/edit`)}
                                        className="flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg text-white transition-colors"
                                    >
                                        <FaEdit className="mr-2" />
                                        Modifier
                                    </button>
                                    <button
                                        onClick={handleDelete}
                                        className="flex items-center px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-white transition-colors"
                                    >
                                        <FaTrash className="mr-2" />
                                        Supprimer
                                    </button>
                    </div>
                )}
                            </div>
                        <div className="text-white/80 space-y-2">
                            <p className="text-lg">{exercise.description}</p>
                            <p className="text-sm">Type: {exercise.exercise_type}</p>
                            <div className="flex items-center space-x-2">
                                <button
                                    onClick={() => downloadFile(exercise.file_path, 'exercice.pdf')}
                                    className="flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors text-white"
                                >
                                    <FaDownload className="mr-2" />
                                    Télécharger l'énoncé
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Formulaire de soumission (uniquement pour les étudiants) */}
                    {isStudent && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="bg-gradient-to-br from-indigo-800/50 to-blue-900/50 backdrop-blur-sm rounded-xl p-6 mb-6 border border-indigo-700/30"
                        >
                            <h2 className="text-xl font-semibold text-white mb-4">Soumettre une réponse</h2>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="flex items-center space-x-4">
                                    <label className="flex-1">
                                        <div className="relative">
                                            <input
                                                type="file"
                                                onChange={handleFileChange}
                                                className="hidden"
                                                accept=".pdf"
                                                id="file-upload"
                                            />
                                            <label
                                                htmlFor="file-upload"
                                                className="flex items-center justify-center w-full px-4 py-2 bg-indigo-600/50 hover:bg-indigo-600/70 rounded-lg cursor-pointer transition-colors text-white"
                                            >
                                                <FaUpload className="mr-2" />
                                                {selectedFile ? selectedFile.name : 'Choisir un fichier PDF'}
                                            </label>
                                        </div>
                                    </label>
                                    <button
                                        type="submit"
                                        className="px-6 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-white transition-colors flex items-center"
                                    >
                                        <FaCheck className="mr-2" />
                                        Soumettre
                                    </button>
                                </div>
                                {submitStatus && (
                                    <div className={`text-sm ${submitStatus.includes('Erreur') ? 'text-red-400' : 'text-green-400'}`}>
                                        {submitStatus}
                                    </div>
                                )}
                        </form>
                        </motion.div>
                    )}

                    {/* Liste des soumissions */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="bg-gradient-to-br from-indigo-800/50 to-blue-900/50 backdrop-blur-sm rounded-xl p-6 border border-indigo-700/30"
                    >
                        <h2 className="text-xl font-semibold text-white mb-4">
                            {isStudent ? 'Mes soumissions' : 'Toutes les soumissions'}
                        </h2>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="text-indigo-300 border-b border-indigo-700/30">
                                        <th className="py-3 px-4 text-left">Date</th>
                                        {!isStudent && <th className="py-3 px-4 text-left">Étudiant</th>}
                                        <th className="py-3 px-4 text-left">Statut</th>
                                        <th className="py-3 px-4 text-left">Note</th>
                                        <th className="py-3 px-4 text-left">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {submissions.map((submission) => (
                                        <tr key={submission.id} className="text-white border-b border-indigo-700/30">
                                            <td className="py-3 px-4">
                                                {new Date(submission.created_at).toLocaleDateString()}
                                            </td>
                                            {!isStudent && (
                                                <td className="py-3 px-4">
                                                    {submission.student_name || 'Anonyme'}
                                                </td>
                                            )}
                                            <td className="py-3 px-4">
                                                <span className={`flex items-center ${
                                                    submission.status === 'graded' 
                                                        ? 'text-green-400' 
                                                        : 'text-yellow-400'
                                                }`}>
                                                    {submission.status === 'graded' ? (
                                                        <FaCheck className="mr-2" />
                                                    ) : (
                                                        <FaClock className="mr-2" />
                                                    )}
                                                    {submission.status === 'graded' ? 'Corrigé' : 'En attente'}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4">
                                                {submission.grade !== null ? (
                                                    <span className="text-white">{submission.grade}/20</span>
                                                ) : (
                                                    <span className="text-white/60">-</span>
                                                )}
                                            </td>
                                            <td className="py-3 px-4">
                                                <div className="flex items-center space-x-2">
                                                    <button
                                                        onClick={() => downloadFile(submission.file_path, `soumission_${submission.id}.pdf`)}
                                                        className="text-indigo-300 hover:text-indigo-200 transition-colors"
                                                    >
                                                        Télécharger
                                                    </button>
                                                    {submission.status === 'graded' && (
                                                        <button
                                                            onClick={() => navigate(`/submissions/${submission.id}`)}
                                                            className="text-green-400 hover:text-green-300 transition-colors ml-4"
                                                        >
                                                            Voir détails
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {submissions.length === 0 && (
                                <div className="text-indigo-300 text-center py-4">
                                    Aucune soumission pour cet exercice
                    </div>
                )}
                        </div>
                    </motion.div>
                </motion.div>
            </div>
        </div>
    );
};

export default ExerciseDetails; 