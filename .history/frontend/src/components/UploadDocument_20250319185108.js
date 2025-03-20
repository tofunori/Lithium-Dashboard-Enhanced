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
        message: 'Traitement du document en cours...',
        severity: 'info'
      });
      
      // UTILISER LE MODE LOCAL UNIQUEMENT
      // Créer une URL temporaire pour le fichier
      const localUrl = URL.createObjectURL(selectedFile);
      
      console.log("Création d'URL locale pour le document:", localUrl);
      
      // Créer les données du document avec l'URL locale
      const documentWithURL = {
        ...documentData,
        url: localUrl,
        // Garder la date de téléversement
        uploadDate: new Date().toISOString()
      };
      
      // Ajouter le document à la collection via le contexte
      const addedDocument = addDocument(documentWithURL, selectedFile, localUrl);
      
      // Notification de succès
      setSnackbar({
        open: true,
        message: 'Document ajouté avec succès! (Mode local)',
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
    } catch (error) {
      console.error('Erreur lors de l\'ajout du document:', error);
      setSnackbar({
        open: true,
        message: 'Une erreur est survenue lors de l\'ajout du document: ' + error.message,
        severity: 'error'
      });
    }
  };
  
  // Fermer la notification
  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  // Fonction pour extraire les métadonnées d'un PDF
  const extractPdfMetadata = async (file) => {
    // Afficher un indicateur de chargement
    setSnackbar({
      open: true,
      message: 'Extraction des métadonnées en cours...',
      severity: 'info'
    });
    
    try {
      // Extraction basique à partir du nom de fichier dans tous les cas
      const fileName = file.name.replace('.pdf', '');
      const extractedTitle = fileName
        .replace(/[-_]/g, ' ')
        .replace(/\b\w/g, l => l.toUpperCase());
      
      // Définir des métadonnées basiques
      setDocumentData(prev => ({
        ...prev,
        title: extractedTitle,
        date: new Date().toISOString().split('T')[0],
        type: 'report',
        author: 'Auteur non spécifié'
      }));
      
      // Essayer d'extraire des métadonnées plus détaillées si possible
      // Créer un URL pour le fichier
      const fileURL = URL.createObjectURL(file);
      
      // Charger le document PDF
      const loadingTask = pdfjsLib.getDocument(fileURL);
      const pdfDoc = await loadingTask.promise;
      
      // Obtenir les métadonnées
      const metadata = await pdfDoc.getMetadata();
      
      // Extraire l'auteur ou l'organisation
      const extractedAuthor = metadata.info?.Author || "Auteur non spécifié";
      
      // Extraire la date de création/modification
      let extractedDate = new Date().toISOString().split('T')[0]; // Date par défaut: aujourd'hui
      if (metadata.info?.CreationDate) {
        // Format D:YYYYMMDDHHmmSS
        const dateString = metadata.info.CreationDate;
        if (dateString.startsWith('D:')) {
          const year = dateString.substring(2, 6);
          const month = dateString.substring(6, 8);
          const day = dateString.substring(8, 10);
          extractedDate = `${year}-${month}-${day}`;
        }
      }
      
      // Déterminer un type basé sur le nom de fichier
      let extractedType = 'report';
      if (fileName.toLowerCase().includes('etude') || fileName.toLowerCase().includes('study')) {
        extractedType = 'study';
      } else if (fileName.toLowerCase().includes('article')) {
        extractedType = 'article';
      } else if (fileName.toLowerCase().includes('interview') || fileName.toLowerCase().includes('entrevue')) {
        extractedType = 'interview';
      }
      
      // Description extraite du contenu de la première page
      let extractedDescription = "";
      try {
        const page = await pdfDoc.getPage(1);
        const textContent = await page.getTextContent();
        const textItems = textContent.items;
        
        // Prendre les premiers éléments de texte (jusqu'à 500 caractères) pour la description
        const text = textItems
          .map(item => item.str)
          .join(' ')
          .substring(0, 500);
        
        extractedDescription = text.length > 0 
          ? text + "..." 
          : `Description générée automatiquement pour "${extractedTitle}"`;
      } catch (error) {
        console.error("Erreur lors de l'extraction du texte:", error);
        extractedDescription = `Description générée automatiquement pour "${extractedTitle}"`;
      }
      
      // Mise à jour des données du formulaire
      setDocumentData(prev => ({
        ...prev,
        title: metadata.info?.Title || extractedTitle,
        author: extractedAuthor,
        type: extractedType,
        date: extractedDate,
        description: extractedDescription
      }));
      
      // Notification de succès
      setSnackbar({
        open: true,
        message: 'Métadonnées extraites avec succès! Vous pouvez modifier les informations si nécessaire.',
        severity: 'success'
      });
    } catch (error) {
      console.error("Erreur lors de l'extraction des métadonnées:", error);
      
      // Notification d'avertissement
      setSnackbar({
        open: true,
        message: 'Extraction partielle des métadonnées. Certains champs ont été pré-remplis à partir du nom de fichier.',
        severity: 'warning'
      });
    }
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