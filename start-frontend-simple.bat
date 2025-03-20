@echo off
echo ===================================================
echo       DEMARRAGE DU FRONTEND REACT (SIMPLE)
echo ===================================================
echo.

cd /d D:\Home\Lithium-Dashboard-Enhanced\frontend

echo Démarrage du serveur React...
echo.

set BROWSER=none
set HOST=localhost
set PORT=3004
set DANGEROUSLY_DISABLE_HOST_CHECK=true

echo npx react-scripts start
npx react-scripts start

echo.
echo Si le serveur s'est arrêté, vérifiez les erreurs ci-dessus.
echo.
pause
