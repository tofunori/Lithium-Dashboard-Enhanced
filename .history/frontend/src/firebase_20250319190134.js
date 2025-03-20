// Import des fonctions Firebase nécessaires
import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";

// Configuration Firebase - ces valeurs devront être remplacées par vos propres valeurs dans un projet réel
const firebaseConfig = {
  apiKey: "AIzaSyAJFuXPZb4AZgWCgPJnxzl5q0UxcuDY7pA",
  authDomain: "lithium-dashboard.firebaseapp.com",
  projectId: "lithium-dashboard",
  storageBucket: "lithium-dashboard.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef123456789012"
};

// Initialiser Firebase - cette partie ne causera pas d'erreur car elle n'utilise que les importations browser-compatible
const firebaseApp = initializeApp(firebaseConfig);

// Initialiser le service de stockage
const storage = getStorage(firebaseApp);

export { storage }; 