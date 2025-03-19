import React from 'react';
import { useDashboard } from '../contexts/DashboardContext';
import './Dashboard.css';

const Dashboard = () => {
  const { 
    filteredRefineries, 
    settings, 
    stats, 
    filters, 
    updateFilters, 
    loading, 
    error 
  } = useDashboard();
  
  if (loading) {
    return (
      <div className="dashboard-loading">
        <h2>Chargement du dashboard...</h2>
        <div className="loading-spinner"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="dashboard-error">
        <h2>Erreur de chargement</h2>
        <p>{error}</p>
        <button className="btn" onClick={() => window.location.reload()}>
          Réessayer
        </button>
      </div>
    );
  }
  
  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>Dashboard des Installations de Recyclage de Batteries de Véhicules Électriques en Amérique du Nord</h1>
        <p className="dashboard-version">Version: {settings?.version || 'N/A'}</p>
      </header>
      
      <div className="dashboard-filters">
        <div className="filter-group">
          <label htmlFor="country-filter">Pays:</label>
          <select 
            id="country-filter"
            value={filters.country}
            onChange={(e) => updateFilters({ country: e.target.value })}
          >
            <option value="all">Tous les pays</option>
            <option value="Canada">Canada</option>
            <option value="USA">États-Unis</option>
            <option value="Mexico">Mexique</option>
          </select>
        </div>
        
        <div className="filter-group">
          <label htmlFor="status-filter">Statut:</label>
          <select 
            id="status-filter"
            value={filters.status}
            onChange={(e) => updateFilters({ status: e.target.value })}
          >
            <option value="all">Tous les statuts</option>
            <option value="operational">Opérationnel</option>
            <option value="construction">En construction</option>
            <option value="planned">Planifié</option>
            <option value="approved">Approuvé</option>
            <option value="suspended">En pause</option>
          </select>
        </div>
        
        <div className="filter-group">
          <label htmlFor="capacity-filter">Capacité minimale:</label>
          <input 
            type="range" 
            id="capacity-filter" 
            min="0" 
            max="10000" 
            step="500" 
            value={filters.minCapacity}
            onChange={(e) => updateFilters({ minCapacity: parseInt(e.target.value) })}
          />
          <span id="capacity-value">{filters.minCapacity}</span>
        </div>
      </div>
      
      <div className="dashboard-stats">
        <div className="stat-card">
          <h3>Total des installations</h3>
          <p>{stats.totalRefineries}</p>
        </div>
        <div className="stat-card">
          <h3>Opérationnelles</h3>
          <p>{stats.operationalRefineries}</p>
        </div>
        <div className="stat-card">
          <h3>En construction</h3>
          <p>{stats.constructionRefineries}</p>
        </div>
        <div className="stat-card">
          <h3>Capacité totale (tpa)</h3>
          <p>{stats.totalCapacity}</p>
        </div>
      </div>
      
      <div className="dashboard-main">
        <div className="card map-container">
          <h2>Carte des Installations</h2>
          <div className="map-placeholder">
            [Carte interactive sera affichée ici]
          </div>
        </div>
        
        <div className="card chart-container">
          <h2>Distribution par pays et statut</h2>
          <div className="chart-placeholder">
            [Graphiques seront affichés ici]
          </div>
        </div>
      </div>
      
      <div className="card">
        <h2>Liste des Installations ({filteredRefineries.length})</h2>
        <div className="table-responsive">
          <table className="refineries-table">
            <thead>
              <tr>
                <th>Nom</th>
                <th>Emplacement</th>
                <th>Pays</th>
                <th>Statut</th>
                <th>Production</th>
                <th>Technologie</th>
              </tr>
            </thead>
            <tbody>
              {filteredRefineries.map(refinery => (
                <tr key={refinery.id}>
                  <td>{refinery.name}</td>
                  <td>{refinery.location}</td>
                  <td>{refinery.country}</td>
                  <td>{refinery.status}</td>
                  <td>{refinery.production}</td>
                  <td>{refinery.processing}</td>
                </tr>
              ))}
              {filteredRefineries.length === 0 && (
                <tr>
                  <td colSpan="6" className="no-data">Aucune installation trouvée avec les filtres actuels</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;