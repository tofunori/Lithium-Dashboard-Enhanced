import React, { createContext, useState, useContext, useEffect, useRef } from 'react';
import { reportsData as initialReportsData } from '../data/reportsData';
import { supabase } from '../supabase';
import { useAuth } from './AuthContext';
// Import Firebase si disponible
let deleteObject, ref;
try {
  const firebaseStorage = require('firebase/storage');
  deleteObject = firebaseStorage.deleteObject;
  ref = firebaseStorage.ref;
} catch (error) {
  console.warn('Firebase storage non disponible:', error);
}

// Import Storage (si disponible)
let storage;
try {
  const firebase = require('../firebase');
  storage = firebase.storage;
} catch (error) {
  console.warn('Module firebase non disponible:', error);
}

// Création du contexte
export const DocumentsContext = createContext();

// Hook personnalisé pour utiliser le contexte
export const useDocuments = () => useContext(DocumentsContext);

// Provider du contexte
export const DocumentsProvider = ({ children }) => {
  // État pour stocker les données des rapports
  const [reportsData, setReportsData] = useState(initialReportsData);
  const { userId, isAuthenticated } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 3;
  const loadingRef = useRef(false);
  
  // Fonction pour supprimer tous les rapports par défaut
  const clearAllReports = () => {
    // Créer un nouvel objet de données avec des listes vides
    const emptyReportsData = {
      general_reports: [],
      foundry_reports: {
        // Conserver la structure des fonderies mais avec des tableaux vides
        "1": [],
        "2": [],
        "3": [],
        "5": [],
        "15": [],
        "17": []
      },
      // Conserver les couleurs de statut
      status_colors: initialReportsData.status_colors
    };
    
    // Mettre à jour l'état
    setReportsData(emptyReportsData);
    
    // Sauvegarder cette configuration vide dans localStorage pour persistance
    try {
      localStorage.setItem('reports_initialized', 'true');
      console.log('Tous les rapports par défaut ont été supprimés');
    } catch (error) {
      console.error('Erreur lors de la sauvegarde de l\'état:', error);
    }
  };
  
  // Fonction pour charger tous les documents publics
  const loadPublicDocuments = async (forceReload = false) => {
    // Éviter les appels multiples simultanés
    if (loadingRef.current && !forceReload) {
      console.log('Chargement déjà en cours, abandon...');
      return;
    }
    
    // Si on a déjà essayé plusieurs fois, utiliser les données en cache si disponibles
    if (retryCount >= maxRetries && reportsData.general_reports.length > 0) {
      console.log(`Nombre maximum de tentatives (${maxRetries}) atteint, utilisation du cache`);
      setIsLoading(false);
      return;
    }
    
    try {
      loadingRef.current = true;
      setIsLoading(true);
      setLoadError(null);
      console.log('Chargement des documents publics... Tentative', retryCount + 1);
      
      // Structure de données vide
      const emptyReportsData = {
        general_reports: [],
        foundry_reports: {
          "1": [],
          "2": [],
          "3": [],
          "5": [],
          "15": [],
          "17": []
        },
        status_colors: initialReportsData.status_colors
      };
      
      // Charger les documents depuis Supabase avec un timeout
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout dépassé')), 8000)
      );
      
      const fetchPromise = supabase
        .from('documents')
        .select('*')
        .order('upload_date', { ascending: false });
      
      // Utiliser Promise.race pour limiter le temps d'attente
      const { data: documents, error } = await Promise.race([
        fetchPromise,
        timeoutPromise.then(() => ({ data: null, error: new Error('Timeout') }))
      ]);
      
      if (error) {
        throw error;
      }
      
      console.log('Documents publics chargés:', documents?.length || 0);
      
      if (documents && documents.length > 0) {
        // Préparer une copie des données vides
        const newData = JSON.parse(JSON.stringify(emptyReportsData));
        
        // Ajouter les documents à leurs collections respectives
        documents.forEach(doc => {
          try {
            // S'assurer que upload_date est défini, sinon utiliser la date actuelle
            const uploadDate = doc.upload_date || new Date().toISOString();
            
            // Convertir le format de Supabase vers notre format interne
            const document = {
              id: doc.id,
              title: doc.title || 'Sans titre',
              author: doc.author || 'Anonyme',
              type: doc.type || 'report', // Valeur par défaut si manquante
              format: doc.format || 'pdf', // Valeur par défaut si manquante
              description: doc.description || '',
              foundryId: doc.foundry_id,
              url: doc.url || '#',
              supabasePath: doc.supabase_path,
              thumbnail: doc.thumbnail || '/images/file-icon.png',
              uploadDate: uploadDate,
              date: uploadDate // Ajout critique: date est utilisée pour le filtrage
            };
            
            if (document.foundryId && newData.foundry_reports[document.foundryId]) {
              newData.foundry_reports[document.foundryId].unshift(document);
            } else {
              newData.general_reports.unshift(document);
            }
          } catch (docError) {
            console.error('Erreur lors du traitement d\'un document:', docError);
            // Continuer avec le document suivant
          }
        });
        
        // Mettre à jour les données avec les documents de Supabase
        setReportsData(newData);
        setRetryCount(0); // Réinitialiser le compteur de tentatives
      } else if (documents && documents.length === 0) {
        // Si la requête réussit mais ne renvoie aucun document
        console.log('Aucun document trouvé dans la base de données');
        setReportsData(emptyReportsData);
        setRetryCount(0); // Réinitialiser le compteur de tentatives
      }
    } catch (error) {
      console.error('Erreur lors du chargement des documents publics:', error);
      setLoadError(error.message || 'Erreur de chargement');
      
      // Incrémenter le compteur de tentatives
      setRetryCount(prev => prev + 1);
      
      // Si nous n'avons pas atteint le nombre maximum de tentatives, réessayer après un délai
      if (retryCount < maxRetries - 1) {
        console.log(`Nouvelle tentative dans 3 secondes (${retryCount + 1}/${maxRetries})...`);
        setTimeout(() => {
          loadingRef.current = false;
          loadPublicDocuments(true);
        }, 3000);
      } else {
        console.log('Nombre maximum de tentatives atteint, abandon.');
      }
    } finally {
      if (retryCount >= maxRetries - 1 || !loadError) {
        setIsLoading(false);
      }
      loadingRef.current = false;
    }
  };
  
  // Charger les documents depuis Supabase Database
  useEffect(() => {
    // Charger tous les documents publics par défaut
    loadPublicDocuments();
    
    // Nettoyage
    return () => {
      loadingRef.current = false;
    };
  }, []);
  
  // Fonction pour ajouter un document uploadé
  const addDocument = async (document, file, fileUrl) => {
    try {
      // Vérifier que l'utilisateur est authentifié
      if (!isAuthenticated || !userId) {
        throw new Error("Vous devez être connecté pour ajouter un document");
      }
      
      // ID unique pour le document
      const docId = new Date().getTime().toString();
      
      // Créer les données du document à insérer dans Supabase
      const documentData = {
        title: document.title,
        author: document.author,
        type: document.type,
        format: document.format,
        description: document.description,
        foundry_id: document.foundryId,
        url: fileUrl,
        supabase_path: document.supabasePath,
        thumbnail: document.format === 'pdf' 
          ? '/images/pdf-icon.png' 
          : (file.type.startsWith('image/') ? fileUrl : '/images/file-icon.png'),
        user_id: userId,
        upload_date: new Date().toISOString()
      };
      
      // Insérer dans Supabase
      const { data: insertedDoc, error } = await supabase
        .from('documents')
        .insert(documentData)
        .select()
        .single();
      
      if (error) {
        throw error;
      }
      
      console.log('Document ajouté à Supabase:', insertedDoc);
      
      // Préparer le nouveau document pour l'état local
      const newDocument = {
        id: insertedDoc.id,
        title: insertedDoc.title,
        author: insertedDoc.author,
        type: insertedDoc.type,
        format: insertedDoc.format,
        description: insertedDoc.description,
        foundryId: insertedDoc.foundry_id,
        url: insertedDoc.url,
        supabasePath: insertedDoc.supabase_path,
        thumbnail: insertedDoc.thumbnail,
        uploadDate: insertedDoc.upload_date,
        date: insertedDoc.upload_date // Ajout important: ajouter également date ici
      };
      
      // Si le document est associé à une fonderie
      if (document.foundryId) {
        setReportsData(prevData => {
          // Copie profonde des données
          const newData = JSON.parse(JSON.stringify(prevData));
          
          // Vérifier si la fonderie existe dans les rapports
          if (!newData.foundry_reports[document.foundryId]) {
            newData.foundry_reports[document.foundryId] = [];
          }
          
          // Ajouter le document à la fonderie
          newData.foundry_reports[document.foundryId].unshift(newDocument);
          
          return newData;
        });
      } else {
        // Ajouter aux rapports généraux
        setReportsData(prevData => {
          const newData = JSON.parse(JSON.stringify(prevData));
          newData.general_reports.unshift(newDocument);
          return newData;
        });
      }
      
      return newDocument;
    } catch (error) {
      console.error('Erreur lors de l\'ajout du document:', error);
      throw error;
    }
  };
  
  // Fonction pour supprimer un document
  const removeDocument = async (documentId, foundryId, supabasePath) => {
    try {
      // Vérifier que l'utilisateur est authentifié
      if (!isAuthenticated || !userId) {
        throw new Error("Vous devez être connecté pour supprimer un document");
      }
      
      let docToRemove = null;
      
      // Trouver d'abord le document pour récupérer son chemin Supabase si nécessaire
      if (foundryId && reportsData.foundry_reports[foundryId]) {
        docToRemove = reportsData.foundry_reports[foundryId].find(doc => doc.id === documentId);
      } else {
        docToRemove = reportsData.general_reports.find(doc => doc.id === documentId);
        
        // Si non trouvé, chercher dans toutes les fonderies
        if (!docToRemove) {
          for (const fId of Object.keys(reportsData.foundry_reports)) {
            const foundDoc = reportsData.foundry_reports[fId].find(doc => doc.id === documentId);
            if (foundDoc) {
              docToRemove = foundDoc;
              foundryId = fId;
              break;
            }
          }
        }
      }
      
      // Si le document a un chemin Supabase, l'utiliser pour la suppression
      if (docToRemove && docToRemove.supabasePath) {
        supabasePath = docToRemove.supabasePath;
      }
      
      // Supprimer de Supabase Database
      const { error: dbError } = await supabase
        .from('documents')
        .delete()
        .eq('id', documentId);
      
      if (dbError) {
        console.error('Erreur lors de la suppression du document de la base de données:', dbError);
      }
      
      // Supprimer de Supabase Storage si le chemin est fourni
      if (supabasePath) {
        const { error } = await supabase.storage
          .from('documents2')
          .remove([supabasePath]);
          
        if (error) {
          console.error('Erreur lors de la suppression du fichier de Supabase:', error);
        } else {
          console.log('Document supprimé de Supabase Storage:', supabasePath);
        }
      }
      
      // Supprimer le document des données locales
      setReportsData(prevData => {
        // Copie profonde des données
        const newData = JSON.parse(JSON.stringify(prevData));
        
        // Si l'ID de fonderie est fourni, supprimer du tableau approprié
        if (foundryId && newData.foundry_reports[foundryId]) {
          newData.foundry_reports[foundryId] = newData.foundry_reports[foundryId].filter(
            doc => doc.id !== documentId
          );
        } else {
          // Vérifier dans les rapports généraux
          newData.general_reports = newData.general_reports.filter(
            doc => doc.id !== documentId
          );
          
          // Et aussi vérifier dans tous les rapports de fonderie au cas où
          Object.keys(newData.foundry_reports).forEach(fId => {
            newData.foundry_reports[fId] = newData.foundry_reports[fId].filter(
              doc => doc.id !== documentId
            );
          });
        }
        
        return newData;
      });
      
      return true;
    } catch (error) {
      console.error('Erreur lors de la suppression du document:', error);
      throw error;
    }
  };
  
  return (
    <DocumentsContext.Provider value={{
      reportsData,
      addDocument,
      removeDocument,
      clearAllReports,
      loadPublicDocuments,
      isLoading,
      loadError
    }}>
      {children}
    </DocumentsContext.Provider>
  );
};

export default DocumentsProvider; 