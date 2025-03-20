import React, { createContext, useState, useContext, useEffect } from 'react';
import { supabase } from '../supabase';

// Création du contexte d'authentification
const AuthContext = createContext();

// Hook pour utiliser le contexte d'authentification dans les composants
export const useAuth = () => useContext(AuthContext);

// Fournisseur du contexte d'authentification
export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userId, setUserId] = useState(null);
  const [authError, setAuthError] = useState(null);

  // Vérifier s'il y a un utilisateur au chargement de l'application
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Vérifier la session Supabase
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Erreur lors de la récupération de la session:', error);
          setAuthError(error.message);
          setLoading(false);
          return;
        }
        
        if (session) {
          console.log('Session trouvée:', session);
          setCurrentUser(session.user.email);
          setUserId(session.user.id);
          setIsAuthenticated(true);
        } else {
          console.log('Aucune session active trouvée');
        }
      } catch (error) {
        console.error('Erreur lors de la vérification de l\'authentification:', error);
        setAuthError(error.message);
      } finally {
        setLoading(false);
      }
    };
    
    checkAuth();
    
    // Écouter les changements d'authentification
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Événement d\'authentification:', event, session ? 'session présente' : 'pas de session');
        if (event === 'SIGNED_IN' && session) {
          setCurrentUser(session.user.email);
          setUserId(session.user.id);
          setIsAuthenticated(true);
          setAuthError(null);
        } else if (event === 'SIGNED_OUT') {
          setCurrentUser(null);
          setUserId(null);
          setIsAuthenticated(false);
          setAuthError(null);
        } else if (event === 'USER_UPDATED' && session) {
          setCurrentUser(session.user.email);
          setUserId(session.user.id);
          setIsAuthenticated(true);
          setAuthError(null);
        }
      }
    );
    
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Fonction de connexion avec Supabase
  const login = async (email, password) => {
    try {
      setAuthError(null);
      console.log('Tentative de connexion pour:', email);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        console.error('Erreur de connexion:', error);
        setAuthError(error.message);
        throw error;
      }
      
      console.log('Connexion réussie:', data);
      setCurrentUser(data.user.email);
      setUserId(data.user.id);
      setIsAuthenticated(true);
      
      return data;
    } catch (error) {
      console.error('Erreur de connexion:', error);
      setAuthError(error.message || 'Erreur de connexion inconnue');
      throw error;
    }
  };

  // Fonction d'inscription avec Supabase
  const signUp = async (email, password) => {
    try {
      setAuthError(null);
      const { data, error } = await supabase.auth.signUp({
        email,
        password
      });
      
      if (error) {
        console.error('Erreur d\'inscription:', error);
        setAuthError(error.message);
        throw error;
      }
      
      return data;
    } catch (error) {
      console.error('Erreur d\'inscription:', error);
      setAuthError(error.message || 'Erreur d\'inscription inconnue');
      throw error;
    }
  };

  // Fonction de déconnexion avec Supabase
  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Erreur de déconnexion:', error);
        setAuthError(error.message);
        throw error;
      }
      
      setCurrentUser(null);
      setUserId(null);
      setIsAuthenticated(false);
      setAuthError(null);
    } catch (error) {
      console.error('Erreur de déconnexion:', error);
      setAuthError(error.message || 'Erreur de déconnexion inconnue');
      throw error;
    }
  };

  // Valeur du contexte
  const value = {
    currentUser,
    userId,
    isAuthenticated,
    login,
    signUp,
    logout,
    loading,
    authError
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export default AuthContext; 