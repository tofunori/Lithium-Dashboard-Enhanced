import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  CardActions, 
  Button, 
  Chip, 
  Grid,
  TextField,
  InputAdornment,
  IconButton,
  Avatar,
  Divider,
  Stack,
  Tabs,
  Tab,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
  Collapse,
  Snackbar,
  Alert,
  ToggleButtonGroup,
  ToggleButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  Slider
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ArticleIcon from '@mui/icons-material/Article';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import VideocamIcon from '@mui/icons-material/Videocam';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import InsertChartIcon from '@mui/icons-material/InsertChart';
import NewspaperIcon from '@mui/icons-material/Newspaper';
import MicIcon from '@mui/icons-material/Mic';
import BookIcon from '@mui/icons-material/Book';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import DeleteIcon from '@mui/icons-material/Delete';
import ViewListIcon from '@mui/icons-material/ViewList';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import ViewHeadlineIcon from '@mui/icons-material/ViewHeadline';
import ViewCompactIcon from '@mui/icons-material/ViewCompact';
import LaunchIcon from '@mui/icons-material/Launch';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import ZoomOutIcon from '@mui/icons-material/ZoomOut';
import { useDocuments } from '../contexts/DocumentsContext';
import useTranslation from '../hooks/useTranslation';

// Récupérer l'icône appropriée selon le format
const getFormatIcon = (format) => {
  switch (format?.toLowerCase()) {
    case 'pdf':
      return <PictureAsPdfIcon />;
    case 'video':
      return <VideocamIcon />;
    case 'article':
      return <NewspaperIcon />;
    case 'infographic':
      return <InsertChartIcon />;
    case 'study':
      return <BookIcon />;
    case 'interview':
      return <MicIcon />;
    default:
      return <InsertDriveFileIcon />;
  }
};

// Récupérer la couleur de chip selon le type
const getTypeColor = (type) => {
  switch (type?.toLowerCase()) {
    case 'report':
      return 'primary';
    case 'interview':
      return 'secondary';
    case 'study':
      return 'success';
    case 'article':
      return 'info';
    case 'press release':
      return 'warning';
    case 'case study':
      return 'success';
    case 'research':
      return 'info';
    case 'analysis':
      return 'secondary';
    default:
      return 'default';
  }
};

// Composant pour un rapport individuel
const ReportCard = ({ report, onDelete }) => {
  const { t } = useTranslation();
  const [confirmDelete, setConfirmDelete] = useState(false);
  
  // Gérer la confirmation de suppression
  const handleDelete = () => {
    if (confirmDelete) {
      // Exécuter la suppression réelle
      onDelete(report.id);
      setConfirmDelete(false);
    } else {
      // Demander confirmation
      setConfirmDelete(true);
      
      // Réinitialiser automatiquement après 3 secondes
      setTimeout(() => {
        setConfirmDelete(false);
      }, 3000);
    }
  };

  return (
    <Card 
      sx={{ 
        mb: 2, 
        boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
        transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
        '&:hover': {
          boxShadow: '0 8px 20px rgba(0,0,0,0.1)',
          transform: 'translateY(-2px)'
        },
        borderRadius: '10px',
        overflow: 'hidden'
      }}
    >
      <CardContent>
        <Box sx={{ display: 'flex', mb: 2 }}>
          <Avatar 
            sx={{ 
              bgcolor: 'primary.light', 
              mr: 2,
              width: 48, 
              height: 48 
            }}
          >
            {getFormatIcon(report.format)}
          </Avatar>
          <Box>
            <Typography variant="h6" gutterBottom>
              {report.title}
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {new Date(report.date).toLocaleDateString()} • {report.author}
            </Typography>
            <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
              <Chip 
                size="small" 
                label={report.type} 
                color={getTypeColor(report.type)} 
                sx={{ fontWeight: 600 }}
              />
              <Chip 
                size="small" 
                label={report.format} 
                variant="outlined"
              />
            </Stack>
          </Box>
        </Box>
        
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {report.description}
        </Typography>
      </CardContent>
      
      <CardActions sx={{ px: 2, pb: 2, justifyContent: 'space-between' }}>
        <Button 
          variant="outlined" 
          size="small"
          href={report.url}
          target="_blank"
          rel="noopener noreferrer"
          startIcon={getFormatIcon(report.format)}
          sx={{ flexGrow: 1, mr: 1 }}
        >
          Consulter
        </Button>
        
        <Button 
          variant={confirmDelete ? "contained" : "outlined"}
          color={confirmDelete ? "error" : "error"}
          size="small"
          onClick={handleDelete}
          sx={{ minWidth: '100px' }}
        >
          {confirmDelete ? "Confirmer" : "Supprimer"}
        </Button>
      </CardActions>
    </Card>
  );
};

