import React, { createContext, useContext, useState, useEffect } from 'react';
import { refineryData as initialData } from '../data/refineryData';

// URL de l'API pour les raffineries (backend)
const API_URL = '/api/recycling-plants/';
// Clé pour le stockage local
const STORAGE_KEY = 'lithium_refineries_data';

// Créer le contexte
export const RefineryContext = createContext();

// Hook personnalisé pour utiliser le contexte
export const useRefineries = () => useContext(RefineryContext);

// Fonction pour charger les données depuis le stockage local
const loadStoredRefineries = () => {
  try {
    const storedData = localStorage.getItem(STORAGE_KEY);
    if (!storedData) {
      console.log('Aucune donnée trouvée dans le stockage local');
      return [];
    }
    
    const parsedData = JSON.parse(storedData);
    console.log('Données chargées depuis le stockage local:', parsedData);
    
    // S'assurer que les données sont un tableau
    return Array.isArray(parsedData) ? parsedData : [];
  } catch (err) {
    console.error('Erreur lors du chargement des données depuis le stockage local:', err);
    return [];
  }
};

// Fonction pour sauvegarder les données dans le stockage local
const saveRefineriesToStorage = (data) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (err) {
    console.error('Erreur lors de la sauvegarde des données:', err);
  }
};

// Fonction pour convertir le format backend vers le format frontend
const backendToFrontendFormat = (backendData) => {
  if (!backendData) return [];
  
  // Si c'est un tableau, convertir chaque élément
  if (Array.isArray(backendData)) {
    return backendData.map(item => backendToFrontendFormat(item));
  }
  
  // Conversion d'un seul élément
  return {
    id: backendData.id || 0,
    name: backendData.name || '',
    location: backendData.address || '',
    country: backendData.university ? backendData.university_name || '' : '',
    coordinates: backendData.latitude && backendData.longitude 
      ? [backendData.latitude, backendData.longitude] 
      : [0, 0],
    status: backendData.active ? 'Opérationnel' : 'En pause',
    production: backendData.capacity ? `${backendData.capacity} kg/mois` : 'N/A',
    processing: 'Hydrométallurgie', // Valeur par défaut
    notes: backendData.description || '',
    website: '',
    // Conserver les autres champs du backend pour ne pas perdre de données
    ...backendData
  };
};

// Fonction pour convertir le format frontend vers le format backend
const frontendToBackendFormat = (frontendData) => {
  if (!frontendData) return [];
  
  // Si c'est un tableau, convertir chaque élément
  if (Array.isArray(frontendData)) {
    return frontendData.map(item => frontendToBackendFormat(item));
  }
  
  // Conversion d'un seul élément
  return {
    id: frontendData.id || 0,
    name: frontendData.name || '',
    address: frontendData.location || '',
    // Pas de conversion pour university car c'est une clé étrangère
    latitude: frontendData.coordinates && frontendData.coordinates[0] ? frontendData.coordinates[0] : null,
    longitude: frontendData.coordinates && frontendData.coordinates[1] ? frontendData.coordinates[1] : null,
    active: frontendData.status === 'Opérationnel',
    capacity: parseFloat(frontendData.production) || 0,
    description: frontendData.notes || '',
    // Conserver les autres champs du frontend pour ne pas perdre de données
    ...frontendData
  };
};

