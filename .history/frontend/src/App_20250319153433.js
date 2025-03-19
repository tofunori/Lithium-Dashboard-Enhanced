import React, { useState, useEffect, createContext, useContext } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Box, Paper, Typography, Grid, FormControl, InputLabel, Select, MenuItem, Switch, FormControlLabel, Button, Divider, Snackbar, Alert } from '@mui/material';
import useTranslation from './hooks/useTranslation';

// Composants
import Dashboard from './components/Dashboard';
import NavBar from './components/NavBar';
import Login from './components/Login';

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
  const { t } = useTranslation();
  
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
        {t('settings_title')}
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 4 }}>
        {t('settings_subtitle')}
      </Typography>

      <Paper sx={paperStyle}>
        <Typography variant="h6" sx={headerStyle}>{t('display_settings')}</Typography>
        
        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel id="theme-select-label">{t('theme')}</InputLabel>
              <Select
                labelId="theme-select-label"
                id="theme-select"
                name="theme"
                value={localSettings.theme}
                onChange={handleSelectChange}
                label={t('theme')}
              >
                <MenuItem value="light">{t('light')}</MenuItem>
                <MenuItem value="dark">{t('dark')}</MenuItem>
                <MenuItem value="system">{t('system')}</MenuItem>
              </Select>
            </FormControl>
            
            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel id="lang-select-label">{t('language')}</InputLabel>
              <Select
                labelId="lang-select-label"
                id="lang-select"
                name="language"
                value={localSettings.language}
                onChange={handleSelectChange}
                label={t('language')}
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
              label={t('animations')}
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
              label={t('notifications')}
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
              label={t('high_performance')}
              sx={{ mb: 2, display: 'block' }}
            />
          </Grid>
        </Grid>
      </Paper>

      <Paper sx={paperStyle}>
        <Typography variant="h6" sx={headerStyle}>{t('map_settings')}</Typography>
        
        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel id="map-style-label">{t('map_style')}</InputLabel>
              <Select
                labelId="map-style-label"
                id="map-style"
                name="mapStyle"
                value={localSettings.mapStyle}
                onChange={handleSelectChange}
                label={t('map_style')}
              >
                <MenuItem value="standard">{t('standard')}</MenuItem>
                <MenuItem value="satellite">{t('satellite')}</MenuItem>
                <MenuItem value="terrain">{t('terrain')}</MenuItem>
              </Select>
            </FormControl>
            
            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel id="default-zoom-label">{t('default_zoom')}</InputLabel>
              <Select
                labelId="default-zoom-label"
                id="default-zoom"
                name="defaultZoom"
                value={localSettings.defaultZoom}
                onChange={handleSelectChange}
                label={t('default_zoom')}
              >
                <MenuItem value="3">{t('continent')}</MenuItem>
                <MenuItem value="5">{t('country')}</MenuItem>
                <MenuItem value="7">{t('region')}</MenuItem>
                <MenuItem value="10">{t('city')}</MenuItem>
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
              label={t('show_legend')}
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
              label={t('marker_clustering')}
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
              label={t('zoom_controls')}
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
          {t('reset')}
        </Button>
        <Button 
          variant="contained" 
          color="primary"
          onClick={handleSaveChanges}
        >
          {t('save_changes')}
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
          {t('settings_saved')}
        </Alert>
      </Snackbar>
    </Box>
  );
};

// Routes de l'application
function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/research" element={<Research />} />
      <Route path="/reports" element={<Reports />} />
      <Route path="/collaborators" element={<Collaborators />} />
      <Route path="/settings" element={<Settings />} />
      <Route path="/login" element={<Login />} />
    </Routes>
  );
}

// Fonction principale de l'app
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
    <SettingsContext.Provider 
      value={{ 
        settings, 
        updateSettings
      }}
    >
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
              <Route path="/login" element={<Login />} />
            </Routes>
          </Box>
        </Router>
      </ThemeProvider>
    </SettingsContext.Provider>
  );
}

export default App; 