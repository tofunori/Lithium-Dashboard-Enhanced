// Import des fonctions Firebase nécessaires
import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";

// Configuration Firebase - ces valeurs devront être remplacées par celles de votre projet
const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "votre-projet.firebaseapp.com",
  projectId: "votre-projet",
  storageBucket: "votre-projet.appspot.com",
  messagingSenderId: "XXXXXXXXXXXX",
  appId: "1:XXXXXXXXXXXX:web:XXXXXXXXXXXX"
};

// Initialiser Firebase
const firebaseApp = initializeApp(firebaseConfig);

// Initialiser le service de stockage
const storage = getStorage(firebaseApp);

export { storage }; 