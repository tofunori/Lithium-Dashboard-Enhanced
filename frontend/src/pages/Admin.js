import React from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './Admin.css';

// Admin components placeholder
// In a real implementation, these would be separate components
const AdminDashboard = () => <div>Dashboard d'administration</div>;
const RefineryList = () => <div>Liste des installations</div>;
const RefineryForm = () => <div>Formulaire d'installation</div>;
const Settings = () => <div>Paramètres</div>;

const Admin = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  const handleLogout = () => {
    logout();
    navigate('/');
  };
  
  return (
    <div className="admin-container">
      <div className="admin-header">
        <h1>Administration - Dashboard Recyclage de Batteries VE</h1>
        <p>Bienvenue, {user?.first_name || user?.username || 'Administrateur'}</p>
        <button onClick={handleLogout} className="btn btn-danger admin-logout-btn">
          Déconnexion
        </button>
      </div>
      
      <div className="admin-content">
        <div className="admin-sidebar">
          <ul className="admin-nav">
            <li>
              <Link to="/admin">Tableau de bord</Link>
            </li>
            <li>
              <Link to="/admin/refineries">Installations</Link>
            </li>
            <li>
              <Link to="/admin/refineries/create">Ajouter une installation</Link>
            </li>
            <li>
              <Link to="/admin/settings">Paramètres</Link>
            </li>
            <li>
              <Link to="/" target="_blank">Voir le dashboard</Link>
            </li>
          </ul>
        </div>
        
        <div className="admin-main">
          <Routes>
            <Route path="/" element={<AdminDashboard />} />
            <Route path="/refineries" element={<RefineryList />} />
            <Route path="/refineries/create" element={<RefineryForm />} />
            <Route path="/refineries/edit/:id" element={<RefineryForm />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </div>
      </div>
    </div>
  );
};

export default Admin;