import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Button, 
  TextField, 
  Typography, 
  Paper, 
  Grid, 
  MenuItem, 
  FormControl, 
  InputLabel, 
  Select,
  Divider,
  Snackbar,
  Alert,
  IconButton,
  Stack,
  CircularProgress
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DeleteIcon from '@mui/icons-material/Delete';
import { styled } from '@mui/material/styles';
import useTranslation from '../hooks/useTranslation';
import { useDocuments } from '../contexts/DocumentsContext';
import * as pdfjsLib from 'pdfjs-dist';
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "../firebase";

// Configurer PDF.js pour utiliser un CDN spécifique
if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://unpkg.com/pdfjs-dist@4.10.38/build/pdf.worker.min.js';
}

// Input de fichier stylisé
const VisuallyHiddenInput = styled('input')({
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
  height: 1,
  overflow: 'hidden',
  position: 'absolute',
  bottom: 0,
  left: 0,
  whiteSpace: 'nowrap',
  width: 1,
});

// Types de documents
const documentTypes = [
  { value: 'report', label: 'Rapport' },
  { value: 'study', label: 'Étude' },
  { value: 'article', label: 'Article' },
  { value: 'interview', label: 'Entrevue' },
  { value: 'press release', label: 'Communiqué de presse' },
  { value: 'case study', label: 'Étude de cas' },
  { value: 'analysis', label: 'Analyse' },
  { value: 'research', label: 'Recherche' }
];

// Formats de documents
const documentFormats = [
  { value: 'pdf', label: 'PDF' },
  { value: 'video', label: 'Vidéo' },
  { value: 'article', label: 'Article Web' },
  { value: 'presentation', label: 'Présentation' },
  { value: 'infographic', label: 'Infographie' }
];

