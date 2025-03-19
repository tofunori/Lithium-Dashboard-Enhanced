import React, { useState, useEffect, createContext, useContext } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Box, Paper, Typography, Grid, FormControl, InputLabel, Select, MenuItem, Switch, FormControlLabel, Button, Divider, Snackbar, Alert } from '@mui/material';

// Composants
import Dashboard from './components/Dashboard';
import NavBar from './components/NavBar';

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

// Page de paramètres complète avec état
const Settings = () => {
  // Récupérer les paramètres du contexte
  const { settings, updateSettings } = useSettings();
  
  // Vérifier si settings existe, sinon utiliser des valeurs par défaut
  const defaultSettings = {
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
  
  // Utiliser settings s'il existe, sinon utiliser defaultSettings
  const currentSettings = settings || defaultSettings;
  
  // États locaux pour les formulaires
  const [localSettings, setLocalSettings] = useState(currentSettings);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [resetConfirmOpen, setResetConfirmOpen] = useState(false);

  // Mettre à jour localSettings quand settings change
  useEffect(() => {
    if (settings) {
      setLocalSettings(settings);
    }
  }, [settings]);

  const paperStyle = {
    borderRadius: '10px', 
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
    overflow: 'hidden',
    padding: 3,
    marginBottom: 3
  };

  const headerStyle = {
    borderBottom: '1px solid rgba(0, 0, 0, 0.1)',
    paddingBottom: 2,
    marginBottom: 3
  };

  // Gestionnaire pour les changements de sélection
  const handleSelectChange = (event) => {
    const { name, value } = event.target;
    setLocalSettings(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Gestionnaire pour les changements de switch
  const handleSwitchChange = (event) => {
    const { name, checked } = event.target;
    setLocalSettings(prev => ({
      ...prev,
      [name]: checked
    }));
  };

  // Enregistrer les modifications
  const handleSaveChanges = () => {
    updateSettings(localSettings);
    setSnackbarOpen(true);
  };

  // Réinitialiser les paramètres
  const handleResetSettings = () => {
    const defaultSettings = {
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
    setLocalSettings(defaultSettings);
    updateSettings(defaultSettings);
    setSnackbarOpen(true);
  };

  // Fermer le snackbar
  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') return;
    setSnackbarOpen(false);
  };

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
      <Typography variant="h4" component="h1" gutterBottom fontWeight="500" color="primary.dark">
        Paramètres de la Plateforme
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 4 }}>
        Personnalisez l'affichage et les fonctionnalités de votre tableau de bord
      </Typography>

      <Paper sx={paperStyle}>
        <Typography variant="h6" sx={headerStyle}>Paramètres d'affichage</Typography>
        
        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel id="theme-select-label">Thème</InputLabel>
              <Select
                labelId="theme-select-label"
                id="theme-select"
                name="theme"
                value={localSettings.theme}
                onChange={handleSelectChange}
                label="Thème"
              >
                <MenuItem value="light">Clair</MenuItem>
                <MenuItem value="dark">Sombre</MenuItem>
                <MenuItem value="system">Système</MenuItem>
              </Select>
            </FormControl>
            
            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel id="lang-select-label">Langue</InputLabel>
              <Select
                labelId="lang-select-label"
                id="lang-select"
                name="language"
                value={localSettings.language}
                onChange={handleSelectChange}
                label="Langue"
              >
                <MenuItem value="fr">Français</MenuItem>
                <MenuItem value="en">English</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <FormControlLabel
              control={
                <Switch 
                  checked={localSettings.animations} 
                  onChange={handleSwitchChange}
                  name="animations"
                />
              }
              label="Animations"
              sx={{ mb: 2, display: 'block' }}
            />
            
            <FormControlLabel
              control={
                <Switch 
                  checked={localSettings.notifications} 
                  onChange={handleSwitchChange}
                  name="notifications"
                />
              }
              label="Notifications"
              sx={{ mb: 2, display: 'block' }}
            />
            
            <FormControlLabel
              control={
                <Switch 
                  checked={localSettings.highPerformance} 
                  onChange={handleSwitchChange}
                  name="highPerformance"
                />
              }
              label="Mode haute performance"
              sx={{ mb: 2, display: 'block' }}
            />
          </Grid>
        </Grid>
      </Paper>

      <Paper sx={paperStyle}>
        <Typography variant="h6" sx={headerStyle}>Paramètres de la carte</Typography>
        
        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel id="map-style-label">Style de carte</InputLabel>
              <Select
                labelId="map-style-label"
                id="map-style"
                name="mapStyle"
                value={localSettings.mapStyle}
                onChange={handleSelectChange}
                label="Style de carte"
              >
                <MenuItem value="standard">Standard</MenuItem>
                <MenuItem value="satellite">Satellite</MenuItem>
                <MenuItem value="terrain">Terrain</MenuItem>
              </Select>
            </FormControl>
            
            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel id="default-zoom-label">Zoom par défaut</InputLabel>
              <Select
                labelId="default-zoom-label"
                id="default-zoom"
                name="defaultZoom"
                value={localSettings.defaultZoom}
                onChange={handleSelectChange}
                label="Zoom par défaut"
              >
                <MenuItem value="3">Continent</MenuItem>
                <MenuItem value="5">Pays</MenuItem>
                <MenuItem value="7">Région</MenuItem>
                <MenuItem value="10">Ville</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <FormControlLabel
              control={
                <Switch 
                  checked={localSettings.showLegend} 
                  onChange={handleSwitchChange}
                  name="showLegend"
                />
              }
              label="Afficher la légende"
              sx={{ mb: 2, display: 'block' }}
            />
            
            <FormControlLabel
              control={
                <Switch 
                  checked={localSettings.markerClustering} 
                  onChange={handleSwitchChange}
                  name="markerClustering"
                />
              }
              label="Clustering des marqueurs"
              sx={{ mb: 2, display: 'block' }}
            />
            
            <FormControlLabel
              control={
                <Switch 
                  checked={localSettings.zoomControls} 
                  onChange={handleSwitchChange}
                  name="zoomControls"
                />
              }
              label="Contrôles de zoom"
              sx={{ mb: 2, display: 'block' }}
            />
          </Grid>
        </Grid>
      </Paper>

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
        <Button 
          variant="outlined" 
          sx={{ mr: 2 }}
          onClick={handleResetSettings}
        >
          Réinitialiser
        </Button>
        <Button 
          variant="contained" 
          color="primary"
          onClick={handleSaveChanges}
        >
          Enregistrer les modifications
        </Button>
      </Box>

      {/* Notification de sauvegarde */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity="success" sx={{ width: '100%' }}>
          Les paramètres ont été sauvegardés avec succès!
        </Alert>
      </Snackbar>
    </Box>
  );
};

// Fonction principale de l'app
function App() {
  // État pour les paramètres de l'application
  const [settings, setSettings] = useState({
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
  });

  // Charger les paramètres au démarrage
  useEffect(() => {
    const savedSettings = loadSavedSettings();
    if (savedSettings) {
      setSettings(savedSettings);
    }
  }, []);

  // Mettre à jour et sauvegarder les paramètres
  const updateSettings = (newSettings) => {
    console.log('Mise à jour des paramètres:', newSettings);
    try {
      // S'assurer que tous les paramètres sont définis
      const updatedSettings = {
        ...settings,
        ...newSettings
      };
      
      // Mise à jour de l'état
      setSettings(updatedSettings);
      
      // Sauvegarde dans localStorage
      localStorage.setItem('app_settings', JSON.stringify(updatedSettings));
      
      console.log('Paramètres sauvegardés avec succès');
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des paramètres:', error);
    }
  };

  // Créer le thème en fonction des paramètres
  const theme = createTheme({
    palette: {
      mode: settings.theme === 'system' 
        ? window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
        : settings.theme,
      primary: {
        main: '#1976d2',
      },
      secondary: {
        main: '#388e3c',
      },
    },
    typography: {
      fontFamily: [
        'Roboto',
        'Arial',
        'sans-serif',
      ].join(','),
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: settings.animations 
            ? {} 
            : {
                '& *': {
                  transition: 'none !important',
                  animation: 'none !important'
                }
              }
        }
      }
    }
  });

  return (
    <SettingsContext.Provider value={{ settings, updateSettings }}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Router>
          <NavBar />
          <Box sx={{ p: 2 }}>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/research" element={<Research />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/collaborators" element={<Collaborators />} />
              <Route path="/settings" element={<Settings />} />
            </Routes>
          </Box>
        </Router>
      </ThemeProvider>
    </SettingsContext.Provider>
  );
}

export default App; 