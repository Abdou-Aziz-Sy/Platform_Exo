import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaBook, FaChartLine, FaHistory, FaUpload, FaCheck, FaExclamationTriangle } from 'react-icons/fa';
import axios from 'axios';
import { API_URL } from '../../config/api';
import { useTheme } from '../../context/ThemeContext';

const StudentDashboard = () => {
    const { darkMode } = useTheme();
    const [exercises, setExercises] = useState([]);
    const [submissions, setSubmissions] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedFile, setSelectedFile] = useState(null);
    const [selectedExercise, setSelectedExercise] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const token = localStorage.getItem('token');
            const [exercisesRes, submissionsRes, statsRes] = await Promise.all([
                axios.get(`${API_URL}/exercises/`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                }),
                axios.get(`${API_URL}/submissions/`, {
                    headers: { 'Authorization': `Bearer ${token}` },
                    params: { include_exercise: true }
                }),
                axios.get(`${API_URL}/statistics/student/${localStorage.getItem('userId')}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                })
            ]);

            setExercises(exercisesRes.data);
            setSubmissions(submissionsRes.data);
            setStats(statsRes.data);
        } catch (err) {
            setError('Erreur lors du chargement des données');
            console.error('Error fetching data:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleFileChange = (e) => {
        setSelectedFile(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedFile || !selectedExercise) return;

        setSubmitting(true);
        try {
            const formData = new FormData();
            formData.append('file', selectedFile);

            const token = localStorage.getItem('token');
            await axios.post(
                `${API_URL}/submissions/`,
                formData,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data'
                    },
                    params: {
                        exercise_id: selectedExercise.id
                    }
                }
            );

            setSelectedFile(null);
            setSelectedExercise(null);
            fetchData();
        } catch (err) {
            setError('Erreur lors de la soumission');
            console.error('Error submitting:', err);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className={`min-h-screen flex items-center justify-center ${darkMode ? 'bg-dark-primary' : 'bg-gradient-to-br from-indigo-900 via-blue-900 to-blue-800'}`}>
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
        );
    }

    return (
        <div className={`min-h-screen ${darkMode ? 'bg-dark-primary' : 'bg-gradient-to-br from-indigo-900 via-blue-900 to-blue-800'}`}>
            <div className="max-w-7xl mx-auto px-4 py-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className={`${
                        darkMode 
                            ? 'bg-dark-secondary border-gray-700' 
                            : 'bg-white/90 backdrop-blur-sm'
                    } rounded-xl shadow-2xl p-8`}
                >
                    <div className="flex items-center mb-8">
                        <FaBook className={`h-8 w-8 ${darkMode ? 'text-indigo-400' : 'text-indigo-600'} mr-4`} />
                        <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                            Tableau de bord étudiant
                        </h1>
                    </div>

                    {error && (
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-md flex items-start"
                        >
                            <FaExclamationTriangle className="h-5 w-5 text-red-500 mr-3 mt-0.5" />
                            <p className="text-red-700">{error}</p>
                        </motion.div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className={`p-6 rounded-xl ${
                                darkMode 
                                    ? 'bg-dark-accent border border-gray-700' 
                                    : 'bg-white border border-gray-200'
                            }`}
                        >
                            <div className="flex items-center mb-4">
                                <FaChartLine className={`h-6 w-6 ${darkMode ? 'text-indigo-400' : 'text-indigo-600'} mr-2`} />
                                <h2 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                    Moyenne générale
                                </h2>
                            </div>
                            <p className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                {stats?.average_score?.toFixed(1) || '0.0'}/20
                            </p>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className={`p-6 rounded-xl ${
                                darkMode 
                                    ? 'bg-dark-accent border border-gray-700' 
                                    : 'bg-white border border-gray-200'
                            }`}
                        >
                            <div className="flex items-center mb-4">
                                <FaHistory className={`h-6 w-6 ${darkMode ? 'text-indigo-400' : 'text-indigo-600'} mr-2`} />
                                <h2 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                    Exercices soumis
                                </h2>
                            </div>
                            <p className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                {submissions.length}
                            </p>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className={`p-6 rounded-xl ${
                                darkMode 
                                    ? 'bg-dark-accent border border-gray-700' 
                                    : 'bg-white border border-gray-200'
                            }`}
                        >
                            <div className="flex items-center mb-4">
                                <FaCheck className={`h-6 w-6 ${darkMode ? 'text-indigo-400' : 'text-indigo-600'} mr-2`} />
                                <h2 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                    Exercices disponibles
                                </h2>
                            </div>
                            <p className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                {exercises.length}
                            </p>
                        </motion.div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            className={`p-6 rounded-xl ${
                                darkMode 
                                    ? 'bg-dark-accent border border-gray-700' 
                                    : 'bg-white border border-gray-200'
                            }`}
                        >
                            <h2 className={`text-xl font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                Exercices disponibles
                            </h2>
                            <div className="space-y-4">
                                {exercises.map((exercise) => (
                                    <motion.div
                                        key={exercise.id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        className={`p-4 rounded-lg ${
                                            darkMode 
                                                ? 'bg-dark-primary border border-gray-700' 
                                                : 'bg-gray-50 border border-gray-200'
                                        }`}
                                    >
                                        <h3 className={`font-medium mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                            {exercise.title}
                                        </h3>
                                        <p className={`text-sm mb-4 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                                            {exercise.description}
                                        </p>
                                        <div className="flex items-center justify-between">
                                            <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                                Type: {exercise.exercise_type}
                                            </span>
                                            <button
                                                onClick={() => setSelectedExercise(exercise)}
                                                className={`px-4 py-2 rounded-lg transition-colors ${
                                                    darkMode 
                                                        ? 'bg-indigo-600 hover:bg-indigo-700 text-white' 
                                                        : 'bg-indigo-100 hover:bg-indigo-200 text-indigo-700'
                                                }`}
                                            >
                                                Soumettre
                                            </button>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                            className={`p-6 rounded-xl ${
                                darkMode 
                                    ? 'bg-dark-accent border border-gray-700' 
                                    : 'bg-white border border-gray-200'
                            }`}
                        >
                            <h2 className={`text-xl font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                Historique des soumissions
                            </h2>
                            <div className="space-y-4">
                                {submissions.map((submission) => (
                                    <motion.div
                                        key={submission.id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        className={`p-4 rounded-lg ${
                                            darkMode 
                                                ? 'bg-dark-primary border border-gray-700' 
                                                : 'bg-gray-50 border border-gray-200'
                                        }`}
                                    >
                                        <div className="flex items-center justify-between mb-2">
                                            <h3 className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                                {submission.exercise?.title || 'Exercice non trouvé'}
                                            </h3>
                                            <span className={`px-2 py-1 rounded-full text-xs ${
                                                submission.status === 'corrected'
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-yellow-100 text-yellow-800'
                                            }`}>
                                                {submission.status === 'corrected' ? 'Corrigé' : 'En attente'}
                                            </span>
                                        </div>
                                        <p className={`text-sm mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                                            Soumis le: {new Date(submission.created_at).toLocaleDateString()}
                                        </p>
                                        {submission.grade && (
                                            <p className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                                Note: {submission.grade}/20
                                            </p>
                                        )}
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
                    </div>

                    {selectedExercise && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 ${
                                darkMode ? 'bg-dark-primary/50' : 'bg-black/50'
                            }`}
                        >
                            <div className={`max-w-md w-full p-6 rounded-xl ${
                                darkMode 
                                    ? 'bg-dark-secondary border border-gray-700' 
                                    : 'bg-white border border-gray-200'
                            }`}>
                                <h2 className={`text-xl font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                    Soumettre une réponse
                                </h2>
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div>
                                        <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                                            Fichier PDF
                                        </label>
                                        <div className="flex items-center">
                                            <input
                                                type="file"
                                                accept=".pdf"
                                                onChange={handleFileChange}
                                                required
                                                className={`flex-1 px-4 py-2 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                                                    darkMode 
                                                        ? 'bg-dark-accent border-gray-600 text-white' 
                                                        : 'border-gray-300 text-gray-900'
                                                }`}
                                            />
                                        </div>
                                    </div>
                                    <div className="flex justify-end space-x-4">
                                        <button
                                            type="button"
                                            onClick={() => setSelectedExercise(null)}
                                            className={`px-4 py-2 rounded-lg transition-colors ${
                                                darkMode 
                                                    ? 'bg-gray-700 hover:bg-gray-600 text-white' 
                                                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                                            }`}
                                        >
                                            Annuler
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={submitting}
                                            className={`px-4 py-2 rounded-lg transition-colors ${
                                                darkMode 
                                                    ? 'bg-indigo-600 hover:bg-indigo-700 text-white' 
                                                    : 'bg-indigo-100 hover:bg-indigo-200 text-indigo-700'
                                            } ${submitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                                        >
                                            {submitting ? 'Soumission en cours...' : 'Soumettre'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </motion.div>
                    )}
                </motion.div>
            </div>
        </div>
    );
};

export default StudentDashboard; 