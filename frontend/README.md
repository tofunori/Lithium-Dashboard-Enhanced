# Lithium Dashboard

Tableau de bord de Recyclage de Lithium - Plateforme de Collaboration Interuniversitaire

## Configuration

1. **Installation des dépendances**

```bash
npm install
```

2. **Configuration Firebase**

Créez un projet Firebase sur la [console Firebase](https://console.firebase.google.com/) et mettez à jour le fichier `src/firebase.js` avec vos propres identifiants Firebase.

```js
// src/firebase.js
const firebaseConfig = {
  apiKey: "VOTRE_API_KEY",
  authDomain: "VOTRE_PROJECT_ID.firebaseapp.com",
  projectId: "VOTRE_PROJECT_ID",
  storageBucket: "VOTRE_PROJECT_ID.appspot.com",
  messagingSenderId: "VOTRE_MESSAGING_SENDER_ID",
  appId: "VOTRE_APP_ID"
};
```

3. **Exécution en local**

```bash
npm start
```

## Déploiement sur Vercel

### Option 1 : Déploiement via l'interface Vercel

1. Créez un compte sur [Vercel](https://vercel.com/signup)
2. Créez un nouveau projet et importez votre dépôt GitHub
3. Configurez le projet:
   - Framework Preset: `Create React App`
   - Build Command: `npm run build`
   - Output Directory: `build`
4. Cliquez sur "Deploy"

### Option 2 : Déploiement avec CLI Vercel

1. Installez Vercel CLI:

```bash
npm install -g vercel
```

2. Connectez-vous à Vercel:

```bash
vercel login
```

3. Déployez le projet:

```bash
vercel
```

4. Pour un déploiement de production:

```bash
vercel --prod
```

## Variables d'environnement

Pour une meilleure sécurité, configurez les clés Firebase comme variables d'environnement sur Vercel:

1. Dans l'interface Vercel, allez dans "Project Settings" > "Environment Variables"
2. Ajoutez les variables suivantes:
   - `REACT_APP_FIREBASE_API_KEY`
   - `REACT_APP_FIREBASE_AUTH_DOMAIN`
   - `REACT_APP_FIREBASE_PROJECT_ID`
   - `REACT_APP_FIREBASE_STORAGE_BUCKET`
   - `REACT_APP_FIREBASE_MESSAGING_SENDER_ID`
   - `REACT_APP_FIREBASE_APP_ID`

3. Modifiez `src/firebase.js` pour utiliser ces variables:

```js
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID
};
```

## Fonctionnalités

- Carte interactive des installations de recyclage de lithium
- Gestion des rapports et documents
- Filtrage avancé des documents
- Upload de fichiers avec extraction automatique des métadonnées
- Stockage cloud pour les documents
- Interface multilingue (français/anglais) 