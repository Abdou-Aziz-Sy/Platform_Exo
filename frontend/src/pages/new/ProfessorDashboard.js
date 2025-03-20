import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaBook, FaChartBar, FaUserGraduate, FaCheckCircle } from 'react-icons/fa';
import axios from 'axios';
import { API_URL } from '../../config/api';
import { useNavigate } from 'react-router-dom';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { useTheme } from '../../context/ThemeContext';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend
);

const ProfessorDashboard = () => {
  const navigate = useNavigate();
  const { darkMode } = useTheme();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState(null);
  const [exercises, setExercises] = useState([]);
  const [submissions, setSubmissions] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const headers = { Authorization: `Bearer ${token}` };

        // Récupérer les statistiques globales
        const statsResponse = await axios.get(
          `${API_URL}/statistics/global`,
          { headers }
        );
        setStats(statsResponse.data);

        // Récupérer les exercices
        const exercisesResponse = await axios.get(
          `${API_URL}/exercises`,
          { headers }
        );
        setExercises(exercisesResponse.data);

        // Récupérer les soumissions
        const submissionsResponse = await axios.get(
          `${API_URL}/submissions`,
          { headers }
        );
        setSubmissions(submissionsResponse.data);

        setLoading(false);
      } catch (err) {
        console.error('Erreur lors de la récupération des données:', err);
        setError('Une erreur est survenue lors du chargement des données');
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: '#fff',
          font: { size: 12 }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#fff',
        bodyColor: '#fff'
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: { color: '#fff', font: { size: 12 } },
        grid: { color: 'rgba(255, 255, 255, 0.1)' }
      },
      x: {
        ticks: { color: '#fff', font: { size: 12 } },
        grid: { color: 'rgba(255, 255, 255, 0.1)' }
      }
    }
  };

  if (loading) {
    return (
      <div className={`min-h-screen ${darkMode ? 'bg-dark-primary' : 'bg-gradient-to-br from-indigo-900 via-blue-900 to-blue-800'} flex items-center justify-center`}>
        <div className="text-white text-xl">Chargement...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`min-h-screen ${darkMode ? 'bg-dark-primary' : 'bg-gradient-to-br from-indigo-900 via-blue-900 to-blue-800'} p-8`}>
        <div className="bg-red-50 text-red-700 p-4 rounded-lg shadow-lg">
          {error}
        </div>
      </div>
    );
  }

  // Données pour les graphiques
  const submissionsData = {
    labels: stats?.submissions_per_day.map(day => day.date) || [],
    datasets: [{
      label: 'Soumissions par jour',
      data: stats?.submissions_per_day.map(day => day.count) || [],
      borderColor: 'rgba(255, 255, 255, 0.8)',
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
      fill: true,
      tension: 0.4
    }]
  };

  const exercisesData = {
    labels: stats?.top_exercises.map(ex => ex.title) || [],
    datasets: [{
      label: 'Nombre de soumissions',
      data: stats?.top_exercises.map(ex => ex.submissions) || [],
      backgroundColor: 'rgba(255, 255, 255, 0.8)',
      borderColor: 'rgba(255, 255, 255, 0.2)',
      borderWidth: 1
    }]
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-dark-primary' : 'bg-gradient-to-br from-indigo-900 via-blue-900 to-blue-800'}`}>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl font-bold text-white mb-8">Tableau de Bord Professeur</h1>

          {/* Statistiques générales */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className={`${
                darkMode 
                  ? 'bg-dark-secondary border-gray-700' 
                  : 'bg-gradient-to-br from-indigo-800/50 to-blue-900/50 border-indigo-700/30'
              } backdrop-blur-sm rounded-xl p-6 border`}
            >
              <div className="flex items-center mb-4">
                <FaUserGraduate className="h-8 w-8 text-indigo-400 mr-3" />
                <h3 className="text-lg font-medium text-white">Étudiants</h3>
              </div>
              <p className="text-3xl font-bold text-white">{stats?.total_students || 0}</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className={`${
                darkMode 
                  ? 'bg-dark-secondary border-gray-700' 
                  : 'bg-gradient-to-br from-indigo-800/50 to-blue-900/50 border-indigo-700/30'
              } backdrop-blur-sm rounded-xl p-6 border`}
            >
              <div className="flex items-center mb-4">
                <FaBook className="h-8 w-8 text-indigo-400 mr-3" />
                <h3 className="text-lg font-medium text-white">Exercices</h3>
              </div>
              <p className="text-3xl font-bold text-white">{stats?.total_exercises || 0}</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className={`${
                darkMode 
                  ? 'bg-dark-secondary border-gray-700' 
                  : 'bg-gradient-to-br from-indigo-800/50 to-blue-900/50 border-indigo-700/30'
              } backdrop-blur-sm rounded-xl p-6 border`}
            >
              <div className="flex items-center mb-4">
                <FaCheckCircle className="h-8 w-8 text-indigo-400 mr-3" />
                <h3 className="text-lg font-medium text-white">Soumissions</h3>
              </div>
              <p className="text-3xl font-bold text-white">{stats?.total_submissions || 0}</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className={`${
                darkMode 
                  ? 'bg-dark-secondary border-gray-700' 
                  : 'bg-gradient-to-br from-indigo-800/50 to-blue-900/50 border-indigo-700/30'
              } backdrop-blur-sm rounded-xl p-6 border`}
            >
              <div className="flex items-center mb-4">
                <FaChartBar className="h-8 w-8 text-indigo-400 mr-3" />
                <h3 className="text-lg font-medium text-white">Moyenne</h3>
              </div>
              <p className="text-3xl font-bold text-white">
                {stats?.average_score ? stats.average_score.toFixed(2) : 'N/A'}
              </p>
            </motion.div>
          </div>

          {/* Graphiques */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className={`${
                darkMode 
                  ? 'bg-dark-secondary border-gray-700' 
                  : 'bg-gradient-to-br from-indigo-800/50 to-blue-900/50 border-indigo-700/30'
              } backdrop-blur-sm rounded-xl p-6 border`}
            >
              <h3 className="text-xl font-medium text-white mb-4">Soumissions par jour</h3>
              <div className="h-64">
                <Line data={submissionsData} options={chartOptions} />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className={`${
                darkMode 
                  ? 'bg-dark-secondary border-gray-700' 
                  : 'bg-gradient-to-br from-indigo-800/50 to-blue-900/50 border-indigo-700/30'
              } backdrop-blur-sm rounded-xl p-6 border`}
            >
              <h3 className="text-xl font-medium text-white mb-4">Exercices les plus populaires</h3>
              <div className="h-64">
                <Bar data={exercisesData} options={chartOptions} />
              </div>
            </motion.div>
          </div>

          {/* Liste des exercices récents */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className={`${
              darkMode 
                ? 'bg-dark-secondary border-gray-700' 
                : 'bg-gradient-to-br from-indigo-800/50 to-blue-900/50 border-indigo-700/30'
            } backdrop-blur-sm rounded-xl p-6 border`}
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-medium text-white">Exercices récents</h3>
              <button
                onClick={() => navigate('/exercises/create')}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
              >
                Créer un exercice
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-indigo-300 border-b border-indigo-700/30">
                    <th className="py-3 px-4 text-left">Titre</th>
                    <th className="py-3 px-4 text-left">Type</th>
                    <th className="py-3 px-4 text-left">Date</th>
                    <th className="py-3 px-4 text-left">Soumissions</th>
                    <th className="py-3 px-4 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {exercises.slice(0, 5).map((exercise) => (
                    <tr key={exercise.id} className="text-white border-b border-indigo-700/30">
                      <td className="py-3 px-4">{exercise.title}</td>
                      <td className="py-3 px-4">{exercise.exercise_type}</td>
                      <td className="py-3 px-4">
                        {new Date(exercise.created_at).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4">
                        {submissions.filter(s => s.exercise_id === exercise.id).length}
                      </td>
                      <td className="py-3 px-4">
                        <button
                          onClick={() => navigate(`/exercises/${exercise.id}`)}
                          className="text-indigo-300 hover:text-indigo-200 transition-colors"
                        >
                          Voir détails
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default ProfessorDashboard; 