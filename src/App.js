import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { initializeData } from './utils/localStorage';
import Navbar from './components/Layout/Navbar';
import Login from './components/Auth/Login';
import StudentDashboard from './components/Dashboard/StudentDashboard';
import AdminDashboard from './components/Admin/AdminDashboard';
import EnhancedCompetitionManager from './components/Admin/EnhancedCompetitionManager';
import StudentManager from './components/Admin/StudentManager';
import PosterCreator from './components/Admin/PosterCreator';
import GalleryManager from './components/Admin/GalleryManager';
import AnnouncementManager from './components/Admin/AnnouncementManager';
import ResultsManager from './components/Admin/ResultsManager';
import EnhancedAnnouncements from './components/Dashboard/EnhancedAnnouncements';
import StudentResults from './components/Dashboard/StudentResults';

function AppContent() {
  const [currentView, setCurrentView] = useState('dashboard');
  const { isAuthenticated, loading } = useAuth();

  useEffect(() => {
    // Initialize localStorage data on first load
    initializeData();
  }, []);

  const handleNavigation = (view) => {
    setCurrentView(view);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    // Public routes
    if (!isAuthenticated) {
      switch (currentView) {
        case 'login':
          return <Login onNavigate={handleNavigation} />;
        case 'announcements':
          return <EnhancedAnnouncements />;
        case 'results':
          return <StudentResults />;
        default:
          return <StudentDashboard currentView={currentView} />;
      }
    }

    // Admin routes
    switch (currentView) {
      case 'admin':
        return <AdminDashboard />;
      case 'competitions-admin':
        return <EnhancedCompetitionManager />;
      case 'students-admin':
        return <StudentManager />;
      case 'poster-creator':
        return <PosterCreator />;
      case 'gallery-admin':
        return <GalleryManager />;
      case 'announcements-admin':
        return <AnnouncementManager />;
      case 'results-admin':
        return <ResultsManager />;
      default:
        return <AdminDashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar currentView={currentView} onNavigate={handleNavigation} />
      <main>
        {renderContent()}
      </main>
      
      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <p className="text-gray-600 text-sm">
              © 2024 Campus Festival Management System. Built with React & TailwindCSS.
            </p>
            <p className="text-gray-500 text-xs mt-2">
              Manage your college festivals with ease - No backend required!
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
