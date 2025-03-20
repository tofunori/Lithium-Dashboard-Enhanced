const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3001;

// Types MIME
const MIME_TYPES = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.wav': 'audio/wav',
  '.mp4': 'video/mp4',
  '.woff': 'application/font-woff',
  '.ttf': 'application/font-ttf',
  '.eot': 'application/vnd.ms-fontobject',
  '.otf': 'application/font-otf',
  '.wasm': 'application/wasm'
};

// Création du serveur
const server = http.createServer((req, res) => {
  console.log(`${req.method} ${req.url}`);

  // Extraire le chemin du fichier depuis l'URL
  let filePath = '.' + req.url;
  if (filePath === './') {
    filePath = './build/index.html';
  } else {
    filePath = './build' + req.url;
  }

  // Vérifier si le fichier existe
  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) {
      // Fichier non trouvé, renvoyer 404
      console.error(`Fichier non trouvé: ${filePath}`);
      res.writeHead(404);
      res.end('Fichier non trouvé!');
      return;
    }

    // Obtenir l'extension du fichier
    const extname = String(path.extname(filePath)).toLowerCase();
    
    // Type de contenu par défaut
    const contentType = MIME_TYPES[extname] || 'application/octet-stream';
    
    // Lire et servir le fichier
    fs.readFile(filePath, (err, content) => {
      if (err) {
        // Une erreur s'est produite lors de la lecture du fichier
        console.error(`Erreur de lecture de fichier: ${err}`);
        res.writeHead(500);
        res.end(`Erreur du serveur: ${err.code}`);
      } else {
        // Succès - renvoyer le contenu du fichier
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(content, 'utf-8');
      }
    });
  });
});

// Démarrer le serveur
server.listen(PORT, () => {
  console.log(`Serveur démarré sur http://localhost:${PORT}/`);
  console.log(`Assurez-vous d'avoir exécuté "npm run build" pour générer les fichiers statiques.`);
}); 