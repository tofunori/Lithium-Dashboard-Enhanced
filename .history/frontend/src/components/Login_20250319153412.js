import React, { useState } from 'react';
import { 
  Box, 
  Paper, 
  Typography, 
  TextField, 
  Button, 
  FormControlLabel, 
  Checkbox,
  Alert,
  CircularProgress
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import useTranslation from '../hooks/useTranslation';

const Login = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [credentials, setCredentials] = useState({
    username: '',
    password: '',
    rememberMe: false
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, checked } = e.target;
    setCredentials({
      ...credentials,
      [name]: name === 'rememberMe' ? checked : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Simulation d'une requête d'authentification
      // En production, il faudrait appeler une API backend
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (credentials.username === 'admin' && credentials.password === 'password') {
        // Stocker le token (simulé)
        localStorage.setItem('authToken', 'simulated-jwt-token');
        
        // Rediriger vers le tableau de bord
        navigate('/');
      } else {
        setError(t('login_failed'));
      }
    } catch (err) {
      setError(t('login_error'));
      console.error('Erreur de connexion:', err);
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
        <Typography variant="h4" component="h1" gutterBottom align="center" fontWeight="500" color="primary.dark">
          {t('login')}
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" align="center" sx={{ mb: 4 }}>
          {t('login_subtitle')}
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <TextField
            label={t('username')}
            variant="outlined"
            fullWidth
            margin="normal"
            name="username"
            value={credentials.username}
            onChange={handleChange}
            required
            autoFocus
          />
          <TextField
            label={t('password')}
            variant="outlined"
            fullWidth
            margin="normal"
            name="password"
            type="password"
            value={credentials.password}
            onChange={handleChange}
            required
          />
          <FormControlLabel
            control={
              <Checkbox 
                name="rememberMe"
                checked={credentials.rememberMe}
                onChange={handleChange}
                color="primary"
              />
            }
            label={t('remember_me')}
            sx={{ mt: 1, mb: 2 }}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            size="large"
            disabled={loading}
            sx={{ 
              py: 1.5,
              mt: 1,
              mb: 2,
              borderRadius: '8px',
              fontWeight: 600
            }}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : t('login')}
          </Button>
          <Typography variant="body2" color="text.secondary" align="center">
            {t('login_help_text')}
          </Typography>
          <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 1 }}>
            <strong>{t('demo_credentials')}:</strong> admin / password
          </Typography>
        </form>
      </Paper>
    </Box>
  );
};

export default Login; 