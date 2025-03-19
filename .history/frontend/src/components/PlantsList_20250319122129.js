import React from 'react';
import { 
  List, 
  ListItem, 
  ListItemText, 
  Divider, 
  Typography, 
  Chip,
  Box
} from '@mui/material';

const PlantsList = ({ plants }) => {
  if (!plants || plants.length === 0) {
    return <Typography>Aucune installation trouvée.</Typography>;
  }

  // Trier les installations par nom
  const sortedPlants = [...plants].sort((a, b) => a.name.localeCompare(b.name));

  return (
    <List disablePadding>
      {sortedPlants.map((plant, index) => (
        <React.Fragment key={plant.id}>
          {index > 0 && <Divider />}
          <ListItem alignItems="flex-start">
            <ListItemText
              primary={
                <Typography variant="subtitle1" component="div">
                  {plant.name}
                </Typography>
              }
              secondary={
                <Box sx={{ mt: 1 }}>
                  <Typography variant="body2" color="text.secondary" component="div">
                    Capacité: {plant.capacity} kg/mois
                  </Typography>
                  <Typography variant="body2" color="text.secondary" component="div">
                    Production actuelle: {plant.current_production} kg/mois
                  </Typography>
                  <Box sx={{ mt: 1, display: 'flex', gap: 1 }}>
                    <Chip 
                      size="small" 
                      label={`${plant.recycling_rate}% recyclage`} 
                      color={plant.recycling_rate > 75 ? "success" : plant.recycling_rate > 50 ? "warning" : "error"}
                    />
                    <Chip 
                      size="small" 
                      label={plant.active ? "Active" : "Inactive"} 
                      color={plant.active ? "primary" : "default"}
                    />
                  </Box>
                </Box>
              }
            />
          </ListItem>
        </React.Fragment>
      ))}
    </List>
  );
};

export default PlantsList; 