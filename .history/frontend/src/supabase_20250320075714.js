import { createClient } from '@supabase/supabase-js';

// Configuration Supabase
// Utiliser les variables d'environnement
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'https://fbtdevwyrwyqdrwxcyno.supabase.co';
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZidGRldnd5cnd5cWRyd3hjeW5vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI0MTgwNDMsImV4cCI6MjA1Nzk5NDA0M30._0P4bz3_1qNHIBQSArqNIKCi8lpZglStUH8Ce-arUts';

console.log('Environnement:', process.env.NODE_ENV);
console.log('URL Supabase:', supabaseUrl);
console.log('Initialisation du client Supabase...');

// Options du client avec persistance de session
const options = {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storageKey: 'supabase.auth.token',
    storage: window.localStorage
  },
  global: {
    headers: { 'x-application-name': 'lithium-dashboard' },
  },
  // Ajouter des retry en cas d'erreur réseau
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
};

// Créer le client Supabase
const supabase = createClient(supabaseUrl, supabaseKey, options);

// Fonction de vérification de session sécurisée
export const checkSession = async () => {
  try {
    const { data, error } = await supabase.auth.getSession();
    if (error) {
      console.error('Erreur lors de la vérification de session:', error);
      return { session: null, user: null };
    }
    return { 
      session: data.session, 
      user: data.session?.user || null 
    };
  } catch (err) {
    console.error('Exception lors de la vérification de session:', err);
    return { session: null, user: null };
  }
};

// Vérifier si la connexion est établie
supabase.auth.getSession().then(({ data, error }) => {
  if (error) {
    console.error('Erreur de connexion à Supabase:', error);
  } else {
    console.log('Connexion à Supabase établie:', data.session ? 'authentifié' : 'non authentifié');
    if (data.session) {
      console.log('Utilisateur connecté:', data.session.user.email);
    }
  }
});

// Fonction pour créer des noms de fichiers sécurisés
export const createSafeFileName = (originalName) => {
  const timestamp = Date.now();
  const safeFileName = originalName.replace(/[^a-zA-Z0-9.-]/g, '_');
  return `document_${timestamp}_${safeFileName}`;
};

// Fonction sécurisée pour la déconnexion
export const safeSignOut = async () => {
  try {
    // Supprimer manuellement la session du localStorage pour s'assurer qu'elle disparaît
    localStorage.removeItem('supabase.auth.token');
    
    // Essayer de se déconnecter via l'API
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.warn('Erreur lors de la déconnexion via API, mais session locale supprimée:', error);
    }
    return true;
  } catch (err) {
    console.error('Erreur lors de la déconnexion:', err);
    // Toujours considérer la déconnexion comme réussie côté client
    return true;
  }
};

// Exporter le client
export { supabase }; 