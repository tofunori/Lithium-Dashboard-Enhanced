# Lithium Dashboard Enhanced

## Présentation
Lithium Dashboard est une application de suivi et de gestion des installations de recyclage du lithium. Cette version améliorée propose une interface réactive et une gestion avancée des documents.

## Configuration requise
- Node.js v14+ (recommandé v16+)
- Python 3.8+
- Un navigateur web moderne

## Installation

### Cloner le projet
```bash
git clone <repository-url>
cd Lithium-Dashboard-Enhanced
```

### Installation du backend (Django)
1. Créer et activer un environnement virtuel:
```bash
python -m venv env
# Sur Windows
env\Scripts\activate
# Sur macOS/Linux
source env/bin/activate
```

2. Installer les dépendances:
```bash
cd backend
pip install -r requirements.txt
```

3. Appliquer les migrations:
```bash
cd ..
python manage.py migrate
```

### Installation du frontend (React)
1. Installer les dépendances:
```bash
cd frontend
npm install
```

2. Installer les dépendances PDF (si nécessaire):
```bash
npm install jspdf jspdf-autotable html2canvas html2pdf.js --save
```

## Démarrage de l'application

### Méthode recommandée
Utilisez le script de démarrage automatique:
```bash
start-lithium.bat
```

Ce script:
- Active l'environnement virtuel Python
- Démarre le serveur Django (backend)
- Démarre le serveur React (frontend)
- Ouvre automatiquement l'application dans votre navigateur

### Démarrage manuel
Si vous préférez démarrer les composants séparément:

1. Démarrer le backend:
```bash
# Activez d'abord l'environnement virtuel
cd Lithium-Dashboard-Enhanced
python manage.py runserver
```

2. Démarrer le frontend:
```bash
cd frontend
npm start
```

3. Accéder à l'application à l'adresse: `http://localhost:3003`

## Résolution des problèmes
Si vous rencontrez des problèmes avec l'application:

1. **Erreurs liées aux PDF**:
   - Exécutez `frontend\fix-pdf-dependencies.bat`

2. **Dépendances manquantes**:
   - Exécutez `frontend\install-missing-deps.bat`

3. **Erreurs de connexion backend/frontend**:
   - Vérifiez que le backend est bien lancé sur le port 8000
   - Vérifiez que le proxy est correctement configuré dans le frontend

## Structure du projet
- `/frontend` - Application React
- `/backend` - API Django
- `/lithium_dashboard` - Configuration Django principale
- `/recycling_plants` - Application Django pour la gestion des installations

## Fonctionnalités
- Visualisation des installations de recyclage
- Gestion des documents et rapports
- Analyse de données
- Interface responsive pour mobile et desktop

## Auteur
[Votre nom]

## Licence
[Votre licence]
