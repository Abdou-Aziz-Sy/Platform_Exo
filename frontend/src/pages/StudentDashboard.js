import React, { useState } from 'react';
import { FaUserCircle } from 'react-icons/fa';
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
import { useDropzone } from 'react-dropzone';

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
        <h1 className="text-xl font-bold text-purple-600">ESPACE ETUDIANT</h1>
      </div>
      <div className="mb-8">
        <div className="flex items-center">
          <div className="rounded-full w-12 h-12 bg-gray-400 flex items-center justify-center mr-3">
            <FaUserCircle className="text-white text-2xl" />
          </div>
          <div>
            <p className="font-semibold">Magatte DIAWARA</p>
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
              <span className="mr-2">📝</span> Sujets
            </a>
          </li>
          <li className="mb-4">
            <a href="#" className="flex items-center">
              <span className="mr-2">📤</span> Soumissions
            </a>
          </li>
          <li className="mb-4">
            <a href="#" className="flex items-center">
              <span className="mr-2">📊</span> Résultats
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

function StudentDashboard() {
  const [file, setFile] = useState(null);
  const [submissions, setSubmissions] = useState([]); // État pour stocker les soumissions

  // Gestion du Drag & Drop avec react-dropzone
  const { getRootProps, getInputProps } = useDropzone({
    accept: '.pdf',
    onDrop: (acceptedFiles) => {
      setFile(acceptedFiles[0]);
    },
  });

  const handleSubmit = () => {
    if (file) {
      const newSubmission = {
        id: submissions.length + 1, // ID unique pour chaque soumission
        name: file.name, // Nom du fichier soumis
        status: 'Remis', // État de la soumission
      };
      setSubmissions([...submissions, newSubmission]); // Ajouter à la liste des soumissions
      alert(`Réponse soumise: ${file.name}`);
      setFile(null); // Réinitialiser le fichier après soumission
    } else {
      alert('Veuillez sélectionner un fichier avant de soumettre.');
    }
  };

  // Données mockées pour les graphiques
  const performanceData = {
    labels: ['Exercice 1', 'Exercice 2', 'Exercice 3', 'Exercice 4', 'Exercice 5'],
    datasets: [
      {
        label: 'Vos notes',
        data: [14, 16, 19, 15, 18],
        borderColor: 'rgba(75, 192, 192, 1)',
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
        borderWidth: 2,
        fill: true,
      },
    ],
  };

  const comparisonData = {
    labels: ['Exercice 1', 'Exercice 2', 'Exercice 3', 'Exercice 4', 'Exercice 5'],
    datasets: [
      {
        label: 'Vos notes',
        data: [14, 16, 19, 15, 18],
        backgroundColor: 'rgba(75, 192, 192, 0.8)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      },
      {
        label: 'Moyenne de la classe',
        data: [12, 15, 17, 14, 16],
        backgroundColor: 'rgba(255, 99, 132, 0.8)',
        borderColor: 'rgba(255, 99, 132, 1)',
        borderWidth: 1,
      },
    ],
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
          {/* Section Sujets disponibles */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-gray-700">Sujets disponibles</h2>
            <ul>
              <li className="mb-3 bg-white p-3 rounded-lg flex justify-between items-center shadow-md">
                <span>Sujet 1 SQL</span>
                <a href="#" className="text-blue-600 hover:text-blue-500">Télécharger</a>
              </li>
              <li className="mb-3 bg-white p-3 rounded-lg flex justify-between items-center shadow-md">
                <span>Sujet 2 BDD Relationnelles</span>
                <a href="#" className="text-blue-600 hover:text-blue-500">Télécharger</a>
              </li>
            </ul>
          </section>

          {/* Section Soumission de réponses */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-gray-700">Soumettre une réponse</h2>
            <div
              {...getRootProps()}
              className="border-dashed border-2 border-gray-400 p-6 text-center cursor-pointer mb-4"
            >
              <input {...getInputProps()} />
              <p>Glissez et déposez un fichier PDF ici, ou cliquez pour sélectionner</p>
              {file && <p>Fichier sélectionné : {file.name}</p>}
            </div>
            <button
              className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2 rounded-lg mb-4"
              onClick={handleSubmit}
            >
              Soumettre
            </button>
            {/* Liste des soumissions */}
            {submissions.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-2 text-gray-700">Soumissions récentes</h3>
                <ul>
                  {submissions.map((submission) => (
                    <li
                      key={submission.id}
                      className="mb-3 bg-white p-3 rounded-lg flex justify-between items-center shadow-md"
                    >
                      <span>
                        {submission.name} - État: <span className="text-green-600">{submission.status}</span>
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </section>

          {/* Section Corrections et notes */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-gray-700">Corrections et notes</h2>
            <ul>
              <li className="mb-3 bg-white p-3 rounded-lg flex justify-between items-center shadow-md">
                <span>Sujet 1 SQL - Note: 14 - Appréciations: Peut mieux faire</span>
                <button className="text-blue-600 hover:text-blue-500">Voir détails</button>
              </li>
              <li className="mb-3 bg-white p-3 rounded-lg flex justify-between items-center shadow-md">
                <span>Sujet 2 BDD Relationnelles- Note: 16 - Appréciations: Bien dans l'ensemble</span>
                <button className="text-blue-600 hover:text-blue-500">Voir détails</button>
              </li>
            </ul>
          </section>

          {/* Section Suivi des performances */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-gray-700">Suivi des performances</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gradient-to-r from-blue-800 to-black text-white p-6 rounded-lg shadow-lg">
                <h3 className="text-xl mb-2">Évolution de vos notes</h3>
                <Line data={performanceData} />
              </div>
              <div className="bg-gradient-to-r from-blue-800 to-black text-white p-6 rounded-lg shadow-lg">
                <h3 className="text-xl mb-2">Comparaison avec la moyenne de la classe</h3>
                <Bar data={comparisonData} />
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

export default StudentDashboard;