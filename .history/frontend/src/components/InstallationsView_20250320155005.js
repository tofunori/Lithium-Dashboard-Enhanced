import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  IconButton,
  Tooltip,
  Snackbar,
  Alert,
  TablePagination,
  CircularProgress,
  Link
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import useTranslation from '../hooks/useTranslation';
import { useRefineries } from '../contexts/RefineryContext';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

// Statuts disponibles pour les fonderies
const availableStatuses = [
  'Opérationnel',
  'En construction',
  'Planifié',
  'En pause',
  'Approuvé',
  'En suspens'
];

// Pays disponibles
const availableCountries = [
  'Canada',
  'États-Unis'
];

const InstallationsView = () => {
  const { t } = useTranslation();
  const { 
    refineries, 
    loading, 
    error, 
    addRefinery, 
    updateRefinery, 
    deleteRefinery 
  } = useRefineries();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [openDialog, setOpenDialog] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentRefinery, setCurrentRefinery] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  
  // Formulaire pour ajouter/modifier une raffinerie
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    location: '',
    country: '',
    coordinates: [0, 0],
    status: '',
    production: '',
    processing: '',
    notes: '',
    website: ''
  });
  
  // Gérer l'ouverture du dialogue
  const handleOpenDialog = (refinery = null) => {
    // Vérifier si l'utilisateur est authentifié
    if (!isAuthenticated) {
      setSnackbar({
        open: true,
        message: 'Vous devez être connecté pour modifier les raffineries',
        severity: 'error'
      });
      return;
    }
    
    if (refinery) {
      // Mode édition
      setEditMode(true);
      setCurrentRefinery(refinery);
      setFormData({
        id: refinery.id,
        name: refinery.name || '',
        location: refinery.location || '',
        country: refinery.country || '',
        coordinates: refinery.coordinates || [0, 0],
        status: refinery.status || '',
        production: refinery.production || '',
        processing: refinery.processing || '',
        notes: refinery.notes || '',
        website: refinery.website || ''
      });
    } else {
      // Mode ajout
      setEditMode(false);
      setCurrentRefinery(null);
      setFormData({
        id: refineries.length > 0 ? Math.max(...refineries.map(r => r.id)) + 1 : 1,
        name: '',
        location: '',
        country: '',
        coordinates: [0, 0],
        status: '',
        production: '',
        processing: '',
        notes: '',
        website: ''
      });
    }
    setOpenDialog(true);
  };
  
  // Fermer le dialogue
  const handleCloseDialog = () => {
    setOpenDialog(false);
  };
  
  // Gérer les changements de champs du formulaire
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Gérer les changements de coordonnées
  const handleCoordinatesChange = (index, value) => {
    const newCoordinates = [...formData.coordinates];
    newCoordinates[index] = Number(value);
    setFormData(prev => ({
      ...prev,
      coordinates: newCoordinates
    }));
  };
  
  // Sauvegarder une raffinerie (ajout ou modification)
  const handleSaveRefinery = () => {
    // Vérifier si l'utilisateur est authentifié
    if (!isAuthenticated) {
      setSnackbar({
        open: true,
        message: 'Vous devez être connecté pour enregistrer des modifications',
        severity: 'error'
      });
      return;
    }
    
    // Vérifier les champs obligatoires
    if (!formData.name || !formData.location || !formData.status) {
      setSnackbar({
        open: true,
        message: 'Veuillez remplir tous les champs obligatoires',
        severity: 'error'
      });
      return;
    }
    
    if (editMode) {
      // Modification d'une raffinerie existante
      updateRefinery(formData);
      
      setSnackbar({
        open: true,
        message: 'Raffinerie modifiée avec succès',
        severity: 'success'
      });
    } else {
      // Ajout d'une nouvelle raffinerie
      addRefinery(formData);
      
      setSnackbar({
        open: true,
        message: 'Nouvelle raffinerie ajoutée avec succès',
        severity: 'success'
      });
    }
    
    handleCloseDialog();
  };
  
  // Supprimer une raffinerie
  const handleDeleteRefinery = (id) => {
    // Vérifier si l'utilisateur est authentifié
    if (!isAuthenticated) {
      setSnackbar({
        open: true,
        message: 'Vous devez être connecté pour supprimer une raffinerie',
        severity: 'error'
      });
      return;
    }
    
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette raffinerie ?')) {
      deleteRefinery(id);
      
      setSnackbar({
        open: true,
        message: 'Raffinerie supprimée avec succès',
        severity: 'success'
      });
    }
  };
  
  // Gestion de la pagination
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };
  
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  
  // Fermer le snackbar
  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbar(prev => ({ ...prev, open: false }));
  };
  
  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" component="h1">
          {t('plants_list')}
        </Typography>
        {isAuthenticated && (
          <Button 
            variant="contained" 
            color="primary" 
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
          >
            Ajouter une raffinerie
          </Button>
        )}
      </Box>
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 5 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Paper sx={{ p: 3, textAlign: 'center', color: 'error.main' }}>
          <Typography>{error}</Typography>
        </Paper>
      ) : (
        <Paper elevation={3} sx={{ width: '100%', overflow: 'hidden' }}>
          <TableContainer sx={{ maxHeight: 'calc(100vh - 250px)' }}>
            <Table stickyHeader aria-label="tableau des raffineries">
              <TableHead>
                <TableRow>
                  <TableCell>Nom</TableCell>
                  <TableCell>Localisation</TableCell>
                  <TableCell>Pays</TableCell>
                  <TableCell>Statut</TableCell>
                  <TableCell>Production</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {refineries.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      Aucune raffinerie trouvée
                    </TableCell>
                  </TableRow>
                ) : (
                  refineries
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((refinery) => (
                    <TableRow key={refinery.id} hover>
                      <TableCell component="th" scope="row">
                        <Link
                          component="button"
                          variant="body2"
                          onClick={() => navigate(`/fonderie/${refinery.id}`)}
                          sx={{ textDecoration: 'none', cursor: 'pointer', fontWeight: 'medium' }}
                        >
                          {refinery.name}
                        </Link>
                      </TableCell>
                      <TableCell>{refinery.location}</TableCell>
                      <TableCell>{refinery.country}</TableCell>
                      <TableCell>
                        <Box
                          component="span"
                          sx={{
                            px: 1.5,
                            py: 0.5,
                            borderRadius: 1,
                            fontSize: '0.75rem',
                            fontWeight: 500,
                            backgroundColor: 
                              refinery.status === 'Opérationnel' ? 'success.light' : 
                              refinery.status === 'En construction' ? 'info.light' :
                              refinery.status === 'Planifié' ? 'warning.light' :
                              refinery.status === 'En pause' ? 'error.light' :
                              'grey.300',
                            color: 
                              refinery.status === 'Opérationnel' ? 'success.dark' : 
                              refinery.status === 'En construction' ? 'info.dark' :
                              refinery.status === 'Planifié' ? 'warning.dark' :
                              refinery.status === 'En pause' ? 'error.dark' :
                              'grey.800'
                          }}
                        >
                          {refinery.status || 'Inconnu'}
                        </Box>
                      </TableCell>
                      <TableCell>{refinery.production || 'N/A'}</TableCell>
                      <TableCell>
                        {isAuthenticated && (
                          <>
                            <Tooltip title="Modifier">
                              <IconButton 
                                size="small" 
                                color="primary"
                                onClick={() => handleOpenDialog(refinery)}
                              >
                                <EditIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Supprimer">
                              <IconButton 
                                size="small" 
                                color="error"
                                onClick={() => handleDeleteRefinery(refinery.id)}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25, 50]}
            component="div"
            count={refineries.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            labelRowsPerPage="Lignes par page:"
            labelDisplayedRows={({ from, to, count }) => `${from}-${to} sur ${count}`}
          />
        </Paper>
      )}
      
      {/* Dialogue pour ajouter/modifier une raffinerie */}
      <Dialog 
        open={openDialog} 
        onClose={handleCloseDialog}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>
          {editMode ? 'Modifier une raffinerie' : 'Ajouter une nouvelle raffinerie'}
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                margin="normal"
                label="Nom"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                margin="normal"
                label="Localisation"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Pays</InputLabel>
                <Select
                  name="country"
                  value={formData.country}
                  onChange={handleInputChange}
                  label="Pays"
                >
                  {availableCountries.map(country => (
                    <MenuItem key={country} value={country}>
                      {country}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Statut</InputLabel>
                <Select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  label="Statut"
                  required
                >
                  {availableStatuses.map(status => (
                    <MenuItem key={status} value={status}>
                      {status}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                margin="normal"
                label="Latitude"
                type="number"
                value={formData.coordinates[0]}
                onChange={(e) => handleCoordinatesChange(0, e.target.value)}
                inputProps={{ step: 0.001 }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                margin="normal"
                label="Longitude"
                type="number"
                value={formData.coordinates[1]}
                onChange={(e) => handleCoordinatesChange(1, e.target.value)}
                inputProps={{ step: 0.001 }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                margin="normal"
                label="Production annuelle"
                name="production"
                value={formData.production}
                onChange={handleInputChange}
                helperText="Ex: 10 000 tonnes par an, 60 GWh par an, etc."
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                margin="normal"
                label="Technologie de traitement"
                name="processing"
                value={formData.processing}
                onChange={handleInputChange}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                margin="normal"
                label="Site Web"
                name="website"
                value={formData.website}
                onChange={handleInputChange}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                margin="normal"
                label="Notes"
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                multiline
                rows={3}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="inherit">
            Annuler
          </Button>
          <Button onClick={handleSaveRefinery} variant="contained" color="primary">
            Enregistrer
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Snackbar pour les notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={5000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default InstallationsView; 