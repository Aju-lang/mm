import React from 'react';
import { resetStudentData } from '../../utils/localStorage';

const DataReset = ({ onReset }) => {
  const handleReset = () => {
    if (window.confirm('This will delete all existing student data and replace it with the new team-based data. Are you sure?')) {
      // Clear all existing data
      localStorage.removeItem('festival_students');
      localStorage.removeItem('festival_competitions');
      localStorage.removeItem('festival_announcements');
      localStorage.removeItem('festival_gallery');
      
      // Force reinitialize with new data
      resetStudentData();
      
      // Reload the page to refresh all components
      window.location.reload();
    }
  };

  return (
    <div className="card border-red-200 bg-red-50">
      <h3 className="text-lg font-semibold text-red-900 mb-4">⚠️ Reset Festival Data</h3>
      <p className="text-red-700 mb-4">
        This will delete all existing data and initialize with the new team-based student data 
        (Team A and Team B with the provided names).
      </p>
      <button
        onClick={handleReset}
        className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg"
      >
        Reset All Data
      </button>
    </div>
  );
};

export default DataReset;
