import React from 'react';
import './Footer.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="footer">
      <div className="container">
        <p>
          Dashboard des Installations de Recyclage de Batteries de Véhicules Électriques en Amérique du Nord - {currentYear}
        </p>
        <p>
          <a href="https://github.com/tofunori/Lithium-Dashboard-Enhanced" target="_blank" rel="noopener noreferrer">
            Code source sur GitHub
          </a>
        </p>
      </div>
    </footer>
  );
};

export default Footer;