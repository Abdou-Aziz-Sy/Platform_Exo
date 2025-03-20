import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_URL, API_ROUTES } from '../../config/api';

const ExerciseCreate = () => {
    const navigate = useNavigate();
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [exerciseType, setExerciseType] = useState('sql'); // sql, mcd, mld, algebra
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            // Vérifier que la somme des poids est égale à 1
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

            // Préparer les descriptions des corrections
            const correctionsDescriptions = corrections.map(correction => correction.description);
            formData.append('corrections_descriptions', JSON.stringify(correctionsDescriptions));

            // Ajouter les fichiers de correction s'ils existent
            corrections.forEach((correction, index) => {
                if (correction.file) {
                    formData.append('corrections', correction.file);
                }
            });

            formData.append('evaluation_criteria', JSON.stringify(evaluationCriteria));

            const token = localStorage.getItem('token');
            console.log('Debug - Sending data:', {
                title,
                description,
                exercise_type: exerciseType,
                corrections_descriptions: correctionsDescriptions,
                evaluation_criteria: evaluationCriteria
            });

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

            console.log('Debug - Response:', response.data);
            navigate('/dashboard');
        } catch (err) {
            console.error('Error details:', err.response?.data);
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
    };

    const removeCorrection = (index) => {
        setCorrections(prev => prev.filter((_, i) => i !== index));
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="max-w-2xl mx-auto">
                <h1 className="text-3xl font-bold mb-8">Créer un nouvel exercice</h1>

                {error && (
                    <div className="bg-red-50 text-red-700 p-4 rounded-md mb-6">
                        {typeof error === 'string' ? error : JSON.stringify(error)}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                            Titre
                        </label>
                        <input
                            type="text"
                            id="title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        />
                    </div>

                    <div>
                        <label htmlFor="exerciseType" className="block text-sm font-medium text-gray-700">
                            Type d'exercice
                        </label>
                        <select
                            id="exerciseType"
                            value={exerciseType}
                            onChange={(e) => setExerciseType(e.target.value)}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        >
                            <option value="sql">SQL</option>
                            <option value="mcd">MCD (Modèle Conceptuel de Données)</option>
                            <option value="mld">MLD (Modèle Logique de Données)</option>
                            <option value="algebra">Algèbre Relationnelle</option>
                        </select>
                    </div>

                    <div>
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                            Description
                        </label>
                        <textarea
                            id="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            required
                            rows={4}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        />
                    </div>

                    <div>
                        <label htmlFor="file" className="block text-sm font-medium text-gray-700">
                            Fichier de l'exercice (PDF)
                        </label>
                        <input
                            type="file"
                            id="file"
                            accept=".pdf"
                            onChange={(e) => setFile(e.target.files[0])}
                            required
                            className="mt-1 block w-full text-sm text-gray-500
                                file:mr-4 file:py-2 file:px-4
                                file:rounded-md file:border-0
                                file:text-sm file:font-semibold
                                file:bg-indigo-50 file:text-indigo-700
                                hover:file:bg-indigo-100"
                        />
                    </div>

                    <div>
                        <div className="flex justify-between items-center mb-4">
                            <label className="block text-sm font-medium text-gray-700">
                                Modèles de correction
                            </label>
                            <button
                                type="button"
                                onClick={addCorrection}
                                className="px-3 py-1 text-sm text-indigo-600 border border-indigo-600 rounded-md hover:bg-indigo-50"
                            >
                                + Ajouter un modèle
                            </button>
                        </div>
                        {corrections.map((correction, index) => (
                            <div key={index} className="mb-4 p-4 border rounded">
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="text-sm font-medium">Modèle de correction {index + 1}</h3>
                                    {index > 0 && (
                                        <button
                                            type="button"
                                            onClick={() => removeCorrection(index)}
                                            className="text-red-600 hover:text-red-800"
                                        >
                                            Supprimer
                                        </button>
                                    )}
                                </div>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-xs text-gray-500">Fichier de correction (PDF)</label>
                                        <input
                                            type="file"
                                            accept=".pdf"
                                            onChange={(e) => handleCorrectionChange(index, 'file', e.target.files[0])}
                                            className="mt-1 block w-full text-sm text-gray-500
                                                file:mr-4 file:py-2 file:px-4
                                                file:rounded-md file:border-0
                                                file:text-sm file:font-semibold
                                                file:bg-indigo-50 file:text-indigo-700
                                                hover:file:bg-indigo-100"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-gray-500">Description de la correction</label>
                                        <textarea
                                            value={correction.description}
                                            onChange={(e) => handleCorrectionChange(index, 'description', e.target.value)}
                                            rows={3}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                            placeholder="Décrivez cette approche de correction..."
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-4">
                            Critères d'évaluation
                        </label>
                        {Object.entries(evaluationCriteria).map(([key, criteria]) => (
                            <div key={key} className="mb-4 p-4 border rounded">
                                <div className="flex items-center gap-4">
                                    <div className="flex-1">
                                        <label className="block text-xs text-gray-500">Critère</label>
                                        <input
                                            type="text"
                                            value={key}
                                            disabled
                                            className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50"
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <label className="block text-xs text-gray-500">Poids (0-1)</label>
                                        <input
                                            type="number"
                                            value={criteria.poids}
                                            onChange={(e) => handleCriteriaChange(key, 'poids', e.target.value)}
                                            min="0"
                                            max="1"
                                            step="0.1"
                                            className="mt-1 block w-full rounded-md border-gray-300"
                                        />
                                    </div>
                                </div>
                                <div className="mt-2">
                                    <label className="block text-xs text-gray-500">Description</label>
                                    <input
                                        type="text"
                                        value={criteria.description}
                                        onChange={(e) => handleCriteriaChange(key, 'description', e.target.value)}
                                        className="mt-1 block w-full rounded-md border-gray-300"
                                    />
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="flex justify-end space-x-4">
                        <button
                            type="button"
                            onClick={() => navigate('/dashboard')}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50"
                        >
                            Annuler
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className={`px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md shadow-sm hover:bg-indigo-700 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            {loading ? 'Création en cours...' : 'Créer l\'exercice'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ExerciseCreate; 