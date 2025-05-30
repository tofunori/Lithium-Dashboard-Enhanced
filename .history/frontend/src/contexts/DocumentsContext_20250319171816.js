import React, { createContext, useState, useContext, useEffect } from 'react';
import { reportsData as initialReportsData } from '../data/reportsData';

// Création du contexte
export const DocumentsContext = createContext();

// Hook personnalisé pour utiliser le contexte
export const useDocuments = () => useContext(DocumentsContext);

// Provider du contexte
export const DocumentsProvider = ({ children }) => {
  // État pour stocker les données des rapports
  const [reportsData, setReportsData] = useState(initialReportsData);
  
  // Fonction pour ajouter un document uploadé
  const addDocument = (document, file, fileUrl) => {
    // Utiliser l'URL Supabase si disponible, sinon créer une URL temporaire
    const documentUrl = fileUrl || URL.createObjectURL(file);
    
    // ID unique pour le document
    const docId = new Date().getTime().toString();
    
    // Préparer le nouveau document avec une URL
    const newDocument = {
      ...document,
      id: docId,
      url: documentUrl,
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
    
    // Sauvegarder dans le localStorage pour persister entre les sessions
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
    } catch (error) {
      console.error('Erreur lors de la sauvegarde du document:', error);
    }
    
    return newDocument;
  };
  
  // Valeur du contexte
  const value = {
    reportsData,
    addDocument
  };
  
  return (
    <DocumentsContext.Provider value={value}>
      {children}
    </DocumentsContext.Provider>
  );
};

export default DocumentsProvider; 