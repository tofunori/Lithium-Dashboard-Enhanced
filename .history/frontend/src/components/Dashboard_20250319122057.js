import React, { useState, useEffect } from 'react';
import { Container, Grid, Paper, Typography, Box } from '@mui/material';
import axios from 'axios';
import RecyclingRateChart from './RecyclingRateChart';
import ProductionTrendsChart from './ProductionTrendsChart';
import PlantsList from './PlantsList';
import MapView from './MapView';

const Dashboard = () => {
  const [plants, setPlants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('/api/recycling-plants/');
        setPlants(response.data);
        setLoading(false);
      } catch (err) {
        setError('Erreur lors du chargement des données');
        setLoading(false);
        console.error(err);
      }
    };

    fetchData();
  }, []);

  if (loading) return <Typography>Chargement des données...</Typography>;
  if (error) return <Typography color="error">{error}</Typography>;

  return (
    <Container maxWidth={false}>
      <Box sx={{ mb: 4, mt: 2 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Tableau de Bord de Recyclage de Lithium
        </Typography>
        <Typography variant="subtitle1" color="textSecondary">
          Plateforme de Collaboration Interuniversitaire
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Carte des installations */}
        <Grid item xs={12} md={8}>
          <Paper elevation={2} sx={{ p: 2, height: 400 }}>
            <Typography variant="h6" gutterBottom>
              Carte des Installations
            </Typography>
            <MapView plants={plants} />
          </Paper>
        </Grid>

        {/* Liste des installations */}
        <Grid item xs={12} md={4}>
          <Paper elevation={2} sx={{ p: 2, height: 400, overflow: 'auto' }}>
            <Typography variant="h6" gutterBottom>
              Installations de Recyclage
            </Typography>
            <PlantsList plants={plants} />
          </Paper>
        </Grid>

        {/* Taux de recyclage */}
        <Grid item xs={12} md={6}>
          <Paper elevation={2} sx={{ p: 2, height: 400 }}>
            <Typography variant="h6" gutterBottom>
              Taux de Recyclage par Installation
            </Typography>
            <RecyclingRateChart plants={plants} />
          </Paper>
        </Grid>

        {/* Tendances de production */}
        <Grid item xs={12} md={6}>
          <Paper elevation={2} sx={{ p: 2, height: 400 }}>
            <Typography variant="h6" gutterBottom>
              Tendances de Production
            </Typography>
            <ProductionTrendsChart plants={plants} />
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Dashboard; 