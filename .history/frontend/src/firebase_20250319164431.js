import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";

// Configuration Firebase - Utiliser les variables d'environnement
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID
};

// Configuration de secours pour le développement local
if (!firebaseConfig.apiKey || firebaseConfig.apiKey === "undefined") {
  console.warn("Variables d'environnement Firebase non trouvées. Utilisation de la configuration de secours pour le développement.");
  // Vous pouvez définir une configuration de développement ici, mais ne placez jamais de clés réelles dans le code source
  // Cette partie ne sera utilisée que pour le développement local si les variables d'environnement ne sont pas configurées
}

// Initialiser Firebase
const app = initializeApp(firebaseConfig);

// Initialiser Storage
export const storage = getStorage(app);

export default app; 