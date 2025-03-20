@echo off
echo ===================================================
echo     DEMARRAGE DE L'APPLICATION (METHODE SIMPLE)
echo ===================================================
echo.

echo Cette méthode va ouvrir deux fenêtres de commande:
echo - Une pour le backend Django
echo - Une pour le frontend React
echo.
echo Vous devez laisser ces fenêtres ouvertes pendant l'utilisation de l'application.
echo.
echo Appuyez sur une touche pour démarrer les serveurs...
pause > nul

echo.
echo 1. Démarrage du backend Django...
start cmd /k "D:\Home\Lithium-Dashboard-Enhanced\start-backend-simple.bat"

echo.
echo 2. Attente de 5 secondes pour permettre au backend de démarrer...
timeout /t 5 > nul

echo.
echo 3. Démarrage du frontend React...
start cmd /k "D:\Home\Lithium-Dashboard-Enhanced\start-frontend-simple.bat"

echo.
echo 4. Attente de 5 secondes pour permettre au frontend de démarrer...
timeout /t 5 > nul

echo.
echo 5. Ouverture du navigateur...
start http://localhost:3004

echo.
echo ===================================================
echo     SERVEURS DEMARRES
echo ===================================================
echo.
echo Backend: http://localhost:8000
echo Frontend: http://localhost:3004
echo.
echo Gardez les fenêtres de commande ouvertes pour maintenir l'application en fonctionnement.
echo Pour arrêter l'application, fermez les fenêtres de commande.
echo.
echo Appuyez sur une touche pour fermer cette fenêtre...
pause > nul
