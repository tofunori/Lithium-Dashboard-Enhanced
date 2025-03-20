import React, { createContext, useState, useContext, useEffect } from 'react';
import { refineryData as initialData } from '../data/refineryData';

// Création du contexte
export const RefineryContext = createContext();

// Hook personnalisé pour faciliter l'accès au contexte
export const useRefineries = () => useContext(RefineryContext);

// Clé pour le stockage localStorage
const STORAGE_KEY = 'lithium_refineries_data';

// Fonction pour charger les données depuis localStorage
const loadStoredRefineries = () => {
  try {
    const storedData = localStorage.getItem(STORAGE_KEY);
    if (storedData) {
      return JSON.parse(storedData);
    }
  } catch (err) {
    console.error('Erreur lors du chargement des données stockées:', err);
  }
  return null;
};

// Fonction pour sauvegarder les données dans localStorage
const saveRefineriesToStorage = (data) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (err) {
    console.error('Erreur lors de la sauvegarde des données:', err);
  }
};

const RefineryProvider = ({ children }) => {
  // État pour stocker les raffineries
  const [refineries, setRefineries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Charger les données initiales
  useEffect(() => {
    try {
      // D'abord essayer de charger depuis localStorage
      const storedRefineries = loadStoredRefineries();
      
      if (storedRefineries) {
        console.log('Données chargées depuis localStorage');
        setRefineries(storedRefineries);
      } else if (initialData && initialData.refineries) {
        // Si pas de données dans localStorage, utiliser les données initiales
        console.log('Données chargées depuis les données initiales');
        setRefineries(initialData.refineries);
        // Sauvegarder les données initiales dans localStorage
        saveRefineriesToStorage(initialData.refineries);
      } else {
        setRefineries([]);
      }
      setLoading(false);
    } catch (err) {
      console.error('Erreur lors du chargement des données:', err);
      setError('Impossible de charger les données des raffineries');
      setLoading(false);
    }
  }, []);

  // Fonction pour ajouter une nouvelle raffinerie
  const addRefinery = (newRefinery) => {
    // Générer un nouvel ID si nécessaire
    if (!newRefinery.id) {
      const maxId = refineries.length > 0 
        ? Math.max(...refineries.map(r => parseInt(r.id, 10))) 
        : 0;
      newRefinery.id = maxId + 1;
    }
    
    const updatedRefineries = [...refineries, newRefinery];
    setRefineries(updatedRefineries);
    
    // Sauvegarder les données mises à jour dans localStorage
    saveRefineriesToStorage(updatedRefineries);
    
    return updatedRefineries;
  };

  // Fonction pour mettre à jour une raffinerie existante
  const updateRefinery = (updatedRefinery) => {
    const updatedRefineries = refineries.map(refinery => 
      refinery.id === updatedRefinery.id ? updatedRefinery : refinery
    );
    setRefineries(updatedRefineries);
    
    // Sauvegarder les données mises à jour dans localStorage
    saveRefineriesToStorage(updatedRefineries);
    
    return updatedRefineries;
  };

  // Fonction pour supprimer une raffinerie
  const deleteRefinery = (id) => {
    const updatedRefineries = refineries.filter(refinery => refinery.id !== id);
    setRefineries(updatedRefineries);
    
    // Sauvegarder les données mises à jour dans localStorage
    saveRefineriesToStorage(updatedRefineries);
    
    return updatedRefineries;
  };

  // Fonction pour obtenir une raffinerie par son ID
  const getRefineryById = (id) => {
    return refineries.find(refinery => refinery.id === parseInt(id, 10));
  };

  // Exporter les valeurs et fonctions
  const contextValue = {
    refineries,
    loading,
    error,
    addRefinery,
    updateRefinery,
    deleteRefinery,
    getRefineryById
  };

  return (
    <RefineryContext.Provider value={contextValue}>
      {children}
    </RefineryContext.Provider>
  );
};

export default RefineryProvider; 