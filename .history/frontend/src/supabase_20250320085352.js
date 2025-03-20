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
  // Configuration pour les problèmes réseau
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  },
  db: {
    schema: 'public'
  },
  // Configuration des retries pour les requêtes HTTP
  fetch: (url, options) => {
    const fetchOptions = {
      ...options,
      // Délai d'attente de 15 secondes pour chaque requête
      timeout: 15000,
    };
    
    // Fonction pour retenter une requête
    const fetchWithRetry = async (attempt = 1, maxAttempts = 3) => {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), fetchOptions.timeout);
        
        const response = await fetch(url, {
          ...fetchOptions,
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        return response;
      } catch (error) {
        if (attempt < maxAttempts) {
          console.log(`Tentative ${attempt} échouée, nouvelle tentative dans ${attempt * 1000}ms...`);
          // Attendre de plus en plus longtemps entre les tentatives
          await new Promise(resolve => setTimeout(resolve, attempt * 1000));
          return fetchWithRetry(attempt + 1, maxAttempts);
        }
        throw error;
      }
    };
    
    return fetchWithRetry();
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

// Fonction pour détecter si nous sommes en ligne
export const isOnline = () => {
  return typeof navigator !== 'undefined' && navigator.onLine;
};

// Fonction sécurisée pour la déconnexion
export const safeSignOut = async () => {
  try {
    // Supprimer manuellement la session du localStorage pour s'assurer qu'elle disparaît
    localStorage.removeItem('supabase.auth.token');
    
    // Essayer de se déconnecter via l'API seulement si nous sommes en ligne
    if (isOnline()) {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.warn('Erreur lors de la déconnexion via API, mais session locale supprimée:', error);
      }
    } else {
      console.warn('Déconnexion hors ligne : session supprimée localement uniquement');
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