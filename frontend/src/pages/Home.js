import React from 'react';
import { Link } from 'react-router-dom';
import logoEsp from '../assets/logo esp.webp';

function Home() {
  return (
    <div className="min-h-screen bg-white text-gray-800">
      {/* En-tête avec navigation - Bleu plus profond et moderne */}
      <header className="bg-blue-800 py-4 shadow-lg">
        <div className="container mx-auto px-6 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-white">Plateforme d'Évaluation</h1>
          <nav className="hidden md:flex space-x-8">
            <a href="#home" className="text-blue-100 hover:text-white transition duration-200">Accueil</a>
            <a href="#about" className="text-blue-100 hover:text-white transition duration-200">À propos</a>
            <Link to="/login" className="text-100 font-bold text-white">
              Connexion
            </Link>
            <Link to="/inscription" className="text-100 font-bold text-white">
              Inscription
            </Link>
          </nav>
          {/* Menu hamburger pour mobile - ajouté pour responsivité */}
          <div className="md:hidden">
            <button className="text-white">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </header>
      
      {/* Section principale avec fond subtil */}
      <main className="relative text-black bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-6 py-12 md:py-10">
          {/* Layout en deux colonnes plus équilibré */}
          <div className="flex flex-col md:flex-row items-center justify-between">
            {/* Colonne gauche: Logo et slogan */}
            <div className="flex flex-col items-center md:items-start text-center md:text-left md:w-1/2 mb-12 md:mb-0">
              {/* Logo avec taille adaptative */}
              <div className="mb-8 flex justify-center md:justify-start w-full">
                <img
                  src={logoEsp}
                  alt="Logo École Supérieure Polytechnique"
                  className="h-32 w-auto"
                />
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-blue-900 mb-6 leading-tight">
                Évaluez et améliorez vos compétences en bases de données avec notre plateforme innovante
              </h2>
              <Link
                to="/login"
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg transition duration-300 shadow-md transform hover:translate-y-1 hover:shadow-lg"
              >
                Continuez
              </Link>
            </div>
            
            {/* Colonne droite: Cartes avec dégradés améliorés */}
            <div className="md:w-2/5 w-full flex flex-col space-y-6">
              {/* Bloc 1: Dégradé bleu vif */}
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 rounded-xl shadow-lg transform transition-all duration-300 hover:shadow-xl">
                <h3 className="text-xl font-semibold text-white mb-3">Nouveaux Exercices</h3>
                <p className="text-blue-50 text-lg">
                  Découvrez les derniers exercices mis à jour pour vous challenger.
                </p>
              </div>
              
              {/* Bloc 2: Dégradé bleu royal */}
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 rounded-xl shadow-lg transform transition-all duration-300 hover:shadow-xl">
                <h3 className="text-xl font-semibold text-white mb-3">Meilleures Performances</h3>
                <p className="text-blue-50 text-lg">
                  Suivez vos progrès avec des statistiques détaillées.
                </p>
              </div>
              
              {/* Bloc 3: Dégradé bleu profond */}
              <div className="bg-gradient-to-r from-blue-700 to-blue-800 p-6 rounded-xl shadow-lg transform transition-all duration-300 hover:shadow-xl">
                <h3 className="text-xl font-semibold text-white mb-3">Ressources</h3>
                <p className="text-blue-50 text-lg">
                  Accédez à des guides et des tutoriels personnalisés.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      {/* Footer simple et élégant */}
      <footer className="bg-gray-100 border-t border-gray-200 py-8">
        <div className="container mx-auto px-6 text-center">
          <p className="text-gray-600">
            Université Cheikh Anta DIOP de Dakar | École Supérieure Polytechnique | Département Génie-Informatique
          </p>
        </div>
      </footer>
    </div>
  );
}

export default Home;