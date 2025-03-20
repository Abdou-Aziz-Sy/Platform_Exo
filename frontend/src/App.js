import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Navigation from './components/layout/Navigation';
import StudentDashboard from './pages/new/StudentDashboard';
import ExerciseCreate from './pages/new/ExerciseCreate';
import ExerciseDetails from './components/exercises/ExerciseDetails';
import ExerciseManagement from './components/exercises/ExerciseManagement';
import ExerciseEdit from './components/exercises/ExerciseEdit';
import SubmissionDetails from './components/submissions/SubmissionDetails';
import SubmissionsList from './components/submissions/SubmissionsList';
import Home from './pages/new/Home';
import Login from './pages/new/Login';
import Register from './pages/new/Register';
import ProfessorDashboard from './pages/new/ProfessorDashboard';
import './App.css';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import ThemeToggle from './components/common/ThemeToggle';

// Composant de protection des routes
const PrivateRoute = ({ children, requiredRole }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Chargement...</div>;
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/dashboard" />;
  }

  return children;
};

// Composant pour gérer l'affichage conditionnel de la navbar
const NavigationWrapper = () => {
  const location = useLocation();
  const publicRoutes = ['/', '/login', '/register'];
  
  if (publicRoutes.includes(location.pathname)) {
    return null;
  }
  
  return <Navigation />;
};

// Composant principal de l'application
function AppContent() {
  const { user } = useAuth();

  return (
    <Router>
      <div className="transition-colors duration-200">
        <NavigationWrapper />
        <Routes>
          {/* Page d'accueil */}
          <Route path="/" element={<Home />} />

          {/* Routes d'authentification */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Route du tableau de bord */}
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                {user?.role === 'professor' ? <ProfessorDashboard /> : <StudentDashboard />}
              </PrivateRoute>
            }
          />

          {/* Routes spécifiques aux professeurs */}
          <Route
            path="/exercises/create"
            element={
              <PrivateRoute requiredRole="professor">
                <ExerciseCreate />
              </PrivateRoute>
            }
          />

          {/* Route des détails d'exercice */}
          <Route
            path="/exercises/:id"
            element={
              <PrivateRoute>
                <ExerciseDetails />
              </PrivateRoute>
            }
          />

          {/* Routes de gestion des exercices */}
          <Route
            path="/exercises/manage"
            element={
              <PrivateRoute requiredRole="professor">
                <ExerciseManagement />
              </PrivateRoute>
            }
          />
          <Route
            path="/exercises/:id/edit"
            element={
              <PrivateRoute requiredRole="professor">
                <ExerciseEdit />
              </PrivateRoute>
            }
          />

          {/* Routes spécifiques aux étudiants */}
          <Route
            path="/submissions"
            element={
              <PrivateRoute requiredRole="student">
                <SubmissionsList />
              </PrivateRoute>
            }
          />

          {/* Routes spécifiques aux soumissions */}
          <Route
            path="/submissions/:id"
            element={
              <PrivateRoute>
                <SubmissionDetails />
              </PrivateRoute>
            }
          />
        </Routes>
        <ThemeToggle />
      </div>
    </Router>
  );
}

// Composant racine qui gère les providers
function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
