import React from 'react';
import CountdownTimer from './CountdownTimer';
import AnnouncementTicker from './AnnouncementTicker';
import StudentSearch from './StudentSearch';
import CompetitionsList from './CompetitionsList';
import Leaderboard from './Leaderboard';
import Gallery from './Gallery';
import { useFestivalData, useDashboardStats, useAnnouncements } from '../../hooks/useFirestore';

const FirebaseStudentDashboard = ({ currentView }) => {
  const { festivalData, loading: festivalLoading } = useFestivalData();
  const stats = useDashboardStats();
  const { getRecentAnnouncements } = useAnnouncements();

  // Component for recent announcements using Firebase data
  const RecentAnnouncements = () => {
    const recentAnnouncements = getRecentAnnouncements(3);

    if (recentAnnouncements.length === 0) {
      return (
        <div className="text-center py-4 text-gray-500">
          <span className="text-2xl mb-2 block">📢</span>
          <p>No recent announcements</p>
        </div>
      );
    }

    return (
      <>
        {recentAnnouncements.map((announcement) => (
          <div key={announcement.id} className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
            <span className="text-blue-600">📢</span>
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-blue-900 truncate">{announcement.title}</h4>
              <p className="text-sm text-blue-700 mt-1 line-clamp-2">{announcement.message}</p>
              {announcement.createdAt && (
                <p className="text-xs text-blue-600 mt-1">
                  {new Date(announcement.createdAt.toDate()).toLocaleDateString()}
                </p>
              )}
            </div>
          </div>
        ))}
      </>
    );
  };

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
          <div className="space-y-6 sm:space-y-8">
            {/* Festival Info & Countdown */}
            <div className="grid-responsive-2">
              <div className="card-responsive">
                <div className="text-center mb-4 sm:mb-6">
                  <div className="text-4xl sm:text-5xl lg:text-6xl mb-3 sm:mb-4">
                    {festivalLoading ? '⏳' : festivalData.logo}
                  </div>
                  <h1 className="text-responsive-lg text-gray-900 mb-2">
                    {festivalLoading ? 'Loading...' : festivalData.name}
                  </h1>
                  <p className="text-gray-600 mb-3 sm:mb-4 text-sm sm:text-base">
                    {festivalData.description}
                  </p>
                  <div className="flex flex-col sm:flex-row items-center justify-center space-y-2 sm:space-y-0 sm:space-x-4 text-xs sm:text-sm text-gray-500">
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
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 lg:gap-6">
              <div className="card-responsive text-center">
                <div className="text-2xl sm:text-3xl mb-2">🎯</div>
                <div className="text-xl sm:text-2xl font-bold text-primary-600">
                  {stats.totalCompetitions || 0}
                </div>
                <div className="text-xs sm:text-sm text-gray-600">Total Competitions</div>
              </div>
              <div className="card-responsive text-center">
                <div className="text-2xl sm:text-3xl mb-2">👥</div>
                <div className="text-xl sm:text-2xl font-bold text-secondary-600">
                  {stats.totalStudents || 0}
                </div>
                <div className="text-xs sm:text-sm text-gray-600">Registered Students</div>
              </div>
              <div className="card-responsive text-center">
                <div className="text-2xl sm:text-3xl mb-2">⏰</div>
                <div className="text-xl sm:text-2xl font-bold text-green-600">
                  {stats.daysToGo || 0}
                </div>
                <div className="text-xs sm:text-sm text-gray-600">Days to Go</div>
              </div>
              <div className="card-responsive text-center">
                <div className="text-2xl sm:text-3xl mb-2">✅</div>
                <div className="text-xl sm:text-2xl font-bold text-purple-600">
                  {stats.completedCompetitions || 0}
                </div>
                <div className="text-xs sm:text-sm text-gray-600">Completed Events</div>
              </div>
              <div className="card-responsive text-center">
                <div className="text-2xl sm:text-3xl mb-2">📢</div>
                <div className="text-xl sm:text-2xl font-bold text-yellow-600">
                  {stats.activeAnnouncements || 0}
                </div>
                <div className="text-xs sm:text-sm text-gray-600">Active Announcements</div>
              </div>
              <div className="card-responsive text-center">
                <div className="text-2xl sm:text-3xl mb-2">📸</div>
                <div className="text-xl sm:text-2xl font-bold text-pink-600">
                  {stats.galleryImages || 0}
                </div>
                <div className="text-xs sm:text-sm text-gray-600">Gallery Images</div>
              </div>
            </div>

            {/* Recent Updates */}
            <div className="card-responsive">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 space-y-2 sm:space-y-0">
                <h3 className="text-lg sm:text-xl font-bold text-gray-900">📢 Recent Updates</h3>
                <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                  Live Updates
                </div>
              </div>
              <div className="space-y-3">
                <RecentAnnouncements />
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <AnnouncementTicker />
      <div className="max-w-7xl mx-auto container-responsive">
        {renderContent()}
      </div>
    </div>
  );
};

export default FirebaseStudentDashboard;
