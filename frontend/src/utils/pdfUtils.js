// Utilitaires pour la gestion des PDF
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { supabase } from '../supabase';

// État du formulaire de conversion web vers PDF
export const webToPdfForm = {
  title: '',
  url: '',
  description: '',
  author: 'Capture Web'
};

// État de traitement
let processingWebToPdf = false;
let openWebToPdfDialog = false;

// Getters et setters pour l'état
export const setProcessingWebToPdf = (value) => {
  processingWebToPdf = value;
};

export const isProcessingWebToPdf = () => {
  return processingWebToPdf;
};

export const setWebToPdfForm = (formData) => {
  Object.assign(webToPdfForm, formData);
};

export const resetWebToPdfForm = () => {
  webToPdfForm.title = '';
  webToPdfForm.url = '';
  webToPdfForm.description = '';
  webToPdfForm.author = 'Capture Web';
};

export const setOpenWebToPdfDialog = (isOpen) => {
  openWebToPdfDialog = isOpen;
};

export const isOpenWebToPdfDialog = () => {
  return openWebToPdfDialog;
};

/**
 * Télécharge un PDF à partir d'une URL et le stocke dans Supabase
 * @param {string} pdfUrl - URL du PDF à télécharger
 * @param {string} title - Titre à donner au fichier PDF
 * @returns {Promise<{url: string, path: string}>}
 */
