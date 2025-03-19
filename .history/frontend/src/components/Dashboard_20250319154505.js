import React, { useState, useEffect } from 'react';
import { Container, Grid, Paper, Typography, Box, useTheme } from '@mui/material';
import axios from 'axios';
import RecyclingRateChart from './RecyclingRateChart';
import ProductionTrendsChart from './ProductionTrendsChart';
import PlantsList from './PlantsList';
import MapView from './MapView';
import useTranslation from '../hooks/useTranslation';

const Dashboard = () => {
  const [plants, setPlants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mapHeight, setMapHeight] = useState(550);
  const theme = useTheme();
  const { t } = useTranslation();

  const paperStyle = {
    borderRadius: '10px', 
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
    overflow: 'hidden',
    height: '100%'
  };

  const headerStyle = {
    borderBottom: `1px solid ${theme.palette.divider}`,
    padding: '16px 20px',
    backgroundColor: 'rgba(249, 250, 251, 0.8)',
    margin: '-16px -16px 16px -16px',
    borderTopLeftRadius: '10px',
    borderTopRightRadius: '10px'
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        // En développement, utiliser des données fictives si l'API n'est pas disponible
        try {
          const response = await axios.get('/api/recycling-plants/');
          setPlants(response.data);
        } catch (apiError) {
          console.warn('API non disponible, utilisation de données fictives', apiError);
          // Données fictives pour le développement
          const mockPlants = [
            { id: 1, name: 'EcoBat Lyon', location: 'Lyon, France', latitude: 45.75, longitude: 4.85, operational: true, capacity: '2500 kg/mois' },
            { id: 2, name: 'RecyTech Paris', location: 'Paris, France', latitude: 48.86, longitude: 2.35, maintenance: true, capacity: '1800 kg/mois' },
            { id: 3, name: 'Green Solutions', location: 'Bordeaux, France', latitude: 44.84, longitude: -0.58, offline: true, capacity: '1200 kg/mois' },
            { id: 4, name: 'Future Recycling', location: 'Strasbourg, France', latitude: 48.58, longitude: 7.75, planning: true }
          ];
          setPlants(mockPlants);
        }
        setLoading(false);
      } catch (err) {
        setError('Erreur lors du chargement des données');
        setLoading(false);
        console.error(err);
      }
    };

    fetchData();
  }, []);

  // Callback pour mettre à jour la taille du conteneur parent depuis MapView
  const handleMapResize = (newHeight) => {
    // Utiliser directement la nouvelle hauteur en pixels
    setMapHeight(newHeight);
  };

  if (loading) return <Typography>{t('loading')}</Typography>;
  if (error) return <Typography color="error">{error}</Typography>;

  return (
    <Container maxWidth={false} sx={{ py: 3 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom fontWeight="500" color="primary.dark">
          {t('dashboard_title')}
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          {t('subtitle')}
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Carte des installations */}
        <Grid item xs={12} md={8} sx={{ height: `${mapHeight}px`, transition: 'height 0.3s ease' }}>
          <Paper elevation={0} sx={{ ...paperStyle, p: 0, height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ flexGrow: 1, display: 'flex' }}>
              <MapView plants={plants} onResize={handleMapResize} />
            </Box>
          </Paper>
        </Grid>

        {/* Liste des installations */}
        <Grid item xs={12} md={4} sx={{ height: `${mapHeight}px`, transition: 'height 0.3s ease' }}>
          <Paper elevation={0} sx={{ ...paperStyle, p: 2 }}>
            <Box sx={headerStyle}>
              <Typography variant="h6" fontWeight="500">
                {t('plants_list')}
              </Typography>
            </Box>
            <Box sx={{ height: 'calc(100% - 50px)', overflowY: 'auto' }}>
              <PlantsList plants={plants} />
            </Box>
          </Paper>
        </Grid>

        {/* Taux de recyclage */}
        <Grid item xs={12} md={6} height="400px">
          <Paper elevation={0} sx={{ ...paperStyle, p: 2 }}>
            <Box sx={headerStyle}>
              <Typography variant="h6" fontWeight="500">
                {t('recycling_rate')}
              </Typography>
            </Box>
            <Box sx={{ height: 'calc(100% - 50px)' }}>
              <RecyclingRateChart plants={plants} />
            </Box>
          </Paper>
        </Grid>

        {/* Tendances de production */}
        <Grid item xs={12} md={6} height="400px">
          <Paper elevation={0} sx={{ ...paperStyle, p: 2 }}>
            <Box sx={headerStyle}>
              <Typography variant="h6" fontWeight="500">
                {t('production_trends')}
              </Typography>
            </Box>
            <Box sx={{ height: 'calc(100% - 50px)' }}>
              <ProductionTrendsChart plants={plants} />
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Dashboard; 