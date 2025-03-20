// Configuration Firebase de base
import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";
// import { getAnalytics } from "firebase/analytics"; // Désactivé pour le moment

// Configuration Firebase
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

// Initialiser Firebase
console.log("Initialisation de Firebase...");
const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app); // Désactivé pour le moment

// Initialiser Storage
console.log("Initialisation de Firebase Storage...");
const storage = getStorage(app);

console.log("Firebase initialisé avec succès!");

export { storage }; 