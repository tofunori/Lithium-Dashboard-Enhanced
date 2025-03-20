// Script pour démarrer l'application React sur le port 3001
const { spawn } = require('child_process');
const path = require('path');

// Définir le port
process.env.PORT = 3001;
process.env.HOST = 'localhost';
process.env.WDS_SOCKET_HOST = 'localhost';
process.env.WDS_SOCKET_PORT = 0;

console.log('Démarrage de l\'application sur le port 3001...');

// Chemin vers le script de démarrage de React dans node_modules
const reactScriptsPath = path.resolve(
  __dirname,
  'node_modules',
  '.bin',
  'react-scripts'
);

// Lancer le processus
const child = spawn('node', [reactScriptsPath, 'start'], {
  stdio: 'inherit',
  env: { ...process.env }
});

child.on('error', (error) => {
  console.error('Erreur de démarrage:', error);
}); 