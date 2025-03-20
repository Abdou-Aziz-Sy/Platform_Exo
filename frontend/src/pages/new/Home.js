import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import logoEsp from '../../assets/logo esp.webp';
import { FaDatabase, FaChartLine, FaBook, FaBars, FaUsers, FaRocket, FaLightbulb } from 'react-icons/fa';

function Home() {
  return (
    <div className="min-h-screen bg-white text-gray-800">
      {/* En-tête avec navigation */}
      <header className="bg-gray-800 py-4 shadow-lg sticky top-0 z-50">
        <div className="container mx-auto px-6 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-white">Plateforme d'Évaluation</h1>
          <nav className="hidden md:flex space-x-8">
            <a href="#home" className="text-blue-100 hover:text-white transition duration-200 font-medium flex items-center justify-center shadow-lg">
              Accueil
            </a>
            <a href="#about" className="text-blue-100 hover:text-white transition duration-200 font-medium flex items-center justify-center shadow-lg">
              À propos
            </a>
            <Link to="/login" className="text-white font-bold bg-gray-500 hover:bg-blue-800 px-4 py-2 rounded-lg transition duration-300 shadow-md">
              Connexion
            </Link>
            <Link to="/inscription" className="text-white font-bold bg-gray-500 hover:bg-blue-800 px-4 py-2 rounded-lg transition duration-300 shadow-md">
              Inscription
            </Link>
          </nav>
          {/* Menu hamburger pour mobile */}
          <div className="md:hidden">
            <button className="text-white focus:outline-none">
              <FaBars className="h-6 w-6" />
            </button>
          </div>
        </div>
      </header>

      {/* Section principale */}
      <main className="py-16">
        <div className="container mx-auto px-6">
          {/* Layout en deux colonnes */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-12">
            {/* Colonne gauche: Logo et slogan */}
            <div className="flex flex-col items-center md:items-start text-center md:text-left md:w-1/2 mb-12 md:mb-0">
              <div className="mb-8 flex justify-center md:justify-start w-full">
                <motion.img
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5 }}
                  src={logoEsp}
                  alt="Logo École Supérieure Polytechnique"
                  className="h-32 w-auto rounded-lg shadow-md"
                />
              </div>
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="text-4xl md:text-5xl font-extrabold text-grey-900 mb-6 leading-tight tracking-tight"
              >
                Évaluez et améliorez vos compétences en bases de données
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="text-lg text-gray-600 mb-8"
              >
                Une plateforme innovante pour les étudiants et enseignants, conçue pour optimiser l'apprentissage et le suivi des performances.
              </motion.p>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.6 }}
              >
                <Link
                  to="/login"
                  className="bg-gray-500 hover:bg-blue-800 text-white font-bold py-3 px-8 rounded-lg transition duration-300 shadow-lg transform hover:-translate-y-1 hover:shadow-xl flex items-center gap-2"
                >
                  Découvrez
                </Link>
              </motion.div>
            </div>

            {/* Colonne droite: Cartes avec icônes et effets */}
            <div className="md:w-2/5 w-full flex flex-col space-y-6">
              {/* Carte 1: Exercices */}
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="bg-gray-700 p-6 rounded-xl shadow-lg transform transition-all duration-300 hover:shadow-xl hover:-translate-y-1 flex items-start gap-4"
              >
                <FaDatabase className="text-white text-3xl" />
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">Nouveaux Exercices</h3>
                  <p className="text-blue-100 text-base">
                    Explorez des exercices interactifs pour maîtriser les bases de données.
                  </p>
                </div>
              </motion.div>

              {/* Carte 2: Performances */}
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
                className="bg-gray-700 p-6 rounded-xl shadow-lg transform transition-all duration-300 hover:shadow-xl hover:-translate-y-1 flex items-start gap-4"
              >
                <FaChartLine className="text-white text-3xl" />
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">Suivi des Performances</h3>
                  <p className="text-blue-100 text-base">
                    Analysez vos progrès avec des statistiques détaillées et personnalisées.
                  </p>
                </div>
              </motion.div>

              {/* Carte 3: Ressources */}
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.7 }}
                className="bg-gray-700 p-6 rounded-xl shadow-lg transform transition-all duration-300 hover:shadow-xl hover:-translate-y-1 flex items-start gap-4"
              >
                <FaBook className="text-white text-3xl" />
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">Ressources Éducatives</h3>
                  <p className="text-blue-100 text-base">
                    Accédez à des guides et tutoriels pour approfondir vos connaissances.
                  </p>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </main>

      {/* Section À propos */}
      <section id="about" className="py-20 bg-white relative">
        <div className="container mx-auto px-6">
          {/* Titre avec un effet décoratif */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-extrabold text-grey-900 mb-4 tracking-tight">
              À propos de notre plateforme
            </h2>
            <div className="w-24 h-1 bg-gray-900 mx-auto rounded-full"></div>
          </motion.div>

          {/* Contenu avec disposition asymétrique et cartes */}
          <div className="relative">
            {/* Introduction à gauche */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="max-w-lg mx-auto md:mx-0 text-center md:text-left mb-12"
            >
              <p className="text-gray-700 text-lg leading-relaxed">
                La Plateforme d'Évaluation est une solution révolutionnaire développée par le Département Génie-Informatique de l'École Supérieure Polytechnique (ESP), visant à transformer l'apprentissage des bases de données pour les étudiants et enseignants.
              </p>
            </motion.div>

            {/* Cartes avec effet de profondeur */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
              {/* Carte 1 - Innovation */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.4 }}
                className="relative bg-white p-6 rounded-2xl shadow-xl transform transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl border border-gray-500"
              >
                <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 w-12 h-12 bg-gray-800 py-4 rounded-full flex items-center justify-center shadow-lg">
                  <FaRocket className="text-white text-xl"/>
                </div>
                <h3 className="text-xl font-semibold text-grey-900 mt-8 mb-3 text-center">Innovation</h3>
                <p className="text-gray-600 text-base text-center">
                  Une approche moderne pour l'apprentissage interactif, avec des outils avancés pour étudiants et enseignants.
                </p>
              </motion.div>

              {/* Carte 2 - Collaboration */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.6 }}
                className="relative bg-white p-6 rounded-2xl shadow-xl transform transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl border border-gray-500 md:-mt-8"
              >
                <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 w-12 h-12 bg-gray-800 py-4 rounded-full flex items-center justify-center shadow-lg">
                  <FaUsers className="text-white text-xl" />
                </div>
                <h3 className="text-xl font-semibold text-grey-900 mt-8 mb-3 text-center">Collaboration</h3>
                <p className="text-gray-600 text-base text-center">
                  Favorise l'interaction entre étudiants et enseignants pour un apprentissage collectif et efficace.
                </p>
              </motion.div>

              {/* Carte 3 - Excellence */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.8 }}
                className="relative bg-white p-6 rounded-2xl shadow-xl transform transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl border border-gray-500"
              >
                <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 w-12 h-12 bg-gray-800 py-4 rounded-full flex items-center justify-center shadow-lg">
                  <FaLightbulb className="text-white text-xl" />
                </div>
                <h3 className="text-xl font-semibold text-grey-900 mt-8 mb-3 text-center">Excellence</h3>
                <p className="text-gray-600 text-base text-center">
                  Des ressources et des outils conçus pour atteindre l'excellence académique.
                </p>
              </motion.div>
            </div>

            {/* Éléments décoratifs en arrière-plan */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 1, delay: 0.2 }}
              className="absolute top-1/2 left-0 w-64 h-64 bg-blue-100 rounded-full opacity-20 transform -translate-y-1/2 -z-10"
            ></motion.div>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 1, delay: 0.4 }}
              className="absolute bottom-0 right-0 w-48 h-48 bg-blue-200 rounded-full opacity-20 -z-10"
            ></motion.div>
          </div>

          {/* Call-to-action final */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 1 }}
            className="text-center mt-16"
          >
            <p className="text-gray-600 text-lg italic mb-6">
              Prêt à transformer votre apprentissage ?
            </p>
            <Link
              to="/login"
              className="text-white font-bold bg-gray-900 hover:bg-blue-800 px-6 py-4 rounded-lg transition duration-300 shadow-md"
            >
              Rejoignez-nous
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-100 border-t border-gray-200 py-8">
        <div className="container mx-auto px-6 text-center">
          <p className="text-gray-600 text-sm">
            Université Cheikh Anta DIOP de Dakar | École Supérieure Polytechnique | Département Génie-Informatique
          </p>
        </div>
      </footer>
    </div>
  );
}

export default Home; 