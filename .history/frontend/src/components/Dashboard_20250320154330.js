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
  Link as MuiLink,
  CircularProgress
} from '@mui/material';
import { Link } from 'react-router-dom';
import InfoIcon from '@mui/icons-material/Info';
import FilterListIcon from '@mui/icons-material/FilterList';
import LanguageIcon from '@mui/icons-material/Language';
import BarChartIcon from '@mui/icons-material/BarChart';
import TableChartIcon from '@mui/icons-material/TableChart';
import MapIcon from '@mui/icons-material/Map';
import FlagIcon from '@mui/icons-material/Flag';
import PieChartIcon from '@mui/icons-material/PieChart';
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
import OpenLayersMap from './OpenLayersMap';
import useTranslation from '../hooks/useTranslation';
import { refineryData } from '../data/refineryData';
import { useRefineries } from '../contexts/RefineryContext';

// Obtenir la couleur correspondant au statut de l'installation
const getStatusColor = (status, shade = 'main') => {
  if (!status) return '#999999';
  
  const colors = {
    'Opérationnel': { main: '#00AA00', light: '#e6f7e6', dark: '#007700' },
    'En construction': { main: '#1976D2', light: '#e3f2fd', dark: '#0d47a1' },
    'Planifié': { main: '#FFA500', light: '#fff8e1', dark: '#e65100' },
    'En pause': { main: '#FF0000', light: '#ffebee', dark: '#c62828' },
    'Approuvé': { main: '#9C27B0', light: '#f3e5f5', dark: '#7b1fa2' },
    'En suspens': { main: '#FF9800', light: '#fff3e0', dark: '#e65100' }
  };
  
  return colors[status] ? colors[status][shade] : '#999999';
};

// Préparer les données pour les installations en format compatible avec la carte
const prepareMapData = (refineries) => {
  return refineries.map(refinery => ({
    id: refinery.id,
    name: refinery.name,
    location: refinery.location,
    latitude: refinery.coordinates[0],
    longitude: refinery.coordinates[1],
    production: refinery.production,
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

  // Afficher la table des raffineries
  const renderDataTable = () => {
    if (loading) {
      return <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}><CircularProgress /></Box>;
    }
    
    return (
      <TableContainer component={Paper} sx={{ maxHeight: 600 }}>
        <Table stickyHeader aria-label="tableau des installations" size="small">
          <TableHead>
            <TableRow>
              <TableCell>Nom</TableCell>
              <TableCell>Localisation</TableCell>
              <TableCell>Statut</TableCell>
              <TableCell>Production</TableCell>
              <TableCell>Technologie</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {refineries.map((row) => (
              <TableRow key={row.id} hover>
                <TableCell>
                  <Link 
                    to={`/fonderie/${row.id}`}
                    style={{ 
                      textDecoration: 'none', 
                      color: theme.palette.primary.main,
                      fontWeight: 'medium',
                      cursor: 'pointer'
                    }}
                  >
                    {row.name}
                  </Link>
                </TableCell>
                <TableCell>{row.location}</TableCell>
                <TableCell>
                  <Typography
                    component="span"
                    sx={{
                      px: 1,
                      py: 0.5,
                      borderRadius: '4px',
                      fontSize: '0.75rem',
                      fontWeight: 'medium',
                      backgroundColor: getStatusColor(row.status, 'light'),
                      color: getStatusColor(row.status, 'dark')
                    }}
                  >
                    {row.status || 'Inconnu'}
                  </Typography>
                </TableCell>
                <TableCell>{row.production || 'N/A'}</TableCell>
                <TableCell>{row.processing || 'N/A'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };

  // Rendu du Dashboard
  return (
    <Box sx={{ flexGrow: 1, p: { xs: 1, sm: 2 } }}>
      <Paper sx={paperStyle}>
        <Typography variant="h5" component="h1" gutterBottom color="primary">
          {t('dashboard_title')}
        </Typography>
        <Typography variant="body1">
          La carte ci-dessous présente <strong>{refineries.length} installations</strong> réparties entre le Canada et les États-Unis. Les marqueurs sont colorés selon leur statut : <span style={{color: '#00AA00'}}>opérationnels</span>, <span style={{color: '#0000FF'}}>en construction</span>, <span style={{color: '#FFA500'}}>planifiés</span> ou <span style={{color: '#FF0000'}}>en pause</span>. Cliquez sur un marqueur pour plus de détails sur l'installation ou explorez les analyses détaillées dans les onglets ci-dessous.
        </Typography>
      </Paper>

      <Paper sx={paperStyle}>
        <Box
          sx={{
            width: '100%',
            height: `${mapHeight}px`,
            transition: 'height 0.3s ease'
          }}>
          <OpenLayersMap plants={mapData} onResize={resizeMapHeight} />
        </Box>
      </Paper>

      <Paper sx={paperStyle}>
        <Box sx={{ width: '100%' }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs 
              value={activeTab} 
              onChange={handleTabChange}
              variant="scrollable"
              scrollButtons="auto"
              allowScrollButtonsMobile
              aria-label="onglets du tableau de bord"
            >
              <Tab icon={<TableChartIcon />} iconPosition="start" label="Tableau des installations" />
              <Tab icon={<PieChartIcon />} iconPosition="start" label="Répartition par statut" />
              <Tab icon={<BarChartIcon />} iconPosition="start" label="Répartition par pays" />
            </Tabs>
          </Box>

          {/* Contenu des onglets */}
          <Box sx={{ p: 3 }}>
            {activeTab === 0 && renderDataTable()}
            
            {activeTab === 1 && (
              <Box>
                <Typography variant="h6" gutterBottom>Répartition des installations par statut</Typography>
                <ResponsiveContainer width="100%" height={400}>
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      labelLine={true}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={150}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={getStatusColor(entry.name)} />
                      ))}
                    </Pie>
                    <RechartsTooltip formatter={(value) => [`${value} installations`]} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
            )}
            
            {activeTab === 2 && (
              <Box>
                <Typography variant="h6" gutterBottom>Répartition des installations par pays</Typography>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart
                    data={countryData}
                    margin={{
                      top: 20,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <RechartsTooltip />
                    <Bar dataKey="value" name="Nombre d'installations">
                      {countryData.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={index % 2 === 0 ? theme.palette.primary.main : theme.palette.secondary.main} 
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            )}
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

export default Dashboard; 