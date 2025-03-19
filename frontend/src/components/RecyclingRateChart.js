import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Typography, Box } from '@mui/material';

const RecyclingRateChart = ({ plants }) => {
  if (!plants || plants.length === 0) {
    return <Typography>Aucune donnée disponible pour le graphique.</Typography>;
  }

  // Préparer les données pour le graphique
  const chartData = plants.map(plant => ({
    name: plant.name,
    'Taux de Recyclage (%)': plant.recycling_rate,
    'Objectif (%)': 75, // Objectif fixé à 75%
  }));

  // Trier par taux de recyclage
  chartData.sort((a, b) => b['Taux de Recyclage (%)'] - a['Taux de Recyclage (%)']);

  // Limiter à 10 installations pour la lisibilité
  const limitedData = chartData.slice(0, 10);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <Box sx={{ bgcolor: 'background.paper', p: 2, border: '1px solid #ccc', borderRadius: 1 }}>
          <Typography variant="subtitle2">{label}</Typography>
          {payload.map((entry, index) => (
            <Typography 
              key={`item-${index}`} 
              variant="body2" 
              sx={{ color: entry.color }}
            >
              {`${entry.name}: ${entry.value}%`}
            </Typography>
          ))}
        </Box>
      );
    }
    return null;
  };

  return (
    <Box sx={{ width: '100%', height: 300 }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={limitedData}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="name"
            tick={{ fontSize: 12 }}
            angle={-45}
            textAnchor="end"
            height={60}
          />
          <YAxis 
            label={{ value: 'Pourcentage (%)', angle: -90, position: 'insideLeft' }}
            domain={[0, 100]}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Bar dataKey="Taux de Recyclage (%)" fill="#4caf50" />
          <Bar dataKey="Objectif (%)" fill="#ff9800" />
        </BarChart>
      </ResponsiveContainer>
    </Box>
  );
};

export default RecyclingRateChart; 