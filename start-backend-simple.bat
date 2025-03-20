@echo off
echo ===================================================
echo       DEMARRAGE DU BACKEND DJANGO (SIMPLE)
echo ===================================================
echo.

cd /d D:\Home\Lithium-Dashboard-Enhanced

echo Activation de l'environnement virtuel...
call env\Scripts\activate.bat

echo.
echo Démarrage du serveur Django...
echo.
python manage.py runserver

echo.
echo Si le serveur s'est arrêté, vérifiez les erreurs ci-dessus.
echo.
pause
