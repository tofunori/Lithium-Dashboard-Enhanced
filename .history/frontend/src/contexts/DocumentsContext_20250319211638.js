import React, { createContext, useState, useContext, useEffect } from 'react';
import { reportsData as initialReportsData } from '../data/reportsData';
import { supabase } from '../supabase';
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
  
  // Charger les documents sauvegardés au démarrage
  useEffect(() => {
    try {
      // Vérifier si on a déjà initialisé avec les rapports vides
      const isInitialized = localStorage.getItem('reports_initialized') === 'true';
      
      if (isInitialized) {
        // Si déjà initialisé, utiliser des listes vides
        clearAllReports();
      }
      
      // Récupérer les documents sauvegardés dans localStorage
      const savedDocs = JSON.parse(localStorage.getItem('uploaded_documents') || '[]');
      
      if (savedDocs.length > 0) {
        console.log('Documents chargés depuis localStorage:', savedDocs.length);
        
        // Préparer une copie des données
        const newData = JSON.parse(JSON.stringify(reportsData));
        
        // Ajouter chaque document sauvegardé à sa collection
        savedDocs.forEach(item => {
          const document = item.document;
          
          // Vérifier si l'URL est Firebase ou locale - dans le mode local avec persistance, on accepte tous les types d'URL
          const isValidUrl = typeof document.url === 'string';
          
          if (isValidUrl) {
            // Créer une nouvelle URL pour les URLs locales blob:
            let docUrl = document.url;
            if (document.url.startsWith('blob:')) {
              // Pour les URLs blob expirées, on peut juste générer une URL fictive
              // car nous stockons les données en local, pas les fichiers eux-mêmes
              docUrl = `/document-${document.id}.${document.format || 'pdf'}`;
            }
            
            // Document mis à jour avec URL corrigée
            const updatedDoc = {
              ...document,
              url: docUrl
            };
            
            if (document.foundryId && newData.foundry_reports[document.foundryId]) {
              // Vérifier si le document existe déjà (éviter les doublons)
              const exists = newData.foundry_reports[document.foundryId]
                .some(doc => doc.id === document.id);
              
              if (!exists) {
                newData.foundry_reports[document.foundryId].unshift(updatedDoc);
              }
            } else {
              // Vérifier si le document existe déjà dans les rapports généraux
              const exists = newData.general_reports
                .some(doc => doc.id === document.id);
              
              if (!exists) {
                newData.general_reports.unshift(updatedDoc);
              }
            }
          } else {
            console.warn('URL non valide trouvée pour document:', document.title);
          }
        });
        
        // Mettre à jour les données
        setReportsData(newData);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des documents:', error);
    }
  }, []);
  
  // Fonction pour ajouter un document uploadé
  const addDocument = (document, file, fileUrl) => {
    // Utiliser l'URL fournie ou créer une URL temporaire
    const documentUrl = fileUrl || URL.createObjectURL(file);
    
    // ID unique pour le document
    const docId = new Date().getTime().toString();
    
    // Vérifier si le document doit être stocké de façon permanente
    // Soit explicitement demandé soit c'est une URL Firebase
    const isPermanentStorage = document.isPermanentStorage || 
      (typeof documentUrl === 'string' && documentUrl.startsWith('https://firebasestorage.googleapis.com'));
    
    // Préparer le nouveau document avec une URL
    const newDocument = {
      ...document,
      id: docId,
      url: documentUrl,
      isPermanentStorage: isPermanentStorage,
      thumbnail: document.format === 'pdf' 
        ? '/images/pdf-icon.png' 
        : (file.type.startsWith('image/') ? documentUrl : '/images/file-icon.png')
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
    
    // Toujours sauvegarder dans localStorage si marqué comme permanent ou si explicitement demandé
    if (isPermanentStorage || document.isPermanentStorage) {
      try {
        // Récupérer les documents existants
        const existingDocs = JSON.parse(localStorage.getItem('uploaded_documents') || '[]');
        
        // Ajouter le nouveau document
        existingDocs.push({
          timestamp: new Date().toISOString(),
          document: newDocument
        });
        
        // Sauvegarder la liste mise à jour
        localStorage.setItem('uploaded_documents', JSON.stringify(existingDocs));
        console.log('Document sauvegardé dans localStorage pour persistance');
      } catch (error) {
        console.error('Erreur lors de la sauvegarde du document:', error);
      }
    } else {
      console.log('Document temporaire non sauvegardé dans localStorage');
    }
    
    return newDocument;
  };
  
  // Fonction pour supprimer un document
  const removeDocument = async (documentId, foundryId, supabasePath) => {
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
    
    // Supprimer de Supabase Storage si le chemin est fourni
    if (supabasePath) {
      try {
        const { error } = await supabase.storage
          .from('documents')
          .remove([supabasePath]);
          
        if (error) {
          console.error('Erreur lors de la suppression du fichier de Supabase:', error);
        } else {
          console.log('Document supprimé de Supabase Storage:', supabasePath);
        }
      } catch (error) {
        console.error('Erreur lors de la suppression du fichier de Supabase:', error);
        // Continuer quand même pour supprimer la référence locale
      }
    }
    
    // Mise à jour du localStorage après suppression
    try {
      // Récupérer les documents sauvegardés
      const savedDocs = JSON.parse(localStorage.getItem('uploaded_documents') || '[]');
      // Filtrer pour enlever le document supprimé
      const updatedDocs = savedDocs.filter(item => item.document.id !== documentId);
      // Sauvegarder la liste mise à jour
      localStorage.setItem('uploaded_documents', JSON.stringify(updatedDocs));
    } catch (error) {
      console.error('Erreur lors de la mise à jour du localStorage:', error);
    }
    
    // Supprimer le document des données
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
  };
  
  // Valeur du contexte
  const value = {
    reportsData,
    addDocument,
    removeDocument,
    clearAllReports
  };
  
  return (
    <DocumentsContext.Provider value={value}>
      {children}
    </DocumentsContext.Provider>
  );
};

export default DocumentsProvider; 