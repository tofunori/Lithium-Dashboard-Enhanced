import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Grid, 
  Paper, 
  Typography, 
  Box, 
  useTheme, 
  Tabs, 
  Tab, 
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Tooltip,
  Link as MuiLink
} from '@mui/material';
import { Link } from 'react-router-dom';
import InfoIcon from '@mui/icons-material/Info';
import FilterListIcon from '@mui/icons-material/FilterList';
import LanguageIcon from '@mui/icons-material/Language';
import BarChartIcon from '@mui/icons-material/BarChart';
import TableChartIcon from '@mui/icons-material/TableChart';
import MapIcon from '@mui/icons-material/Map';
import FlagIcon from '@mui/icons-material/Flag';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import MapView from './MapView';
import useTranslation from '../hooks/useTranslation';
import { refineryData } from '../data/refineryData';
import { useRefineries } from '../contexts/RefineryContext';

// Préparer les données pour les installations en format compatible avec la carte
const prepareMapData = (refineries) => {
  return refineries.map(refinery => ({
    id: refinery.id,
    name: refinery.name,
    location: refinery.location,
    latitude: refinery.coordinates[0],
    longitude: refinery.coordinates[1],
    capacity: refinery.production,
    website: refinery.website,
    // Convertir l'état en propriétés pour le composant MapView
    operational: refinery.status === 'Opérationnel',
    maintenance: refinery.status === 'En suspens',
    offline: refinery.status === 'En pause',
    planning: refinery.status === 'Planifié' || refinery.status === 'En construction' || refinery.status === 'Approuvé',
    // Ajouter des propriétés supplémentaires pour les popups
    status: refinery.status,
    country: refinery.country,
    processing: refinery.processing,
    notes: refinery.notes
  }));
};

// Préparer les données pour le graphique de statut
const prepareStatusChartData = (refineries) => {
  const statusCount = {};
  
  refineries.forEach(refinery => {
    if (statusCount[refinery.status]) {
      statusCount[refinery.status]++;
    } else {
      statusCount[refinery.status] = 1;
    }
  });
  
  return Object.keys(statusCount).map(status => ({
    name: status,
    value: statusCount[status],
    color: refineryData.status_colors[status] || '#999999'
  }));
};

// Préparer les données pour le graphique par pays
const prepareCountryChartData = (refineries) => {
  const countryCount = {};
  
  refineries.forEach(refinery => {
    if (countryCount[refinery.country]) {
      countryCount[refinery.country]++;
    } else {
      countryCount[refinery.country] = 1;
    }
  });
  
  return Object.keys(countryCount).map((country, index) => ({
    name: country,
    value: countryCount[country],
    color: refineryData.chart_colors[index % refineryData.chart_colors.length]
  }));
};

