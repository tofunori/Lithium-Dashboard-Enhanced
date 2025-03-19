import React, { createContext, useState, useContext, useEffect } from 'react';

// Création du contexte d'authentification
const AuthContext = createContext();

// Hook pour utiliser le contexte d'authentification dans les composants
export const useAuth = () => useContext(AuthContext);

// Fournisseur du contexte d'authentification
export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Vérifier s'il y a un utilisateur au chargement de l'application
  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('authToken');
      const user = localStorage.getItem('user');
      
      if (token && user) {
        setCurrentUser(user);
        setIsAuthenticated(true);
      }
      
      setLoading(false);
    };
    
    checkAuth();
  }, []);

  // Fonction de connexion
  const login = (username, password) => {
    // Pour le développement, on accepte tous les identifiants
    localStorage.setItem('authToken', 'simulated-jwt-token');
    localStorage.setItem('user', username);
    setCurrentUser(username);
    setIsAuthenticated(true);
    return Promise.resolve();
  };

  // Fonction de déconnexion
  const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    setCurrentUser(null);
    setIsAuthenticated(false);
  };

  // Valeur du contexte
  const value = {
    currentUser,
    isAuthenticated,
    login,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export default AuthContext; 