const RefineryProvider = ({ children }) => {
  // État pour stocker les raffineries
  const [refineries, setRefineries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Charger les données depuis le backend
  const fetchRefineries = async () => {
    try {
      setLoading(true);
      console.log('Tentative de chargement des données depuis le backend:', API_URL);
      
      const response = await fetch(API_URL, {
        headers: {
          'Accept': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Données chargées depuis le backend:', data);
      
      // S'assurer que les données sont un tableau
      const dataArray = Array.isArray(data) ? data : [];
      
      // Si le backend n'a pas de données, ne pas écraser les données locales
      if (dataArray.length === 0) {
        console.log('Le backend n\'a pas de données, conservation des données locales');
        setLoading(false);
        return refineries; // Retourner les données actuelles
      }
      
      const formattedData = backendToFrontendFormat(dataArray);
      console.log('Données formatées pour le frontend:', formattedData);
      
      // Vérifier que les données formatées ne sont pas vides
      if (formattedData.length === 0 && refineries.length > 0) {
        console.log('Les données formatées sont vides, conservation des données locales');
        setLoading(false);
        return refineries; // Retourner les données actuelles
      }
      
      setRefineries(formattedData);
      saveRefineriesToStorage(formattedData); // Mettre à jour le stockage local avec les données du backend
      setLoading(false);
      return formattedData;
    } catch (err) {
      console.error('Erreur lors du chargement des données depuis le backend:', err);
      
      // En cas d'erreur, essayer de charger depuis le stockage local
      const storedRefineries = loadStoredRefineries();
      
      if (storedRefineries && storedRefineries.length > 0) {
        console.log('Utilisation des données du stockage local suite à une erreur backend');
        setRefineries(storedRefineries);
        setLoading(false);
        return storedRefineries;
      } else if (initialData && initialData.refineries && initialData.refineries.length > 0) {
        console.log('Utilisation des données initiales suite à une erreur backend');
        setRefineries(initialData.refineries);
        saveRefineriesToStorage(initialData.refineries);
        setLoading(false);
        return initialData.refineries;
      }
      
      setError('Impossible de charger les données des raffineries depuis le serveur');
      setLoading(false);
      return [];
    }
  };

  // Charger les données initiales
  useEffect(() => {
    const loadData = async () => {
      try {
        // D'abord essayer de charger depuis le stockage local pour avoir des données rapidement
        const storedRefineries = loadStoredRefineries();
        
        if (storedRefineries && storedRefineries.length > 0) {
          console.log('Données chargées depuis le stockage local:', storedRefineries.length, 'raffineries');
          setRefineries(storedRefineries);
          setLoading(false);
        } else if (initialData && initialData.refineries && initialData.refineries.length > 0) {
          // Si pas de données dans le stockage local, utiliser les données initiales
          console.log('Données chargées depuis les données initiales:', initialData.refineries.length, 'raffineries');
          setRefineries(initialData.refineries);
          saveRefineriesToStorage(initialData.refineries);
          setLoading(false);
        }
        
        // Ensuite, essayer de charger depuis le backend (en arrière-plan)
        try {
          const backendData = await fetchRefineries();
          
          if (backendData && backendData.length > 0) {
            // Données chargées avec succès depuis le backend
            console.log('Données chargées depuis le backend avec succès:', backendData.length, 'raffineries');
          } else if (backendData && backendData.length === 0 && 
                    storedRefineries && storedRefineries.length > 0) {
            // Si le backend est accessible mais n'a pas de données, initialiser avec les données locales
            console.log('Backend accessible mais sans données, initialisation avec les données locales...');
            const initializedData = await initializeBackendData();
            if (initializedData && initializedData.length > 0) {
              console.log('Données initialisées dans le backend avec succès:', initializedData.length, 'raffineries');
            }
          }
        } catch (backendErr) {
          console.error('Erreur lors de la tentative de chargement depuis le backend:', backendErr);
          // L'erreur est déjà gérée dans fetchRefineries, pas besoin de faire plus ici
        }
      } catch (err) {
        console.error('Erreur lors du chargement des données:', err);
        setError('Impossible de charger les données des raffineries');
        setLoading(false);
      }
    };
    
    loadData();
  }, []);

  // Ajouter une nouvelle raffinerie
  const addRefinery = async (newRefinery) => {
    try {
      console.log('Ajout d\'une nouvelle raffinerie:', newRefinery);
      
      // Créer une copie de l'état actuel
      const currentRefineries = [...refineries];
      
      // Mettre à jour l'état local d'abord pour une meilleure réactivité
      const updatedRefineries = [...currentRefineries, newRefinery];
      
      // Vérifier que updatedRefineries contient des données
      console.log('Nombre de raffineries après ajout:', updatedRefineries.length);
      
      // Mettre à jour l'état et le stockage local seulement si nous avons des données
      if (updatedRefineries.length > 0) {
        setRefineries(updatedRefineries);
        saveRefineriesToStorage(updatedRefineries);
      } else {
        console.error('Erreur: l\'ajout a résulté en un tableau vide');
        return; // Ne pas continuer si nous n'avons pas de données
      }
      
      // Essayer d'ajouter au backend
      try {
        const backendRefinery = frontendToBackendFormat(newRefinery);
        console.log('Données converties pour le backend:', backendRefinery);
        
        const response = await fetch(API_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify(backendRefinery),
        });
        
        if (!response.ok) {
          console.error('Erreur lors de l\'ajout au backend:', await response.text());
          return;
        }
        
        const addedRefinery = await response.json();
        console.log('Raffinerie ajoutée avec succès dans le backend:', addedRefinery);
        
        // Ne pas recharger les données depuis le backend pour éviter de perdre l'état local
        // await fetchRefineries();
      } catch (backendErr) {
        console.error('Erreur lors de l\'ajout au backend, mais les données locales ont été mises à jour:', backendErr);
      }
    } catch (err) {
      console.error('Erreur lors de l\'ajout d\'une raffinerie:', err);
      setError('Impossible d\'ajouter la raffinerie');
    }
  };

  // Mettre à jour une raffinerie existante
  const updateRefinery = async (updatedRefinery) => {
    try {
      console.log('Mise à jour de la raffinerie:', updatedRefinery);
      
      // Créer une copie de l'état actuel
      const currentRefineries = [...refineries];
      
      // Mettre à jour l'état local d'abord pour une meilleure réactivité
      const updatedRefineries = currentRefineries.map(refinery => 
        refinery.id === updatedRefinery.id ? updatedRefinery : refinery
      );
      
      // Vérifier que updatedRefineries contient des données
      console.log('Nombre de raffineries après mise à jour:', updatedRefineries.length);
      
      // Mettre à jour l'état et le stockage local seulement si nous avons des données
      if (updatedRefineries.length > 0) {
        setRefineries(updatedRefineries);
        saveRefineriesToStorage(updatedRefineries);
      } else {
        console.error('Erreur: la mise à jour a résulté en un tableau vide');
        return; // Ne pas continuer si nous n'avons pas de données
      }
      
      // Essayer de mettre à jour dans le backend
      try {
        const backendRefinery = frontendToBackendFormat(updatedRefinery);
        console.log('Données converties pour le backend:', backendRefinery);
        
        const response = await fetch(`${API_URL}${updatedRefinery.id}/`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify(backendRefinery),
        });
        
        if (!response.ok) {
          console.error('Erreur lors de la mise à jour dans le backend:', await response.text());
          return;
        }
        
        const updatedBackendRefinery = await response.json();
        console.log('Raffinerie mise à jour avec succès dans le backend:', updatedBackendRefinery);
        
        // Ne pas recharger les données depuis le backend pour éviter de perdre l'état local
        // await fetchRefineries();
      } catch (backendErr) {
        console.error('Erreur lors de la mise à jour dans le backend, mais les données locales ont été mises à jour:', backendErr);
      }
    } catch (err) {
      console.error('Erreur lors de la mise à jour d\'une raffinerie:', err);
      setError('Impossible de mettre à jour la raffinerie');
    }
  };
  
  // Supprimer une raffinerie
  const deleteRefinery = async (id) => {
    try {
      console.log('Suppression de la raffinerie avec l\'ID:', id);
      
      // Créer une copie de l'état actuel
      const currentRefineries = [...refineries];
      
      // Mettre à jour l'état local d'abord pour une meilleure réactivité
      const updatedRefineries = currentRefineries.filter(refinery => refinery.id !== id);
      
      // Vérifier que nous n'avons pas supprimé toutes les raffineries par erreur
      console.log('Nombre de raffineries après suppression:', updatedRefineries.length);
      
      // Mettre à jour l'état et le stockage local
      setRefineries(updatedRefineries);
      saveRefineriesToStorage(updatedRefineries);
      
      // Essayer de supprimer du backend
      try {
        const response = await fetch(`${API_URL}${id}/`, {
          method: 'DELETE',
          headers: {
            'Accept': 'application/json'
          }
        });
        
        if (!response.ok && response.status !== 404) {
          console.error('Erreur lors de la suppression dans le backend:', await response.text());
          return;
        }
        
        console.log('Raffinerie supprimée avec succès du backend');
      } catch (backendErr) {
        console.error('Erreur lors de la suppression dans le backend, mais les données locales ont été mises à jour:', backendErr);
      }
    } catch (err) {
      console.error('Erreur lors de la suppression d\'une raffinerie:', err);
      setError('Impossible de supprimer la raffinerie');
    }
  };

  // Fonction pour obtenir une raffinerie par son ID
  const getRefineryById = (id) => {
    return refineries.find(refinery => refinery.id === parseInt(id, 10));
  };

  // Fonction pour recharger les données depuis le backend
  const refreshData = () => {
    return fetchRefineries();
  };

  // Fonction pour initialiser les données dans le backend
  const initializeBackendData = async () => {
    try {
      console.log('Tentative d\'initialisation des données dans le backend...');
      
      // Vérifier si des données existent déjà dans le backend
      const response = await fetch(API_URL);
      
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }
      
      const data = await response.json();
      
      // S'assurer que les données sont un tableau
      const dataArray = Array.isArray(data) ? data : [];
      
      // Si le backend n'a pas de données, initialiser avec les données locales
      if (dataArray.length === 0 && initialData && initialData.refineries && initialData.refineries.length > 0) {
        console.log('Initialisation des données dans le backend avec les données initiales...');
        
        // Convertir les données au format backend
        const backendRefineries = frontendToBackendFormat(initialData.refineries);
        console.log('Données converties au format backend:', backendRefineries);
        
        const successfullyAdded = [];
        
        // Ajouter chaque raffinerie au backend
        for (const refinery of backendRefineries) {
          try {
            const postResponse = await fetch(API_URL, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify(refinery),
            });
            
            if (!postResponse.ok) {
              console.error(`Erreur lors de l'ajout de la raffinerie ${refinery.name}:`, await postResponse.text());
              continue;
            }
            
            const addedRefinery = await postResponse.json();
            console.log(`Raffinerie ${refinery.name} ajoutée avec succès:`, addedRefinery);
            successfullyAdded.push(addedRefinery);
          } catch (postErr) {
            console.error(`Erreur lors de l'ajout de la raffinerie ${refinery.name}:`, postErr);
          }
        }
        
        console.log(`${successfullyAdded.length}/${backendRefineries.length} raffineries initialisées dans le backend avec succès`);
        
        if (successfullyAdded.length > 0) {
          // Recharger les données depuis le backend
          return await fetchRefineries();
        } else {
          // Si aucune raffinerie n'a été ajoutée avec succès, utiliser les données initiales
          console.log('Aucune raffinerie n\'a pu être ajoutée au backend, utilisation des données initiales');
          const formattedData = initialData.refineries;
          setRefineries(formattedData);
          saveRefineriesToStorage(formattedData);
          return formattedData;
        }
      }
      
      const formattedData = backendToFrontendFormat(dataArray);
      setRefineries(formattedData);
      saveRefineriesToStorage(formattedData);
      return formattedData;
    } catch (err) {
      console.error('Erreur lors de l\'initialisation des données dans le backend:', err);
      
      // En cas d'erreur, utiliser les données initiales
      if (initialData && initialData.refineries && initialData.refineries.length > 0) {
        console.log('Utilisation des données initiales suite à une erreur d\'initialisation');
        const formattedData = initialData.refineries;
        setRefineries(formattedData);
        saveRefineriesToStorage(formattedData);
        return formattedData;
      }
      
      return [];
    }
  };

  // Valeur du contexte à exposer
  const contextValue = {
    refineries,
    loading,
    error,
    addRefinery,
    updateRefinery,
    deleteRefinery,
    getRefineryById,
    refreshData,
    initializeBackendData
  };

  return (
    <RefineryContext.Provider value={contextValue}>
      {children}
    </RefineryContext.Provider>
  );
};

export default RefineryProvider;