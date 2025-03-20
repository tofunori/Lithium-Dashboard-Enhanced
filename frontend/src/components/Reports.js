import React, { useState, useEffect } from 'react';
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
  IconButton,
  Menu,
  MenuItem,
  Tooltip
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import LinkIcon from '@mui/icons-material/Link';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import { useNavigate } from 'react-router-dom';
import useTranslation from '../hooks/useTranslation';
import ReportsView from './ReportsView';
import UploadDocument from './UploadDocument';
import WebToPdfDialog from './dialogs/WebToPdfDialog';
import { reportsData } from '../data/reportsData';
import { useAuth } from '../contexts/AuthContext';
import { useDocuments } from '../contexts/DocumentsContext';
import LoadingIndicator from './LoadingIndicator';

const Reports = () => {
  const { t } = useTranslation();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [openUploadDialog, setOpenUploadDialog] = useState(false);
  const [openWebToPdfDialog, setOpenWebToPdfDialog] = useState(false);
  const { loadPublicDocuments, isLoading } = useDocuments();
  
  // État pour le menu déroulant
  const [anchorEl, setAnchorEl] = useState(null);
  const openMenu = Boolean(anchorEl);
  
  // Ouvrir le menu
  const handleOpenMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };
  
  // Fermer le menu
  const handleCloseMenu = () => {
    setAnchorEl(null);
  };
  
  // Charger explicitement les documents au montage du composant
  useEffect(() => {
    const documentsCached = localStorage.getItem('cached_documents');
    
    if (!documentsCached) {
      console.log("Premier chargement des documents publics dans Reports");
      loadPublicDocuments(false);
    } else {
      console.log("Documents déjà en cache, pas de rechargement dans Reports");
    }
    
    // Cette fonction ne doit s'exécuter qu'une seule fois au montage
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  // Compter le nombre total de rapports (généraux + spécifiques)
  const getTotalReportsCount = () => {
    let count = reportsData.general_reports.length;
    
    Object.values(reportsData.foundry_reports).forEach(foundryReports => {
      count += foundryReports.length;
    });
    
    return count;
  };
  
  // Vérifier l'authentification avant d'ouvrir un dialogue
  const checkAuthenticationBeforeAction = (action) => {
    if (!isAuthenticated) {
      // Rediriger vers la page de connexion
      navigate('/login', { state: { from: { pathname: '/reports' } } });
      return false;
    }
    return true;
  };
  
  // Gérer l'ouverture du dialogue d'upload de fichier
  const handleOpenUploadDialog = () => {
    if (checkAuthenticationBeforeAction()) {
      setOpenUploadDialog(true);
    }
    handleCloseMenu();
  };
  
  // Gérer l'ouverture du dialogue de conversion web vers PDF
  const handleOpenWebToPdfDialog = () => {
    if (checkAuthenticationBeforeAction()) {
      setOpenWebToPdfDialog(true);
    }
    handleCloseMenu();
  };
  
  // Gérer la fermeture des dialogues
  const handleCloseUploadDialog = () => {
    setOpenUploadDialog(false);
  };
  
  const handleCloseWebToPdfDialog = () => {
    setOpenWebToPdfDialog(false);
  };
  
  // Gérer le succès de l'upload ou de la conversion
  const handleDocumentSuccess = () => {
    // Fermer les dialogues après un succès
    setTimeout(() => {
      handleCloseUploadDialog();
      handleCloseWebToPdfDialog();
    }, 1500); // Attendre un peu pour que l'utilisateur voie la notification de succès
  };
  
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Box>
          <Typography variant="h4" component="h1" fontWeight="600" gutterBottom>
            Rapports et Analyses
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
            {t('documents_library').replace('{count}', getTotalReportsCount())}
          </Typography>
        </Box>
        
        {/* Menu déroulant pour ajouter des documents */}
        <Box>
          <Button 
            variant="contained" 
            startIcon={<AddIcon />}
            onClick={handleOpenMenu}
            aria-haspopup="true"
            aria-expanded={openMenu ? 'true' : undefined}
            aria-controls={openMenu ? 'add-document-menu' : undefined}
            sx={{ mt: 1 }}
          >
            {isAuthenticated ? t('add_document') : t('login_to_add_document')}
          </Button>
          
          <Menu
            id="add-document-menu"
            anchorEl={anchorEl}
            open={openMenu}
            onClose={handleCloseMenu}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
          >
            <MenuItem onClick={handleOpenUploadDialog}>
              <FileUploadIcon sx={{ mr: 1 }} />
              Téléverser un fichier
            </MenuItem>
            <MenuItem onClick={handleOpenWebToPdfDialog}>
              <PictureAsPdfIcon sx={{ mr: 1 }} />
              Convertir une page web en PDF
            </MenuItem>
          </Menu>
        </Box>
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
            <Typography variant="h6">
              <FileUploadIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
              Ajouter un document
            </Typography>
            <IconButton onClick={handleCloseUploadDialog} size="small">
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          <UploadDocument onUploadSuccess={handleDocumentSuccess} />
        </DialogContent>
      </Dialog>
      
      {/* Dialog pour la conversion web vers PDF */}
      <WebToPdfDialog
        open={openWebToPdfDialog}
        onClose={handleCloseWebToPdfDialog}
        onSuccess={handleDocumentSuccess}
      />
    </Container>
  );
};

export default Reports;