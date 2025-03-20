@echo off
set PORT=3001
set HOST=localhost
set WDS_SOCKET_HOST=localhost
set WDS_SOCKET_PORT=0
set BROWSER=none

echo Démarrage de l'application React sur le port 3001...

REM Utiliser le chemin complet vers node.exe
"C:\Program Files\nodejs\node.exe" "%~dp0node_modules\react-scripts\scripts\start.js" 