const Dashboard = () => {
  const { t } = useTranslation();
  const { refineries, loading } = useRefineries();
  const [activeTab, setActiveTab] = useState(0);
  const [chartHeight, setChartHeight] = useState(350);
  const [mapHeight, setMapHeight] = useState(800);
  const [mapData, setMapData] = useState([]);
  const [statusChartData, setStatusChartData] = useState([]);
  const [countryChartData, setCountryChartData] = useState([]);
  const theme = useTheme();

  const paperStyle = {
    borderRadius: '12px', 
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
    overflow: 'hidden',
    height: '100%',
    backgroundColor: theme.palette.background.paper
  };

  // Préparer les données au chargement
  useEffect(() => {
    const plants = prepareMapData(refineries);
    setMapData(plants);
    setStatusChartData(prepareStatusChartData(refineries));
    setCountryChartData(prepareCountryChartData(refineries));
  }, [refineries]);

  // Gérer le changement d'onglet
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };
  
  // Adapter la hauteur des charts en fonction de la taille de l'écran
  const resizeChartHeight = (newHeight) => {
    setChartHeight(newHeight);
  };
  
  // Adapter la hauteur de la carte en fonction de la taille de l'écran
  const resizeMapHeight = (newHeight) => {
    setMapHeight(newHeight);
  };

  // Formater les données pour les graphiques de répartition
  const formatPlantStatusData = () => {
    // Si les refineries ne sont pas chargées, retourner un tableau vide
    if (loading || !refineries) return [];
    
    // Compter le nombre d'installations par statut
    const statusCounts = {};
    
    refineries.forEach(plant => {
      const status = plant.status || 'Inconnu';
      statusCounts[status] = (statusCounts[status] || 0) + 1;
    });
    
    // Convertir en tableau pour Recharts
    return Object.keys(statusCounts).map(status => ({
      name: status,
      value: statusCounts[status]
    }));
  };
  
  const formatPlantCountryData = () => {
    // Si les refineries ne sont pas chargées, retourner un tableau vide
    if (loading || !refineries) return [];
    
    // Compter le nombre d'installations par pays
    const countryCounts = {};
    
    refineries.forEach(plant => {
      const country = plant.country || 'Inconnu';
      countryCounts[country] = (countryCounts[country] || 0) + 1;
    });
    
    // Convertir en tableau pour Recharts
    return Object.keys(countryCounts).map(country => ({
      name: country,
      value: countryCounts[country]
    }));
  };
  
  // Données pour les graphiques
  const statusData = formatPlantStatusData();
  const countryData = formatPlantCountryData();

  // Obtenir la couleur de statut pour l'affichage des puces
  const getStatusColor = (status) => {
    return refineryData.status_colors[status] || "#999999";
  };

  // Rendre le tableau de données
  const renderDataTable = () => {
    return (
      <TableContainer component={Paper} sx={{ maxHeight: 600, boxShadow: 'none' }}>
        <Table stickyHeader aria-label="tableau des installations" size="small">
          <TableHead>
            <TableRow>
              <TableCell>Nom</TableCell>
              <TableCell>Emplacement</TableCell>
              <TableCell>Statut</TableCell>
              <TableCell>Production</TableCell>
              <TableCell>Procédé</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {refineries.map((row) => (
              <TableRow key={row.id} hover>
                <TableCell>{row.name}</TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <FlagIcon sx={{ fontSize: 16, mr: 0.75, color: 'text.secondary', opacity: 0.7 }} />
                    <Typography variant="body2">{row.location}</Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Chip 
                    label={row.status} 
                    size="small" 
                    sx={{ 
                      bgcolor: `${getStatusColor(row.status)}20`, 
                      color: getStatusColor(row.status),
                      fontWeight: 500,
                      fontSize: '0.75rem'
                    }} 
                  />
                </TableCell>
                <TableCell>{row.production}</TableCell>
                <TableCell>
                  <Typography variant="body2" noWrap sx={{ maxWidth: 200 }}>{row.processing}</Typography>
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex' }}>
                    <Tooltip title="Plus d'informations">
                      <IconButton 
                        size="small" 
                        color="primary" 
                        component={Link} 
                        to={`/fonderie/${row.id}`} 
                      >
                        <InfoIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Visiter le site web">
                      <IconButton size="small" color="primary" component="a" href={row.website} target="_blank">
                        <LanguageIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };

  // Rendre le graphique de statut
  const renderStatusChart = () => {
    return (
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={statusChartData}
            cx="50%"
            cy="50%"
            labelLine={true}
            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {statusChartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <RechartsTooltip formatter={(value, name) => [`${value} installations`, name]} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    );
  };

  // Rendre le graphique par pays
  const renderCountryChart = () => {
    return (
      <ResponsiveContainer width="100%" height={300}>
        <BarChart
          data={countryChartData}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <RechartsTooltip formatter={(value) => [`${value} installations`]} />
          <Legend />
          <Bar dataKey="value" name="Nombre d'installations">
            {countryChartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    );
  };

  return (
    <Box sx={{ py: 3, px: { xs: 2, md: 3 } }}>
      <Grid container spacing={3}>
        {/* Header avec titre et sous-titre */}
        <Grid item xs={12}>
          <Box sx={{ mb: 3 }}>
            <Typography variant="h4" component="h1" gutterBottom fontWeight="600" color="primary.dark">
              {t('dashboard_title')}
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              {t('subtitle')} • <Typography component="span" variant="subtitle1" color="primary">Version {refineryData.version}</Typography>
            </Typography>
          </Box>
        </Grid>
        
        {/* Texte d'introduction */}
        <Grid item xs={12}>
          <Paper 
            elevation={0} 
            sx={{ 
              p: 3, 
              borderRadius: '12px', 
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
              mb: 3
            }}
          >
            <Typography variant="body1" paragraph>
              Bienvenue sur le tableau de bord de surveillance des installations de recyclage de lithium en Amérique du Nord. Cette plateforme cartographie et centralise les informations sur les principales installations de traitement des batteries lithium-ion en fin de vie.
            </Typography>
            <Typography variant="body1">
              La carte ci-dessous présente <strong>{refineries.length} installations</strong> réparties entre le Canada et les États-Unis. Les marqueurs sont colorés selon leur statut : <span style={{color: '#00AA00'}}>opérationnels</span>, <span style={{color: '#0000FF'}}>en construction</span>, <span style={{color: '#FFA500'}}>planifiés</span> ou <span style={{color: '#FF0000'}}>en pause</span>. Cliquez sur un marqueur pour plus de détails sur l'installation ou explorez les analyses détaillées dans les onglets ci-dessous.
            </Typography>
          </Paper>
        </Grid>

        {/* Carte principale - occupe toute la largeur */}
        <Grid item xs={12}>
          <Paper 
            elevation={0} 
            sx={{ 
              ...paperStyle, 
              p: 0,
              overflow: 'hidden'
            }}
          >
            <Box sx={{ 
              height: `${mapHeight}px`,
              width: '100%',
              transition: 'height 0.3s ease'
            }}>
              <MapView plants={mapData} onResize={resizeMapHeight} />
            </Box>
          </Paper>
        </Grid>

        {/* Onglets pour alterner entre graphiques et tableau */}
        <Grid item xs={12}>
          <Paper elevation={0} sx={{ ...paperStyle, p: 0 }}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tabs 
                value={activeTab} 
                onChange={handleTabChange}
                variant="scrollable"
                scrollButtons="auto"
                sx={{ 
                  px: 2,
                  '& .MuiTab-root': {
                    minHeight: '56px',
                    textTransform: 'none',
                    fontWeight: 500
                  }
                }}
              >
                <Tab icon={<TableChartIcon />} iconPosition="start" label="Tableau des installations" />
                <Tab icon={<BarChartIcon />} iconPosition="start" label="Analyse par statut" />
                <Tab icon={<MapIcon />} iconPosition="start" label="Analyse par pays" />
              </Tabs>
            </Box>
            
            {/* Contenu des onglets */}
            <Box sx={{ p: 3 }}>
              {activeTab === 0 && renderDataTable()}
              
              {activeTab === 1 && (
                <Box>
                  <Typography variant="h6" gutterBottom>Répartition des installations par statut</Typography>
                  {renderStatusChart()}
                </Box>
              )}
              
              {activeTab === 2 && (
                <Box>
                  <Typography variant="h6" gutterBottom>Répartition des installations par pays</Typography>
                  {renderCountryChart()}
                </Box>
              )}
            </Box>
          </Paper>
        </Grid>

        {/* Footer avec informations de source */}
        <Grid item xs={12}>
          <Box sx={{ mt: 2, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              Données compilées par le Centre d'Innovation en Recyclage de Batteries • Dernière mise à jour: {refineryData.version}
            </Typography>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard; 