import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

// Avant de créer la racine, s'assurer que l'élément n'a pas aria-hidden
const rootElement = document.getElementById('root');
if (rootElement.hasAttribute('aria-hidden')) {
  rootElement.removeAttribute('aria-hidden');
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
); 