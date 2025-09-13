import React, { useEffect } from 'react';
import CountdownTimer from './CountdownTimer';
import AnnouncementTicker from './AnnouncementTicker';
import StudentSearch from './StudentSearch';
import CompetitionsList from './CompetitionsList';
import Leaderboard from './Leaderboard';
import Gallery from './Gallery';
import { getFestivalData, updateStudentRecords } from '../../utils/localStorage';

const StudentDashboard = ({ currentView }) => {
  const festivalData = getFestivalData();

  // Update student records when dashboard loads
  useEffect(() => {
    updateStudentRecords();
  }, [currentView]);

  const renderContent = () => {
    switch (currentView) {
      case 'competitions':
        return <CompetitionsList />;
      case 'leaderboard':
        return <Leaderboard />;
      case 'gallery':
        return <Gallery />;
      default:
        return (
          <div className="space-y-8">
            {/* Festival Info & Countdown */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="card">
                <div className="text-center mb-6">
                  <div className="text-6xl mb-4">{festivalData.logo}</div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">{festivalData.name}</h1>
                  <p className="text-gray-600 mb-4">{festivalData.description}</p>
                  <div className="flex items-center justify-center space-x-4 text-sm text-gray-500">
                    <span>📅 {festivalData.startDate} - {festivalData.endDate}</span>
                    <span>📍 {festivalData.venue}</span>
                  </div>
                </div>
              </div>
              <CountdownTimer targetDate={festivalData.startDate} />
            </div>

            {/* Student Search */}
            <StudentSearch />

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="card text-center">
                <div className="text-3xl mb-2">🎯</div>
                <div className="text-2xl font-bold text-primary-600">5</div>
                <div className="text-sm text-gray-600">Total Competitions</div>
              </div>
              <div className="card text-center">
                <div className="text-3xl mb-2">👥</div>
                <div className="text-2xl font-bold text-secondary-600">10</div>
                <div className="text-sm text-gray-600">Registered Students</div>
              </div>
              <div className="card text-center">
                <div className="text-3xl mb-2">🏆</div>
                <div className="text-2xl font-bold text-green-600">3</div>
                <div className="text-sm text-gray-600">Days to Go</div>
              </div>
            </div>

            {/* Recent Updates */}
            <div className="card">
              <h3 className="text-xl font-bold text-gray-900 mb-4">📢 Recent Updates</h3>
              <div className="space-y-3">
                <div className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
                  <span className="text-blue-600">ℹ️</span>
                  <div>
                    <h4 className="font-medium text-blue-900">Registration Extended</h4>
                    <p className="text-sm text-blue-700">Registration deadline has been extended to October 12th due to high demand.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg">
                  <span className="text-green-600">✅</span>
                  <div>
                    <h4 className="font-medium text-green-900">New Competition Added</h4>
                    <p className="text-sm text-green-700">Photography Contest has been added to the event lineup. Check it out!</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3 p-3 bg-yellow-50 rounded-lg">
                  <span className="text-yellow-600">⚠️</span>
                  <div>
                    <h4 className="font-medium text-yellow-900">Venue Change</h4>
                    <p className="text-sm text-yellow-700">Dance Battle venue has been moved to the Main Auditorium.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <AnnouncementTicker />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderContent()}
      </div>
    </div>
  );
};

export default StudentDashboard;

