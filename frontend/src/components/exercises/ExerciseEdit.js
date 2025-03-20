import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_URL, API_ROUTES } from '../../config/api';

const ExerciseEdit = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [exercise, setExercise] = useState(null);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchExercise();
    }, [id]);

    const fetchExercise = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(
                `${API_URL}${API_ROUTES.EXERCISES.GET(id)}`,
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );
            setExercise(response.data);
            setTitle(response.data.title);
            setDescription(response.data.description);
        } catch (err) {
            setError('Erreur lors du chargement de l\'exercice');
            console.error('Erreur:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const formData = new FormData();
            formData.append('title', title);
            formData.append('description', description);
            if (file) {
                formData.append('file', file);
            }

            const token = localStorage.getItem('token');
            await axios.put(
                `${API_URL}${API_ROUTES.EXERCISES.UPDATE(id)}`,
                formData,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data'
                    }
                }
            );

            navigate('/exercises/manage');
        } catch (err) {
            console.error('Erreur détaillée:', err.response?.data);
            let errorMessage = 'Erreur lors de la modification de l\'exercice';
            
            if (err.response?.data) {
                if (typeof err.response.data === 'string') {
                    errorMessage = err.response.data;
                } else if (err.response.data.detail) {
                    errorMessage = err.response.data.detail;
                } else if (Array.isArray(err.response.data)) {
                    errorMessage = err.response.data.map(error => error.msg).join(', ');
                }
            }
            
            setError(errorMessage);
        } finally {
            setLoading(false);
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
            <div className="container mx-auto px-4 py-8">
                <div className="bg-red-50 text-red-700 p-4 rounded-md">
                    {error}
                </div>
            </div>
        );
    }

    if (!exercise) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="text-lg">Exercice non trouvé</div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="max-w-2xl mx-auto">
                <h1 className="text-3xl font-bold mb-8">Modifier l'exercice</h1>

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
                            Nouveau fichier PDF (optionnel)
                        </label>
                        <input
                            type="file"
                            id="file"
                            accept=".pdf"
                            onChange={(e) => setFile(e.target.files[0])}
                            className="mt-1 block w-full text-sm text-gray-500
                                file:mr-4 file:py-2 file:px-4
                                file:rounded-md file:border-0
                                file:text-sm file:font-semibold
                                file:bg-indigo-50 file:text-indigo-700
                                hover:file:bg-indigo-100"
                        />
                        <p className="mt-2 text-sm text-gray-500">
                            Si aucun fichier n'est sélectionné, le fichier actuel sera conservé.
                        </p>
                    </div>

                    <div className="flex justify-end space-x-4">
                        <button
                            type="button"
                            onClick={() => navigate('/exercises/manage')}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50"
                        >
                            Annuler
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className={`px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md shadow-sm hover:bg-indigo-700 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            {loading ? 'Modification en cours...' : 'Modifier l\'exercice'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ExerciseEdit; 