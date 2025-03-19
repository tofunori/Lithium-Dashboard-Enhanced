import React from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Paper,
  Divider,
  Grid
} from '@mui/material';
import useTranslation from '../hooks/useTranslation';
import ReportsView from './ReportsView';
import { reportsData } from '../data/reportsData';

const Reports = () => {
  const { t } = useTranslation();
  
  // Compter le nombre total de rapports (généraux + spécifiques)
  const getTotalReportsCount = () => {
    let count = reportsData.general_reports.length;
    
    Object.values(reportsData.foundry_reports).forEach(foundryReports => {
      count += foundryReports.length;
    });
    
    return count;
  };
  
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" fontWeight="600" gutterBottom>
          Rapports et Analyses
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
          Consultez notre bibliothèque de {getTotalReportsCount()} documents, rapports et études concernant l'industrie du recyclage de lithium.
        </Typography>
        <Divider />
      </Box>
      
      <Grid container spacing={4}>
        <Grid item xs={12}>
          <Paper 
            elevation={0}
            sx={{ 
              p: 3, 
              borderRadius: '12px', 
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)'
            }}
          >
            <ReportsView />
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Reports; 