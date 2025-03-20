import React, { useState } from 'react';
import { 
  Box, 
  Paper, 
  Typography, 
  TextField, 
  Button, 
  Alert,
  Tabs,
  Tab,
  Link,
  Divider
} from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import useTranslation from '../hooks/useTranslation';

const Login = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState(0);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const { login, signUp } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Destination après connexion réussie (ou page d'accueil par défaut)
  const from = location.state?.from?.pathname || "/";
  
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    setError('');
    setSuccess('');
  };
  
  const handleLogin = async (e) => {
    e.preventDefault();
    
    // Validation basique
    if (!email || !password) {
      setError(t('login_error_fields'));
      return;
    }
    
    try {
      setError('');
      setLoading(true);
      
      await login(email, password);
      
      // Rediriger vers la page demandée ou la page d'accueil
      navigate(from, { replace: true });
    } catch (error) {
      console.error('Erreur de connexion:', error);
      setError(t('login_error_invalid'));
    } finally {
      setLoading(false);
    }
  };
  
  const handleSignUp = async (e) => {
    e.preventDefault();
    
    // Validation basique
    if (!email || !password) {
      setError(t('signup_error_fields'));
      return;
    }
    
    // Validation du format email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError(t('signup_error_email_format'));
      return;
    }
    
    // Validation de la force du mot de passe
    if (password.length < 6) {
      setError(t('signup_error_password_length'));
      return;
    }
    
    try {
      setError('');
      setLoading(true);
      
      const { user, session, error } = await signUp(email, password);
      
      if (error) throw error;
      
      if (user && session) {
        // L'utilisateur est automatiquement connecté
        navigate(from, { replace: true });
      } else {
        // Inscription réussie mais email de confirmation envoyé
        setSuccess(t('signup_success_confirm_email'));
        // Passage à l'onglet connexion
        setActiveTab(0);
      }
    } catch (error) {
      console.error('Erreur d\'inscription:', error);
      if (error.message.includes('email')) {
        setError(t('signup_error_email_exists'));
      } else {
        setError(t('signup_error_general'));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: 'calc(100vh - 64px)' 
    }}>
      <Paper elevation={3} sx={{ 
        p: 4, 
        maxWidth: 450, 
        width: '100%', 
        borderRadius: '10px',
        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.1)'
      }}>
        <Tabs 
          value={activeTab} 
          onChange={handleTabChange} 
          variant="fullWidth" 
          sx={{ mb: 3 }}
        >
          <Tab label={t('login')} />
          <Tab label={t('signup')} />
        </Tabs>
        
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}
        
        {success && (
          <Alert severity="success" sx={{ mb: 3 }}>
            {success}
          </Alert>
        )}
        
        {activeTab === 0 ? (
          // Formulaire de connexion
          <form onSubmit={handleLogin}>
            <Typography variant="h5" component="h1" gutterBottom fontWeight="500" color="primary.dark">
              {t('login')}
            </Typography>
            
            <TextField
              label="Email"
              type="email"
              fullWidth
              margin="normal"
              variant="outlined"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            
            <TextField
              label={t('password')}
              type="password"
              fullWidth
              margin="normal"
              variant="outlined"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            
            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              size="large"
              sx={{ mt: 3, mb: 2 }}
              disabled={loading}
            >
              {loading ? t('logging_in') : t('login')}
            </Button>
            
            <Box sx={{ mt: 2, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                {t('no_account')} 
                <Link 
                  component="button" 
                  type="button" 
                  variant="body2" 
                  onClick={() => setActiveTab(1)}
                  sx={{ ml: 0.5 }}
                >
                  {t('create_account')}
                </Link>
              </Typography>
            </Box>
          </form>
        ) : (
          // Formulaire d'inscription
          <form onSubmit={handleSignUp}>
            <Typography variant="h5" component="h1" gutterBottom fontWeight="500" color="primary.dark">
              {t('create_account')}
            </Typography>
            
            <TextField
              label="Email"
              type="email"
              fullWidth
              margin="normal"
              variant="outlined"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            
            <TextField
              label={t('password')}
              type="password"
              fullWidth
              margin="normal"
              variant="outlined"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              helperText={t('password_requirements')}
            />
            
            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              size="large"
              sx={{ mt: 3, mb: 2 }}
              disabled={loading}
            >
              {loading ? t('creating_account') : t('signup')}
            </Button>
            
            <Box sx={{ mt: 2, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                {t('already_have_account')} 
                <Link 
                  component="button" 
                  type="button" 
                  variant="body2" 
                  onClick={() => setActiveTab(0)}
                  sx={{ ml: 0.5 }}
                >
                  {t('login')}
                </Link>
              </Typography>
            </Box>
          </form>
        )}
      </Paper>
    </Box>
  );
};

export default Login; 