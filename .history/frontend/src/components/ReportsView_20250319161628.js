import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Grid, 
  Card, 
  CardMedia, 
  CardContent, 
  CardActions, 
  Button, 
  Chip, 
  Tabs, 
  Tab, 
  Divider,
  IconButton,
  TextField,
  InputAdornment,
  useTheme
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import VideocamIcon from '@mui/icons-material/Videocam';
import MicIcon from '@mui/icons-material/Mic';
import ArticleIcon from '@mui/icons-material/Article';
import ScienceIcon from '@mui/icons-material/Science';
import DescriptionIcon from '@mui/icons-material/Description';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import { reportsData } from '../data/reportsData';
import { useParams } from 'react-router-dom';
import useTranslation from '../hooks/useTranslation';

// Composant pour afficher une carte de rapport
const ReportCard = ({ report }) => {
  const theme = useTheme();
  
  // Fonction pour obtenir l'icône selon le format
  const getFormatIcon = (format) => {
    switch (format.toLowerCase()) {
      case 'pdf':
        return <PictureAsPdfIcon color="error" />;
      case 'video':
        return <VideocamIcon style={{ color: '#1976d2' }} />;
      case 'audio':
        return <MicIcon style={{ color: '#9c27b0' }} />;
      default:
        return <ArticleIcon color="primary" />;
    }
  };
  
  // Fonction pour obtenir l'icône selon le type
  const getTypeIcon = (type) => {
    switch (type.toLowerCase()) {
      case 'rapport':
        return <DescriptionIcon />;
      case 'article':
        return <MenuBookIcon />;
      case 'étude':
        return <ScienceIcon />;
      case 'entrevue':
        return <MicIcon />;
      default:
        return <ArticleIcon />;
    }
  };
  
  // Fonction pour obtenir la couleur du chip selon le type
  const getTypeColor = (type) => {
    switch (type.toLowerCase()) {
      case 'rapport':
        return 'primary';
      case 'article':
        return 'info';
      case 'étude':
        return 'success';
      case 'entrevue':
        return 'secondary';
      default:
        return 'default';
    }
  };

  return (
    <Card 
      elevation={1} 
      sx={{ 
        display: 'flex', 
        mb: 2, 
        borderRadius: '12px',
        overflow: 'hidden',
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          transform: 'translateY(-3px)',
          boxShadow: '0 8px 20px rgba(0,0,0,0.1)'
        }
      }}
    >
      <CardMedia
        component="img"
        sx={{ width: 100, objectFit: 'cover', display: { xs: 'none', sm: 'block' } }}
        image={report.thumbnail}
        alt={report.title}
      />
      <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
        <CardContent sx={{ flex: '1 0 auto', pb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <Chip 
              icon={getTypeIcon(report.type)}
              label={report.type.charAt(0).toUpperCase() + report.type.slice(1)} 
              size="small" 
              color={getTypeColor(report.type)}
              sx={{ mr: 1 }}
            />
            <Typography variant="caption" color="text.secondary">
              {new Date(report.date).toLocaleDateString('fr-FR', { year: 'numeric', month: 'short', day: 'numeric' })}
            </Typography>
            <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center' }}>
              {getFormatIcon(report.format)}
              <Typography variant="caption" color="text.secondary" sx={{ ml: 0.5, textTransform: 'uppercase' }}>
                {report.format}
              </Typography>
            </Box>
          </Box>
          
          <Typography variant="subtitle1" component="div" fontWeight="500">
            {report.title}
          </Typography>
          
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            Par {report.author}
          </Typography>
          
          <Typography variant="body2" color="text.secondary" sx={{ 
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}>
            {report.description}
          </Typography>
        </CardContent>
        
        <CardActions sx={{ px: 2, pb: 2, pt: 0 }}>
          <Button 
            size="small" 
            variant="outlined" 
            startIcon={getFormatIcon(report.format)}
            href={report.url}
            target="_blank"
          >
            Consulter
          </Button>
        </CardActions>
      </Box>
    </Card>
  );
};

// Composant principal pour la vue des rapports
const ReportsView = ({ foundryId }) => {
  const { t } = useTranslation();
  const [tabValue, setTabValue] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const { fonderieId } = useParams();
  
  // Utiliser l'ID de la fonderie passé en prop ou depuis l'URL
  const currentFoundryId = foundryId || fonderieId;
  
  // Obtenir les rapports pour cette fonderie et les rapports généraux
  const foundryReports = currentFoundryId ? reportsData[currentFoundryId] || [] : [];
  const generalReports = reportsData.general || [];
  
  // Filtrer les rapports selon l'onglet actif, la recherche et le type
  const getFilteredReports = () => {
    let reports = [];
    
    if (tabValue === 0) {
      // Tous les rapports (spécifiques à la fonderie + généraux)
      reports = [...foundryReports, ...generalReports];
    } else if (tabValue === 1) {
      // Uniquement les rapports spécifiques à la fonderie
      reports = [...foundryReports];
    } else {
      // Uniquement les rapports généraux
      reports = [...generalReports];
    }
    
    // Filtrer par recherche
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      reports = reports.filter(report => 
        report.title.toLowerCase().includes(query) || 
        report.description.toLowerCase().includes(query) ||
        report.author.toLowerCase().includes(query)
      );
    }
    
    // Filtrer par type
    if (filterType !== 'all') {
      reports = reports.filter(report => report.type.toLowerCase() === filterType.toLowerCase());
    }
    
    return reports;
  };
  
  const filteredReports = getFilteredReports();
  
  // Gérer les changements d'onglet
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  
  // Gérer la recherche
  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };
  
  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange} 
          aria-label="report tabs"
          sx={{
            '& .MuiTab-root': {
              textTransform: 'none',
              fontWeight: 500
            }
          }}
        >
          <Tab label="Tous les documents" />
          <Tab label="Documents spécifiques" />
          <Tab label="Documents généraux" />
        </Tabs>
      </Box>
      
      {/* Barre de recherche et filtres */}
      <Box sx={{ mb: 3, display: 'flex', flexWrap: 'wrap', gap: 2 }}>
        <TextField
          placeholder="Rechercher un document..."
          variant="outlined"
          size="small"
          value={searchQuery}
          onChange={handleSearchChange}
          sx={{ flexGrow: 1, minWidth: '200px' }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
        
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Chip 
            label="Tous" 
            onClick={() => setFilterType('all')}
            color={filterType === 'all' ? 'primary' : 'default'}
            variant={filterType === 'all' ? 'filled' : 'outlined'}
          />
          <Chip 
            icon={<DescriptionIcon />}
            label="Rapports" 
            onClick={() => setFilterType('rapport')}
            color={filterType === 'rapport' ? 'primary' : 'default'}
            variant={filterType === 'rapport' ? 'filled' : 'outlined'}
          />
          <Chip 
            icon={<MenuBookIcon />}
            label="Articles" 
            onClick={() => setFilterType('article')}
            color={filterType === 'article' ? 'primary' : 'default'}
            variant={filterType === 'article' ? 'filled' : 'outlined'}
          />
          <Chip 
            icon={<ScienceIcon />}
            label="Études" 
            onClick={() => setFilterType('étude')}
            color={filterType === 'étude' ? 'primary' : 'default'}
            variant={filterType === 'étude' ? 'filled' : 'outlined'}
          />
          <Chip 
            icon={<MicIcon />}
            label="Entrevues" 
            onClick={() => setFilterType('entrevue')}
            color={filterType === 'entrevue' ? 'primary' : 'default'}
            variant={filterType === 'entrevue' ? 'filled' : 'outlined'}
          />
        </Box>
      </Box>
      
      {/* Liste des rapports */}
      <Box>
        {filteredReports.length > 0 ? (
          filteredReports.map(report => (
            <ReportCard key={report.id} report={report} />
          ))
        ) : (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="subtitle1" color="text.secondary">
              Aucun document ne correspond à vos critères.
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default ReportsView; 