import React from 'react';
import { Link } from 'react-router-dom';

function Inscription() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-200 p-4">
      <div className="bg-white p-6 md:p-8 rounded-lg shadow-md w-full max-w-sm border border-gray-200">
        {/* Logo ou icône (optionnel) */}
        <div className="flex justify-center mb-4">
          <div className="h-12 w-12 bg-blue-600 rounded-full flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 21v-2a4 4 0 00-8 0v2m8-10a4 4 0 10-8 0 4 4 0 008 0zm6 10v-2a4 4 0 00-3-3.87M2 19v-2a4 4 0 013-3.87" />
            </svg>
          </div>
        </div>

        <h2 className="text-2xl font-semibold text-center mb-6 text-gray-800">Inscription</h2>
        
        <form>
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-1" htmlFor="prenom">Prénom</label>
            <input type="text" id="prenom" className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Entrez votre prénom" />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-1" htmlFor="nom">Nom</label>
            <input type="text" id="nom" className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Entrez votre nom" />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-1" htmlFor="email">Email</label>
            <input type="email" id="email" className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Entrez votre email" />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-1" htmlFor="password">Mot de passe</label>
            <input type="password" id="password" className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Entrez votre mot de passe" />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-1">Vous êtes :</label>
            <div className="flex items-center space-x-4">
              <label className="flex items-center">
                <input type="radio" name="role" value="etudiant" className="h-4 w-4 text-blue-600 focus:ring-blue-500" />
                <span className="ml-2 text-gray-700">Étudiant</span>
              </label>
              <label className="flex items-center">
                <input type="radio" name="role" value="professeur" className="h-4 w-4 text-blue-600 focus:ring-blue-500" />
                <span className="ml-2 text-gray-700">Professeur</span>
              </label>
            </div>
          </div>
          
          <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
            S'inscrire
          </button>
        </form>
        
        <div className="mt-6 text-center border-t border-gray-200 pt-4 text-sm">
          <p className="text-gray-600">
            Vous avez déjà un compte?{' '}
            <Link to="/login" className="text-blue-600 hover:text-blue-800 font-medium">Se connecter</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Inscription;
