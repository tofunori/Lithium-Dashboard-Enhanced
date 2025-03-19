import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './Login.css';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [loginError, setLoginError] = useState('');
  
  const { login, isAuthenticated, error } = useAuth();
  const navigate = useNavigate();
  
  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/admin');
    }
  }, [isAuthenticated, navigate]);
  
  // Set error from auth context
  useEffect(() => {
    if (error) {
      setLoginError(error);
    }
  }, [error]);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoginError('');
    
    // Validate form
    if (!username || !password) {
      setLoginError('Veuillez entrer un nom d\'utilisateur et un mot de passe');
      return;
    }
    
    // Attempt login
    const success = await login(username, password);
    
    if (success) {
      // Save username if remember me is checked
      if (rememberMe) {
        localStorage.setItem('rememberedUsername', username);
      } else {
        localStorage.removeItem('rememberedUsername');
      }
      
      // Redirect to admin page
      navigate('/admin');
    }
  };
  
  // Load remembered username
  useEffect(() => {
    const rememberedUsername = localStorage.getItem('rememberedUsername');
    if (rememberedUsername) {
      setUsername(rememberedUsername);
      setRememberMe(true);
    }
  }, []);
  
  return (
    <div className="login-container">
      <div className="login-card">
        <h2>Connexion à l'administration</h2>
        
        {loginError && (
          <div className="login-error">
            <p>{loginError}</p>
          </div>
        )}
        
        <form className="login-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username">Nom d'utilisateur</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="form-control"
              placeholder="admin"
              autoComplete="username"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Mot de passe</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="form-control"
              placeholder="••••••••"
              autoComplete="current-password"
            />
          </div>
          
          <div className="form-group remember-me">
            <input
              type="checkbox"
              id="remember-me"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
            />
            <label htmlFor="remember-me">Se souvenir de moi</label>
          </div>
          
          <button type="submit" className="btn login-btn">
            Se connecter
          </button>
        </form>
        
        <div className="login-footer">
          <p>
            <a href="/">Retour au dashboard</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;