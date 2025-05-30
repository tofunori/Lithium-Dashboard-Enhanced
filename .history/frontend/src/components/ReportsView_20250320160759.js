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
  Slider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
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
import ExpandLessIcon from '@mui/icons-material/ExpandMore';
import ExpandMoreIcon from '@mui/icons-material/ExpandLess';
import DeleteIcon from '@mui/icons-material/Delete';
import ViewListIcon from '@mui/icons-material/ViewList';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import ViewHeadlineIcon from '@mui/icons-material/ViewHeadline';
import ViewCompactIcon from '@mui/icons-material/ViewCompact';
import LaunchIcon from '@mui/icons-material/Launch';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import ZoomOutIcon from '@mui/icons-material/ZoomOut';
import AddIcon from '@mui/icons-material/Add';
import LinkIcon from '@mui/icons-material/Link';
import WebIcon from '@mui/icons-material/Web';
import { useDocuments } from '../contexts/DocumentsContext';
import { useAuth } from '../contexts/AuthContext';
import useTranslation from '../hooks/useTranslation';
import LoadingIndicator from './LoadingIndicator';

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
  const { isAuthenticated } = useAuth();
  
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
        
        {isAuthenticated && (
          <Button 
            variant={confirmDelete ? "contained" : "outlined"}
            color={confirmDelete ? "error" : "error"}
            size="small"
            onClick={handleDelete}
            sx={{ minWidth: '100px' }}
          >
            {confirmDelete ? "Confirmer" : "Supprimer"}
          </Button>
        )}
      </CardActions>
    </Card>
  );
};

