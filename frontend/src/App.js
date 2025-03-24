import React, { useEffect } from 'react';
import { 
  BrowserRouter as Router, 
  Routes, 
  Route, 
  Navigate, 
  useLocation
} from 'react-router-dom';
import axios from 'axios';
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

// Configuration globale d'Axios
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log('API URL:', process.env.REACT_APP_API_URL);
    console.log('Request Config:', config);
    return config;
  },
  (error) => {
    console.error('Request Error:', error);
    return Promise.reject(error);
  }
);

// Composant de protection des routes
const PrivateRoute = ({ children, requiredRole }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  console.log('PrivateRoute - User:', user);
  console.log('PrivateRoute - Loading:', loading);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-900 via-blue-900 to-blue-800">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
    </div>;
  }

  if (!user) {
    console.log('PrivateRoute - Redirecting to login');
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requiredRole && user.role !== requiredRole) {
    console.log('PrivateRoute - Invalid role, redirecting to dashboard');
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

// Composant pour le routage du dashboard
const DashboardRoute = () => {
  const { user } = useAuth();
  console.log('DashboardRoute - User Role:', user?.role);
  return user?.role === 'professor' ? <ProfessorDashboard /> : <StudentDashboard />;
};

// Composant pour la navigation
const NavigationWrapper = () => {
  const location = useLocation();
  const publicRoutes = ['/', '/login', '/register'];
  
  console.log('NavigationWrapper - Current Path:', location.pathname);
  
  if (publicRoutes.includes(location.pathname)) {
    return null;
  }
  
  return <Navigation />;
};

// Composant principal
function AppContent() {
  console.log('AppContent - Rendering');
  console.log('Environment:', process.env.NODE_ENV);
  console.log('API URL:', process.env.REACT_APP_API_URL);

  return (
    <Router>
      <div className="transition-colors duration-200">
        <NavigationWrapper />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <DashboardRoute />
              </PrivateRoute>
            }
          />
          
          <Route
            path="/exercises/create"
            element={
              <PrivateRoute requiredRole="professor">
                <ExerciseCreate />
              </PrivateRoute>
            }
          />
          
          <Route
            path="/exercises/:id"
            element={
              <PrivateRoute>
                <ExerciseDetails />
              </PrivateRoute>
            }
          />
          
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
          
          <Route
            path="/submissions"
            element={
              <PrivateRoute requiredRole="student">
                <SubmissionsList />
              </PrivateRoute>
            }
          />
          
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

// Composant racine
function App() {
  console.log('App - Initial Render');
  
  useEffect(() => {
    console.log('App - Environment Variables:');
    console.log('NODE_ENV:', process.env.NODE_ENV);
    console.log('REACT_APP_API_URL:', process.env.REACT_APP_API_URL);
    console.log('REACT_APP_FRONTEND_URL:', process.env.REACT_APP_FRONTEND_URL);
    console.log('REACT_APP_ADMIN_URL:', process.env.REACT_APP_ADMIN_URL);
  }, []);

  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
