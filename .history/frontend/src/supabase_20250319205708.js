import { createClient } from '@supabase/supabase-js';

// Récupérer les variables d'environnement
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

// Vérifier si les variables d'environnement sont définies
if (!supabaseUrl || !supabaseKey) {
  console.warn(
    'Variables d\'environnement Supabase manquantes. ' +
    'Veuillez définir REACT_APP_SUPABASE_URL et REACT_APP_SUPABASE_ANON_KEY ' +
    'dans votre fichier .env ou les variables d\'environnement Vercel.'
  );
}

// Créer et exporter le client Supabase
export const supabase = createClient(
  supabaseUrl || 'https://votre-projet.supabase.co',
  supabaseKey || 'clé-publique-supabase'
); 