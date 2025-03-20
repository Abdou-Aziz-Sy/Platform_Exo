import React, { useState } from 'react';
import { FaUserCircle } from 'react-icons/fa';
import { Bar, Line } from 'react-chartjs-2';
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

// Enregistrement des composants nécessaires pour Chart.js
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

// Composant pour la barre latérale
function Sidebar() {
  return (
    <div className="w-64 h-screen bg-purple-100 text-gray-800 p-4">
      <div className="mb-8">
        <h1 className="text-xl font-bold text-purple-600">ESPACE PROFESSEUR</h1>
      </div>
      <div className="mb-8">
        <div className="flex items-center">
          <div className="rounded-full w-12 h-12 bg-gray-400 flex items-center justify-center mr-3">
            <FaUserCircle className="text-white text-2xl" />
          </div>
          <div>
            <p className="font-semibold">DR MBACKE</p>
            <span className="text-green-500">● Online</span>
          </div>
        </div>
      </div>
      <nav>
        <ul>
          <li className="mb-4">
            <a href="#" className="flex items-center text-purple-600">
              <span className="mr-2">🏠</span> Dashboard
            </a>
          </li>
          <li className="mb-4">
            <a href="#" className="flex items-center">
              <span className="mr-2">📊</span> Statistiques
            </a>
          </li>
          <li className="mb-4">
            <a href="#" className="flex items-center">
              <span className="mr-2">📝</span> Sujets
            </a>
          </li>
          <li className="mb-4">
            <a href="#" className="flex items-center">
              <span className="mr-2">📤</span> Soumissions
            </a>
          </li>
        </ul>
      </nav>
    </div>
  );
}

// Composant pour l'en-tête
function Header() {
  return (
    <div className="flex justify-between items-center bg-gradient-to-r from-blue-800 to-black p-4 shadow-md">
      <div className="flex-1 text-white">
        <p className="text-lg font-semibold">École Supérieure Polytechnique | Département Génie-Informatique</p>
      </div>
      <div className="flex items-center space-x-4">
        <button className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all font-medium text-sm shadow-sm">
          Déconnexion
        </button>
      </div>
    </div>
  );
}

