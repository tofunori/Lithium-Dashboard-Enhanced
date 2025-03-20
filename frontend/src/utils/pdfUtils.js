// Utilitaires pour la gestion des PDF
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

// Fonction pour convertir une page web en PDF
export const webToPdfForm = {
  title: '',
  url: '',
  description: '',
  author: 'Capture Web'
};

// Fonction pour indiquer si un traitement PDF est en cours
let processingWebToPdf = false;

export const setProcessingWebToPdf = (value) => {
  processingWebToPdf = value;
};

export const isProcessingWebToPdf = () => {
  return processingWebToPdf;
};

// Fonction pour définir le formulaire web-to-pdf
export const setWebToPdfForm = (formData) => {
  Object.assign(webToPdfForm, formData);
};

// Fonction pour réinitialiser le formulaire
export const resetWebToPdfForm = () => {
  webToPdfForm.title = '';
  webToPdfForm.url = '';
  webToPdfForm.description = '';
  webToPdfForm.author = 'Capture Web';
};

// Fonction pour ouvrir le dialogue de conversion web-to-pdf
export const setOpenWebToPdfDialog = (isOpen) => {
  window.openWebToPdfDialog = isOpen;
};

export const isOpenWebToPdfDialog = () => {
  return window.openWebToPdfDialog || false;
};

// Générer un PDF à partir d'une URL
export const generatePdfFromUrl = async (url, title) => {
  try {
    // Ici, vous pourriez implémenter la logique de conversion d'URL en PDF
    // Cette fonction est un espace réservé pour l'implémentation réelle
    console.log(`Génération de PDF pour l'URL: ${url} avec le titre: ${title}`);
    
    // Exemple d'implémentation minimale
    const doc = new jsPDF();
    
    // Ajouter un titre au PDF
    doc.setFontSize(16);
    doc.text(title, 20, 20);
    
    // Ajouter l'URL source
    doc.setFontSize(10);
    doc.text(`Source: ${url}`, 20, 30);
    
    // Ajouter la date de génération
    doc.text(`Généré le: ${new Date().toLocaleString()}`, 20, 35);
    
    // Retourner le blob du PDF
    return doc.output('blob');
  } catch (error) {
    console.error('Erreur lors de la génération du PDF:', error);
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
  generatePdfFromUrl
};
