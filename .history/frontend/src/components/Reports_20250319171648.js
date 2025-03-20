import React, { useState } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Paper,
  Divider,
  Grid,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import useTranslation from '../hooks/useTranslation';
import ReportsView from './ReportsView';
import UploadDocument from './UploadDocument';
import { reportsData } from '../data/reportsData';

const Reports = () => {
  const { t } = useTranslation();
  const [openUploadDialog, setOpenUploadDialog] = useState(false);
  
  // Compter le nombre total de rapports (généraux + spécifiques)
  const getTotalReportsCount = () => {
    let count = reportsData.general_reports.length;
    
    Object.values(reportsData.foundry_reports).forEach(foundryReports => {
      count += foundryReports.length;
    });
    
    return count;
  };
  
  // Gérer l'ouverture et la fermeture du dialog d'upload
  const handleOpenUploadDialog = () => {
    setOpenUploadDialog(true);
  };
  
  const handleCloseUploadDialog = () => {
    setOpenUploadDialog(false);
  };
  
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Box>
          <Typography variant="h4" component="h1" fontWeight="600" gutterBottom>
            Rapports et Analyses
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
            Consultez notre bibliothèque de {getTotalReportsCount()} documents, rapports et études concernant l'industrie du recyclage de lithium.
          </Typography>
        </Box>
        
        <Button 
          variant="contained" 
          startIcon={<AddIcon />}
          onClick={handleOpenUploadDialog}
          sx={{ mt: 1 }}
        >
          Ajouter un document
        </Button>
      </Box>
      
      <Divider sx={{ mb: 4 }} />
      
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
      
      {/* Dialog pour l'upload de document */}
      <Dialog
        open={openUploadDialog}
        onClose={handleCloseUploadDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">Ajouter un document</Typography>
            <IconButton onClick={handleCloseUploadDialog} size="small">
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          <UploadDocument onUploadSuccess={() => {
            // Fermer le dialog après un téléchargement réussi
            setTimeout(() => {
              handleCloseUploadDialog();
            }, 1500); // Attendre un peu pour que l'utilisateur voie la notification de succès
          }} />
        </DialogContent>
      </Dialog>
    </Container>
  );
};

export default Reports; 