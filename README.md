# Lithium-Dashboard Enhanced

Enhanced version of the original Lithium-Dashboard for visualizing electric vehicle battery recycling facilities in North America, now with a Django backend and React frontend for improved functionality and accessibility.

## Features

- **Interactive Map** - View all recycling facilities on an interactive map
- **Detailed Visualizations** - Filter by country, status, and capacity
- **Admin Dashboard** - Secure admin interface for data management
- **User Authentication** - Secure login for authorized users
- **Remote Access** - Access the dashboard from anywhere
- **Responsive Design** - Works on desktop and mobile devices
- **Database Integration** - Persistent data storage with Django's ORM
- **API Endpoints** - RESTful API for data retrieval and updates

## Technology Stack

### Backend
- Django (Python web framework)
- Django REST Framework (API framework)
- PostgreSQL (database)

### Frontend
- React.js (UI framework)
- React-Leaflet (maps)
- Recharts (data visualization)
- Axios (API requests)

## Project Structure

```
Lithium-Dashboard-Enhanced/
├── backend/                 # Django Backend
│   ├── dashboard/           # Main Django project
│   ├── core/                # Core app for models and APIs
│   ├── manage.py            # Django management script
│   └── requirements.txt     # Python dependencies
├── frontend/                # React Frontend
│   ├── public/              # Static files
│   ├── src/                 # React source code
│   ├── package.json         # JavaScript dependencies
│   └── README.md            # Frontend-specific instructions
└── docs/                    # Documentation
```

## Installation

### Backend Setup

1. Navigate to the backend directory:
   ```
   cd backend
   ```

2. Create a virtual environment:
   ```
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies:
   ```
   pip install -r requirements.txt
   ```

4. Run migrations:
   ```
   python manage.py migrate
   ```

5. Create a superuser for admin access:
   ```
   python manage.py createsuperuser
   ```

6. Start the backend server:
   ```
   python manage.py runserver
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```
   cd frontend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the development server:
   ```
   npm start
   ```

## Usage

- Access the dashboard at: http://localhost:3000
- Access the admin interface at: http://localhost:8000/admin
- API endpoints are available at: http://localhost:8000/api/

## Deployment

This project can be deployed using various services:

1. Backend: Render, Heroku, or any Django-compatible hosting
2. Frontend: Netlify, Vercel, or any static site hosting
3. Database: PostgreSQL services like Render, Heroku Postgres, etc.

Detailed deployment instructions are available in the docs/ directory.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- Original Lithium-Dashboard project
- All contributors to the open-source libraries used in this project