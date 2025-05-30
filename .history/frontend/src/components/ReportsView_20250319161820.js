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
  Tab
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
import { reportsData } from '../data/reportsData';
import useTranslation from '../hooks/useTranslation';

// Composant pour un rapport individuel
const ReportCard = ({ report }) => {
  const { t } = useTranslation();
  
  // Récupérer l'icône appropriée selon le format
  const getFormatIcon = (format) => {
    switch (format.toLowerCase()) {
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
    switch (type.toLowerCase()) {
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
      
      <CardActions sx={{ px: 2, pb: 2 }}>
        <Button 
          variant="outlined" 
          size="small"
          href={report.url}
          target="_blank"
          rel="noopener noreferrer"
          startIcon={getFormatIcon(report.format)}
          fullWidth
        >
          Consulter
        </Button>
      </CardActions>
    </Card>
  );
};

// Composant principal
const ReportsView = ({ foundryId }) => {
  const { t } = useTranslation();
  const [tabValue, setTabValue] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [reports, setReports] = useState([]);

  // Types de filtres
  const filterTypes = [
    { value: 'all', label: 'Tous' },
    { value: 'report', label: 'Rapports' },
    { value: 'article', label: 'Articles' },
    { value: 'study', label: 'Études' },
    { value: 'interview', label: 'Entrevues' },
    { value: 'case study', label: 'Études de cas' }
  ];

  // Obtenir les rapports
  useEffect(() => {
    let reports = [];
    
    // Ajouter les rapports spécifiques à la fonderie
    if (foundryId && reportsData.foundry_reports[foundryId]) {
      reports = [...reportsData.foundry_reports[foundryId]];
    }
    
    // Si on est sur l'onglet "Tous", ajouter les rapports généraux
    if (tabValue === 0) {
      reports = [...reports, ...reportsData.general_reports];
    }
    
    setReports(reports);
  }, [foundryId, tabValue]);

  // Filtrer les rapports
  const filteredReports = reports.filter(report => {
    // Filtre par type
    const matchesType = filterType === 'all' || report.type.toLowerCase() === filterType.toLowerCase();
    
    // Filtre par recherche
    const matchesSearch = searchQuery === '' || 
      report.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.author.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesType && matchesSearch;
  });

  // Gérer le changement d'onglet
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  return (
    <Box>
      {/* Onglets principaux */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange}
          textColor="primary"
          indicatorColor="primary"
        >
          <Tab label="Tous les documents" />
          <Tab label="Spécifiques à cette installation" />
        </Tabs>
      </Box>
      
      {/* Barre de recherche et filtres */}
      <Box sx={{ mb: 3, display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2 }}>
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
        
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {filterTypes.map(type => (
            <Chip
              key={type.value}
              label={type.label}
              onClick={() => setFilterType(type.value)}
              color={filterType === type.value ? 'primary' : 'default'}
              variant={filterType === type.value ? 'filled' : 'outlined'}
              sx={{ 
                fontWeight: filterType === type.value ? 600 : 400,
                '&:hover': { backgroundColor: filterType === type.value ? '' : 'rgba(0, 0, 0, 0.04)' }
              }}
            />
          ))}
        </Box>
      </Box>
      
      {/* Liste des rapports */}
      {filteredReports.length > 0 ? (
        <Grid container spacing={2}>
          {filteredReports.map((report, index) => (
            <Grid item xs={12} key={`${report.title}-${index}`}>
              <ReportCard report={report} />
            </Grid>
          ))}
        </Grid>
      ) : (
        <Box sx={{ py: 4, textAlign: 'center' }}>
          <Typography variant="body1" color="text.secondary">
            Aucun document ne correspond à votre recherche.
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default ReportsView; 