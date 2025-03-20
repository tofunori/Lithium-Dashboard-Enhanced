import { createClient } from '@supabase/supabase-js';

// Configuration Supabase
// Pour un projet de production, ces valeurs devraient être dans des variables d'environnement
const supabaseUrl = 'https://wmlfcgsjmogkcqhxlmtf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndtbGZjZ3NqbW9na2NxaHhsbXRmIiwicm9sZSI6ImFub24iLCJpYXQiOjE2OTczMzM0MTIsImV4cCI6MjAxMjkwOTQxMn0.OstJnY0kBXzUO4ynznKO5kbP90yABxXnwXi01A7JoPs';

// Créer le client Supabase
const supabase = createClient(supabaseUrl, supabaseKey);

// Vérifier si la connexion est établie
supabase.auth.getSession().then(({ data, error }) => {
  if (error) {
    console.error('Erreur de connexion à Supabase:', error);
  } else {
    console.log('Connexion à Supabase établie:', data.session ? 'authentifié' : 'non authentifié');
  }
});

// Fonction pour créer des noms de fichiers sécurisés
export const createSafeFileName = (originalName) => {
  const timestamp = Date.now();
  const safeFileName = originalName.replace(/[^a-zA-Z0-9.-]/g, '_');
  return `document_${timestamp}_${safeFileName}`;
};

// Exporter le client
export { supabase }; 