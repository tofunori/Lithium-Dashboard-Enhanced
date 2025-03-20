import React from 'react';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Button, 
  IconButton, 
  Box, 
  Drawer, 
  List, 
  ListItem, 
  ListItemIcon, 
  ListItemText,
  useMediaQuery,
  useTheme,
  Avatar,
  Tooltip,
  Chip
} from '@mui/material';
import { 
  Menu as MenuIcon, 
  Dashboard as DashboardIcon,
  Science as ScienceIcon,
  Assessment as AssessmentIcon,
  Group as GroupIcon,
  Settings as SettingsIcon,
  Login as LoginIcon,
  Logout as LogoutIcon,
  Person as PersonIcon,
  Factory as FactoryIcon
} from '@mui/icons-material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import useTranslation from '../hooks/useTranslation';
import { useAuth } from '../contexts/AuthContext';

const NavBar = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { t } = useTranslation();
  const { currentUser, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const toggleDrawer = (open) => (event) => {
    if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
      return;
    }
    setDrawerOpen(open);
  };

  const handleLogout = async () => {
    try {
      // Désactiver les boutons ou afficher un spinner si nécessaire
      
      // Appeler la fonction de déconnexion sécurisée
      await logout();
      
      // Après la déconnexion, rediriger vers la page d'accueil ou de connexion
      navigate('/');
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
      // Afficher un message d'erreur si nécessaire
      
      // Dans tous les cas, rediriger vers la page d'accueil pour éviter de bloquer l'utilisateur
      navigate('/');
    }
  };

  const menuItems = [
    { text: t('dashboard'), icon: <DashboardIcon />, path: '/' },
    { text: "Installations", icon: <FactoryIcon />, path: '/installations' },
    { text: t('plants'), icon: <ScienceIcon />, path: '/research' },
    { text: t('reports'), icon: <AssessmentIcon />, path: '/reports' },
    { text: t('stats'), icon: <GroupIcon />, path: '/collaborators' },
    { text: t('settings'), icon: <SettingsIcon />, path: '/settings' },
  ];

  const drawer = (
    <Box
      sx={{ width: 250 }}
      role="presentation"
      onClick={toggleDrawer(false)}
      onKeyDown={toggleDrawer(false)}
    >
      <Box sx={{ p: 2, borderBottom: '1px solid rgba(0, 0, 0, 0.12)' }}>
        <Typography variant="h6" component="div">
          Lithium Recycling
        </Typography>
        <Typography variant="subtitle2" color="text.secondary">
          {t('subtitle')}
        </Typography>
        
        {isAuthenticated && (
          <Box sx={{ mt: 2, display: 'flex', alignItems: 'center' }}>
            <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main', mr: 1 }}>
              <PersonIcon fontSize="small" />
            </Avatar>
            <Typography variant="body2">
              {currentUser}
            </Typography>
          </Box>
        )}
      </Box>
      <List>
        {menuItems.map((item) => (
          <ListItem 
            button 
            key={item.text} 
            component={RouterLink} 
            to={item.path}
            sx={{ 
              '&.active': {
                bgcolor: 'rgba(0, 0, 0, 0.08)',
              }
            }}
          >
            <ListItemIcon>
              {item.icon}
            </ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItem>
        ))}
        
        {isAuthenticated ? (
          <ListItem 
            button 
            onClick={handleLogout}
            sx={{ 
              '&.active': {
                bgcolor: 'rgba(0, 0, 0, 0.08)',
              }
            }}
          >
            <ListItemIcon>
              <LogoutIcon />
            </ListItemIcon>
            <ListItemText primary={t('logout')} />
          </ListItem>
        ) : (
          <ListItem 
            button 
            component={RouterLink} 
            to="/login"
            sx={{ 
              '&.active': {
                bgcolor: 'rgba(0, 0, 0, 0.08)',
              }
            }}
          >
            <ListItemIcon>
              <LoginIcon />
            </ListItemIcon>
            <ListItemText primary={t('login')} />
          </ListItem>
        )}
      </List>
    </Box>
  );

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          {isMobile && (
            <IconButton
              edge="start"
              color="inherit"
              aria-label="menu"
              onClick={toggleDrawer(true)}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
          )}
          
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            ♻️ {t('dashboard')}
          </Typography>
          
          {!isMobile && (
            <Box>
              {menuItems.map((item) => (
                <Button 
                  key={item.text}
                  color="inherit"
                  component={RouterLink}
                  to={item.path}
                  startIcon={item.icon}
                  sx={{ mx: 1 }}
                >
                  {item.text}
                </Button>
              ))}
            </Box>
          )}
          
          {isAuthenticated ? (
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Chip 
                avatar={<Avatar><PersonIcon fontSize="small" /></Avatar>}
                label={currentUser}
                variant="outlined"
                color="primary"
                sx={{ 
                  mr: 2, 
                  color: 'white', 
                  borderColor: 'rgba(255,255,255,0.5)',
                  '& .MuiAvatar-root': { bgcolor: 'primary.dark' }
                }}
              />
              <Tooltip title={t('logout')}>
                <Button 
                  color="inherit" 
                  onClick={handleLogout}
                  startIcon={<LogoutIcon />}
                >
                  {t('logout')}
                </Button>
              </Tooltip>
            </Box>
          ) : (
            <Button 
              color="inherit" 
              component={RouterLink} 
              to="/login"
              startIcon={<LoginIcon />}
            >
              {t('login')}
            </Button>
          )}
        </Toolbar>
      </AppBar>

      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={toggleDrawer(false)}
      >
        {drawer}
      </Drawer>
    </>
  );
};

export default NavBar; 