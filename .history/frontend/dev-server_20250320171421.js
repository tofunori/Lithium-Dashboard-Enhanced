// Un serveur de développement simple utilisant le module http de Node.js
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3001;

// Types MIME pour différents types de fichiers
const MIME_TYPES = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.jsx': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'application/font-woff',
  '.woff2': 'application/font-woff2',
  '.ttf': 'font/ttf',
  '.eot': 'application/vnd.ms-fontobject',
  '.otf': 'font/otf'
};

// Dossier source contenant les fichiers du frontend
const STATIC_ROOT = path.join(__dirname, 'src');
const INDEX_HTML = path.join(STATIC_ROOT, 'index.html');

// Vérifier si index.html existe, sinon créer un fichier temporaire
if (!fs.existsSync(INDEX_HTML)) {
  const tempHTML = `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Lithium Dashboard</title>
      <style>
        body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
        h1 { color: #333; }
        p { margin: 20px 0; }
      </style>
    </head>
    <body>
      <h1>Serveur de développement actif</h1>
      <p>Le serveur est en cours d'exécution sur le port ${PORT}.</p>
      <p>Placez vos fichiers dans le dossier <code>src</code> pour les servir.</p>
    </body>
    </html>
  `;
  
  // Créer le dossier src s'il n'existe pas
  if (!fs.existsSync(STATIC_ROOT)) {
    fs.mkdirSync(STATIC_ROOT, { recursive: true });
  }
  
  fs.writeFileSync(INDEX_HTML, tempHTML);
  console.log(`Fichier index.html temporaire créé dans ${STATIC_ROOT}`);
}

// Créer le serveur HTTP
const server = http.createServer((req, res) => {
  console.log(`${req.method} ${req.url}`);
  
  // Normaliser l'URL demandée
  let url = req.url;
  
  // Servir index.html pour la racine
  if (url === '/') {
    url = '/index.html';
  }
  
  // Construire le chemin du fichier
  const filePath = path.join(STATIC_ROOT, url);
  
  // Vérifier si le fichier existe
  fs.stat(filePath, (err, stats) => {
    if (err) {
      if (err.code === 'ENOENT') {
        // Fichier non trouvé, servir index.html (pour les applications SPA)
        fs.readFile(INDEX_HTML, (err, data) => {
          if (err) {
            res.writeHead(500);
            res.end('Erreur du serveur');
            return;
          }
          res.writeHead(200, { 'Content-Type': 'text/html' });
          res.end(data);
        });
      } else {
        // Autre erreur
        res.writeHead(500);
        res.end(`Erreur du serveur: ${err.code}`);
      }
      return;
    }
    
    // Si c'est un répertoire, servir index.html dans ce répertoire
    if (stats.isDirectory()) {
      const indexPath = path.join(filePath, 'index.html');
      fs.stat(indexPath, (err) => {
        if (err) {
          // Pas d'index.html dans ce répertoire, servir le principal
          fs.readFile(INDEX_HTML, (err, data) => {
            if (err) {
              res.writeHead(500);
              res.end('Erreur du serveur');
              return;
            }
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(data);
          });
          return;
        }
        
        // Servir index.html du répertoire
        fs.readFile(indexPath, (err, data) => {
          if (err) {
            res.writeHead(500);
            res.end('Erreur du serveur');
            return;
          }
          res.writeHead(200, { 'Content-Type': 'text/html' });
          res.end(data);
        });
      });
      return;
    }
    
    // Lire et servir le fichier
    fs.readFile(filePath, (err, data) => {
      if (err) {
        res.writeHead(500);
        res.end(`Erreur du serveur: ${err.code}`);
        return;
      }
      
      // Déterminer le type MIME
      const ext = path.extname(filePath);
      const contentType = MIME_TYPES[ext] || 'application/octet-stream';
      
      // Ajouter les en-têtes CORS
      res.writeHead(200, {
        'Content-Type': contentType,
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept'
      });
      
      res.end(data);
    });
  });
});

// Démarrer le serveur
server.listen(PORT, () => {
  console.log(`Serveur démarré sur http://localhost:${PORT}/`);
  console.log(`Serveur les fichiers depuis ${STATIC_ROOT}`);
}); 