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

// Données des installations de recyclage
const refineryData = {
  "version": "2025-03-19",
  "refineries": [
    {
      "id": 1,
      "name": "Li-Cycle",
      "location": "Kingston, Ontario, Canada",
      "country": "Canada",
      "coordinates": [44.2312, -76.4860],
      "status": "Opérationnel",
      "production": "10 000+ tonnes de masse noire par an",
      "processing": "Spoke & Hub Technologies - Procédé hydrométallurgique",
      "notes": "Produit de la masse noire à partir de batteries lithium-ion usagées, hub aux États-Unis en pause.",
      "website": "https://li-cycle.com/"
    },
    {
      "id": 2,
      "name": "Lithion Technologies",
      "location": "Saint-Bruno-de-Montarville, Québec, Canada",
      "country": "Canada",
      "coordinates": [45.5366, -73.3718],
      "status": "Opérationnel",
      "production": "10 000-20 000 tonnes de batteries par an",
      "processing": "Procédé hydrométallurgique en deux étapes",
      "notes": "Produit de la masse noire, usine d'hydrométallurgie pour matériaux avancés prévue pour 2026.",
      "website": "https://www.lithiontechnologies.com/"
    },
    {
      "id": 3,
      "name": "Li-Cycle",
      "location": "Gilbert, AZ, États-Unis",
      "country": "États-Unis",
      "coordinates": [33.3528, -111.7890],
      "status": "Opérationnel",
      "production": "N/A",
      "processing": "Spoke & Hub Technologies - Procédé hydrométallurgique 'Generation 3'",
      "notes": "Produit de la masse noire à partir de batteries EV complètes sans démontage.",
      "website": "https://li-cycle.com/"
    },
    {
      "id": 4,
      "name": "Li-Cycle",
      "location": "Tuscaloosa, AL, États-Unis",
      "country": "États-Unis",
      "coordinates": [33.2098, -87.5692],
      "status": "Opérationnel",
      "production": "N/A",
      "processing": "Spoke & Hub Technologies - Procédé hydrométallurgique 'Generation 3'",
      "notes": "Produit de la masse noire à partir de batteries EV complètes sans démontage.",
      "website": "https://li-cycle.com/"
    },
    {
      "id": 5,
      "name": "Cirba Solutions",
      "location": "Lancaster, OH, États-Unis",
      "country": "États-Unis",
      "coordinates": [39.7134, -82.5441],
      "status": "Opérationnel",
      "production": "N/A",
      "processing": "Procédé hydrométallurgique",
      "notes": "Produit de la masse noire à partir de batteries lithium-ion en fin de vie, envoyée pour traitement avancé.",
      "website": "https://www.cirbasolutions.com/"
    },
    {
      "id": 6,
      "name": "Cirba Solutions",
      "location": "Columbia, SC, États-Unis",
      "country": "États-Unis",
      "coordinates": [34.0007, -81.0348],
      "status": "Opérationnel",
      "production": "N/A",
      "processing": "Procédé hydrométallurgique",
      "notes": "Produit de la masse noire, partie d'un réseau de traitement plus large.",
      "website": "https://www.cirbasolutions.com/"
    },
    {
      "id": 7,
      "name": "Cirba Solutions",
      "location": "Trail, Colombie-Britannique, Canada",
      "country": "Canada",
      "coordinates": [49.0996, -117.7118],
      "status": "Opérationnel",
      "production": "N/A",
      "processing": "Hydrométallurgie",
      "notes": "Traite les batteries lithium-ion pour produire des sels de lithium et des 'cakes' de cobalt, récupérant jusqu'à 95 % des métaux critiques.",
      "website": "https://www.cirbasolutions.com/"
    },
    {
      "id": 8,
      "name": "Umicore",
      "location": "Loyalist, Ontario, Canada",
      "country": "Canada",
      "coordinates": [44.2333, -76.9667],
      "status": "En pause",
      "production": "Capacité prévue pour 1 million de VE par an",
      "processing": "Hydrométallurgie",
      "notes": "Production de pCAM et CAM prévue, construction en pause depuis novembre 2024.",
      "website": "https://www.umicore.ca/en/"
    },
    {
      "id": 9,
      "name": "Northvolt",
      "location": "Saint-Basile-le-Grand, Québec, Canada",
      "country": "Canada",
      "coordinates": [45.5333, -73.2833],
      "status": "En construction",
      "production": "60 GWh par an (prévu)",
      "processing": "Hydrométallurgie",
      "notes": "Prévu pour produire pCAM et CAM à partir de batteries recyclées, opérationnel fin 2026.",
      "website": "https://northvolt.com/"
    },
    {
      "id": 10,
      "name": "EVSX (filiale de St-Georges Eco-Mining)",
      "location": "Thorold, Ontario, Canada",
      "country": "Canada",
      "coordinates": [43.0867, -79.2060],
      "status": "En construction",
      "production": "N/A",
      "processing": "Hydrométallurgie",
      "notes": "Focus sur les batteries à haute teneur en nickel, pas encore opérationnelle.",
      "website": "https://stgeorgesecomining.com/evsx/"
    },
    {
      "id": 11,
      "name": "Electra Battery Materials",
      "location": "Temiskaming Shores, Ontario, Canada",
      "country": "Canada",
      "coordinates": [47.5066, -79.6653],
      "status": "Planifié",
      "production": "N/A",
      "processing": "Hydrométallurgie",
      "notes": "Focus sur matériaux à base de cobalt des batteries lithium-ion, pas encore en construction.",
      "website": "https://electrabmc.com/"
    },
    {
      "id": 12,
      "name": "Ascend Elements Apex 1",
      "location": "Hopkinsville, KY, États-Unis",
      "country": "États-Unis",
      "coordinates": [36.7887, -87.3857],
      "status": "En construction",
      "production": "750 000 VE par an (prévu)",
      "processing": "Hydro-to-Cathode™",
      "notes": "Produit pCAM et CAM à partir de batteries recyclées, démarrage prévu fin 2025.",
      "website": "https://ascendelements.com/"
    },
    {
      "id": 13,
      "name": "Ascend Elements Base 1",
      "location": "Covington, GA, États-Unis",
      "country": "États-Unis",
      "coordinates": [33.5968, -83.8602],
      "status": "Opérationnel",
      "production": "N/A",
      "processing": "Hydro-to-Cathode™",
      "notes": "Produit pCAM à partir de batteries recyclées, usine pilote.",
      "website": "https://ascendelements.com/"
    },
    {
      "id": 14,
      "name": "Green Li-ion GLMC 1",
      "location": "Atoka, OK, États-Unis",
      "country": "États-Unis",
      "coordinates": [34.4066, -96.1039],
      "status": "Opérationnel",
      "production": "600-1 100 tonnes de pCAM par an",
      "processing": "GREEN HYDROREJUVENATION™",
      "notes": "Première usine en Amérique du Nord à produire pCAM directement à partir de masse noire.",
      "website": "https://www.greenli-ion.com/"
    },
    {
      "id": 15,
      "name": "Redwood Materials",
      "location": "Storey County, NV, États-Unis",
      "country": "États-Unis",
      "coordinates": [39.5442, -119.4310],
      "status": "Opérationnel",
      "production": "1 million de VE par an (prévu)",
      "processing": "Hydrométallurgie",
      "notes": "Produit CAM à partir de batteries recyclées, en expansion.",
      "website": "https://www.redwoodmaterials.com/"
    },
    {
      "id": 16,
      "name": "Redwood Materials",
      "location": "Ridgeville, SC, États-Unis",
      "country": "États-Unis",
      "coordinates": [33.1510, -80.2533],
      "status": "En construction",
      "production": "N/A",
      "processing": "Hydrométallurgie",
      "notes": "Prévue pour produire CAM, pas encore opérationnelle.",
      "website": "https://www.redwoodmaterials.com/"
    },
    {
      "id": 17,
      "name": "Tesla Gigafactory",
      "location": "Sparks, NV, États-Unis",
      "country": "États-Unis",
      "coordinates": [39.5380, -119.4430],
      "status": "Opérationnel",
      "production": "N/A",
      "processing": "Hydrométallurgie (procédé interne)",
      "notes": "Recyclage interne de batteries usagées et rebuts, récupération de 92 % des matériaux.",
      "website": "https://www.tesla.com/gigafactory"
    },
    {
      "id": 18,
      "name": "American Battery Technology",
      "location": "Reno, NV, États-Unis",
      "country": "États-Unis",
      "coordinates": [39.5296, -119.8138],
      "status": "En construction",
      "production": "N/A",
      "processing": "Hydrométallurgie",
      "notes": "Prévue pour traiter les batteries lithium-ion, pas encore opérationnelle.",
      "website": "https://americanbatterytechnology.com/"
    },
    {
      "id": 19,
      "name": "Li-Cycle",
      "location": "Rochester, NY, États-Unis",
      "country": "États-Unis",
      "coordinates": [43.1566, -77.6088],
      "status": "En pause",
      "production": "N/A",
      "processing": "Spoke & Hub Technologies - Procédé hydrométallurgique",
      "notes": "Prévu pour produire des matériaux comme le carbonate de lithium, en pause depuis octobre 2023.",
      "website": "https://li-cycle.com/"
    },
    {
      "id": 20,
      "name": "CVMR Corporation",
      "location": "Amarillo, TX, États-Unis",
      "country": "États-Unis",
      "coordinates": [35.2220, -101.8313],
      "status": "Planifié",
      "production": "Not specified",
      "processing": "Vapour Metallurgy",
      "notes": "Planned to start operations in 2025.",
      "website": "https://www.cvmr.com/"
    }
  ],
  "status_colors": {
    "Opérationnel": "#00AA00",
    "En construction": "#0000FF",
    "Planifié": "#FFA500",
    "Approuvé": "#FFA500",
    "En suspens": "#FF0000",
    "En pause": "#FF0000"
  },
  "chart_colors": ["#4a6bff", "#ff7043", "#ffca28", "#66bb6a", "#ab47bc"]
};

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
  const [mapHeight, setMapHeight] = useState(800);
  const [tabValue, setTabValue] = useState(0);
  const [mapData, setMapData] = useState([]);
  const [statusChartData, setStatusChartData] = useState([]);
  const [countryChartData, setCountryChartData] = useState([]);
  const theme = useTheme();
  const { t } = useTranslation();

  const paperStyle = {
    borderRadius: '12px', 
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
    overflow: 'hidden',
    height: '100%',
    backgroundColor: theme.palette.background.paper
  };

  // Préparer les données au chargement
  useEffect(() => {
    const plants = prepareMapData(refineryData.refineries);
    setMapData(plants);
    setStatusChartData(prepareStatusChartData(refineryData.refineries));
    setCountryChartData(prepareCountryChartData(refineryData.refineries));
  }, []);

  // Gérer les changements d'onglet
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // Callback pour mettre à jour la taille de la carte
  const handleMapResize = (newHeight) => {
    setMapHeight(newHeight);
  };

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
            {refineryData.refineries.map((row) => (
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
              <MapView plants={mapData} onResize={handleMapResize} />
            </Box>
          </Paper>
        </Grid>

        {/* Onglets pour alterner entre graphiques et tableau */}
        <Grid item xs={12}>
          <Paper elevation={0} sx={{ ...paperStyle, p: 0 }}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tabs 
                value={tabValue} 
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
              {tabValue === 0 && renderDataTable()}
              
              {tabValue === 1 && (
                <Box>
                  <Typography variant="h6" gutterBottom>Répartition des installations par statut</Typography>
                  {renderStatusChart()}
                </Box>
              )}
              
              {tabValue === 2 && (
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