import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import './Navbar.css';

const Navbar = ({ toggleDarkMode, darkMode }) => {
  const { isAuthenticated, logout } = useAuth();
  
  return (
    <nav className="navbar">
      <div className="container navbar-container">
        <div className="navbar-brand">
          <Link to="/">Dashboard Recyclage de Batteries VE</Link>
        </div>
        
        <div className="navbar-menu">
          <ul className="navbar-nav">
            <li className="nav-item">
              <Link to="/" className="nav-link">Accueil</Link>
            </li>
            {isAuthenticated ? (
              <>
                <li className="nav-item">
                  <Link to="/admin" className="nav-link">Administration</Link>
                </li>
                <li className="nav-item">
                  <button onClick={logout} className="nav-link btn-link">Déconnexion</button>
                </li>
              </>
            ) : (
              <li className="nav-item">
                <Link to="/login" className="nav-link">Connexion</Link>
              </li>
            )}
            <li className="nav-item">
              <button onClick={toggleDarkMode} className="nav-link btn-link">
                {darkMode ? '☀️ Mode clair' : '🌙 Mode sombre'}
              </button>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;