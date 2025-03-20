// Import des fonctions Firebase nécessaires
import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";

// Configuration Firebase à partir des variables d'environnement
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID
};

// Utiliser des valeurs par défaut si les variables d'environnement ne sont pas définies
// (Uniquement pour le développement, à supprimer en production)
if (!firebaseConfig.apiKey) {
  console.warn("Variables d'environnement Firebase non définies. Utilisation de valeurs par défaut pour le développement.");
  firebaseConfig.apiKey = "AIzaSyAJFuXPZb4AZgWCgPJnxzl5q0UxcuDY7pA";
  firebaseConfig.authDomain = "lithium-dashboard.firebaseapp.com";
  firebaseConfig.projectId = "lithium-dashboard";
  firebaseConfig.storageBucket = "lithium-dashboard.appspot.com";
  firebaseConfig.messagingSenderId = "123456789012";
  firebaseConfig.appId = "1:123456789012:web:abcdef123456789012";
}

// Cette initialisation est maintenant compatible avec le navigateur
try {
  // Initialiser Firebase
  const firebaseApp = initializeApp(firebaseConfig);
  
  // Initialiser le service de stockage
  const storage = getStorage(firebaseApp);
  
  export { storage };
} catch (error) {
  console.error("Erreur lors de l'initialisation de Firebase:", error);
  // Exporter un objet de remplacement pour éviter les erreurs
  export const storage = {
    ref: () => ({
      put: async () => Promise.reject(new Error("Firebase non disponible")),
      getDownloadURL: async () => Promise.reject(new Error("Firebase non disponible"))
    })
  };
} 