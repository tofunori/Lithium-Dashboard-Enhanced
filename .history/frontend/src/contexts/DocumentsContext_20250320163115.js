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
  const documentsLoadedRef = useRef(false); // pour suivre si les documents ont déjà été chargés avec succès
  
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
    // Si les documents sont déjà chargés et qu'on ne force pas le rechargement, ne rien faire
    if (documentsLoadedRef.current && !forceReload) {
      console.log('Documents déjà chargés, utilisation du cache');
      setIsLoading(false);
      return;
    }
    
    // Éviter les appels multiples simultanés
    if (loadingRef.current && !forceReload) {
      console.log('Chargement déjà en cours, abandon...');
      return;
    }
    
    // Si on a déjà essayé plusieurs fois, utiliser les données initiales pour éviter le blocage
    if (retryCount >= maxRetries) {
      console.log(`Nombre maximum de tentatives (${maxRetries}) atteint, utilisation des données par défaut`);
      // Utiliser reportsData (qui contient soit des données chargées soit initialReportsData)
      setIsLoading(false);
      return;
    }
    
    try {
      loadingRef.current = true;
      setIsLoading(true);
      setLoadError(null);
      console.log('Chargement des documents publics... Tentative', retryCount + 1);
      
      // Essayer d'utiliser des données en cache du localStorage si disponibles
      try {
        const cachedData = localStorage.getItem('cached_documents');
        if (cachedData && !forceReload) {
          const parsedData = JSON.parse(cachedData);
          const cacheTime = parsedData.timestamp || 0;
          const currentTime = Date.now();
          const cacheAge = currentTime - cacheTime;
          
          // Si le cache a moins de 30 minutes, l'utiliser
          if (cacheAge < 30 * 60 * 1000) {
            console.log('Utilisation des données en cache (moins de 30 minutes)');
            setReportsData(parsedData.data);
            setIsLoading(false);
            loadingRef.current = false;
            documentsLoadedRef.current = true;
            return;
          }
        }
      } catch (cacheError) {
        console.warn('Erreur lors de la lecture du cache:', cacheError);
        // Continuer normalement si le cache échoue
      }
      
      // Charger les documents depuis Supabase avec un timeout plus long
      const { data: documents, error } = await Promise.race([
        supabase
          .from('documents')
          .select('*')
          .order('upload_date', { ascending: false }),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout dépassé')), 15000)
        )
      ]);
      
      if (error) {
        throw error;
      }
      
      console.log('Documents publics chargés:', documents?.length || 0);
      
      // Structure de données vide (en dehors du try pour que finally puisse y accéder)
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
      
      // Préparer une copie des données vides
      const newData = JSON.parse(JSON.stringify(emptyReportsData));
      
      if (documents && documents.length > 0) {
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
              type: doc.type || 'report',
              format: doc.format || 'pdf',
              description: doc.description || '',
              foundryId: doc.foundry_id,
              url: doc.url || '#',
              supabasePath: doc.supabase_path,
              thumbnail: doc.thumbnail || '/images/file-icon.png',
              uploadDate: uploadDate,
              date: uploadDate
            };
            
            if (document.foundryId && newData.foundry_reports[document.foundryId]) {
              newData.foundry_reports[document.foundryId].unshift(document);
            } else {
              newData.general_reports.unshift(document);
            }
          } catch (docError) {
            console.error('Erreur lors du traitement d\'un document:', docError);
          }
        });
      }
      
      // Mettre à jour les données avec les documents de Supabase
      setReportsData(newData);
      
      // Sauvegarder dans le cache local
      try {
        const cacheData = {
          data: newData,
          timestamp: Date.now()
        };
        localStorage.setItem('cached_documents', JSON.stringify(cacheData));
      } catch (cacheError) {
        console.warn('Erreur lors de la sauvegarde du cache:', cacheError);
      }
      
      // Marquer comme chargé avec succès
      documentsLoadedRef.current = true;
      setRetryCount(0);
    } catch (error) {
      console.error('Erreur lors du chargement des documents publics:', error);
      setLoadError(error.message || 'Erreur de chargement');
      
      // Incrémenter le compteur de tentatives
      setRetryCount(prev => prev + 1);
      
      // Si nous n'avons pas atteint le nombre maximum de tentatives, réessayer après un délai
      if (retryCount < maxRetries - 1) {
        console.log(`Nouvelle tentative dans 5 secondes (${retryCount + 1}/${maxRetries})...`);
        setTimeout(() => {
          loadingRef.current = false;
          loadPublicDocuments(true);
        }, 5000);
      } else {
        console.log('Nombre maximum de tentatives atteint, utilisation des données par défaut.');
        // Utiliser les données initiales si disponibles
        documentsLoadedRef.current = true;
      }
    } finally {
      // Toujours finir par désactiver le chargement après le temps maximum
      setTimeout(() => {
        setIsLoading(false);
        loadingRef.current = false;
      }, 1000); // Délai court pour permettre au rendu de se stabiliser
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
  const addDocument = async (document, file = null) => {
    try {
      // S'assurer que le type et le format sont définis avec des valeurs par défaut si nécessaire
      const documentType = document.type || 'report';
      let documentFormat = document.format || 'external_link';
      
      // Vérifier si nous avons un chemin Supabase qui indique un fichier PDF
      if (document.supabasePath) {
        const isPdfPath = document.supabasePath.toLowerCase().includes('pdf');
        if (isPdfPath) {
          documentFormat = 'pdf';
          console.log("Format défini sur PDF car le document a un chemin Supabase PDF");
        }
      }
      
      // Vérifier si l'URL se termine par .pdf
      if (document.url && document.url.toLowerCase().endsWith('.pdf')) {
        documentFormat = 'pdf';
        console.log("Format défini sur PDF car l'URL se termine par .pdf");
      }
      
      // Si le supabasePath est fourni, c'est un document stocké dans Supabase
      if (document.supabasePath) {
        documentFormat = 'pdf';
        console.log("Document avec chemin Supabase détecté, format défini comme PDF");
      }
      
      // Intégrer la vérification du nom de fichier pour les fichiers uploadés
      if (file && file.name && file.name.toLowerCase().endsWith('.pdf')) {
        documentFormat = 'pdf';
        console.log("Format défini sur PDF car le fichier a une extension .pdf");
      }
      
      // Préparer les données du document
      const documentData = {
        id: document.id || Date.now().toString(),
        title: document.title,
        author: document.author || "Auteur non spécifié",
        type: documentType,
        format: documentFormat,
        description: document.description || "",
        date: document.date || new Date().toISOString(),
        url: document.url || "",
        supabasePath: document.supabasePath || null,
        foundryId: document.foundryId || null,
        createdAt: document.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      // Log pour débogage
      console.log("Données du document à insérer:", documentData);
      
      // Création ou mise à jour du document dans Supabase
      const { data: insertedDoc, error: insertError } = await supabase
        .from('documents')
        .upsert(documentData)
        .select();
      
      if (insertError) {
        console.error("Erreur lors de l'insertion du document:", insertError);
        throw new Error(`Erreur de base de données: ${insertError.message}`);
      }
      
      console.log('Document ajouté à Supabase:', insertedDoc);
      
      // Si c'est un document avec un fichier, effectuer l'upload du fichier
      if (file) {
        try {
          // Générer un nom de fichier sécurisé
          const timestamp = Date.now();
          const fileExtension = file.name.split('.').pop().toLowerCase();
          const safeTitle = documentData.title.replace(/[^a-z0-9]/gi, '_').toLowerCase();
          const fileName = `${timestamp}_${safeTitle}.${fileExtension}`;
          
          // Chemin de stockage dans le bucket
          const filePath = `documents/${fileName}`;
          
          // Upload du fichier
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('documents2')
            .upload(filePath, file, {
              cacheControl: '3600',
              upsert: true
            });
          
          if (uploadError) {
            throw new Error(`Erreur lors de l'upload: ${uploadError.message}`);
          }
          
          // Récupérer l'URL publique du fichier
          const { data: urlData } = await supabase.storage
            .from('documents2')
            .getPublicUrl(filePath);
          
          const publicUrl = urlData?.publicUrl;
          
          if (!publicUrl) {
            throw new Error("Impossible d'obtenir l'URL publique du fichier");
          }
          
          // Mettre à jour le document avec l'URL et le chemin du fichier
          const { data: updatedDoc, error: updateError } = await supabase
            .from('documents')
            .update({
              url: publicUrl,
              supabasePath: filePath,
              format: fileExtension === 'pdf' ? 'pdf' : documentFormat
            })
            .eq('id', documentData.id)
            .select();
          
          if (updateError) {
            throw new Error(`Erreur lors de la mise à jour du document: ${updateError.message}`);
          }
          
          // Mettre à jour l'objet documentData pour le retour
          documentData.url = publicUrl;
          documentData.supabasePath = filePath;
          
          // Si c'est un PDF, forcer le format à 'pdf'
          if (fileExtension === 'pdf') {
            documentData.format = 'pdf';
          }
        } catch (fileError) {
          console.error("Erreur lors de la gestion du fichier:", fileError);
          // Ne pas propager l'erreur, le document est déjà créé
        }
      }
      
      // Mettre à jour le state en ajoutant le nouveau document
      setReportsData(prevData => {
        const newData = { ...prevData };
        
        if (documentData.foundryId) {
          // Ajouter aux rapports de la fonderie
          if (!newData.foundry_reports[documentData.foundryId]) {
            newData.foundry_reports[documentData.foundryId] = [];
          }
          newData.foundry_reports[documentData.foundryId] = [
            ...newData.foundry_reports[documentData.foundryId],
            documentData
          ];
        } else {
          // Ajouter aux rapports généraux
          newData.general_reports = [...newData.general_reports, documentData];
        }
        
        return newData;
      });
      
      return documentData;
    } catch (error) {
      console.error("Erreur lors de l'ajout du document:", error);
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