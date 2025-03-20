// Import des fonctions Firebase nécessaires
import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";

// Configuration Firebase à partir des variables d'environnement
const firebaseConfig = {
  apiKey: "AIzaSyAxKoyOLiNvBxHFFIs-M6lBs_cfcVvWR0Y",
  authDomain: "leafy-bulwark-442103-e7.firebaseapp.com",
  databaseURL: "https://leafy-bulwark-442103-e7-default-rtdb.firebaseio.com",
  projectId: "leafy-bulwark-442103-e7",
  storageBucket: "leafy-bulwark-442103-e7.firebasestorage.app",
  messagingSenderId: "700446305381",
  appId: "1:700446305381:web:24883b4443894d852eaa8c",
  measurementId: "G-23MMQLCK9Q"
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

// Créer un objet storage par défaut au cas où Firebase échoue
let storage;

// Cette initialisation est maintenant compatible avec le navigateur
try {
  // Initialiser Firebase
  const app = initializeApp(firebaseConfig);
  
  // Initialiser le service de stockage
  storage = getStorage(app);
} catch (error) {
  console.error("Erreur lors de l'initialisation de Firebase:", error);
  // Créer un objet de remplacement pour éviter les erreurs
  storage = {
    ref: () => ({
      put: async () => Promise.reject(new Error("Firebase non disponible")),
      getDownloadURL: async () => Promise.reject(new Error("Firebase non disponible"))
    })
  };
}

export { storage }; 