import React, { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  TextField, 
  Button, 
  Typography, 
  Box, 
  IconButton,
  CircularProgress,
  Alert,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  LinearProgress
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import LinkIcon from '@mui/icons-material/Link';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import DescriptionIcon from '@mui/icons-material/Description';
import { useDocuments } from '../../contexts/DocumentsContext';
import { useAuth } from '../../contexts/AuthContext';
import { supabase, createSafeFileName } from '../../supabase';
import { jsPDF } from 'jspdf';

// Types de documents
const documentTypes = [
  { value: 'report', label: 'Rapport' },
  { value: 'study', label: 'Étude' },
  { value: 'article', label: 'Article' },
  { value: 'press release', label: 'Communiqué de presse' },
  { value: 'analysis', label: 'Analyse' },
  { value: 'research', label: 'Recherche' }
];

/**
 * Dialogue pour ajouter un lien web qui se convertit en PDF
 */
const WebToPdfDialog = ({ open, onClose, onSuccess }) => {
  const { isAuthenticated } = useAuth();
  const { addDocument, loadPublicDocuments } = useDocuments();
  
  // État du formulaire
  const [formData, setFormData] = useState({
    title: '',
    url: '',
    author: '',
    type: 'article',
    description: ''
  });
  
  // État de traitement
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState(0);
  const [conversionMethod, setConversionMethod] = useState('');
  const [timeoutId, setTimeoutId] = useState(null);
  
  // Simuler la progression pendant le traitement
  useEffect(() => {
    if (isProcessing) {
      const interval = setInterval(() => {
        setProgress(prev => {
          // Augmenter progressivement jusqu'à 90%
          const increment = (90 - prev) / 10;
          return Math.min(prev + (increment > 0.5 ? increment : 0.5), 90);
        });
      }, 500);
      
      // Mettre en place un timeout de sécurité de 30 secondes
      const timeout = setTimeout(() => {
        // Au lieu d'afficher une erreur, essayons simplement de finaliser avec ce que nous avons
        setConversionMethod('Finalisation forcée...');
        setProgress(95);
        try {
          // Forcer la finalisation
          finalizePdfConversion(formData.url, null);
        } catch (error) {
          console.error("Erreur lors de la finalisation forcée:", error);
          setError("La conversion n'a pas pu être finalisée. Veuillez réessayer ou utiliser un lien direct vers un PDF.");
          setIsProcessing(false);
        }
        clearInterval(interval);
      }, 30000);
      
      setTimeoutId(timeout);
      
      return () => {
        clearInterval(interval);
        clearTimeout(timeout);
      };
    } else {
      // Réinitialiser la progression lorsque le traitement est terminé
      setProgress(0);
    }
  }, [isProcessing, formData.url]);
  
  // Nettoyer le timeout lors de la fermeture
  useEffect(() => {
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [timeoutId]);
  
  // Gérer les changements dans le formulaire
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Extraire le titre depuis l'URL
  const extractTitleFromUrl = async () => {
    if (!formData.url) return;
    
    try {
      setIsProcessing(true);
      setError(null);
      setConversionMethod('Extraction du titre...');
      
      // Normaliser l'URL
      let url = formData.url;
      if (!url.startsWith('http')) {
        url = 'https://' + url;
      }
      
      // Essayer d'extraire le titre de la page depuis l'URL
      const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`;
      
      const response = await fetch(proxyUrl, { timeout: 10000 });
      const data = await response.json();
      
      if (data && data.contents) {
        // Extraire le titre avec une regex
        const titleMatch = data.contents.match(/<title[^>]*>([^<]+)<\/title>/);
        if (titleMatch && titleMatch[1]) {
          let title = titleMatch[1].trim();
          
          // Nettoyer le titre (supprimer les caractères spéciaux)
          title = title.replace(/&#?[a-z0-9]+;/g, ' ').trim();
          title = title.replace(/\s+/g, ' ');
          
          // Mettre à jour le formulaire
          setFormData(prev => ({
            ...prev,
            title: title
          }));
        }
      }
    } catch (error) {
      console.warn("Erreur lors de l'extraction du titre:", error);
      // Ne pas afficher d'erreur à l'utilisateur, c'est juste une aide
    } finally {
      setIsProcessing(false);
    }
  };
  
  // Fonction simple pour générér un PDF basique à partir d'une URL
  const generateSimplePdf = async (url, title) => {
    try {
      // Créer un nouveau document PDF
      const doc = new jsPDF();
      
      // Ajouter un titre et l'URL
      doc.setFontSize(18);
      doc.text(title, 20, 20);
      
      doc.setFontSize(12);
      doc.text('Source: ' + url, 20, 30);
      doc.text('Date de capture: ' + new Date().toLocaleString(), 20, 40);
      
      doc.setFontSize(10);
      doc.text('Ce document est une référence à une page web. Cliquez sur le lien ci-dessus pour accéder au contenu original.', 20, 50, { maxWidth: 170 });
      
      // Retourner le PDF sous forme de blob
      return doc.output('blob');
    } catch (error) {
      console.error("Erreur lors de la génération du PDF simple:", error);
      throw error;
    }
  };
  
  // Finalisation de conversion
  const finalizePdfConversion = async (url, pdfBlob, filePath = null) => {
    try {
      setProgress(95);
      setConversionMethod('Finalisation...');
      
      let publicUrl = url;
      let supabasePath = null;
      
      // Si nous avons un PDF mais pas de chemin de fichier, téléverser vers Supabase
      if (pdfBlob && !filePath) {
        // Créer un nom de fichier sécurisé
        const timestamp = Date.now();
        const safeTitle = formData.title.replace(/[^a-z0-9]/gi, '_').toLowerCase();
        const fileName = `${timestamp}_${safeTitle}.pdf`;
        
        // S'assurer que c'est bien un PDF
        const pdfFile = new File([pdfBlob], fileName, { type: 'application/pdf' });
        
        // Chemin de stockage
        filePath = `public/${fileName}`;
        
        try {
          // Téléverser vers Supabase
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('documents2')
            .upload(filePath, pdfFile, {
              cacheControl: '3600',
              upsert: true
            });
          
          if (uploadError) {
            throw uploadError;
          }
          
          // Récupérer l'URL publique
          const { data: urlData } = await supabase.storage
            .from('documents2')
            .getPublicUrl(filePath);
          
          if (urlData?.publicUrl) {
            publicUrl = urlData.publicUrl;
            supabasePath = filePath;
          }
        } catch (uploadError) {
          console.error("Erreur lors du téléversement:", uploadError);
          // Continuer avec l'URL originale en cas d'erreur
        }
      }
      
      setProgress(98);
      
      // Créer un nouveau document en utilisant le format attendu par addDocument
      const documentToAdd = {
        title: formData.title,
        author: formData.author || 'Source Web',
        type: formData.type || 'article',
        format: pdfBlob ? 'pdf' : 'external_link',
        description: formData.description || `Source: ${url}`,
        url: publicUrl,
        supabasePath: supabasePath,
        date: new Date().toISOString()
      };
      
      // Utiliser addDocument du contexte pour ajouter le document
      try {
        const result = await addDocument(documentToAdd);
        
        console.log("Document ajouté avec succès:", result);
        
        // Actualiser la liste des documents
        loadPublicDocuments(true);
        
        // Notifier le succès
        if (onSuccess) {
          onSuccess(result);
        }
        
        // Réinitialiser et fermer
        setFormData({
          title: '',
          url: '',
          author: '',
          type: 'article',
          description: ''
        });
        
        setIsProcessing(false);
        setProgress(100);
        
        // Fermer le dialogue après un court délai
        setTimeout(() => {
          onClose();
        }, 500);
        
        return true;
      } catch (addError) {
        console.error("Échec de l'ajout du document:", addError);
        setError("Erreur lors de l'ajout du document: " + (addError.message || 'Erreur inconnue'));
        setIsProcessing(false);
        return false;
      }
    } catch (error) {
      console.error("Erreur de finalisation:", error);
      setError("Une erreur est survenue lors de la finalisation: " + error.message);
      setIsProcessing(false);
      return false;
    }
  };
  
  // Soumettre le formulaire
  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    
    // Vérifier les champs obligatoires
    if (!formData.title || !formData.url) {
      setError("Le titre et l'URL sont obligatoires");
      return;
    }
    
    try {
      setIsProcessing(true);
      setError(null);
      setProgress(5);
      
      // Normaliser l'URL
      let url = formData.url;
      if (!url.startsWith('http')) {
        url = 'https://' + url;
      }
      
      // Vérifier si c'est un PDF direct
      const isPdfUrl = url.toLowerCase().endsWith('.pdf');
      
      // Pour les PDF directs, utiliser une approche simplifiée
      if (isPdfUrl) {
        setConversionMethod('Référencement direct du PDF...');
        setProgress(50);
        
        // On va simplement stocker l'URL sans télécharger le fichier
        return finalizePdfConversion(url, null);
      }
      
      // Pour les pages web, stocker simplement l'URL comme référence
      setConversionMethod('Création d\'une référence web...');
      setProgress(70);
      
      try {
        // Générer un PDF simple comme alternative
        const pdfBlob = await generateSimplePdf(url, formData.title);
        return finalizePdfConversion(url, pdfBlob);
      } catch (error) {
        console.error("Erreur lors de la génération du PDF simple:", error);
        return finalizePdfConversion(url, null);
      }
      
    } catch (error) {
      console.error('Erreur lors de la conversion web vers PDF:', error);
      setError(error.message || "Erreur lors de la conversion. L'URL sera enregistrée comme lien direct.");
      
      // Tenter une finalisation d'urgence
      try {
        await finalizePdfConversion(formData.url, null);
      } catch (finalError) {
        setIsProcessing(false);
      }
    }
  };
  
  return (
    <Dialog
      open={open}
      onClose={!isProcessing ? onClose : undefined}
      maxWidth="md"
      fullWidth
      aria-labelledby="web-to-pdf-dialog-title"
    >
      <DialogTitle id="web-to-pdf-dialog-title">
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">
            <PictureAsPdfIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
            Ajouter un lien web
          </Typography>
          {!isProcessing && (
            <IconButton onClick={onClose} size="small">
              <CloseIcon />
            </IconButton>
          )}
        </Box>
      </DialogTitle>
      
      <DialogContent dividers>
        {!isAuthenticated ? (
          <Alert severity="warning" sx={{ mb: 2 }}>
            Vous devez être connecté pour ajouter un lien web.
          </Alert>
        ) : (
          <>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}
            
            {isProcessing ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <CircularProgress size={60} />
                <Box sx={{ width: '100%', mt: 3 }}>
                  <LinearProgress variant="determinate" value={progress} sx={{ height: 8, borderRadius: 2 }} />
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1, textAlign: 'center' }}>
                    {Math.round(progress)}%
                  </Typography>
                </Box>
                <Typography variant="h6" sx={{ mt: 2 }}>
                  {conversionMethod || "Traitement en cours..."}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Cette opération peut prendre quelques instants...
                </Typography>
              </Box>
            ) : (
              <Box component="form" onSubmit={handleSubmit} noValidate>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  Ajoutez un lien web qui sera stocké dans la bibliothèque de documents.
                </Typography>
                
                <Divider sx={{ mb: 3 }} />
                
                <Box sx={{ mb: 3 }}>
                  <TextField
                    required
                    fullWidth
                    label="URL du site web"
                    name="url"
                    value={formData.url}
                    onChange={handleChange}
                    onBlur={extractTitleFromUrl}
                    placeholder="https://example.com/article"
                    InputProps={{
                      startAdornment: <LinkIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                    }}
                    sx={{ mb: 2 }}
                  />
                  
                  <TextField
                    required
                    fullWidth
                    label="Titre du document"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="Titre de la page web"
                    sx={{ mb: 2 }}
                  />
                  
                  <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                    <TextField
                      fullWidth
                      label="Auteur / Source"
                      name="author"
                      value={formData.author}
                      onChange={handleChange}
                      placeholder="Nom de l'auteur ou de la source"
                    />
                    
                    <FormControl fullWidth>
                      <InputLabel>Type de document</InputLabel>
                      <Select
                        name="type"
                        value={formData.type}
                        onChange={handleChange}
                        label="Type de document"
                      >
                        {documentTypes.map(type => (
                          <MenuItem key={type.value} value={type.value}>
                            {type.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Box>
                  
                  <TextField
                    fullWidth
                    multiline
                    rows={4}
                    label="Description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Description du contenu du document..."
                  />
                </Box>
                
                <Alert severity="info" sx={{ mb: 2 }}>
                  <Typography variant="body2">
                    <strong>Comment ça fonctionne:</strong>
                  </Typography>
                  <Typography variant="body2" component="ol" sx={{ pl: 2, mt: 1 }}>
                    <li>Le lien web sera ajouté à votre bibliothèque de documents</li>
                    <li>Si l'URL pointe vers un PDF, il sera référencé directement</li>
                    <li>Pour les autres types de pages, une référence web sera créée</li>
                    <li>Vous pourrez accéder au contenu original en cliquant sur le document</li>
                  </Typography>
                </Alert>
              </Box>
            )}
          </>
        )}
      </DialogContent>
      
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button 
          onClick={onClose} 
          color="inherit"
          disabled={isProcessing}
        >
          Annuler
        </Button>
        <Button 
          onClick={handleSubmit}
          variant="contained" 
          color="primary"
          disabled={isProcessing || !isAuthenticated || !formData.title || !formData.url}
          startIcon={isProcessing ? <CircularProgress size={20} /> : <LinkIcon />}
        >
          {isProcessing ? 'Traitement en cours...' : 'Ajouter le lien'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default WebToPdfDialog;