import React from 'react';
import { Link } from 'react-router-dom';

function Login() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-200 p-4">
      <div className="bg-white p-6 md:p-8 rounded-lg shadow-md w-full max-w-sm border border-gray-200">
        {/* Logo ou icône (optionnel) */}
        <div className="flex justify-center mb-4">
          <div className="h-12 w-12 bg-blue-600 rounded-full flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
        </div>
        
        <h2 className="text-2xl font-semibold text-center mb-6 text-gray-800">Connexion</h2>
        
        <form>
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-1" htmlFor="email">
              Email
            </label>
            <input
              type="email"
              id="email"
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="Entrez votre email"
            />
          </div>
          
          <div className="mb-4">
            <div className="flex justify-between items-center mb-1">
              <label className="block text-gray-700 font-medium" htmlFor="password">
                Mot de passe
              </label>
              <a href="#" className="text-xs text-blue-600 hover:text-blue-800 transition-colors">
                Mot de passe oublié?
              </a>
            </div>
            <input
              type="password"
              id="password"
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="Entrez votre mot de passe"
            />
          </div>
          
          <div className="mb-4">
            <label className="flex items-center text-sm">
              <input type="checkbox" className="h-4 w-4 text-blue-600 focus:ring-blue-500" />
              <span className="ml-2 text-gray-700">Se souvenir de moi</span>
            </label>
          </div>
          
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all font-medium text-sm shadow-sm"
          >
            Se connecter
          </button>
        </form>
        
        <div className="mt-6 text-center border-t border-gray-200 pt-4 text-sm">
          <p className="text-gray-600">
            Vous n'avez pas de compte?{' '}
            <Link to="/inscription" className="text-blue-600 hover:text-blue-800 font-medium transition-colors">
              S'inscrire
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