// Composant principal
const ReportsView = ({ foundryId }) => {
  const { t } = useTranslation();
  const { reportsData, removeDocument, clearAllReports, isLoading, loadPublicDocuments, loadError, addDocument } = useDocuments();
  const { isAuthenticated } = useAuth();
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

  // État pour les dialogues d'ajout de document
  const [openLinkDialog, setOpenLinkDialog] = useState(false);
  const [openWebToPdfDialog, setOpenWebToPdfDialog] = useState(false);
  const [processingWebToPdf, setProcessingWebToPdf] = useState(false);
  
  // Formulaire pour le lien externe
  const [externalLinkForm, setExternalLinkForm] = useState({
    title: '',
    url: '',
    description: '',
    author: '',
    type: 'report',
    format: 'external_link'
  });
  
  // Formulaire pour la conversion web vers PDF
  const [webToPdfForm, setWebToPdfForm] = useState({
    title: '',
    url: '',
    description: '',
    author: 'Capture Web'
  });

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

  // Modifier l'effet pour éviter les rechargements excessifs
  // Modifier l'effet qui recharge les documents pour limiter les tentatives
  useEffect(() => {
    // Ne recharger que si :
    // - Nous avons explicitement une liste de rapports vide (pas juste indéfinie)
    // - Nous ne sommes pas en train de charger
    // - Aucune erreur n'est en cours
    if (reports.length === 0 && !isLoading && !loadError) {
      console.log("Pas de documents trouvés, chargement initial unique");
      // Marquer un effet de bord dans une variable locale pour éviter les rechargements
      const timeout = setTimeout(() => {
        loadPublicDocuments(false);
      }, 100);
      return () => clearTimeout(timeout);
    }
  }, [loadPublicDocuments]);

  // Mettre à jour reports uniquement lorsque reportsData change réellement
  useEffect(() => {
    console.log("ID de la fonderie:", foundryId);
    
    // Attendre que les données soient chargées
    if (isLoading) {
      return;
    }
    
    let newReports = [];
    
    // Ajouter les rapports spécifiques à la fonderie si un ID est fourni
    if (foundryId && reportsData.foundry_reports[foundryId]) {
      console.log("Rapports spécifiques trouvés:", reportsData.foundry_reports[foundryId]);
      newReports = [...reportsData.foundry_reports[foundryId]];
    } else if (!foundryId) {
      // Si aucun ID n'est fourni (page principale des rapports)
      // Sur l'onglet 0, afficher tous les rapports (généraux + tous les rapports spécifiques)
      if (tabValue === 0) {
        newReports = [...reportsData.general_reports];
        // Ajouter tous les rapports spécifiques
        Object.values(reportsData.foundry_reports).forEach(foundryReports => {
          newReports = [...newReports, ...foundryReports];
        });
      } 
      // Sur l'onglet 1, afficher uniquement les rapports généraux
      else if (tabValue === 1) {
        newReports = [...reportsData.general_reports];
      }
    } else {
      console.log("Aucun rapport spécifique trouvé pour l'ID:", foundryId);
    }
    
    // Si on affiche les rapports d'une fonderie spécifique et qu'on est sur l'onglet "Tous"
    if (foundryId && tabValue === 0) {
      console.log("Ajout des rapports généraux:", reportsData.general_reports);
      newReports = [...newReports, ...reportsData.general_reports];
    }
    
    console.log("Rapports finaux à afficher:", newReports.length);
    // Utiliser un JSON.stringify pour comparer si les données ont réellement changé
    // avant de mettre à jour l'état pour éviter les rendus inutiles
    const currentReportsJson = JSON.stringify(reports.map(r => r.id));
    const newReportsJson = JSON.stringify(newReports.map(r => r.id));
    
    if (currentReportsJson !== newReportsJson) {
      setReports(newReports);
    }
  }, [foundryId, tabValue, reportsData, isLoading]);

  // Afficher un message de débogage des documents
  useEffect(() => {
    console.log("Documents disponibles dans reports:", reports);
    if (reports.length > 0) {
      console.log("Structure du premier document:", reports[0]);
    }
  }, [reports]);

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
    // Ajouter un log pour déboguer
    if (!report.date) {
      console.warn("Document sans date trouvé:", report);
      return false;
    }
    
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

  // Gérer la soumission du formulaire de lien externe
  const handleSubmitExternalLink = async () => {
    if (!externalLinkForm.title || !externalLinkForm.url) {
      setSnackbar({
        open: true,
        message: 'Veuillez remplir les champs obligatoires (titre et URL)',
        severity: 'error'
      });
      return;
    }
    
    try {
      // Vérifier que l'URL est valide
      new URL(externalLinkForm.url);
      
      // Créer un nouveau document sans fichier réel
      const newDocument = {
        id: Date.now().toString(),
        title: externalLinkForm.title,
        author: externalLinkForm.author || 'Source externe',
        type: externalLinkForm.type,
        format: externalLinkForm.format,
        description: externalLinkForm.description,
        foundryId: foundryId || null,
        url: externalLinkForm.url,
        date: new Date().toISOString()
      };
      
      await addDocument(newDocument);
      
      setSnackbar({
        open: true,
        message: 'Lien externe ajouté avec succès',
        severity: 'success'
      });
      
      // Réinitialiser le formulaire et fermer le dialogue
      setExternalLinkForm({
        title: '',
        url: '',
        description: '',
        author: '',
        type: 'report',
        format: 'external_link'
      });
      setOpenLinkDialog(false);
      
    } catch (error) {
      console.error('Erreur lors de l\'ajout du lien externe:', error);
      setSnackbar({
        open: true,
        message: `Erreur: ${error.message || 'URL invalide'}`,
        severity: 'error'
      });
    }
  };
  
  // Fonction pour extraire le titre et la description d'une page web
  const extractWebPageInfo = async (url) => {
    try {
      setSnackbar({
        open: true,
        message: 'Extraction des informations de la page...',
        severity: 'info'
      });
      
      // Utiliser un service proxy pour éviter les problèmes CORS
      const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`;
      
      const response = await fetch(proxyUrl);
      const data = await response.json();
      
      if (data.contents) {
        // Extraire les informations à partir du HTML
        const parser = new DOMParser();
        const doc = parser.parseFromString(data.contents, 'text/html');
        
        // Extraire le titre
        const title = doc.querySelector('title')?.textContent || '';
        
        // Extraire la description (meta description ou premier paragraphe)
        let description = doc.querySelector('meta[name="description"]')?.getAttribute('content') || '';
        
        // Si pas de meta description, prendre le premier paragraphe substantiel
        if (!description || description.length < 10) {
          const paragraphs = Array.from(doc.querySelectorAll('p'));
          for (const p of paragraphs) {
            const text = p.textContent.trim();
            if (text.length > 50) {
              description = text.substring(0, 250) + (text.length > 250 ? '...' : '');
              break;
            }
          }
        }
        
        // Mettre à jour le formulaire avec les informations extraites
        if (title || description) {
          setWebToPdfForm(prev => ({
            ...prev,
            title: title.trim() || prev.title,
            description: description || prev.description
          }));
          
          setSnackbar({
            open: true,
            message: 'Informations extraites avec succès',
            severity: 'success'
          });
          
          return { title, description };
        }
      }
      
      throw new Error('Impossible d\'extraire les informations');
    } catch (error) {
      console.error('Erreur lors de l\'extraction des informations:', error);
      setSnackbar({
        open: true,
        message: 'Impossible d\'extraire automatiquement les informations',
        severity: 'warning'
      });
      return null;
    }
  };

  // Gérer la soumission du formulaire de conversion web vers PDF
  const handleSubmitWebToPdf = async () => {
    if (!webToPdfForm.url || !webToPdfForm.title) {
      setSnackbar({
        open: true,
        message: 'Veuillez remplir les champs obligatoires (titre et URL)',
        severity: 'error'
      });
      return;
    }
    
    try {
      // Vérifier que l'URL est valide
      new URL(webToPdfForm.url);
      
      setProcessingWebToPdf(true);
      
      // TODO: Implémenter la conversion réelle via le backend
      // Cette fonctionnalité nécessite un endpoint API côté serveur qui:
      // 1. Prend l'URL comme entrée
      // 2. Utilise puppeteer ou similaire pour capturer la page
      // 3. Convertit en PDF
      // 4. Stocke le PDF et renvoie l'URL
      
      // Simulation pour le moment (à remplacer par appel API réel)
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Créer un nouveau document fictif pour la démonstration
      const newDocument = {
        id: Date.now().toString(),
        title: webToPdfForm.title,
        author: webToPdfForm.author || 'Capture Web',
        type: 'web_capture',
        format: 'pdf',
        description: webToPdfForm.description || `Capture de ${webToPdfForm.url}`,
        foundryId: foundryId || null,
        url: webToPdfForm.url, // Sera remplacé par l'URL du PDF généré
        date: new Date().toISOString()
      };
      
      await addDocument(newDocument);
      
      setSnackbar({
        open: true,
        message: 'Conversion web vers PDF initiée. Le document sera disponible sous peu.',
        severity: 'success'
      });
      
      // Réinitialiser le formulaire et fermer le dialogue
      setWebToPdfForm({
        title: '',
        url: '',
        description: '',
        author: 'Capture Web'
      });
      setOpenWebToPdfDialog(false);
      
    } catch (error) {
      console.error('Erreur lors de la conversion web vers PDF:', error);
      setSnackbar({
        open: true,
        message: `Erreur: ${error.message || 'Impossible de convertir cette page web'}`,
        severity: 'error'
      });
    } finally {
      setProcessingWebToPdf(false);
    }
  };

  return (
    <Box>
      {/* En-tête avec bouton d'ajout uniquement pour les utilisateurs authentifiés */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" component="h1">
          {foundryId ? `Documents de la fonderie #${foundryId}` : 'Rapports et documents'}
        </Typography>
        
        {isAuthenticated && (
          <Box>
            <Button 
              variant="outlined" 
              color="primary" 
              startIcon={<LinkIcon />} 
              onClick={() => setOpenLinkDialog(true)}
              sx={{ mr: 1 }}
            >
              Ajouter un lien
            </Button>
            <Button 
              variant="outlined" 
              color="primary" 
              startIcon={<WebIcon />} 
              onClick={() => setOpenWebToPdfDialog(true)}
              sx={{ mr: 1 }}
            >
              Web vers PDF
            </Button>
          </Box>
        )}
      </Box>
      
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
      
      {/* Affichage persistant des onglets et filtres, même pendant le chargement */}
      <>
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
      </>
      
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
      
      {/* Contrôles d'affichage avec indication seulement si données disponibles */}
      {(!isLoading || filteredReports.length > 0) && (
        <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography variant="body2" color="text.secondary" sx={{ mr: 2 }}>
              {filteredReports.length} document{filteredReports.length > 1 ? 's' : ''} trouvé{filteredReports.length > 1 ? 's' : ''}
            </Typography>
            
            {isAuthenticated && (
              <Button 
                variant="outlined" 
                color="error" 
                size="small"
                onClick={() => {
                  if (window.confirm('Êtes-vous sûr de vouloir supprimer tous les documents par défaut? Cette action est irréversible.')) {
                    clearAllReports();
                  }
                }}
                sx={{ mr: 2 }}
              >
                Supprimer tous les documents par défaut
              </Button>
            )}
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {/* Contrôles d'affichage */}
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
      )}
      
      {/* Indicateur de chargement */}
      {isLoading && !loadError && (
        <Box sx={{ 
          p: 4, 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center',
          minHeight: '200px'
        }}>
          <LoadingIndicator message="Chargement des documents..." />
        </Box>
      )}
      
      {/* Affichage des erreurs */}
      {loadError && (
        <Box sx={{ 
          p: 3, 
          textAlign: 'center', 
          border: '1px solid rgba(255,0,0,0.1)',
          borderRadius: '8px',
          backgroundColor: 'rgba(255,0,0,0.05)',
          mb: 3
        }}>
          <Alert severity="error" sx={{ mb: 2 }}>
            Erreur de chargement des documents: {loadError}
          </Alert>
          <Button 
            variant="contained" 
            onClick={() => loadPublicDocuments(true)}
            sx={{ mt: 2 }}
          >
            Réessayer
          </Button>
        </Box>
      )}
      
      {/* Affichage du contenu seulement si données disponibles et pas d'erreur */}
      {!isLoading && !loadError && (
        <>
          {filteredReports.length === 0 ? (
            <Paper sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="h6" color="text.secondary">
                Aucun document ne correspond à vos critères de recherche.
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Essayez de modifier vos filtres ou d'élargir votre recherche.
              </Typography>
            </Paper>
          ) : (
            <>
              {viewMode === 'grid' && (
                <Grid container spacing={3}>
                  {filteredReports.map(report => (
                    <Grid 
                      item 
                      xs={12} 
                      sm={cardSize <= 2 ? 6 : 12} 
                      md={cardSize === 1 ? 3 : (cardSize === 2 ? 4 : (cardSize === 3 ? 6 : 12))} 
                      key={report.id || `${report.title}-${Math.random()}`}
                    >
                      <ReportCard report={report} onDelete={handleDeleteDocument} />
                    </Grid>
                  ))}
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
            </>
          )}
        </>
      )}
      
      {/* Dialogue pour ajouter un lien externe */}
      <Dialog open={openLinkDialog} onClose={() => setOpenLinkDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Ajouter un lien externe</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Ajoutez un lien vers un document ou une ressource externe qui sera affiché dans la liste des rapports.
          </Typography>
          
          <TextField
            fullWidth
            margin="normal"
            label="Titre du document"
            value={externalLinkForm.title}
            onChange={e => setExternalLinkForm({...externalLinkForm, title: e.target.value})}
            required
          />
          
          <TextField
            fullWidth
            margin="normal"
            label="URL"
            value={externalLinkForm.url}
            onChange={(e) => {
              const newUrl = e.target.value;
              setExternalLinkForm({...externalLinkForm, url: newUrl});
              
              // Si l'URL semble valide et qu'on vient de la coller, essayer d'extraire les informations
              if (newUrl && newUrl.startsWith('http') && 
                  (newUrl.length - externalLinkForm.url.length > 10 || externalLinkForm.url === '')) {
                // Extraire les informations et mettre à jour le formulaire
                extractWebPageInfo(newUrl).then(info => {
                  if (info && info.title) {
                    setExternalLinkForm(prev => ({
                      ...prev,
                      title: info.title || prev.title,
                      description: info.description || prev.description
                    }));
                  }
                });
              }
            }}
            required
            placeholder="https://example.com/document.pdf"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <LinkIcon />
                </InputAdornment>
              ),
            }}
          />
          
          <TextField
            fullWidth
            margin="normal"
            label="Description"
            value={externalLinkForm.description}
            onChange={e => setExternalLinkForm({...externalLinkForm, description: e.target.value})}
            multiline
            rows={2}
          />
          
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Auteur / Source"
                value={externalLinkForm.author}
                onChange={e => setExternalLinkForm({...externalLinkForm, author: e.target.value})}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Type de document</InputLabel>
                <Select
                  value={externalLinkForm.type}
                  onChange={e => setExternalLinkForm({...externalLinkForm, type: e.target.value})}
                  label="Type de document"
                >
                  <MenuItem value="report">Rapport</MenuItem>
                  <MenuItem value="article">Article</MenuItem>
                  <MenuItem value="study">Étude</MenuItem>
                  <MenuItem value="presentation">Présentation</MenuItem>
                  <MenuItem value="research">Recherche</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenLinkDialog(false)}>Annuler</Button>
          <Button 
            onClick={handleSubmitExternalLink} 
            variant="contained" 
            color="primary"
          >
            Ajouter
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Dialogue pour convertir une page web en PDF */}
      <Dialog 
        open={openWebToPdfDialog} 
        onClose={() => setOpenWebToPdfDialog(false)} 
        maxWidth="sm" 
        fullWidth
      >
        <DialogTitle>Convertir une page web en PDF</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Entrez l'URL d'une page web pour la convertir en PDF et l'ajouter à la bibliothèque de documents.
          </Typography>
          
          <TextField
            fullWidth
            margin="normal"
            label="Titre du document"
            value={webToPdfForm.title}
            onChange={e => setWebToPdfForm({...webToPdfForm, title: e.target.value})}
            required
          />
          
          <TextField
            fullWidth
            margin="normal"
            label="URL de la page web"
            value={webToPdfForm.url}
            onChange={(e) => {
              const newUrl = e.target.value;
              setWebToPdfForm({...webToPdfForm, url: newUrl});
              
              // Si l'URL semble valide et qu'on vient de la coller, essayer d'extraire les informations
              if (newUrl && newUrl.startsWith('http') && 
                  (newUrl.length - webToPdfForm.url.length > 10 || webToPdfForm.url === '')) {
                extractWebPageInfo(newUrl);
              }
            }}
            required
            placeholder="https://example.com/page"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <WebIcon />
                </InputAdornment>
              ),
            }}
          />
          
          <TextField
            fullWidth
            margin="normal"
            label="Description"
            value={webToPdfForm.description}
            onChange={e => setWebToPdfForm({...webToPdfForm, description: e.target.value})}
            multiline
            rows={2}
            placeholder="Description optionnelle du contenu de cette page"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenWebToPdfDialog(false)}>Annuler</Button>
          <Button 
            onClick={handleSubmitWebToPdf} 
            variant="contained" 
            color="primary"
            disabled={processingWebToPdf}
          >
            {processingWebToPdf ? 'Conversion en cours...' : 'Convertir et ajouter'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ReportsView; 