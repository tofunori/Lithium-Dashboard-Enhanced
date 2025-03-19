import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Box, Paper, Typography, Grid, FormControl, InputLabel, Select, MenuItem, Switch, FormControlLabel, Button, Divider } from '@mui/material';

// Composants
import Dashboard from './components/Dashboard';
import NavBar from './components/NavBar';

// Pages supplémentaires
const Research = () => <Box p={3}>Page de Recherche Collaborative</Box>;
const Reports = () => <Box p={3}>Rapports et Analyses</Box>;
const Collaborators = () => <Box p={3}>Collaborateurs Universitaires</Box>;

// Page de paramètres complète
const Settings = () => {
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
                value="light"
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
                value="fr"
                label="Langue"
              >
                <MenuItem value="fr">Français</MenuItem>
                <MenuItem value="en">English</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <FormControlLabel
              control={<Switch defaultChecked />}
              label="Animations"
              sx={{ mb: 2, display: 'block' }}
            />
            
            <FormControlLabel
              control={<Switch defaultChecked />}
              label="Notifications"
              sx={{ mb: 2, display: 'block' }}
            />
            
            <FormControlLabel
              control={<Switch />}
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
                value="standard"
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
                value="5"
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
              control={<Switch defaultChecked />}
              label="Afficher la légende"
              sx={{ mb: 2, display: 'block' }}
            />
            
            <FormControlLabel
              control={<Switch defaultChecked />}
              label="Clustering des marqueurs"
              sx={{ mb: 2, display: 'block' }}
            />
            
            <FormControlLabel
              control={<Switch defaultChecked />}
              label="Contrôles de zoom"
              sx={{ mb: 2, display: 'block' }}
            />
          </Grid>
        </Grid>
      </Paper>

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
        <Button variant="outlined" sx={{ mr: 2 }}>Réinitialiser</Button>
        <Button variant="contained" color="primary">Enregistrer les modifications</Button>
      </Box>
    </Box>
  );
};

// Theme
const theme = createTheme({
  palette: {
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
});

function App() {
  return (
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
  );
}

export default App; 