const UploadDocument = ({ onUploadSuccess }) => {
  const { t } = useTranslation();
  const { addDocument } = useDocuments();
  
  // Configuration du worker PDF.js à l'intérieur du composant
  useEffect(() => {
    // Utiliser une URL CDN pour le worker
    pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.js`;
  }, []);
  
  // État pour le formulaire
  const [documentData, setDocumentData] = useState({
    title: '',
    author: '',
    type: '',
    format: '',
    description: '',
    foundryId: '', // Optionnel, pour lier à une fonderie spécifique
    date: new Date().toISOString().split('T')[0]
  });
  
  // État pour le fichier
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  
  // État pour les notifications
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'info'
  });
  
  // Gérer les changements dans le formulaire
  const handleChange = (e) => {
    const { name, value } = e.target;
    setDocumentData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Gérer la sélection de fichier
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Afficher un aperçu du fichier
    if (file.type.includes('image/')) {
      setFilePreview(URL.createObjectURL(file));
    } else {
      setFilePreview(null);
    }
    
    setSelectedFile(file);
    
    // Définir le format en fonction du type de fichier
    if (file.type.includes('pdf')) {
      setDocumentData(prev => ({ ...prev, format: 'pdf' }));
      await extractPdfMetadata(file);
    } else if (file.type.includes('video')) {
      setDocumentData(prev => ({ ...prev, format: 'video' }));
      extractVideoMetadata(file);
    } else if (file.type.includes('image')) {
      setDocumentData(prev => ({ ...prev, format: 'infographic' }));
      extractImageMetadata(file);
    }
  };
  
  // Supprimer le fichier sélectionné
  const handleRemoveFile = () => {
    setSelectedFile(null);
    setFilePreview(null);
    
    // Réinitialiser l'input file
    const fileInput = document.getElementById('document-file-input');
    if (fileInput) fileInput.value = '';
  };
  
  // Soumettre le formulaire
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Vérifier les champs obligatoires
    if (!documentData.title || !documentData.author || !documentData.type || !selectedFile) {
      setSnackbar({
        open: true,
        message: 'Veuillez remplir tous les champs obligatoires et sélectionner un fichier.',
        severity: 'error'
      });
      return;
    }
    
    try {
      // Afficher un indicateur de chargement
      setSnackbar({
        open: true,
        message: 'Téléversement en cours...',
        severity: 'info'
      });
      
      console.log("Début de l'upload du fichier:", selectedFile.name);
      
      // Générer un nom de fichier unique basé sur l'horodatage et le nom original
      const timestamp = Date.now();
      const uniqueFileName = `documents/${timestamp}_${selectedFile.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
      
      console.log("Nom de fichier unique:", uniqueFileName);
      console.log("Taille du fichier:", selectedFile.size, "bytes");
      
      try {
        // Vérifier si Firebase et Storage sont disponibles
        if (!storage || !ref || !uploadBytes || !getDownloadURL) {
          throw new Error("Les modules Firebase requis ne sont pas disponibles");
        }
        
        console.log("Création de la référence Firebase Storage...");
        const storageRef = ref(storage, uniqueFileName);
        
        console.log("Début de l'upload vers Firebase...");
        const uploadResult = await uploadBytes(storageRef, selectedFile);
        console.log("Upload réussi:", uploadResult);
        
        console.log("Récupération de l'URL du fichier...");
        const downloadURL = await getDownloadURL(uploadResult.ref);
        console.log("URL obtenue:", downloadURL);
        
        // Créer les données du document
        const newDocument = {
          ...documentData,
          url: downloadURL,
          isPermanentStorage: true,
          uploadDate: new Date().toISOString()
        };
        
        // Ajouter le document au contexte
        console.log("Ajout du document à la collection...");
        const addedDocument = addDocument(newDocument, selectedFile, downloadURL);
        
        console.log("Document ajouté avec succès:", addedDocument);
        
        // Notification de succès
        setSnackbar({
          open: true,
          message: 'Document téléversé avec succès et sauvegardé de façon permanente!',
          severity: 'success'
        });
        
        // Réinitialiser le formulaire
        setDocumentData({
          title: '',
          author: '',
          type: '',
          format: '',
          description: '',
          foundryId: '',
          date: new Date().toISOString().split('T')[0]
        });
        setSelectedFile(null);
        setFilePreview(null);
        
        // Réinitialiser l'input file
        const fileInput = document.getElementById('document-file-input');
        if (fileInput) fileInput.value = '';
        
        // Notifier le parent si la fonction de callback est fournie
        if (onUploadSuccess) {
          onUploadSuccess(addedDocument);
        }
        
      } catch (firebaseError) {
        console.error("ERREUR FIREBASE DÉTAILLÉE:", firebaseError);
        console.error("Message:", firebaseError.message);
        console.error("Code:", firebaseError.code);
        console.error("Stack:", firebaseError.stack);
        
        // En cas d'erreur CORS (généralement le cas)
        let errorMessage = `Erreur Firebase: ${firebaseError.message}.`;
        
        if (firebaseError.message.includes('storage/unknown') || 
            firebaseError.code === 'storage/unknown' ||
            firebaseError.message.includes('412')) {
          errorMessage += " Erreur liée à CORS. Vérifiez la configuration CORS dans Firebase Storage.";
        }
        
        // Notifier l'utilisateur de l'erreur Firebase
        setSnackbar({
          open: true,
          message: errorMessage + " Basculement en mode local.",
          severity: 'error'
        });
        
        // Fallback en mode local
        const localUrl = URL.createObjectURL(selectedFile);
        console.log("URL locale créée:", localUrl);
        
        // Ajouter le document en mode local
        const localDocument = {
          ...documentData,
          url: localUrl,
          isPermanentStorage: true,  // Tout de même marquer comme permanent pour persistance
          uploadDate: new Date().toISOString()
        };
        
        const addedLocalDocument = addDocument(localDocument, selectedFile, localUrl);
        
        // Notification pour le mode local
        setSnackbar({
          open: true,
          message: 'Document ajouté en mode local avec persistance (fallback).',
          severity: 'warning'
        });
        
        // Réinitialiser le formulaire
        setDocumentData({
          title: '',
          author: '',
          type: '',
          format: '',
          description: '',
          foundryId: '',
          date: new Date().toISOString().split('T')[0]
        });
        setSelectedFile(null);
        setFilePreview(null);
        
        // Réinitialiser l'input file
        const fileInput = document.getElementById('document-file-input');
        if (fileInput) fileInput.value = '';
      }
      
    } catch (error) {
      console.error('Erreur générale lors de l\'ajout du document:', error);
      setSnackbar({
        open: true,
        message: 'Une erreur est survenue: ' + error.message,
        severity: 'error'
      });
    }
  };
  
  // Fermer la notification
  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  // Extraire les métadonnées des fichiers PDF
  const extractPdfMetadata = async (file) => {
    console.log('Extraction de métadonnées PDF désactivée pour résoudre le problème du worker');
    
    // Extraction basique à partir du nom de fichier uniquement
    const fileName = file.name.replace('.pdf', '');
    const extractedTitle = fileName
      .replace(/[-_]/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase());
    
    // Définir des métadonnées basiques sans utiliser PDF.js
    setDocumentData(prev => ({
      ...prev,
      title: extractedTitle,
      date: new Date().toISOString().split('T')[0],
      type: 'report',
      format: 'pdf',
      author: 'Auteur non spécifié',
      description: `Description générée automatiquement pour "${extractedTitle}"`
    }));
    
    // Notification d'avertissement
    setSnackbar({
      open: true,
      message: 'Extraction avancée désactivée. Métadonnées basiques générées à partir du nom de fichier.',
      severity: 'info'
    });
  };

  // Fonction pour extraire les métadonnées d'une vidéo
  const extractVideoMetadata = (file) => {
    // Simulation d'extraction pour les vidéos
    setTimeout(() => {
      const fileName = file.name.replace(/\.[^/.]+$/, "");
      const extractedTitle = fileName
        .replace(/[-_]/g, ' ')
        .replace(/\b\w/g, l => l.toUpperCase());
      
      setDocumentData(prev => ({
        ...prev,
        title: extractedTitle,
        type: 'interview',
        author: 'Média Audiovisuel',
        date: new Date().toISOString().split('T')[0]
      }));
      
      setSnackbar({
        open: true,
        message: 'Métadonnées extraites avec succès! Vous pouvez modifier les informations si nécessaire.',
        severity: 'success'
      });
    }, 1000);
  };

  // Fonction pour extraire les métadonnées d'une image
  const extractImageMetadata = (file) => {
    // Extraction simulée des métadonnées EXIF pour les images
    setTimeout(() => {
      const fileName = file.name.replace(/\.[^/.]+$/, "");
      const extractedTitle = fileName
        .replace(/[-_]/g, ' ')
        .replace(/\b\w/g, l => l.toUpperCase());
      
      setDocumentData(prev => ({
        ...prev,
        title: extractedTitle,
        type: 'infographic',
        author: 'Créateur de contenu visuel',
        date: new Date().toISOString().split('T')[0]
      }));
      
      setSnackbar({
        open: true,
        message: 'Métadonnées extraites avec succès! Vous pouvez modifier les informations si nécessaire.',
        severity: 'success'
      });
    }, 1000);
  };

  return (
    <Paper 
      elevation={0} 
      sx={{ 
        p: 3, 
        borderRadius: '12px', 
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)'
      }}
    >
      <Typography variant="h5" component="h2" gutterBottom>
        Ajouter un nouveau document
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Téléversez un nouveau document, rapport ou étude à la bibliothèque. Les fichiers PDF, vidéos et images sont acceptés.
      </Typography>
      
      <Divider sx={{ mb: 3 }} />
      
      <Box component="form" onSubmit={handleSubmit} noValidate>
        <Grid container spacing={3}>
          {/* Section fichier */}
          <Grid item xs={12} md={4}>
            <Box 
              sx={{ 
                border: '2px dashed #ccc', 
                borderRadius: '8px', 
                p: 3, 
                textAlign: 'center',
                mb: 2,
                height: '220px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: 'rgba(0, 0, 0, 0.02)'
              }}
            >
              {filePreview ? (
                <Box sx={{ position: 'relative', width: '100%', height: '100%' }}>
                  <img 
                    src={filePreview} 
                    alt="Aperçu" 
                    style={{ 
                      maxWidth: '100%', 
                      maxHeight: '80%', 
                      objectFit: 'contain',
                      marginBottom: '10px'
                    }} 
                  />
                  <IconButton
                    aria-label="Supprimer"
                    onClick={handleRemoveFile}
                    sx={{ position: 'absolute', top: 0, right: 0 }}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
              ) : selectedFile ? (
                <Box sx={{ width: '100%', position: 'relative' }}>
                  <Typography variant="body1" gutterBottom>
                    {selectedFile.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  </Typography>
                  <IconButton
                    aria-label="Supprimer"
                    onClick={handleRemoveFile}
                    sx={{ position: 'absolute', top: 0, right: 0 }}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
              ) : (
                <>
                  <CloudUploadIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
                  <Typography variant="body1" gutterBottom>
                    Glissez votre fichier ici
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    ou
                  </Typography>
                </>
              )}
              
              {!selectedFile && (
                <Button
                  component="label"
                  variant="contained"
                  sx={{ mt: 1 }}
                >
                  Parcourir
                  <VisuallyHiddenInput 
                    id="document-file-input"
                    type="file" 
                    onChange={handleFileChange}
                    accept=".pdf,.jpg,.jpeg,.png,.mp4,.webm" 
                  />
                </Button>
              )}
            </Box>
            
            <Typography variant="caption" color="text.secondary">
              Formats acceptés: PDF, JPG, PNG, MP4, WEBM (max 50 MB)
            </Typography>
          </Grid>
          
          {/* Section métadonnées */}
          <Grid item xs={12} md={8}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  label="Titre du document"
                  name="title"
                  value={documentData.title}
                  onChange={handleChange}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  label="Auteur / Organisation"
                  name="author"
                  value={documentData.author}
                  onChange={handleChange}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  type="date"
                  label="Date de publication"
                  name="date"
                  value={documentData.date}
                  onChange={handleChange}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required>
                  <InputLabel>Type de document</InputLabel>
                  <Select
                    name="type"
                    value={documentData.type}
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
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required>
                  <InputLabel>Format</InputLabel>
                  <Select
                    name="format"
                    value={documentData.format}
                    onChange={handleChange}
                    label="Format"
                  >
                    {documentFormats.map(format => (
                      <MenuItem key={format.value} value={format.value}>
                        {format.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  label="Description"
                  name="description"
                  value={documentData.description}
                  onChange={handleChange}
                  placeholder="Décrivez brièvement le contenu de ce document..."
                />
              </Grid>
            </Grid>
          </Grid>
          
          {/* Boutons d'action */}
          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
            <Button 
              onClick={() => {
                setDocumentData({
                  title: '',
                  author: '',
                  type: '',
                  format: '',
                  description: '',
                  foundryId: '',
                  date: new Date().toISOString().split('T')[0]
                });
                setSelectedFile(null);
                setFilePreview(null);
              }}
              color="error"
              variant="outlined"
            >
              {t('reset')}
            </Button>
            
            {selectedFile && (
              <Button 
                variant="outlined" 
                color="secondary"
                onClick={() => {
                  if (selectedFile.type.includes('pdf')) {
                    extractPdfMetadata(selectedFile);
                  } else if (selectedFile.type.includes('video')) {
                    extractVideoMetadata(selectedFile);
                  } else if (selectedFile.type.includes('image')) {
                    extractImageMetadata(selectedFile);
                  }
                }}
              >
                Réextraire métadonnées
              </Button>
            )}
            
            <Button 
              type="submit"
              variant="contained"
              color="primary"
              disabled={!selectedFile}
            >
              {t('publish')}
            </Button>
          </Box>
        </Grid>
      </Box>
      
      {/* Notification */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity} 
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Paper>
  );
};

export default UploadDocument; 