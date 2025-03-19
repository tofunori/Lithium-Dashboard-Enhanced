import React from 'react';
import { 
  List, 
  ListItem, 
  ListItemText, 
  Divider, 
  Typography, 
  Chip,
  Box,
  Avatar,
  ListItemAvatar
} from '@mui/material';
import PlaceIcon from '@mui/icons-material/Place';
import BusinessIcon from '@mui/icons-material/Business';

// Fonction pour déterminer le statut d'une installation
const getPlantStatus = (plant) => {
  if (plant.status) return plant.status;
  return plant.active ? 'operational' : 'suspended';
};

// Traduction des statuts en français
const statusTranslation = {
  operational: 'Opérationnel',
  construction: 'En construction',
  planned: 'Planifié',
  approved: 'Approuvé',
  suspended: 'En pause',
  default: 'Inconnu'
};

// Couleurs associées aux statuts
const statusColors = {
  operational: '#4caf50',  // green
  construction: '#ff9800', // orange
  planned: '#2196f3',      // blue
  approved: '#9c27b0',     // purple
  suspended: '#f44336',    // red
  default: '#9e9e9e'       // grey
};

const PlantsList = ({ plants }) => {
  if (!plants || plants.length === 0) {
    return <Typography>Aucune installation trouvée.</Typography>;
  }

  // Trier les installations par nom
  const sortedPlants = [...plants].sort((a, b) => a.name.localeCompare(b.name));

  return (
    <List disablePadding>
      {sortedPlants.map((plant, index) => {
        const status = getPlantStatus(plant);
        const statusText = statusTranslation[status] || statusTranslation.default;
        const statusColor = statusColors[status] || statusColors.default;
        
        return (
          <React.Fragment key={plant.id}>
            {index > 0 && <Divider variant="inset" component="li" />}
            <ListItem 
              alignItems="flex-start" 
              sx={{ 
                py: 1.5,
                '&:hover': {
                  backgroundColor: 'rgba(0, 0, 0, 0.02)'
                }
              }}
            >
              <ListItemAvatar>
                <Avatar 
                  sx={{ 
                    bgcolor: `${statusColor}20`,
                    color: statusColor
                  }}
                >
                  <PlaceIcon />
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Typography variant="subtitle1" component="div" sx={{ fontWeight: 500 }}>
                      {plant.name}
                    </Typography>
                    <Chip 
                      size="small" 
                      label={statusText} 
                      sx={{ 
                        backgroundColor: `${statusColor}20`, 
                        color: statusColor,
                        fontWeight: 500,
                        fontSize: '0.7rem'
                      }}
                    />
                  </Box>
                }
                secondary={
                  <Box sx={{ mt: 0.5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                      <BusinessIcon sx={{ fontSize: 16, color: 'text.secondary', mr: 0.5 }} />
                      <Typography variant="body2" color="text.secondary" component="span">
                        {plant.location}, {plant.country}
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary" component="div" sx={{ mt: 0.5 }}>
                      <strong>Capacité:</strong> {plant.capacity} kg/mois
                    </Typography>
                    <Typography variant="body2" color="text.secondary" component="div">
                      <strong>Production:</strong> {plant.current_production} kg/mois
                    </Typography>
                    <Box sx={{ mt: 1 }}>
                      <Chip 
                        size="small" 
                        label={`${plant.recycling_rate}% recyclage`} 
                        sx={{
                          backgroundColor: plant.recycling_rate > 75 ? '#e8f5e9' : plant.recycling_rate > 50 ? '#fff8e1' : '#ffebee',
                          color: plant.recycling_rate > 75 ? '#2e7d32' : plant.recycling_rate > 50 ? '#f57f17' : '#c62828',
                          fontWeight: 500,
                          fontSize: '0.7rem'
                        }}
                      />
                    </Box>
                  </Box>
                }
              />
            </ListItem>
          </React.Fragment>
        );
      })}
    </List>
  );
};

export default PlantsList; 