// Composant principal
const ReportsView = ({ foundryId }) => {
  const { t } = useTranslation();
  const { reportsData, removeDocument } = useDocuments();
  const [tabValue, setTabValue] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterFormat, setFilterFormat] = useState('all');
  const [sortOrder, setSortOrder] = useState('newest');
  const [dateFilter, setDateFilter] = useState('all');
  const [customDateRange, setCustomDateRange] = useState({
    start: '',
    end: ''
  });
  const [reports, setReports] = useState([]);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'info'
  });
  
  // Options de visualisation
  const [viewMode, setViewMode] = useState('grid');
  const [cardSize, setCardSize] = useState(2); // Taille par défaut (1-4)

  // Types de filtres
  const filterTypes = [
    { value: 'all', label: 'Tous' },
    { value: 'report', label: 'Rapports' },
    { value: 'article', label: 'Articles' },
    { value: 'study', label: 'Études' },
    { value: 'interview', label: 'Entrevues' },
    { value: 'case study', label: 'Études de cas' }
  ];

  // Formats de documents pour le filtre
  const formatFilters = [
    { value: 'all', label: 'Tous' },
    { value: 'pdf', label: 'PDF' },
    { value: 'video', label: 'Vidéo' },
    { value: 'article', label: 'Article Web' },
    { value: 'infographic', label: 'Infographie' }
  ];

  // Options de tri
  const sortOptions = [
    { value: 'newest', label: 'Plus récents' },
    { value: 'oldest', label: 'Plus anciens' },
    { value: 'title_asc', label: 'Titre (A-Z)' },
    { value: 'title_desc', label: 'Titre (Z-A)' }
  ];

  // Options de filtre par date
  const dateFilterOptions = [
    { value: 'all', label: 'Toutes les dates' },
    { value: 'today', label: 'Aujourd\'hui' },
    { value: 'last_week', label: 'Dernière semaine' },
    { value: 'last_month', label: 'Dernier mois' },
    { value: 'last_year', label: 'Dernière année' },
    { value: 'custom', label: 'Période personnalisée' }
  ];

  // Obtenir les rapports
  useEffect(() => {
    console.log("ID de la fonderie:", foundryId);
    console.log("Structure de reportsData:", reportsData);
    let reports = [];
    
    // Ajouter les rapports spécifiques à la fonderie si un ID est fourni
    if (foundryId && reportsData.foundry_reports[foundryId]) {
      console.log("Rapports spécifiques trouvés:", reportsData.foundry_reports[foundryId]);
      reports = [...reportsData.foundry_reports[foundryId]];
    } else if (!foundryId) {
      // Si aucun ID n'est fourni (page principale des rapports)
      // Sur l'onglet 0, afficher tous les rapports (généraux + tous les rapports spécifiques)
      if (tabValue === 0) {
        reports = [...reportsData.general_reports];
        // Ajouter tous les rapports spécifiques
        Object.values(reportsData.foundry_reports).forEach(foundryReports => {
          reports = [...reports, ...foundryReports];
        });
      } 
      // Sur l'onglet 1, afficher uniquement les rapports généraux
      else if (tabValue === 1) {
        reports = [...reportsData.general_reports];
      }
    } else {
      console.log("Aucun rapport spécifique trouvé pour l'ID:", foundryId);
    }
    
    // Si on affiche les rapports d'une fonderie spécifique et qu'on est sur l'onglet "Tous"
    if (foundryId && tabValue === 0) {
      console.log("Ajout des rapports généraux:", reportsData.general_reports);
      reports = [...reports, ...reportsData.general_reports];
    }
    
    console.log("Rapports finaux à afficher:", reports);
    setReports(reports);
  }, [foundryId, tabValue, reportsData]);

  // Fonction pour vérifier si une date est dans la plage de filtre
  const isDateInRange = (dateStr) => {
    const date = new Date(dateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const lastWeek = new Date(today);
    lastWeek.setDate(lastWeek.getDate() - 7);
    
    const lastMonth = new Date(today);
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    
    const lastYear = new Date(today);
    lastYear.setFullYear(lastYear.getFullYear() - 1);
    
    switch (dateFilter) {
      case 'today':
        return date >= today;
      case 'last_week':
        return date >= lastWeek;
      case 'last_month':
        return date >= lastMonth;
      case 'last_year':
        return date >= lastYear;
      case 'custom':
        const startDate = customDateRange.start ? new Date(customDateRange.start) : null;
        const endDate = customDateRange.end ? new Date(customDateRange.end) : null;
        
        if (startDate && endDate) {
          return date >= startDate && date <= endDate;
        } else if (startDate) {
          return date >= startDate;
        } else if (endDate) {
          return date <= endDate;
        }
        return true;
      default:
        return true;
    }
  };

  // Filtrer les rapports
  const filteredReports = reports.filter(report => {
    // Filtre par type
    const matchesType = filterType === 'all' || report.type.toLowerCase() === filterType.toLowerCase();
    
    // Filtre par format
    const matchesFormat = filterFormat === 'all' || report.format.toLowerCase() === filterFormat.toLowerCase();
    
    // Filtre par date
    const matchesDate = isDateInRange(report.date);
    
    // Filtre par recherche
    const matchesSearch = searchQuery === '' || 
      report.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.author.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesType && matchesFormat && matchesDate && matchesSearch;
  }).sort((a, b) => {
    // Tri par date ou par titre
    switch (sortOrder) {
      case 'newest':
        return new Date(b.date) - new Date(a.date);
      case 'oldest':
        return new Date(a.date) - new Date(b.date);
      case 'title_asc':
        return a.title.localeCompare(b.title);
      case 'title_desc':
        return b.title.localeCompare(a.title);
      default:
        return new Date(b.date) - new Date(a.date);
    }
  });

  // Gérer le changement d'onglet
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  
  // Gérer le changement de filtre par date
  const handleDateFilterChange = (event) => {
    setDateFilter(event.target.value);
    
    // Si l'utilisateur ne sélectionne pas "Période personnalisée", réinitialiser les dates personnalisées
    if (event.target.value !== 'custom') {
      setCustomDateRange({
        start: '',
        end: ''
      });
    }
  };
  
  // Gérer le changement de date personnalisée
  const handleCustomDateChange = (event) => {
    const { name, value } = event.target;
    setCustomDateRange(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Fonction pour gérer la suppression d'un document
  const handleDeleteDocument = async (documentId) => {
    try {
      // Trouver le document pour obtenir des détails supplémentaires
      let foundDocument = null;
      let documentFoundryId = null;
      
      // Chercher dans les rapports généraux
      reportsData.general_reports.forEach(doc => {
        if (doc.id === documentId) {
          foundDocument = doc;
          documentFoundryId = null;
        }
      });
      
      // Chercher dans les rapports de fonderie
      if (!foundDocument) {
        Object.entries(reportsData.foundry_reports).forEach(([fId, docs]) => {
          docs.forEach(doc => {
            if (doc.id === documentId) {
              foundDocument = doc;
              documentFoundryId = fId;
            }
          });
        });
      }
      
      if (!foundDocument) {
        throw new Error('Document non trouvé');
      }
      
      // Extraire le chemin Firebase si disponible
      let firebasePath = null;
      if (foundDocument.url && typeof foundDocument.url === 'string' && foundDocument.url.includes('firebasestorage.googleapis.com')) {
        // Essayer d'extraire le chemin
        const urlParts = foundDocument.url.split('?')[0].split('/o/');
        if (urlParts.length > 1) {
          firebasePath = decodeURIComponent(urlParts[1]);
        } else {
          console.warn('Impossible d\'extraire le chemin Firebase de:', foundDocument.url);
        }
      }
      
      // Supprimer le document
      await removeDocument(documentId, documentFoundryId, firebasePath);
      
      // Afficher un message de succès
      setSnackbar({
        open: true,
        message: 'Document supprimé avec succès',
        severity: 'success'
      });
      
    } catch (error) {
      console.error('Erreur lors de la suppression du document:', error);
      
      // Afficher un message d'erreur
      setSnackbar({
        open: true,
        message: `Erreur lors de la suppression: ${error.message}`,
        severity: 'error'
      });
    }
  };

  // Gérer la fermeture du snackbar
  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') return;
    setSnackbar({ ...snackbar, open: false });
  };

  // Gérer le changement de mode de visualisation
  const handleViewModeChange = (event, newViewMode) => {
    if (newViewMode !== null) {
      setViewMode(newViewMode);
    }
  };
  
  // Gérer le changement de taille des cartes
  const handleCardSizeChange = (event, newValue) => {
    setCardSize(newValue);
  };

  return (
    <Box>
      {/* Snackbar pour les notifications */}
      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={6000} 
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
      
      {/* Onglets principaux - adaptés selon la présence d'un ID de fonderie */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange}
          textColor="primary"
          indicatorColor="primary"
        >
          {foundryId ? (
            // Onglets pour une fonderie spécifique
            <>
              <Tab label="Tous les documents" />
              <Tab label="Spécifiques à cette installation" />
            </>
          ) : (
            // Onglets pour la page principale des rapports
            <>
              <Tab label="Tous les documents" />
              <Tab label="Documents généraux" />
            </>
          )}
        </Tabs>
      </Box>
      
      {/* Barre de recherche et filtres principaux */}
      <Box sx={{ mb: 2, display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2 }}>
        <TextField
          placeholder="Rechercher un document..."
          size="small"
          fullWidth
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{ flexGrow: 1 }}
        />
        
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Trier par</InputLabel>
          <Select
            value={sortOrder}
            label="Trier par"
            onChange={(e) => setSortOrder(e.target.value)}
          >
            {sortOptions.map(option => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        
        <Button 
          size="small" 
          variant="outlined" 
          onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
          endIcon={showAdvancedFilters ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        >
          Filtres avancés
        </Button>
      </Box>
      
      {/* Filtres avancés (visibles uniquement si showAdvancedFilters est vrai) */}
      <Collapse in={showAdvancedFilters}>
        <Paper 
          elevation={0} 
          sx={{ 
            p: 2, 
            mb: 3, 
            borderRadius: '8px', 
            backgroundColor: 'rgba(0, 0, 0, 0.02)'
          }}
        >
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Type de document</InputLabel>
                <Select
                  value={filterType}
                  label="Type de document"
                  onChange={(e) => setFilterType(e.target.value)}
                >
                  {filterTypes.map(type => (
                    <MenuItem key={type.value} value={type.value}>
                      {type.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Format</InputLabel>
                <Select
                  value={filterFormat}
                  label="Format"
                  onChange={(e) => setFilterFormat(e.target.value)}
                >
                  {formatFilters.map(format => (
                    <MenuItem key={format.value} value={format.value}>
                      {format.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Période</InputLabel>
                <Select
                  value={dateFilter}
                  label="Période"
                  onChange={handleDateFilterChange}
                >
                  {dateFilterOptions.map(option => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            {dateFilter === 'custom' && (
              <Grid item xs={12} sm={6} md={3}>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <TextField
                    size="small"
                    label="Du"
                    type="date"
                    name="start"
                    value={customDateRange.start}
                    onChange={handleCustomDateChange}
                    InputLabelProps={{ shrink: true }}
                  />
                  <TextField
                    size="small"
                    label="Au"
                    type="date"
                    name="end"
                    value={customDateRange.end}
                    onChange={handleCustomDateChange}
                    InputLabelProps={{ shrink: true }}
                  />
                </Box>
              </Grid>
            )}
            
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                <Button 
                  size="small" 
                  variant="outlined"
                  onClick={() => {
                    setFilterType('all');
                    setFilterFormat('all');
                    setDateFilter('all');
                    setCustomDateRange({ start: '', end: '' });
                    setSortOrder('newest');
                    setSearchQuery('');
                  }}
                >
                  Réinitialiser les filtres
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Paper>
      </Collapse>
      
      {/* Indication sur le nombre de résultats et contrôles d'affichage */}
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          {filteredReports.length} document{filteredReports.length > 1 ? 's' : ''} trouvé{filteredReports.length > 1 ? 's' : ''}
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {/* Contrôle de la taille d'affichage */}
          <Box sx={{ display: 'flex', alignItems: 'center', width: 180 }}>
            <ZoomOutIcon sx={{ color: 'text.secondary', mr: 1 }} />
            <Slider
              size="small"
              value={cardSize}
              min={1}
              max={4}
              step={1}
              onChange={handleCardSizeChange}
              aria-label="Taille d'affichage"
            />
            <ZoomInIcon sx={{ color: 'text.secondary', ml: 1 }} />
          </Box>
          
          {/* Sélecteur de mode d'affichage */}
          <ToggleButtonGroup
            value={viewMode}
            exclusive
            onChange={handleViewModeChange}
            aria-label="Mode d'affichage"
            size="small"
          >
            <ToggleButton value="list" aria-label="Liste simple">
              <ViewListIcon />
            </ToggleButton>
            <ToggleButton value="detail" aria-label="Liste détaillée">
              <ViewHeadlineIcon />
            </ToggleButton>
            <ToggleButton value="grid" aria-label="Grille">
              <ViewModuleIcon />
            </ToggleButton>
            <ToggleButton value="compact" aria-label="Tableau compact">
              <ViewCompactIcon />
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>
      </Box>
      
      {/* Affichage des documents selon le mode sélectionné */}
      {viewMode === 'grid' && (
        <Grid container spacing={3}>
          {filteredReports.length > 0 ? (
            filteredReports.map(report => (
              <Grid 
                item 
                xs={12} 
                sm={cardSize <= 2 ? 6 : 12} 
                md={cardSize === 1 ? 3 : (cardSize === 2 ? 4 : (cardSize === 3 ? 6 : 12))} 
                key={report.id || `${report.title}-${Math.random()}`}
              >
                <ReportCard report={report} onDelete={handleDeleteDocument} />
              </Grid>
            ))
          ) : (
            <Grid item xs={12}>
              <Paper sx={{ p: 3, textAlign: 'center' }}>
                <Typography variant="h6" color="text.secondary">
                  Aucun document ne correspond à vos critères de recherche.
                </Typography>
              </Paper>
            </Grid>
          )}
        </Grid>
      )}
      
      {viewMode === 'list' && (
        <List sx={{ bgcolor: 'background.paper', borderRadius: 1 }}>
          {filteredReports.length > 0 ? (
            filteredReports.map(report => (
              <ListItem
                key={report.id || `${report.title}-${Math.random()}`}
                divider
                secondaryAction={
                  <Box>
                    <IconButton
                      edge="end"
                      component="a"
                      href={report.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      color="primary"
                      sx={{ mr: 1 }}
                    >
                      <LaunchIcon />
                    </IconButton>
                    <IconButton
                      edge="end"
                      onClick={() => handleDeleteDocument(report.id)}
                      color="error"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                }
              >
                <ListItemAvatar>
                  <Avatar sx={{ bgcolor: 'primary.light' }}>
                    {getFormatIcon(report.format)}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={report.title}
                  secondary={`${new Date(report.date).toLocaleDateString()} • ${report.author}`}
                />
              </ListItem>
            ))
          ) : (
            <ListItem>
              <ListItemText
                primary={
                  <Typography variant="h6" color="text.secondary" align="center">
                    Aucun document ne correspond à vos critères de recherche.
                  </Typography>
                }
              />
            </ListItem>
          )}
        </List>
      )}
      
      {viewMode === 'detail' && (
        <List sx={{ bgcolor: 'background.paper', borderRadius: 1 }}>
          {filteredReports.length > 0 ? (
            filteredReports.map(report => (
              <Paper 
                key={report.id || `${report.title}-${Math.random()}`}
                sx={{ mb: 2, overflow: 'hidden' }}
                elevation={1}
              >
                <ListItem
                  sx={{ 
                    py: 2,
                    borderLeft: '4px solid',
                    borderColor: `${getTypeColor(report.type)}.main`
                  }}
                  secondaryAction={
                    <Box>
                      <Button 
                        variant="outlined" 
                        size="small"
                        href={report.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        startIcon={getFormatIcon(report.format)}
                        sx={{ mr: 1 }}
                      >
                        Consulter
                      </Button>
                      <Button 
                        variant="outlined" 
                        color="error"
                        size="small"
                        onClick={() => handleDeleteDocument(report.id)}
                        startIcon={<DeleteIcon />}
                      >
                        Supprimer
                      </Button>
                    </Box>
                  }
                >
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: 'primary.light', width: 50, height: 50, mr: 2 }}>
                      {getFormatIcon(report.format)}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    disableTypography
                    primary={
                      <Typography variant="h6" gutterBottom>
                        {report.title}
                      </Typography>
                    }
                    secondary={
                      <Box>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          {new Date(report.date).toLocaleDateString()} • {report.author}
                        </Typography>
                        <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
                          <Chip 
                            size="small" 
                            label={report.type} 
                            color={getTypeColor(report.type)} 
                            sx={{ fontWeight: 600 }}
                          />
                          <Chip 
                            size="small" 
                            label={report.format} 
                            variant="outlined"
                          />
                        </Stack>
                        <Typography variant="body2" color="text.secondary">
                          {report.description}
                        </Typography>
                      </Box>
                    }
                  />
                </ListItem>
              </Paper>
            ))
          ) : (
            <Paper sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="h6" color="text.secondary">
                Aucun document ne correspond à vos critères de recherche.
              </Typography>
            </Paper>
          )}
        </List>
      )}
      
      {viewMode === 'compact' && (
        <TableContainer component={Paper} sx={{ mb: 2 }}>
          <Table size={cardSize <= 2 ? "small" : "medium"} aria-label="Liste des documents">
            <TableHead>
              <TableRow>
                <TableCell>Format</TableCell>
                <TableCell>Titre</TableCell>
                <TableCell>Auteur</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Date</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredReports.length > 0 ? (
                filteredReports.map(report => (
                  <TableRow
                    key={report.id || `${report.title}-${Math.random()}`}
                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                  >
                    <TableCell>
                      <Avatar sx={{ width: 30, height: 30, bgcolor: 'primary.light' }}>
                        {getFormatIcon(report.format)}
                      </Avatar>
                    </TableCell>
                    <TableCell component="th" scope="row">
                      {report.title}
                    </TableCell>
                    <TableCell>{report.author}</TableCell>
                    <TableCell>
                      <Chip 
                        size="small" 
                        label={report.type} 
                        color={getTypeColor(report.type)} 
                      />
                    </TableCell>
                    <TableCell>{new Date(report.date).toLocaleDateString()}</TableCell>
                    <TableCell align="right">
                      <IconButton
                        size="small"
                        component="a"
                        href={report.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        color="primary"
                        sx={{ mr: 1 }}
                      >
                        <LaunchIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDeleteDocument(report.id)}
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    <Typography variant="body1" color="text.secondary">
                      Aucun document ne correspond à vos critères de recherche.
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};

export default ReportsView; 