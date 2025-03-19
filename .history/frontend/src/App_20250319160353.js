import React, { useState, useEffect, createContext, useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Box, Paper, Typography, Grid, FormControl, InputLabel, Select, MenuItem, Switch, FormControlLabel, Button, Divider, Snackbar, Alert } from '@mui/material';
import useTranslation from './hooks/useTranslation';
import { AuthProvider, useAuth } from './contexts/AuthContext';

// Composants
import Dashboard from './components/Dashboard';
import NavBar from './components/NavBar';
import Login from './components/Login';
import Settings from './components/Settings';
import FonderieDetail from './components/FonderieDetail';

// Contexte pour les paramètres globaux
export const SettingsContext = createContext();

// Hook pour utiliser les paramètres dans tous les composants
export const useSettings = () => useContext(SettingsContext);

// Fonction pour charger les paramètres sauvegardés
const loadSavedSettings = () => {
  try {
    const savedSettings = localStorage.getItem('app_settings');
    return savedSettings ? JSON.parse(savedSettings) : null;
  } catch (error) {
    console.error('Erreur lors du chargement des paramètres:', error);
    return null;
  }
};

// Pages supplémentaires
const Research = () => <Box p={3}>Page de Recherche Collaborative</Box>;
const Reports = () => <Box p={3}>Rapports et Analyses</Box>;
const Collaborators = () => <Box p={3}>Collaborateurs Universitaires</Box>;

// Composant de route privée qui vérifie l'authentification
const PrivateRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" />;
};

// Routes de l'application
function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={
        <PrivateRoute>
          <Dashboard />
        </PrivateRoute>
      } />
      <Route path="/research" element={
        <PrivateRoute>
          <Research />
        </PrivateRoute>
      } />
      <Route path="/reports" element={
        <PrivateRoute>
          <Reports />
        </PrivateRoute>
      } />
      <Route path="/collaborators" element={
        <PrivateRoute>
          <Collaborators />
        </PrivateRoute>
      } />
      <Route path="/settings" element={
        <PrivateRoute>
          <Settings />
        </PrivateRoute>
      } />
      <Route path="/fonderie/:fonderieId" element={
        <PrivateRoute>
          <FonderieDetail />
        </PrivateRoute>
      } />
    </Routes>
  );
}

// Fonction App principale
function App() {
  // Charger les paramètres depuis localStorage ou utiliser les valeurs par défaut
  const [settings, setSettings] = useState(() => {
    const savedSettings = loadSavedSettings();
    return savedSettings || {
      theme: 'light',
      language: 'fr',
      animations: true,
      notifications: true,
      highPerformance: false,
      mapStyle: 'standard',
      defaultZoom: '5',
      showLegend: true,
      markerClustering: true,
      zoomControls: true
    };
  });

  // Mettre à jour les paramètres et les sauvegarder
  const updateSettings = (newSettings) => {
    // Assurez-vous de ne pas écraser d'autres paramètres
    const updatedSettings = { ...settings, ...newSettings };
    setSettings(updatedSettings);
    
    // Sauvegarder dans localStorage
    try {
      localStorage.setItem('app_settings', JSON.stringify(updatedSettings));
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des paramètres:', error);
    }
  };

  // Créer le thème en fonction des paramètres
  const theme = createTheme({
    palette: {
      mode: settings.theme === 'system' 
        ? (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
        : settings.theme,
      primary: {
        main: '#1976d2',
      },
      secondary: {
        main: '#dc004e',
      },
    },
  });

  return (
    <SettingsContext.Provider 
      value={{
        settings,
        updateSettings
      }}
    >
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AuthProvider>
          <Router>
            <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
              <NavBar />
              <Box component="main" sx={{ flexGrow: 1, p: { xs: 1, sm: 2 } }}>
                <AppRoutes />
              </Box>
            </Box>
          </Router>
        </AuthProvider>
      </ThemeProvider>
    </SettingsContext.Provider>
  );
}

export default App; 