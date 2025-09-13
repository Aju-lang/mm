import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { getFestivalData } from '../../utils/localStorage';

const Navbar = ({ onNavigate, currentView }) => {
  const { isAuthenticated, logout } = useAuth();
  const festivalData = getFestivalData();

  const handleLogout = () => {
    logout();
    onNavigate('dashboard');
  };

  return (
    <nav className="bg-white shadow-lg border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and Festival Name */}
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <span className="text-3xl mr-3">{festivalData.logo}</span>
              <div>
                <h1 className="text-xl font-bold text-gray-900">{festivalData.name}</h1>
                <p className="text-sm text-gray-500">{festivalData.venue}</p>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="flex items-center space-x-4">
            {!isAuthenticated ? (
              <>
                <button
                  onClick={() => onNavigate('dashboard')}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    currentView === 'dashboard'
                      ? 'bg-primary-100 text-primary-700'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  Dashboard
                </button>
                <button
                  onClick={() => onNavigate('competitions')}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    currentView === 'competitions'
                      ? 'bg-primary-100 text-primary-700'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  Competitions
                </button>
                <button
                  onClick={() => onNavigate('leaderboard')}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    currentView === 'leaderboard'
                      ? 'bg-primary-100 text-primary-700'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  Leaderboard
                </button>
                <button
                  onClick={() => onNavigate('gallery')}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    currentView === 'gallery'
                      ? 'bg-primary-100 text-primary-700'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  Gallery
                </button>
                <button
                  onClick={() => onNavigate('announcements')}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    currentView === 'announcements'
                      ? 'bg-primary-100 text-primary-700'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  Announcements
                </button>
                <button
                  onClick={() => onNavigate('results')}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    currentView === 'results'
                      ? 'bg-primary-100 text-primary-700'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  Results
                </button>
                <button
                  onClick={() => onNavigate('login')}
                  className="btn-primary"
                >
                  Admin Login
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => onNavigate('admin')}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    currentView === 'admin'
                      ? 'bg-primary-100 text-primary-700'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  Admin Dashboard
                </button>
                <button
                  onClick={() => onNavigate('competitions-admin')}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    currentView === 'competitions-admin'
                      ? 'bg-primary-100 text-primary-700'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  Competitions
                </button>
                <button
                  onClick={() => onNavigate('students-admin')}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    currentView === 'students-admin'
                      ? 'bg-primary-100 text-primary-700'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  Students
                </button>
                <button
                  onClick={() => onNavigate('gallery-admin')}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    currentView === 'gallery-admin'
                      ? 'bg-primary-100 text-primary-700'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  Gallery
                </button>
                <button
                  onClick={() => onNavigate('announcements-admin')}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    currentView === 'announcements-admin'
                      ? 'bg-primary-100 text-primary-700'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  Announcements
                </button>
                <button
                  onClick={() => onNavigate('results-admin')}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    currentView === 'results-admin'
                      ? 'bg-primary-100 text-primary-700'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  Update Results
                </button>
                <button
                  onClick={handleLogout}
                  className="btn-outline"
                >
                  Logout
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
