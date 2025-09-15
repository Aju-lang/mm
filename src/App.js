import React, { useState, useEffect } from 'react';
import { FirebaseAuthProvider, useFirebaseAuth } from './contexts/FirebaseAuthContext';
import firebaseMigration from './utils/firebaseMigration';
import Navbar from './components/Layout/Navbar';
import FirebaseLogin from './components/Auth/FirebaseLogin';
import FirebaseStudentDashboard from './components/Dashboard/FirebaseStudentDashboard';
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
  const { isAuthenticated, loading } = useFirebaseAuth();
  const [migrationStatus, setMigrationStatus] = useState({ 
    completed: false, 
    inProgress: false, 
    error: null 
  });

  useEffect(() => {
    // Initialize Firebase and run migration if needed
    const initializeApp = async () => {
      try {
        console.log('🚀 Initializing Firebase-based app...');
        setMigrationStatus({ completed: false, inProgress: true, error: null });
        
        // Check if migration is needed and run it
        const { needsMigration } = await firebaseMigration.checkMigrationStatus();
        
        if (needsMigration) {
          console.log('📦 Running data migration from localStorage to Firebase...');
          const migrationResult = await firebaseMigration.runFullMigration();
          
          if (migrationResult.success) {
            console.log('✅ Migration completed successfully:', migrationResult.message);
          } else {
            console.warn('⚠️ Migration completed with errors:', migrationResult.message);
          }
        }
        
        setMigrationStatus({ completed: true, inProgress: false, error: null });
        console.log('✅ App initialized with Firebase');
      } catch (error) {
        console.error('❌ Error initializing app:', error);
        setMigrationStatus({ 
          completed: false, 
          inProgress: false, 
          error: error.message 
        });
      }
    };

    initializeApp();
  }, []);

  const handleNavigation = (view) => {
    setCurrentView(view);
  };

  if (loading || migrationStatus.inProgress) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">
            {migrationStatus.inProgress ? 'Migrating data to Firebase...' : 'Loading...'}
          </p>
        </div>
      </div>
    );
  }

  if (migrationStatus.error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-red-600 text-6xl mb-4">❌</div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Initialization Error</h2>
          <p className="text-gray-600 mb-4">{migrationStatus.error}</p>
          <button
            onClick={() => window.location.reload()}
            className="btn-primary"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    // Public routes
    if (!isAuthenticated) {
      switch (currentView) {
        case 'login':
          return <FirebaseLogin onNavigate={handleNavigation} />;
        case 'announcements':
          return <EnhancedAnnouncements />;
        case 'results':
          return <StudentResults />;
        default:
          return <FirebaseStudentDashboard currentView={currentView} />;
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
      <footer className="bg-white border-t border-gray-200 mt-8 sm:mt-12 lg:mt-16">
        <div className="max-w-7xl mx-auto container-responsive">
          <div className="text-center">
            <p className="text-gray-600 text-xs sm:text-sm">
              © 2024 Campus Festival Management System. Built with React & TailwindCSS.
            </p>
            <p className="text-gray-500 text-xs mt-1 sm:mt-2">
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
    <FirebaseAuthProvider>
      <AppContent />
    </FirebaseAuthProvider>
  );
}

export default App;
