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
import useTranslation from '../hooks/useTranslation';

// Fonction pour déterminer le statut d'une installation
const getPlantStatus = (plant) => {
  if (plant.operational) return 'operational';
  if (plant.maintenance) return 'maintenance';
  if (plant.offline) return 'offline';
  return 'planning';
};

// Couleurs selon le statut
const statusColors = {
  operational: 'success',
  maintenance: 'warning',
  offline: 'error',
  planning: 'default'
};

const PlantsList = ({ plants }) => {
  const { t } = useTranslation();
  
  // Vérifier si plants existe et n'est pas vide
  if (!plants || plants.length === 0) {
    return (
      <Box sx={{ p: 2, textAlign: 'center' }}>
        <Typography color="text.secondary">{t('no_plants_found')}</Typography>
      </Box>
    );
  }

  return (
    <List sx={{ width: '100%', bgcolor: 'background.paper', p: 0 }}>
      {plants.map((plant, index) => {
        const status = getPlantStatus(plant);
        const statusColor = statusColors[status] || 'default';
        
        return (
          <React.Fragment key={plant.id || index}>
            <ListItem alignItems="flex-start" sx={{ py: 2 }}>
              <ListItemAvatar>
                <Avatar sx={{ bgcolor: 'primary.light' }}>
                  <BusinessIcon />
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={
                  <Typography variant="subtitle1" fontWeight="500">
                    {plant.name}
                  </Typography>
                }
                secondary={
                  <React.Fragment>
                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                      <PlaceIcon sx={{ fontSize: 16, mr: 0.5, color: 'text.secondary' }} />
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        component="span"
                      >
                        {plant.location || t('location_unknown')}
                      </Typography>
                    </Box>
                    <Box sx={{ mt: 1 }}>
                      <Chip 
                        label={t(status)} 
                        size="small" 
                        color={statusColor}
                        sx={{ mt: 1 }}
                      />
                    </Box>
                    <Box sx={{ mt: 1 }}>
                      <Typography variant="body2" color="text.secondary">
                        <strong>{t('capacity')}:</strong> {plant.capacity || t('not_available')}
                      </Typography>
                    </Box>
                  </React.Fragment>
                }
              />
            </ListItem>
            {index < plants.length - 1 && <Divider variant="inset" component="li" />}
          </React.Fragment>
        );
      })}
    </List>
  );
};

export default PlantsList; 