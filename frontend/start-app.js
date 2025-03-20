const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Définir les variables d'environnement nécessaires
process.env.DANGEROUSLY_DISABLE_HOST_CHECK = 'true';
process.env.HOST = 'localhost';
process.env.PORT = '3001';

// Vérifier si le fichier webpack.config.js existe dans react-scripts
const reactScriptsPath = path.resolve(__dirname, 'node_modules', 'react-scripts');
const webpackConfigPath = path.resolve(reactScriptsPath, 'config', 'webpack.config.js');

if (fs.existsSync(webpackConfigPath)) {
  console.log('Démarrage de l\'application React...');
  
  try {
    // Exécuter la commande npm start avec l'option de désactivation de l'hôte
    execSync('npx cross-env DANGEROUSLY_DISABLE_HOST_CHECK=true react-scripts start', { 
      stdio: 'inherit',
      env: { 
        ...process.env, 
        DANGEROUSLY_DISABLE_HOST_CHECK: 'true',
        HOST: 'localhost',
        PORT: '3001'
      }
    });
  } catch (error) {
    console.error('Erreur lors du démarrage de l\'application:', error);
    
    // Fallback à Vite si disponible
    if (fs.existsSync(path.resolve(__dirname, 'node_modules', '.bin', 'vite'))) {
      console.log('Essai de démarrage avec Vite...');
      execSync('npx vite', { stdio: 'inherit' });
    }
  }
} else {
  console.log('Configuration Webpack non trouvée, essai de démarrage avec Vite...');
  execSync('npx vite', { stdio: 'inherit' });
}
