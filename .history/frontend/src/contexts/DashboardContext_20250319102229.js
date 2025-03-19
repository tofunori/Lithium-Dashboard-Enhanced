import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';

// Configuration d'axios pour le débogage
axios.interceptors.request.use(request => {
  console.log('Starting Request', request);
  return request;
});

axios.interceptors.response.use(
  response => {
    console.log('Response:', response);
    return response;
  },
  error => {
    console.error('API Error:', error.response || error);
    return Promise.reject(error);
  }
);

const DashboardContext = createContext();

export const DashboardProvider = ({ children }) => {
  const { getAuthHeader } = useAuth();
  
  // State variables
  const [refineries, setRefineries] = useState([]);
  const [settings, setSettings] = useState(null);
  const [filteredRefineries, setFilteredRefineries] = useState([]);
  const [filters, setFilters] = useState({
    country: 'all',
    status: 'all',
    minCapacity: 0
  });
  const [stats, setStats] = useState({
    totalRefineries: 0,
    operationalRefineries: 0,
    constructionRefineries: 0,
    totalCapacity: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Fetch refineries data
  const fetchRefineries = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('Fetching refineries...');
      const response = await axios.get('/api/refineries/');
      console.log('API response:', response.data);
      // Vérifier et transformer les coordonnées si nécessaire
      const processedData = response.data.map(refinery => ({
        ...refinery,
        coordinates: Array.isArray(refinery.coordinates) ? 
          refinery.coordinates : 
          [refinery.latitude || 0, refinery.longitude || 0]
      }));
      console.log('Processed refineries:', processedData);
      setRefineries(processedData);
    } catch (err) {
      console.error('Error fetching refineries:', err);
      setError('Failed to load refineries data');
    } finally {
      setLoading(false);
    }
  };
  
  // Fetch dashboard settings
  const fetchSettings = async () => {
    try {
      console.log('Fetching settings...');
      const response = await axios.get('/api/settings/current/');
      console.log('Settings response:', response.data);
      setSettings(response.data);
    } catch (err) {
      console.error('Error fetching settings:', err);
    }
  };
  
  // Fetch stats
  const fetchStats = async () => {
    try {
      console.log('Fetching stats...');
      const response = await axios.get('/api/refineries/stats/');
      console.log('Stats response:', response.data);
      setStats({
        totalRefineries: response.data.total_refineries,
        operationalRefineries: response.data.operational_refineries,
        constructionRefineries: response.data.construction_refineries,
        totalCapacity: response.data.total_capacity
      });
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };
  
  // Filter refineries based on current filters
  const filterRefineries = () => {
    if (!refineries.length) return [];
    
    const filtered = refineries.filter(refinery => {
      // Filter by country
      if (filters.country !== 'all' && refinery.country !== filters.country) {
        return false;
      }
      
      // Filter by status
      if (filters.status !== 'all' && refinery.status !== filters.status) {
        return false;
      }
      
      // Filter by minimum capacity (simplified implementation)
      if (filters.minCapacity > 0) {
        const capacityStr = refinery.production || '';
        const capacityMatch = capacityStr.match(/\d+/);
        const capacity = capacityMatch ? parseInt(capacityMatch[0], 10) : 0;
        
        if (capacity < filters.minCapacity) {
          return false;
        }
      }
      
      return true;
    });
    
    setFilteredRefineries(filtered);
  };
  
  // Update filters
  const updateFilters = (newFilters) => {
    setFilters({ ...filters, ...newFilters });
  };
  
  // Create a new refinery
  const createRefinery = async (refineryData) => {
    try {
      const response = await axios.post('/api/refineries/', refineryData, {
        headers: getAuthHeader()
      });
      
      // Refresh data after creation
      fetchRefineries();
      fetchStats();
      
      return { success: true, data: response.data };
    } catch (err) {
      console.error('Error creating refinery:', err);
      return { 
        success: false, 
        error: err.response?.data || 'Error creating refinery' 
      };
    }
  };
  
  // Update a refinery
  const updateRefinery = async (id, refineryData) => {
    try {
      const response = await axios.put(`/api/refineries/${id}/`, refineryData, {
        headers: getAuthHeader()
      });
      
      // Refresh data after update
      fetchRefineries();
      fetchStats();
      
      return { success: true, data: response.data };
    } catch (err) {
      console.error('Error updating refinery:', err);
      return { 
        success: false, 
        error: err.response?.data || 'Error updating refinery' 
      };
    }
  };
  
  // Delete a refinery
  const deleteRefinery = async (id) => {
    try {
      await axios.delete(`/api/refineries/${id}/`, {
        headers: getAuthHeader()
      });
      
      // Refresh data after deletion
      fetchRefineries();
      fetchStats();
      
      return { success: true };
    } catch (err) {
      console.error('Error deleting refinery:', err);
      return { 
        success: false, 
        error: err.response?.data || 'Error deleting refinery' 
      };
    }
  };
  
  // Increment settings version
  const incrementVersion = async () => {
    try {
      const response = await axios.post('/api/settings/increment_version/', {}, {
        headers: getAuthHeader()
      });
      
      setSettings(response.data);
      return { success: true, data: response.data };
    } catch (err) {
      console.error('Error incrementing version:', err);
      return { 
        success: false, 
        error: err.response?.data || 'Error incrementing version' 
      };
    }
  };
  
  // Load data on initial render
  useEffect(() => {
    console.log('DashboardContext initialized, fetching data...');
    fetchRefineries();
    fetchSettings();
    fetchStats();
  }, []);
  
  // Apply filters when refineries or filters change
  useEffect(() => {
    filterRefineries();
  }, [refineries, filters]);
  
  const value = {
    refineries,
    filteredRefineries,
    settings,
    stats,
    filters,
    loading,
    error,
    fetchRefineries,
    fetchSettings,
    fetchStats,
    updateFilters,
    createRefinery,
    updateRefinery,
    deleteRefinery,
    incrementVersion
  };
  
  return <DashboardContext.Provider value={value}>{children}</DashboardContext.Provider>;
};

export const useDashboard = () => useContext(DashboardContext);