export const downloadPdfFromUrl = async (pdfUrl, title) => {
  try {
    console.log("Téléchargement du PDF depuis:", pdfUrl);
    
    // Liste de proxies CORS pour contourner les restrictions
    const corsProxies = [
      `https://corsproxy.io/?${encodeURIComponent(pdfUrl)}`,
      `https://api.allorigins.win/raw?url=${encodeURIComponent(pdfUrl)}`,
      `https://proxy.cors.sh/${pdfUrl}`,
      `https://cors-anywhere.herokuapp.com/${pdfUrl}`,
      `https://yacdn.org/proxy/${pdfUrl}`
    ];
    
    // Fonction pour tenter de télécharger avec différents proxies
    const downloadWithProxy = async () => {
      let lastError = null;
      
      // D'abord essayer l'accès direct
      try {
        console.log("Tentative d'accès direct au PDF...");
        const response = await fetch(pdfUrl, { 
          method: 'GET',
          mode: 'cors',
          headers: { 
            'Content-Type': 'application/pdf',
            'Accept': 'application/pdf',
            'Access-Control-Allow-Origin': '*'
          }
        });
        
        if (response.ok) {
          console.log("Téléchargement direct réussi");
          return response;
        }
      } catch (directError) {
        console.warn("Échec de l'accès direct:", directError.message);
        lastError = directError;
      }
      
      // Essayer les proxies un par un
      for (const proxyUrl of corsProxies) {
        try {
          console.log("Tentative avec proxy:", proxyUrl);
          const response = await fetch(proxyUrl, { 
            method: 'GET',
            headers: { 
              'Content-Type': 'application/pdf',
              'Accept': 'application/pdf,*/*'
            }
          });
          
          if (response.ok) {
            console.log("Téléchargement via proxy réussi:", proxyUrl);
            return response;
          }
        } catch (proxyError) {
          console.warn(`Échec avec le proxy ${proxyUrl}:`, proxyError.message);
          lastError = proxyError;
        }
      }
      
      // Si nous arrivons ici, tous les proxies ont échoué
      throw lastError || new Error("Échec de tous les proxies");
    };
    
    // Tenter le téléchargement
    const response = await downloadWithProxy();
    
    // Convertir la réponse en blob
    const pdfBlob = await response.blob();
    console.log("Blob PDF récupéré:", pdfBlob.type, "Taille:", pdfBlob.size, "octets");
    
    // Vérification de type PDF
    const isProbablyPdf = 
      pdfBlob.type === 'application/pdf' || 
      pdfUrl.toLowerCase().endsWith('.pdf') || 
      pdfBlob.size > 8000;
    
    if (!isProbablyPdf) {
      throw new Error("Le fichier téléchargé n'est pas un PDF valide");
    }
    
    // Créer un fichier à partir du blob
    const timestamp = Date.now();
    const safeTitle = title.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    const fileName = `${timestamp}_${safeTitle}.pdf`;
    const pdfFile = new File([pdfBlob], fileName, { type: 'application/pdf' });
    
    // Définir le chemin de stockage
    const filePath = `pdfs/${fileName}`;
    
    // Téléverser le fichier vers Supabase
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('documents2')
      .upload(filePath, pdfFile, {
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
    
    return {
      url: publicUrl,
      path: filePath
    };
    
  } catch (error) {
    console.error('Erreur lors du téléchargement du PDF:', error);
    throw error;
  }
};

/**
 * Convertit une page web en PDF via un service en ligne
 * @param {string} url - URL de la page web à convertir
 * @param {string} title - Titre à donner au fichier PDF
 * @returns {Promise<{url: string, path: string}>}
 */
export const convertWebToPdf = async (url, title) => {
  try {
    // Utiliser l'API ConvertAPI pour convertir la page web en PDF
    const apiUrl = `https://v2.convertapi.com/convert/web/to/pdf?secret=QK7U25cH3tlUmJ5L&url=${encodeURIComponent(url)}`;
    
    const response = await fetch(apiUrl);
    
    if (!response.ok) {
      throw new Error(`Échec de la conversion: ${response.status} ${response.statusText}`);
    }
    
    const convertApiResult = await response.json();
    
    if (!convertApiResult.Files || !convertApiResult.Files.length) {
      throw new Error("Aucun fichier retourné par l'API de conversion");
    }
    
    // URL du PDF généré
    const pdfUrl = convertApiResult.Files[0].Url;
    
    // Télécharger le PDF généré
    const pdfResponse = await fetch(pdfUrl);
    
    if (!pdfResponse.ok) {
      throw new Error(`Impossible de télécharger le PDF converti: ${pdfResponse.status}`);
    }
    
    const pdfBlob = await pdfResponse.blob();
    
    // Créer un fichier à partir du blob
    const timestamp = Date.now();
    const safeTitle = title.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    const fileName = `${timestamp}_${safeTitle}.pdf`;
    const pdfFile = new File([pdfBlob], fileName, { type: 'application/pdf' });
    
    // Définir le chemin de stockage
    const filePath = `pdfs/${fileName}`;
    
    // Téléverser le fichier vers Supabase
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('documents2')
      .upload(filePath, pdfFile, {
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
    
    return {
      url: publicUrl,
      path: filePath
    };
    
  } catch (error) {
    console.error('Erreur lors de la conversion web vers PDF:', error);
    throw error;
  }
};

/**
 * Traite une URL en détectant si c'est un PDF direct ou une page web à convertir
 * @param {string} url - URL à traiter
 * @param {string} title - Titre du document
 * @returns {Promise<{url: string, path: string, format: string}>}
 */
export const processWebUrl = async (url, title) => {
  try {
    // Vérifier que l'URL est complète
    if (!url.startsWith('http')) {
      url = 'https://' + url;
    }
    
    // Détecter si l'URL est déjà un PDF
    const isPdfUrl = url.toLowerCase().endsWith('.pdf');
    
    if (isPdfUrl) {
      // Télécharger directement le PDF
      const result = await downloadPdfFromUrl(url, title);
      return {
        ...result,
        format: 'pdf'
      };
    } else {
      // Convertir la page web en PDF
      try {
        const result = await convertWebToPdf(url, title);
        return {
          ...result,
          format: 'pdf'
        };
      } catch (conversionError) {
        console.error('Échec de la conversion en PDF:', conversionError);
        // En cas d'échec, retourner simplement l'URL comme lien externe
        return {
          url: url,
          path: null,
          format: 'external_link'
        };
      }
    }
  } catch (error) {
    console.error('Erreur lors du traitement de l\'URL:', error);
    throw error;
  }
};

export default {
  webToPdfForm,
  setWebToPdfForm,
  resetWebToPdfForm,
  setProcessingWebToPdf,
  isProcessingWebToPdf,
  setOpenWebToPdfDialog,
  isOpenWebToPdfDialog,
  downloadPdfFromUrl,
  convertWebToPdf,
  processWebUrl
};