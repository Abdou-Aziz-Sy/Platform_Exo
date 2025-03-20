import React, { useState } from 'react';
import { API_URL } from '../config/api';

const ExerciseForm = ({ onSubmit }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState(null);
  const [correctionFile, setCorrectionFile] = useState(null);
  const [correctionText, setCorrectionText] = useState('');
  const [evaluationCriteria, setEvaluationCriteria] = useState({
    syntaxe: { poids: 0.3, description: "Correction syntaxique des requêtes SQL" },
    logique: { poids: 0.4, description: "Logique et exactitude des résultats" },
    optimisation: { poids: 0.3, description: "Optimisation et performance des requêtes" }
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('file', file);
    if (correctionFile) {
      formData.append('correction_file', correctionFile);
    }
    formData.append('correction_text', correctionText);
    formData.append('evaluation_criteria', JSON.stringify(evaluationCriteria));

    try {
      const response = await fetch(`${API_URL}/exercises`, {
        method: 'POST',
        body: formData,
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la création de l\'exercice');
      }

      const data = await response.json();
      onSubmit(data);
      
      // Réinitialiser le formulaire
      setTitle('');
      setDescription('');
      setFile(null);
      setCorrectionFile(null);
      setCorrectionText('');
      
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de la création de l\'exercice');
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

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow">
      <div>
        <label className="block text-sm font-medium text-gray-700">Titre</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          rows="4"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Fichier de l'exercice (PDF)</label>
        <input
          type="file"
          accept=".pdf"
          onChange={(e) => setFile(e.target.files[0])}
          className="mt-1 block w-full"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Fichier de correction (PDF, optionnel)</label>
        <input
          type="file"
          accept=".pdf"
          onChange={(e) => setCorrectionFile(e.target.files[0])}
          className="mt-1 block w-full"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Correction SQL</label>
        <textarea
          value={correctionText}
          onChange={(e) => setCorrectionText(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          rows="6"
          placeholder="Entrez la solution SQL correcte ici..."
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-4">Critères d'évaluation</label>
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

      <div>
        <button
          type="submit"
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Créer l'exercice
        </button>
      </div>
    </form>
  );
};

export default ExerciseForm; 