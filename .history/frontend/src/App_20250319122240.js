import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Box } from '@mui/material';

// Composants
import Dashboard from './components/Dashboard';
import NavBar from './components/NavBar';

// Pages supplémentaires
const Research = () => <Box p={3}>Page de Recherche Collaborative</Box>;
const Reports = () => <Box p={3}>Rapports et Analyses</Box>;
const Collaborators = () => <Box p={3}>Collaborateurs Universitaires</Box>;
const Settings = () => <Box p={3}>Paramètres de la Plateforme</Box>;

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