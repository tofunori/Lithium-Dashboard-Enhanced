@echo off
set PORT=3001
set HOST=localhost
set WDS_SOCKET_HOST=localhost
set WDS_SOCKET_PORT=0
set BROWSER=none

echo Démarrage de l'application React sur le port 3001...

REM Définir le chemin vers node_modules\.bin
set PATH=%~dp0node_modules\.bin;%PATH%

REM Exécuter directement le fichier react-scripts.js
node "%~dp0node_modules\react-scripts\bin\react-scripts.js" start 