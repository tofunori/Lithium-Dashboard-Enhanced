@echo off
echo ===================================================
echo    DEMARRAGE DU FRONTEND REACT AVEC NPX
echo ===================================================
echo.

REM Définir les variables d'environnement
set BROWSER=none
set HOST=localhost
set PORT=3003
set DANGEROUSLY_DISABLE_HOST_CHECK=true

REM Démarrer le serveur React
echo Utilisation directe de npx react-scripts...
npx react-scripts start

echo.
if %ERRORLEVEL% NEQ 0 (
    echo ERREUR: Échec du démarrage de React.
    echo.
    echo Vérification de react-scripts...
    echo.
    npm list react-scripts
    echo.
    echo Réinstallation de react-scripts...
    npm install react-scripts --save-dev
    echo.
    echo Nouvelle tentative de démarrage...
    npx react-scripts start
)
