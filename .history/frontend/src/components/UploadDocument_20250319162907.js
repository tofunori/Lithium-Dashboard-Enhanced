import React, { useState } from 'react';
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
  Stack
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DeleteIcon from '@mui/icons-material/Delete';
import { styled } from '@mui/material/styles';
import useTranslation from '../hooks/useTranslation';

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

const UploadDocument = () => {
  const { t } = useTranslation();
  
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
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setSelectedFile(file);
    
    // Créer une URL de prévisualisation pour les images
    if (file.type.startsWith('image/')) {
      setFilePreview(URL.createObjectURL(file));
    } else {
      setFilePreview(null);
    }
    
    // Déterminer automatiquement le format en fonction du type de fichier
    if (file.type.includes('pdf')) {
      setDocumentData(prev => ({ ...prev, format: 'pdf' }));
      extractPdfMetadata(file);
    } else if (file.type.includes('video')) {
      setDocumentData(prev => ({ ...prev, format: 'video' }));
      extractVideoMetadata(file);
    } else if (file.type.includes('image')) {
      setDocumentData(prev => ({ ...prev, format: 'infographic' }));
      extractImageMetadata(file);
    }
  };
  
  // Fonction pour extraire les métadonnées d'un PDF
  const extractPdfMetadata = (file) => {
    // Simuler le chargement des métadonnées
    setSnackbar({
      open: true,
      message: 'Extraction des métadonnées en cours...',
      severity: 'info'
    });
    
    // Dans un environnement réel, vous utiliseriez une bibliothèque comme pdf.js
    // pour extraire les métadonnées du PDF
    setTimeout(() => {
      // Simuler l'extraction réussie des métadonnées
      // Ces informations seraient normalement extraites du PDF
      const fileName = file.name.replace('.pdf', '');
      const extractedTitle = fileName
        .replace(/[-_]/g, ' ')
        .replace(/\b\w/g, l => l.toUpperCase());
      
      // Déterminer un auteur basé sur une logique simple
      let extractedAuthor = '';
      if (fileName.toLowerCase().includes('rapport') || fileName.toLowerCase().includes('report')) {
        extractedAuthor = "Organisation de Recherche";
      } else if (fileName.toLowerCase().includes('etude') || fileName.toLowerCase().includes('study')) {
        extractedAuthor = "Université de Recherche";
      } else {
        extractedAuthor = "Auteur inconnu";
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
      
      // Mise à jour des données du formulaire
      setDocumentData(prev => ({
        ...prev,
        title: extractedTitle,
        author: extractedAuthor,
        type: extractedType,
        description: `Description générée automatiquement pour le document "${extractedTitle}". Veuillez modifier cette description pour ajouter plus de détails sur le contenu du document.`
      }));
      
      setSnackbar({
        open: true,
        message: 'Métadonnées extraites avec succès! Vous pouvez modifier les informations si nécessaire.',
        severity: 'success'
      });
    }, 1500);
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
        author: 'Média Audiovisuel'
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
        author: 'Créateur de contenu visuel'
      }));
      
      setSnackbar({
        open: true,
        message: 'Métadonnées extraites avec succès! Vous pouvez modifier les informations si nécessaire.',
        severity: 'success'
      });
    }, 1000);
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
    
    // Dans un environnement réel, vous utiliseriez FormData pour envoyer le fichier à votre API
    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('documentData', JSON.stringify(documentData));
    
    // Simulation d'un envoi réussi (à remplacer par un appel API)
    setTimeout(() => {
      setSnackbar({
        open: true,
        message: 'Document téléversé avec succès!',
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
    }, 1500);
  };
  
  // Fermer la notification
  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
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
          <Grid item xs={12}>
            <Stack direction="row" spacing={2} justifyContent="flex-end">
              <Button 
                variant="outlined" 
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
              >
                Réinitialiser
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
                variant="contained" 
                type="submit" 
                disabled={!selectedFile}
              >
                Publier le document
              </Button>
            </Stack>
          </Grid>
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