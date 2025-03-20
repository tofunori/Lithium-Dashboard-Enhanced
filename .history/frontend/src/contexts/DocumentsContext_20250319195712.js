import React, { createContext, useState, useContext, useEffect } from 'react';
import { reportsData as initialReportsData } from '../data/reportsData';
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
  
  // Charger les documents sauvegardés au démarrage
  useEffect(() => {
    try {
      // Récupérer les documents sauvegardés dans localStorage
      const savedDocs = JSON.parse(localStorage.getItem('uploaded_documents') || '[]');
      
      if (savedDocs.length > 0) {
        console.log('Documents chargés depuis localStorage:', savedDocs.length);
        
        // Préparer une copie des données
        const newData = JSON.parse(JSON.stringify(reportsData));
        
        // Ajouter chaque document sauvegardé à sa collection
        savedDocs.forEach(item => {
          const document = item.document;
          
          // Vérifier si l'URL est une URL Firebase valide
          const isValidUrl = typeof document.url === 'string' && 
            (document.url.startsWith('https://firebasestorage.googleapis.com') || 
             document.url.startsWith('http'));
          
          if (isValidUrl) {
            if (document.foundryId && newData.foundry_reports[document.foundryId]) {
              // Vérifier si le document existe déjà (éviter les doublons)
              const exists = newData.foundry_reports[document.foundryId]
                .some(doc => doc.id === document.id);
              
              if (!exists) {
                newData.foundry_reports[document.foundryId].unshift(document);
              }
            } else {
              // Vérifier si le document existe déjà dans les rapports généraux
              const exists = newData.general_reports
                .some(doc => doc.id === document.id);
              
              if (!exists) {
                newData.general_reports.unshift(document);
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
    // Utiliser l'URL Supabase si disponible, sinon créer une URL temporaire
    const documentUrl = fileUrl || URL.createObjectURL(file);
    
    // ID unique pour le document
    const docId = new Date().getTime().toString();
    
    // Vérifier si l'URL est permanente (Firebase)
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
    
    // Sauvegarder dans le localStorage uniquement si c'est un document permanent
    if (isPermanentStorage) {
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
  const removeDocument = async (documentId, foundryId, firebaseFilePath) => {
    // Supprimer de Firebase Storage si le chemin est fourni
    if (firebaseFilePath && storage && deleteObject && ref) {
      try {
        // Créer une référence vers le fichier dans Firebase Storage
        const fileRef = ref(storage, firebaseFilePath);
        // Supprimer le fichier
        await deleteObject(fileRef);
        console.log('Document supprimé de Firebase Storage:', firebaseFilePath);
      } catch (error) {
        console.error('Erreur lors de la suppression du fichier de Firebase:', error);
        // Continuer quand même pour supprimer la référence locale
      }
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
    
    // Mettre à jour le localStorage
    try {
      // Récupérer les documents existants
      const existingDocs = JSON.parse(localStorage.getItem('uploaded_documents') || '[]');
      
      // Filtrer pour retirer le document supprimé
      const updatedDocs = existingDocs.filter(item => item.document.id !== documentId);
      
      // Sauvegarder la liste mise à jour
      localStorage.setItem('uploaded_documents', JSON.stringify(updatedDocs));
    } catch (error) {
      console.error('Erreur lors de la mise à jour du localStorage:', error);
    }
    
    return true;
  };
  
  // Valeur du contexte
  const value = {
    reportsData,
    addDocument,
    removeDocument
  };
  
  return (
    <DocumentsContext.Provider value={value}>
      {children}
    </DocumentsContext.Provider>
  );
};

export default DocumentsProvider; 