function TeacherDashboard() {
  const [file, setFile] = useState(null);
  const [subjects, setSubjects] = useState([
    { id: 1, name: 'Sujet 1 SQL' },
    { id: 2, name: 'Sujet 2 BDD Relationnelles' },
  ]); // État pour les sujets
  const [correctionModels, setCorrectionModels] = useState([
    { id: 1, name: 'Modèle Correction 1' },
    { id: 2, name: 'Modèle Correction 2' },
  ]); // État pour les modèles de correction

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const handleSubmit = (type) => {
    if (file) {
      const newItem = {
        id: type === 'subject' ? subjects.length + 1 : correctionModels.length + 1,
        name: file.name,
      };
      if (type === 'subject') {
        setSubjects([...subjects, newItem]);
      } else if (type === 'correction') {
        setCorrectionModels([...correctionModels, newItem]);
      }
      alert(`${type === 'subject' ? 'Sujet' : 'Modèle de correction'} ajouté: ${file.name}`);
      setFile(null); // Réinitialiser le fichier
    } else {
      alert('Veuillez sélectionner un fichier avant de soumettre.');
    }
  };

  // Fonction pour supprimer un sujet
  const handleDeleteSubject = (id) => {
    setSubjects(subjects.filter((subject) => subject.id !== id));
  };

  // Fonction pour modifier un sujet
  const handleEditSubject = (id) => {
    alert(`Modifier le sujet avec l'ID: ${id}`);
  };

  // Fonction pour supprimer un modèle de correction
  const handleDeleteCorrection = (id) => {
    setCorrectionModels(correctionModels.filter((model) => model.id !== id));
  };

  // Fonction pour modifier un modèle de correction
  const handleEditCorrection = (id) => {
    alert(`Modifier le modèle de correction avec l'ID: ${id}`);
  };

  // Données mockées pour les graphiques existants
  const averageData = {
    labels: ['Exercice 1', 'Exercice 2', 'Exercice 3'],
    datasets: [
      {
        label: 'Moyenne des notes',
        data: [12, 15, 18],
        backgroundColor: 'rgba(255, 105, 180, 0.8)',
        borderColor: 'rgba(0, 0, 0, 0.8)',
        borderWidth: 1,
      },
    ],
  };

  const progressionData = {
    labels: ['Semaine 1', 'Semaine 2', 'Semaine 3'],
    datasets: [
      {
        label: 'Progression',
        data: [10, 14, 17],
        borderColor: 'rgba(75, 192, 192, 1)',
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
        borderWidth: 2,
        fill: true,
      },
    ],
  };

  // Données mockées pour la section d'analyse
  const learningTrendsData = {
    labels: ['Semaine 1', 'Semaine 2', 'Semaine 3', 'Semaine 4'],
    datasets: [
      {
        label: 'Tendance d’apprentissage',
        data: [50, 60, 70, 65],
        borderColor: 'rgba(255, 99, 132, 1)',
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
        borderWidth: 2,
        fill: true,
      },
    ],
  };

  const stats = {
    submissions: 150,
    successRate: 75,
    poorlyUnderstood: ['Question 1', 'Question 3'],
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-r from-blue-100 to-purple-100">
      {/* Barre latérale */}
      <Sidebar />

      {/* Contenu principal */}
      <div className="flex-1">
        {/* En-tête */}
        <Header />

        {/* Sections du tableau de bord */}
        <div className="p-6">
          {/* Section Statistiques */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-gray-700">Statistiques des performances</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gradient-to-r from-blue-800 to-black text-white p-6 rounded-lg shadow-lg">
                <h3 className="text-xl mb-2">Moyenne des notes par exercice</h3>
                <Bar data={averageData} />
              </div>
              <div className="bg-gradient-to-r from-blue-800 to-black text-white p-6 rounded-lg shadow-lg">
                <h3 className="text-xl mb-2">Progression des notes</h3>
                <Line data={progressionData} />
              </div>
            </div>
          </section>

          {/* Section Sujets d'examen */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-gray-700">Sujets d'examen</h2>
            <input type="file" accept=".txt,.pdf" onChange={handleFileChange} className="mb-4" />
            <button
              className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2 rounded-lg mr-4"
              onClick={() => handleSubmit('subject')}
            >
              Ajouter un Sujet
            </button>
            <ul>
              {subjects.map((subject) => (
                <li
                  key={subject.id}
                  className="mb-3 bg-white p-3 rounded-lg flex justify-between items-center shadow-md"
                >
                  <span>{subject.name}</span>
                  <div>
                    <button
                      className="text-blue-600 hover:text-blue-500 mr-4"
                      onClick={() => handleEditSubject(subject.id)}
                    >
                      Modifier
                    </button>
                    <button
                      className="text-red-600 hover:text-red-500"
                      onClick={() => handleDeleteSubject(subject.id)}
                    >
                      Supprimer
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </section>

          {/* Section Soumissions étudiantes */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-gray-700">Soumissions étudiantes</h2>
            <ul>
              <li className="mb-3 bg-white p-3 rounded-lg flex justify-between items-center shadow-md">
                <span>Abdou Aziz SY - Sujet 1 SQL- Note: 15/20</span>
                <button className="text-blue-600 hover:text-blue-500">Ajuster</button>
              </li>
              <li className="mb-3 bg-white p-3 rounded-lg flex justify-between items-center shadow-md">
                <span>Ibrahima SENE - Sujet 2 BDD Relationnelles - Note: 18/20</span>
                <button className="text-blue-600 hover:text-blue-500">Ajuster</button>
              </li>
            </ul>
          </section>

          {/* Section Modèles de correction */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-gray-700">Modèles de correction</h2>
            <input type="file" accept=".txt,.pdf" onChange={handleFileChange} className="mb-4" />
            <button
              className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2 rounded-lg"
              onClick={() => handleSubmit('correction')}
            >
              Ajouter un Modèle
            </button>
            <ul>
              {correctionModels.map((model) => (
                <li
                  key={model.id}
                  className="mb-3 bg-white p-3 rounded-lg flex justify-between items-center shadow-md"
                >
                  <span>{model.name}</span>
                  <div>
                    <button
                      className="text-blue-600 hover:text-blue-500 mr-4"
                      onClick={() => handleEditCorrection(model.id)}
                    >
                      Modifier
                    </button>
                    <button
                      className="text-red-600 hover:text-red-500"
                      onClick={() => handleDeleteCorrection(model.id)}
                    >
                      Supprimer
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </section>

          {/* Section : Analyse des performances */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-gray-700">Analyse des performances</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gradient-to-r from-blue-800 to-black text-white p-6 rounded-lg shadow-lg">
                <h3 className="text-xl mb-2">Statistiques</h3>
                <p>Nombre de soumissions : {stats.submissions}</p>
                <p>Taux de réussite : {stats.successRate}%</p>
                <p>Questions mal comprises : {stats.poorlyUnderstood.join(', ')}</p>
              </div>
              <div className="bg-gradient-to-r from-blue-800 to-black text-white p-6 rounded-lg shadow-lg col-span-2">
                <h3 className="text-xl mb-2">Tendances d’apprentissage</h3>
                <Line data={learningTrendsData} />
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

export default TeacherDashboard;