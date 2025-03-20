@echo off
echo ===================================================
echo     INSTALLATION DES DEPENDANCES PDF MANQUANTES
echo ===================================================
echo.

echo Installation de jspdf et autres bibliotheques PDF...
call npm install jspdf html2canvas jspdf-autotable --save

echo.
echo Verification si d'autres dependances sont necessaires...
call npm install @babel/runtime @babel/plugin-transform-runtime --save-dev

echo.
echo Installation terminee. Redemarrage du serveur de developpement...
set BROWSER=none
set HOST=localhost
set PORT=3003
set DANGEROUSLY_DISABLE_HOST_CHECK=true
call npm run dev

echo.
echo Si le probleme persiste, verifiez le composant ReportsView.js
echo pour vous assurer que l'import de jspdf est correct:
echo.
echo import jsPDF from 'jspdf';
echo.
