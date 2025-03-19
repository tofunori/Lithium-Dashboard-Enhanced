import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Box, 
  Container, 
  Grid, 
  Paper, 
  Typography, 
  Chip, 
  Button, 
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  IconButton,
  Link,
  Tabs,
  Tab
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import LanguageIcon from '@mui/icons-material/Language';
import InfoIcon from '@mui/icons-material/Info';
import ProductionQuantityLimitsIcon from '@mui/icons-material/ProductionQuantityLimits';
import SettingsIcon from '@mui/icons-material/Settings';
import MapIcon from '@mui/icons-material/Map';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import DescriptionIcon from '@mui/icons-material/Description';
import useTranslation from '../hooks/useTranslation';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip as RechartsTooltip } from 'recharts';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { refineryData } from '../data/refineryData';
import { reportsData } from '../data/reportsData';
import ReportsView from './ReportsView';

// Correction pour les icônes Leaflet
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34]
});

L.Marker.prototype.options.icon = DefaultIcon;

// Création d'une icône personnalisée
const createCustomIcon = (color) => {
  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="background-color: ${color}; width: 24px; height: 24px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 5px rgba(0,0,0,0.3);"></div>`,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
    popupAnchor: [0, -15]
  });
};

const FonderieDetail = () => {
  const { fonderieId } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [fonderie, setFonderie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState(0);

  // Couleurs pour les graphiques
  const chartColors = ["#4a6bff", "#ff7043", "#ffca28", "#66bb6a", "#ab47bc"];

  // Obtenir la couleur de statut
  const getStatusColor = (status) => {
    return refineryData.status_colors[status] || "#999999";
  };

  // Créer des données fictives pour le graphique de composition
  const getMaterialData = () => {
    return [
      { name: 'Lithium', value: 35 },
      { name: 'Cobalt', value: 25 },
      { name: 'Nickel', value: 20 },
      { name: 'Manganèse', value: 15 },
      { name: 'Autres', value: 5 }
    ];
  };

  // Récupérer les données de la fonderie
  useEffect(() => {
    // Simulation d'une requête API
    try {
      setLoading(true);
      const foundFonderie = refineryData.refineries.find(r => r.id === parseInt(fonderieId));
      
      if (foundFonderie) {
        setFonderie(foundFonderie);
      } else {
        setError("Fonderie non trouvée");
      }
    } catch (err) {
      setError("Erreur lors du chargement des données");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [fonderieId]);

  // Rendre le graphique de composition des matériaux
  const renderCompositionChart = () => {
    const data = getMaterialData();
    
    return (
      <ResponsiveContainer width="100%" height={250}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={chartColors[index % chartColors.length]} />
            ))}
          </Pie>
          <RechartsTooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    );
  };

  // Rendre la mini-carte
  const renderMap = (fonderie) => {
    if (!fonderie || !fonderie.coordinates || !Array.isArray(fonderie.coordinates) || fonderie.coordinates.length < 2) {
      return (
        <Box sx={{ 
          height: 200, 
          bgcolor: 'grey.100', 
          borderRadius: '8px', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center' 
        }}>
          <Typography variant="body2" color="text.secondary">
            Données de localisation non disponibles
          </Typography>
        </Box>
      );
    }

    // Déterminer la couleur en fonction du statut
    const color = getStatusColor(fonderie.status);
    const customIcon = createCustomIcon(color);
    
    // Style de la mini-carte
    const mapStyle = {
      height: '200px',
      width: '100%',
      borderRadius: '8px',
      overflow: 'hidden'
    };

    return (
      <MapContainer 
        center={fonderie.coordinates} 
        zoom={11} 
        style={mapStyle}
        zoomControl={true}
        scrollWheelZoom={false}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        <Marker 
          position={fonderie.coordinates} 
          icon={customIcon}
        >
          <Popup>
            <Typography variant="subtitle2" fontWeight="bold">
              {fonderie.name}
            </Typography>
            <Typography variant="body2">
              {fonderie.location}
            </Typography>
          </Popup>
        </Marker>
      </MapContainer>
    );
  };

  // Gérer le changement d'onglet
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  // État de chargement
  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography variant="h6">{t('loading')}</Typography>
      </Container>
    );
  }

  // État d'erreur
  if (error || !fonderie) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Button 
          startIcon={<ArrowBackIcon />} 
          onClick={() => navigate(-1)} 
          sx={{ mb: 2 }}
        >
          Retour
        </Button>
        <Typography variant="h6" color="error">{error || "Fonderie non trouvée"}</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* En-tête avec bouton retour */}
      <Box sx={{ display: 'flex', mb: 3, alignItems: 'center' }}>
        <Button 
          startIcon={<ArrowBackIcon />} 
          onClick={() => navigate(-1)} 
          sx={{ mr: 2 }}
        >
          Retour
        </Button>
        <Typography variant="h4" component="h1" fontWeight="600">
          {fonderie.name}
        </Typography>
      </Box>

      {/* Onglets pour naviguer entre les sections */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs 
          value={activeTab} 
          onChange={handleTabChange}
          sx={{ 
            '& .MuiTab-root': { 
              textTransform: 'none',
              fontWeight: 500
            } 
          }}
        >
          <Tab label="Informations générales" />
          <Tab label="Documents et rapports" icon={<DescriptionIcon />} iconPosition="start" />
        </Tabs>
      </Box>

      {/* Contenu selon l'onglet actif */}
      {activeTab === 0 && (
        <Grid container spacing={4}>
          {/* Informations principales */}
          <Grid item xs={12} md={7}>
            <Paper 
              elevation={0} 
              sx={{ 
                p: 3, 
                borderRadius: '12px', 
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
                height: '100%'
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6">
                  Informations générales
                </Typography>
                <Chip 
                  label={fonderie.status} 
                  size="small" 
                  sx={{ 
                    bgcolor: `${getStatusColor(fonderie.status)}20`,
                    color: getStatusColor(fonderie.status),
                    fontWeight: 500
                  }} 
                />
              </Box>
              
              <TableContainer>
                <Table size="small">
                  <TableBody>
                    <TableRow>
                      <TableCell component="th" sx={{ borderBottom: 'none', fontWeight: 500, width: '30%' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <MapIcon sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                          Emplacement
                        </Box>
                      </TableCell>
                      <TableCell sx={{ borderBottom: 'none' }}>{fonderie.location}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell component="th" sx={{ borderBottom: 'none', fontWeight: 500 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <ProductionQuantityLimitsIcon sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                          Capacité de production
                        </Box>
                      </TableCell>
                      <TableCell sx={{ borderBottom: 'none' }}>{fonderie.production || "Non spécifiée"}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell component="th" sx={{ borderBottom: 'none', fontWeight: 500 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <SettingsIcon sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                          Procédé de recyclage
                        </Box>
                      </TableCell>
                      <TableCell sx={{ borderBottom: 'none' }}>{fonderie.processing}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell component="th" sx={{ borderBottom: 'none', fontWeight: 500 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <LanguageIcon sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                          Site web
                        </Box>
                      </TableCell>
                      <TableCell sx={{ borderBottom: 'none' }}>
                        <Link href={fonderie.website} target="_blank" rel="noopener noreferrer">
                          {fonderie.website}
                        </Link>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
              
              <Typography variant="h6" sx={{ mt: 4, mb: 2 }}>
                Notes et particularités
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                {fonderie.notes}
              </Typography>
              
              {/* Informations supplémentaires fictives */}
              <Typography variant="h6" sx={{ mt: 4, mb: 2 }}>
                Historique et développement
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Cette installation a été développée dans le cadre d'un effort stratégique pour augmenter la capacité de recyclage des batteries lithium-ion en Amérique du Nord. L'usine emploie environ 150 personnes et contribue significativement à l'économie locale. Ses technologies de pointe permettent une récupération optimale des matériaux critiques des batteries en fin de vie.
              </Typography>
            </Paper>
          </Grid>
          
          {/* Visualisations et données techniques */}
          <Grid item xs={12} md={5}>
            <Paper 
              elevation={0} 
              sx={{ 
                p: 3, 
                borderRadius: '12px', 
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
                mb: 4
              }}
            >
              <Typography variant="h6" sx={{ mb: 2 }}>
                Localisation
              </Typography>
              {renderMap(fonderie)}
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Latitude: {fonderie.coordinates[0]}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Longitude: {fonderie.coordinates[1]}
                </Typography>
              </Box>
            </Paper>
            
            <Paper 
              elevation={0} 
              sx={{ 
                p: 3, 
                borderRadius: '12px', 
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)'
              }}
            >
              <Typography variant="h6" sx={{ mb: 2 }}>
                Composition des matériaux recyclés
              </Typography>
              <Box sx={{ position: 'relative' }}>
                {renderCompositionChart()}
                <Box 
                  sx={{ 
                    position: 'absolute', 
                    bottom: 0, 
                    right: 0,
                    display: 'flex', 
                    alignItems: 'center' 
                  }}
                >
                  <HelpOutlineIcon color="disabled" fontSize="small" />
                  <Typography variant="caption" color="text.secondary" sx={{ ml: 0.5 }}>
                    Données indicatives
                  </Typography>
                </Box>
              </Box>
            </Paper>
          </Grid>
          
          {/* Statistiques de performance */}
          <Grid item xs={12}>
            <Paper 
              elevation={0} 
              sx={{ 
                p: 3, 
                borderRadius: '12px', 
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)'
              }}
            >
              <Typography variant="h6" sx={{ mb: 3 }}>
                Métriques de performance
              </Typography>
              
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6} md={3}>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Taux de récupération
                    </Typography>
                    <Typography variant="h5" sx={{ mt: 1, fontWeight: 600 }}>
                      92%
                    </Typography>
                    <Typography variant="caption" color="success.main">
                      +3% depuis l'année dernière
                    </Typography>
                  </Box>
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Consommation d'énergie
                    </Typography>
                    <Typography variant="h5" sx={{ mt: 1, fontWeight: 600 }}>
                      450 kWh/t
                    </Typography>
                    <Typography variant="caption" color="success.main">
                      -5% depuis l'année dernière
                    </Typography>
                  </Box>
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Consommation d'eau
                    </Typography>
                    <Typography variant="h5" sx={{ mt: 1, fontWeight: 600 }}>
                      2.3 m³/t
                    </Typography>
                    <Typography variant="caption" color="error.main">
                      +7% depuis l'année dernière
                    </Typography>
                  </Box>
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Émissions de CO₂
                    </Typography>
                    <Typography variant="h5" sx={{ mt: 1, fontWeight: 600 }}>
                      0.8 t/t
                    </Typography>
                    <Typography variant="caption" color="success.main">
                      -10% depuis l'année dernière
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </Paper>
          </Grid>
        </Grid>
      )}

      {/* Onglet des documents et rapports */}
      {activeTab === 1 && (
        <Paper 
          elevation={0} 
          sx={{ 
            p: 3, 
            borderRadius: '12px', 
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)'
          }}
        >
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Documents relatifs à {fonderie.name}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Consultez les rapports, articles, études et entrevues concernant cette installation. Filtrez par type de document ou recherchez par mot-clé.
            </Typography>
          </Box>
          
          <ReportsView foundryId={fonderieId} />
        </Paper>
      )}
    </Container>
  );
};

export default FonderieDetail; 