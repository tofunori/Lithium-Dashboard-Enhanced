@echo off
echo ===================================================
echo   INSTALLATION DES DEPENDANCES PDF MANQUANTES
echo ===================================================
echo.

cd /d D:\Home\Lithium-Dashboard-Enhanced\frontend

echo Installation de jspdf et extensions...
call npm install jspdf jspdf-autotable html2canvas --save

echo.
echo Installation d'autres dependances potentielles...
call npm install html2pdf.js --save

echo.
echo Creation d'un lien symbolique local pour assurer la compatibilite...
mklink /d node_modules\jspdf node_modules\jspdf

echo.
echo Configuration terminee. Redemarrage de l'application...
cd /d D:\Home\Lithium-Dashboard-Enhanced
call start-full-app.bat

echo.
echo Ouverture du navigateur...
timeout /t 3
start http://localhost:3003
