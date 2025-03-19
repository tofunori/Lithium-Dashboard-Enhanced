import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Typography, Box, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import axios from 'axios';

const ProductionTrendsChart = ({ plants }) => {
  const [productionData, setProductionData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPlants, setSelectedPlants] = useState([]);

  useEffect(() => {
    const fetchProductionData = async () => {
      try {
        const response = await axios.get('/api/production-history/');
        setProductionData(response.data);
        
        // Sélectionner les 3 premières installations par défaut si disponibles
        if (plants && plants.length > 0) {
          setSelectedPlants(plants.slice(0, 3).map(plant => plant.id));
        }
        
        setLoading(false);
      } catch (err) {
        setError('Erreur lors du chargement des données de production');
        setLoading(false);
        console.error(err);
      }
    };

    fetchProductionData();
  }, [plants]);

  const handlePlantChange = (event) => {
    setSelectedPlants(event.target.value);
  };

  if (loading) return <Typography>Chargement des données...</Typography>;
  if (error) return <Typography color="error">{error}</Typography>;

  // Créer des données de test en attendant l'API
  // Ces données seraient normalement fournies par l'API
  const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Aoû', 'Sept', 'Oct', 'Nov', 'Déc'];
  const demoData = months.map(month => {
    const dataPoint = { month };
    plants.forEach(plant => {
      if (selectedPlants.includes(plant.id)) {
        // Générer des données aléatoires simulées
        const baseValue = Math.floor(Math.random() * 1000) + 500;
        dataPoint[plant.name] = baseValue + Math.floor(Math.random() * 200);
      }
    });
    return dataPoint;
  });

  // Générer des couleurs différentes pour chaque ligne
  const colors = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088fe', '#00c49f'];

  return (
    <Box sx={{ width: '100%', height: '100%' }}>
      <FormControl sx={{ mb: 2, width: 300 }}>
        <InputLabel id="plant-select-label">Installations</InputLabel>
        <Select
          labelId="plant-select-label"
          id="plant-select"
          multiple
          value={selectedPlants}
          onChange={handlePlantChange}
          label="Installations"
          renderValue={(selected) => {
            return plants
              .filter(plant => selected.includes(plant.id))
              .map(plant => plant.name)
              .join(', ');
          }}
        >
          {plants.map((plant) => (
            <MenuItem key={plant.id} value={plant.id}>
              {plant.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <Box sx={{ width: '100%', height: 250 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={demoData}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis label={{ value: 'Production (kg)', angle: -90, position: 'insideLeft' }} />
            <Tooltip />
            <Legend />
            {plants
              .filter(plant => selectedPlants.includes(plant.id))
              .map((plant, index) => (
                <Line
                  key={plant.id}
                  type="monotone"
                  dataKey={plant.name}
                  stroke={colors[index % colors.length]}
                  activeDot={{ r: 8 }}
                />
              ))
            }
          </LineChart>
        </ResponsiveContainer>
      </Box>
    </Box>
  );
};

export default ProductionTrendsChart; 