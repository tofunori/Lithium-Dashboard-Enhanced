import React, { createContext, useState, useContext, useEffect } from 'react';
import { refineryData as initialData } from '../data/refineryData';

// Création du contexte
export const RefineryContext = createContext();

// Hook personnalisé pour faciliter l'accès au contexte
export const useRefineries = () => useContext(RefineryContext);

const RefineryProvider = ({ children }) => {
  // État pour stocker les raffineries
  const [refineries, setRefineries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Charger les données initiales
  useEffect(() => {
    try {
      if (initialData && initialData.refineries) {
        setRefineries(initialData.refineries);
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
        ? Math.max(...refineries.map(r => r.id)) 
        : 0;
      newRefinery.id = maxId + 1;
    }
    
    const updatedRefineries = [...refineries, newRefinery];
    setRefineries(updatedRefineries);
    
    // Ici, on pourrait également envoyer les données à un backend
    // ou les sauvegarder localement selon l'architecture
    return updatedRefineries;
  };

  // Fonction pour mettre à jour une raffinerie existante
  const updateRefinery = (updatedRefinery) => {
    const updatedRefineries = refineries.map(refinery => 
      refinery.id === updatedRefinery.id ? updatedRefinery : refinery
    );
    setRefineries(updatedRefineries);
    return updatedRefineries;
  };

  // Fonction pour supprimer une raffinerie
  const deleteRefinery = (id) => {
    const updatedRefineries = refineries.filter(refinery => refinery.id !== id);
    setRefineries(updatedRefineries);
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