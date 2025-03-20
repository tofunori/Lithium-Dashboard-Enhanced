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

  // Vérifier s'il y a un utilisateur au chargement de l'application
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Vérifier la session Supabase
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
          setCurrentUser(session.user.email);
          setUserId(session.user.id);
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error('Erreur lors de la vérification de l\'authentification:', error);
      } finally {
        setLoading(false);
      }
    };
    
    checkAuth();
    
    // Écouter les changements d'authentification
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'SIGNED_IN' && session) {
          setCurrentUser(session.user.email);
          setUserId(session.user.id);
          setIsAuthenticated(true);
        } else if (event === 'SIGNED_OUT') {
          setCurrentUser(null);
          setUserId(null);
          setIsAuthenticated(false);
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
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) throw error;
      
      setCurrentUser(data.user.email);
      setUserId(data.user.id);
      setIsAuthenticated(true);
      
      return data;
    } catch (error) {
      console.error('Erreur de connexion:', error);
      throw error;
    }
  };

  // Fonction d'inscription avec Supabase
  const signUp = async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password
      });
      
      if (error) throw error;
      
      return data;
    } catch (error) {
      console.error('Erreur d\'inscription:', error);
      throw error;
    }
  };

  // Fonction de déconnexion avec Supabase
  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) throw error;
      
      setCurrentUser(null);
      setUserId(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Erreur de déconnexion:', error);
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
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export default AuthContext; 