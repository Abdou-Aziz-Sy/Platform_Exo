import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaBook, FaUpload, FaPlus, FaTrash, FaCheck, FaExclamationTriangle } from 'react-icons/fa';
import axios from 'axios';
import { API_URL } from '../../config/api';
import { useTheme } from '../../context/ThemeContext';

const ExerciseCreate = () => {
    const navigate = useNavigate();
    const { darkMode } = useTheme();
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [exerciseType, setExerciseType] = useState('sql');
    const [file, setFile] = useState(null);
    const [corrections, setCorrections] = useState([{
        file: null,
        description: ''
    }]);
    const [evaluationCriteria, setEvaluationCriteria] = useState({
        comprehension: { poids: 0.3, description: "Compréhension du problème et pertinence de la solution" },
        technique: { poids: 0.4, description: "Maîtrise technique et respect des normes" },
        optimisation: { poids: 0.3, description: "Optimisation et qualité de la solution" }
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [selectedFileName, setSelectedFileName] = useState('');
    const [selectedCorrectionFiles, setSelectedCorrectionFiles] = useState([]);

    // Garder les handlers existants
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const totalWeight = Object.values(evaluationCriteria).reduce((sum, criteria) => sum + parseFloat(criteria.poids), 0);
            if (Math.abs(totalWeight - 1) > 0.01) {
                setError('La somme des poids des critères doit être égale à 1');
                setLoading(false);
                return;
            }

            const formData = new FormData();
            formData.append('title', title);
            formData.append('description', description);
            formData.append('exercise_type', exerciseType);
            formData.append('file', file);

            const correctionsDescriptions = corrections.map(correction => correction.description);
            formData.append('corrections_descriptions', JSON.stringify(correctionsDescriptions));

            corrections.forEach((correction, index) => {
                if (correction.file) {
                    formData.append('corrections', correction.file);
                }
            });

            formData.append('evaluation_criteria', JSON.stringify(evaluationCriteria));

            const token = localStorage.getItem('token');
            const response = await axios.post(
                `${API_URL}/exercises/`,
                formData,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data'
                    }
                }
            );

            navigate('/dashboard');
        } catch (err) {
            let errorMessage = 'Une erreur est survenue lors de la création de l\'exercice';
            
            if (err.response?.data) {
                if (typeof err.response.data === 'string') {
                    errorMessage = err.response.data;
                } else if (err.response.data.detail) {
                    errorMessage = err.response.data.detail;
                } else if (Array.isArray(err.response.data)) {
                    errorMessage = err.response.data.map(error => 
                        typeof error === 'string' ? error : error.msg
                    ).join(', ');
                } else if (err.response.data.msg) {
                    errorMessage = err.response.data.msg;
                }
            }
            
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleCriteriaChange = (key, field, value) => {
        setEvaluationCriteria(prev => ({
            ...prev,
            [key]: {
                ...prev[key],
                [field]: field === 'poids' ? parseFloat(value) : value
            }
        }));
    };

    const handleCorrectionChange = (index, field, value) => {
        if (field === 'file') {
            const newSelectedFiles = [...selectedCorrectionFiles];
            newSelectedFiles[index] = value.name;
            setSelectedCorrectionFiles(newSelectedFiles);
        }
        setCorrections(prev => {
            const newCorrections = [...prev];
            newCorrections[index] = {
                ...newCorrections[index],
                [field]: value
            };
            return newCorrections;
        });
    };

    const addCorrection = () => {
        setCorrections(prev => [...prev, { file: null, description: '' }]);
        setSelectedCorrectionFiles(prev => [...prev, '']);
    };

    const removeCorrection = (index) => {
        setCorrections(prev => prev.filter((_, i) => i !== index));
        setSelectedCorrectionFiles(prev => prev.filter((_, i) => i !== index));
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        setFile(file);
        setSelectedFileName(file.name);
    };

    return (
        <div className={`min-h-screen ${darkMode ? 'bg-dark-primary' : 'bg-gradient-to-br from-indigo-900 via-blue-900 to-blue-800'}`}>
            <div className="max-w-4xl mx-auto px-4 py-8">
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
                            Créer un nouvel exercice
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

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                        >
                            <label className={`block text-sm font-medium ${darkMode ? 'text-gray-200' : 'text-gray-700'} mb-2`}>
                                Titre de l'exercice
                            </label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                required
                                className={`w-full px-4 py-2 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                                    darkMode 
                                        ? 'bg-dark-accent border-gray-600 text-white' 
                                        : 'border-gray-300 text-gray-900'
                                }`}
                                placeholder="Entrez le titre de l'exercice"
                            />
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                        >
                            <label className={`block text-sm font-medium ${darkMode ? 'text-gray-200' : 'text-gray-700'} mb-2`}>
                                Type d'exercice
                            </label>
                            <select
                                value={exerciseType}
                                onChange={(e) => setExerciseType(e.target.value)}
                                className={`w-full px-4 py-2 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                                    darkMode 
                                        ? 'bg-dark-accent border-gray-600 text-white' 
                                        : 'border-gray-300 text-gray-900'
                                }`}
                            >
                                <option value="sql">SQL</option>
                                <option value="mcd">MCD (Modèle Conceptuel de Données)</option>
                                <option value="mld">MLD (Modèle Logique de Données)</option>
                                <option value="algebra">Algèbre Relationnelle</option>
                            </select>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                        >
                            <label className={`block text-sm font-medium ${darkMode ? 'text-gray-200' : 'text-gray-700'} mb-2`}>
                                Description
                            </label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                required
                                rows={4}
                                className={`w-full px-4 py-2 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                                    darkMode 
                                        ? 'bg-dark-accent border-gray-600 text-white' 
                                        : 'border-gray-300 text-gray-900'
                                }`}
                                placeholder="Décrivez l'exercice en détail"
                            />
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            className="relative"
                        >
                            <label className={`block text-sm font-medium ${darkMode ? 'text-gray-200' : 'text-gray-700'} mb-2`}>
                                Fichier de l'exercice (PDF)
                            </label>
                            <div className="flex items-center justify-center w-full">
                                <label className={`w-full flex flex-col items-center px-4 py-6 rounded-lg border-2 border-dashed cursor-pointer transition-colors ${
                                    darkMode 
                                        ? 'border-gray-600 hover:border-indigo-400 bg-dark-accent hover:bg-dark-accent/70' 
                                        : 'border-gray-300 hover:border-indigo-500 bg-white hover:bg-indigo-50'
                                }`}>
                                    <FaUpload className={`h-8 w-8 mb-2 ${darkMode ? 'text-gray-400' : 'text-gray-400'}`} />
                                    <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                                        {selectedFileName || "Cliquez pour sélectionner un fichier PDF"}
                                    </span>
                                    <input
                                        type="file"
                                        accept=".pdf"
                                        onChange={handleFileChange}
                                        required
                                        className="hidden"
                                    />
                                </label>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                        >
                            <div className="flex items-center justify-between mb-4">
                                <label className={`text-sm font-medium ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                                    Corrections
                                </label>
                                <button
                                    type="button"
                                    onClick={() => addCorrection()}
                                    className={`flex items-center px-3 py-1 rounded-lg transition-colors ${
                                        darkMode 
                                            ? 'bg-indigo-600 hover:bg-indigo-700 text-white' 
                                            : 'bg-indigo-100 hover:bg-indigo-200 text-indigo-700'
                                    }`}
                                >
                                    <FaPlus className="h-4 w-4 mr-1" />
                                    Ajouter
                                </button>
                            </div>

                            {corrections.map((correction, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.6 + index * 0.1 }}
                                    className={`p-4 rounded-lg mb-4 ${
                                        darkMode 
                                            ? 'bg-dark-accent border border-gray-700' 
                                            : 'bg-gray-50'
                                    }`}
                                >
                                    <div className="flex justify-between items-start mb-4">
                                        <label className={`text-sm font-medium ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                                            Correction {index + 1}
                                        </label>
                                        <button
                                            type="button"
                                            onClick={() => removeCorrection(index)}
                                            className="text-red-500 hover:text-red-700"
                                        >
                                            <FaTrash className="h-4 w-4" />
                                        </button>
                                    </div>

                                    <div className="space-y-4">
                                        <div>
                                            <label className={`block text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'} mb-1`}>
                                                Description de la correction
                                            </label>
                                            <input
                                                type="text"
                                                value={correction.description}
                                                onChange={(e) => handleCorrectionChange(index, 'description', e.target.value)}
                                                className={`w-full px-3 py-2 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                                                    darkMode 
                                                        ? 'bg-dark-primary border-gray-600 text-white' 
                                                        : 'border-gray-300 text-gray-900'
                                                }`}
                                                placeholder="Description de la correction"
                                            />
                                        </div>

                                        <div>
                                            <label className={`block text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'} mb-1`}>
                                                Fichier de correction (PDF)
                                            </label>
                                            <div className="flex items-center">
                                                <label className={`flex-1 flex items-center px-4 py-2 rounded-lg cursor-pointer transition-colors ${
                                                    darkMode 
                                                        ? 'bg-dark-primary border border-gray-600 hover:border-indigo-400' 
                                                        : 'bg-white border border-gray-300 hover:border-indigo-500'
                                                }`}>
                                                    <FaUpload className={`h-5 w-5 mr-2 ${darkMode ? 'text-gray-400' : 'text-gray-400'}`} />
                                                    <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                                                        {selectedCorrectionFiles[index]?.name || "Choisir un fichier"}
                                                    </span>
                                                    <input
                                                        type="file"
                                                        accept=".pdf"
                                                        onChange={(e) => handleCorrectionChange(index, 'file', e.target.files[0])}
                                                        className="hidden"
                                                    />
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.7 }}
                        >
                            <label className={`block text-sm font-medium ${darkMode ? 'text-gray-200' : 'text-gray-700'} mb-4`}>
                                Critères d'évaluation
                            </label>
                            {Object.entries(evaluationCriteria).map(([key, criteria], index) => (
                                <motion.div
                                    key={key}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.8 + index * 0.1 }}
                                    className={`p-4 rounded-lg mb-4 ${
                                        darkMode 
                                            ? 'bg-dark-accent border border-gray-700' 
                                            : 'bg-gray-50'
                                    }`}
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <label className={`text-sm font-medium ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                                            {criteria.description}
                                        </label>
                                        <input
                                            type="number"
                                            step="0.1"
                                            min="0"
                                            max="1"
                                            value={criteria.poids}
                                            onChange={(e) => handleCriteriaChange(key, 'poids', e.target.value)}
                                            className={`w-24 px-2 py-1 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                                                darkMode 
                                                    ? 'bg-dark-primary border-gray-600 text-white' 
                                                    : 'border-gray-300 text-gray-900'
                                            }`}
                                        />
                                    </div>
                                </motion.div>
                            ))}
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 1 }}
                            className="flex justify-end pt-6"
                        >
                            <button
                                type="submit"
                                disabled={loading}
                                className={`flex items-center px-6 py-3 text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                {loading ? (
                                    <span className="flex items-center">
                                        <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                        </svg>
                                        Création en cours...
                                    </span>
                                ) : (
                                    <>
                                        <FaCheck className="h-5 w-5 mr-2" />
                                        Créer l'exercice
                                    </>
                                )}
                            </button>
                        </motion.div>
                    </form>
                </motion.div>
            </div>
        </div>
    );
};

export default ExerciseCreate; 