import React, { useEffect, useState } from 'react';
import CountdownTimer from './CountdownTimer';
import AnnouncementTicker from './AnnouncementTicker';
import StudentSearch from './StudentSearch';
import CompetitionsList from './CompetitionsList';
import Leaderboard from './Leaderboard';
import Gallery from './Gallery';
import { hybridStorage, updateStudentRecords } from '../../utils/hybridStorage';

const StudentDashboard = ({ currentView }) => {
  const [festivalData, setFestivalData] = useState({
    name: 'RENDEZVOUS 2025',
    logo: '🎭',
    startDate: '2025-09-19',
    endDate: '2025-09-20',
    venue: 'MARKAZ MIHRAJ MALAYIL'
  });
  
  const [stats, setStats] = useState({
    totalCompetitions: 0,
    totalStudents: 0,
    daysToGo: 0,
    completedCompetitions: 0,
    activeAnnouncements: 0,
    galleryImages: 0
  });

  // Update student records when dashboard loads
  useEffect(() => {
    loadStats();
    loadFestivalData();
    
    // Set up real-time listeners for automatic updates
    const unsubscribeStudents = hybridStorage.onStudentsChange((data) => {
      console.log('📊 Student Dashboard: Students updated via Firebase real-time', data.length);
      loadStats();
    });
    
    const unsubscribeCompetitions = hybridStorage.onCompetitionsChange((data) => {
      console.log('🏆 Student Dashboard: Competitions updated via Firebase real-time', data.length);
      loadStats();
    });
    
    const unsubscribeAnnouncements = hybridStorage.onAnnouncementsChange((data) => {
      console.log('📢 Student Dashboard: Announcements updated via Firebase real-time', data.length);
      loadStats();
    });
    
    const unsubscribeGallery = hybridStorage.onGalleryChange((data) => {
      console.log('🖼️ Student Dashboard: Gallery updated via Firebase real-time', data.length);
      loadStats();
    });
    
    return () => {
      unsubscribeStudents();
      unsubscribeCompetitions();
      unsubscribeAnnouncements();
      unsubscribeGallery();
    };
  }, [currentView]);

  const loadFestivalData = async () => {
    try {
      const data = await hybridStorage.getFestivalData();
      setFestivalData(data);
    } catch (error) {
      console.error('Error loading festival data:', error);
    }
  };

  const loadStats = async () => {
    try {
      await updateStudentRecords();
      
      const [students, competitions, announcements, gallery] = await Promise.all([
        hybridStorage.getStudents(),
        hybridStorage.getCompetitions(),
        hybridStorage.getAnnouncements(),
        hybridStorage.getGallery()
      ]);
      
      // Calculate days to festival
      const startDate = new Date(festivalData.startDate);
      const today = new Date();
      const daysToGo = Math.max(0, Math.ceil((startDate - today) / (1000 * 60 * 60 * 24)));
      
      setStats({
        totalCompetitions: competitions.length,
        totalStudents: students.length,
        daysToGo: daysToGo,
        completedCompetitions: competitions.filter(c => c.status === 'completed').length,
        activeAnnouncements: announcements.filter(a => a.active).length,
        galleryImages: gallery.length
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  // Component for recent announcements
  const RecentAnnouncements = () => {
    const [announcements, setAnnouncements] = useState([]);
    
    useEffect(() => {
      const loadAnnouncements = async () => {
        try {
          const data = await hybridStorage.getAnnouncements();
          setAnnouncements(data.filter(a => a.active).slice(0, 3));
        } catch (error) {
          console.error('Error loading announcements:', error);
        }
      };
      
      loadAnnouncements();
      
      const unsubscribe = hybridStorage.onAnnouncementsChange((data) => {
        setAnnouncements(data.filter(a => a.active).slice(0, 3));
      });
      
      return () => unsubscribe();
    }, []);
    
    return (
      <>
        {announcements.map((announcement) => (
          <div key={announcement.id} className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
            <span className="text-blue-600">📢</span>
            <div>
              <h4 className="font-medium text-blue-900">{announcement.title}</h4>
              <p className="text-sm text-blue-700">{announcement.message}</p>
            </div>
          </div>
        ))}
        {announcements.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <span className="text-4xl mb-4 block">📢</span>
            <p>No active announcements at the moment.</p>
          </div>
        )}
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
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6">
              <div className="card text-center">
                <div className="text-3xl mb-2">🎯</div>
                <div className="text-2xl font-bold text-primary-600">{stats.totalCompetitions}</div>
                <div className="text-sm text-gray-600">Total Competitions</div>
              </div>
              <div className="card text-center">
                <div className="text-3xl mb-2">👥</div>
                <div className="text-2xl font-bold text-secondary-600">{stats.totalStudents}</div>
                <div className="text-sm text-gray-600">Registered Students</div>
              </div>
              <div className="card text-center">
                <div className="text-3xl mb-2">⏰</div>
                <div className="text-2xl font-bold text-green-600">{stats.daysToGo}</div>
                <div className="text-sm text-gray-600">Days to Go</div>
              </div>
              <div className="card text-center">
                <div className="text-3xl mb-2">✅</div>
                <div className="text-2xl font-bold text-purple-600">{stats.completedCompetitions}</div>
                <div className="text-sm text-gray-600">Completed Events</div>
              </div>
              <div className="card text-center">
                <div className="text-3xl mb-2">📢</div>
                <div className="text-2xl font-bold text-yellow-600">{stats.activeAnnouncements}</div>
                <div className="text-sm text-gray-600">Active Announcements</div>
              </div>
              <div className="card text-center">
                <div className="text-3xl mb-2">📸</div>
                <div className="text-2xl font-bold text-pink-600">{stats.galleryImages}</div>
                <div className="text-sm text-gray-600">Gallery Images</div>
              </div>
            </div>

            {/* Recent Updates */}
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-900">📢 Recent Updates</h3>
                <button
                  onClick={loadStats}
                  className="btn-outline text-sm"
                >
                  Refresh
                </button>
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderContent()}
      </div>
    </div>
  );
};

export default StudentDashboard;

