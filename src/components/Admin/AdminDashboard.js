import React, { useState, useEffect } from 'react';
import { hybridStorage, updateStudentRecords, forceInitializeStudents, clearAllCompetitionsAndAnnouncements } from '../../utils/hybridStorage';
import DataReset from './DataReset';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalCompetitions: 0,
    activeAnnouncements: 0,
    completedCompetitions: 0,
    totalGalleryImages: 0,
    studentsWithResults: 0
  });

  const [recentActivity, setRecentActivity] = useState([]);

  useEffect(() => {
    loadDashboardData();
    
    // Set up real-time listeners for automatic updates
    const unsubscribeStudents = hybridStorage.onStudentsChange(() => {
      loadDashboardData();
    });
    
    const unsubscribeCompetitions = hybridStorage.onCompetitionsChange(() => {
      loadDashboardData();
    });
    
    const unsubscribeAnnouncements = hybridStorage.onAnnouncementsChange(() => {
      loadDashboardData();
    });
    
    const unsubscribeGallery = hybridStorage.onGalleryChange(() => {
      loadDashboardData();
    });
    
    return () => {
      unsubscribeStudents();
      unsubscribeCompetitions();
      unsubscribeAnnouncements();
      unsubscribeGallery();
    };
  }, []);

  const loadDashboardData = async () => {
    try {
      // Update student records first
      await updateStudentRecords();
      
      const [students, competitions, announcements, gallery] = await Promise.all([
        hybridStorage.getStudents(),
        hybridStorage.getCompetitions(),
        hybridStorage.getAnnouncements(),
        hybridStorage.getGallery()
      ]);

      setStats({
        totalStudents: students.length,
        totalCompetitions: competitions.length,
        activeAnnouncements: announcements.filter(a => a.active).length,
        completedCompetitions: competitions.filter(c => c.status === 'completed').length,
        totalGalleryImages: gallery.length,
        studentsWithResults: students.filter(s => s.results && s.results.length > 0).length
      });

    // Generate real recent activity based on actual data
    const activities = [];
    
    // Recent competitions
    const recentCompetitions = competitions
      .filter(c => c.status === 'completed')
      .slice(-2)
      .map(c => ({
        id: `comp-${c.id}`,
        type: 'competition_completed',
        message: `${c.name} completed with results`,
        time: 'Recently',
        icon: '🏆'
      }));
    
    // Recent announcements
    const recentAnnouncements = announcements
      .filter(a => a.active)
      .slice(-2)
      .map(a => ({
        id: `ann-${a.id}`,
        type: 'announcement_active',
        message: `${a.title} is active`,
        time: 'Recently',
        icon: '📢'
      }));
    
    // Gallery updates
    if (gallery.length > 0) {
      activities.push({
        id: 'gallery-update',
        type: 'gallery_updated',
        message: `${gallery.length} images in gallery`,
        time: 'Recently',
        icon: '📸'
      });
    }
    
    // Student participation
    const participatingStudents = students.filter(s => s.events && s.events.length > 0).length;
    if (participatingStudents > 0) {
      activities.push({
        id: 'student-participation',
        type: 'student_participation',
        message: `${participatingStudents} students participating in events`,
        time: 'Recently',
        icon: '👥'
      });
    }

    const allActivities = [...recentCompetitions, ...recentAnnouncements, ...activities].slice(0, 5);

    setRecentActivity(allActivities);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    }
  };

  const [festivalData, setFestivalData] = useState({
    name: 'RENDEZVOUS 2025',
    logo: '🎭',
    venue: 'MARKAZ MIHRAJ MALAYIL'
  });

  const [isInitializingStudents, setIsInitializingStudents] = useState(false);
  const [isClearingCompetitions, setIsClearingCompetitions] = useState(false);

  useEffect(() => {
    const loadFestivalData = async () => {
      try {
        const data = await hybridStorage.getFestivalData();
        setFestivalData(data);
      } catch (error) {
        console.error('Error loading festival data:', error);
      }
    };
    loadFestivalData();
  }, []);

  const handleForceInitializeStudents = async () => {
    if (!window.confirm('This will clear all students from Firebase and re-add them from localStorage. Are you sure?')) {
      return;
    }

    setIsInitializingStudents(true);
    try {
      await forceInitializeStudents();
      await loadDashboardData(); // Refresh the dashboard
      alert('✅ Students successfully initialized in Firebase!');
    } catch (error) {
      console.error('Error initializing students:', error);
      alert('❌ Error initializing students. Check console for details.');
    } finally {
      setIsInitializingStudents(false);
    }
  };

  const handleClearCompetitions = async () => {
    if (!window.confirm('This will delete ALL existing competitions and announcements. Are you sure? This will give you a fresh start.')) {
      return;
    }

    setIsClearingCompetitions(true);
    try {
      await clearAllCompetitionsAndAnnouncements();
      await loadDashboardData(); // Refresh the dashboard
      alert('✅ All competitions and announcements cleared successfully!');
    } catch (error) {
      console.error('Error clearing competitions:', error);
      alert('❌ Error clearing competitions. Check console for details.');
    } finally {
      setIsClearingCompetitions(false);
    }
  };

  const StatCard = ({ title, value, icon, color, description }) => (
    <div className="card hover:shadow-xl transition-shadow duration-300">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className={`text-3xl font-bold ${color}`}>{value}</p>
          {description && <p className="text-xs text-gray-500 mt-1">{description}</p>}
        </div>
        <div className={`p-3 rounded-full ${color.replace('text-', 'bg-').replace('600', '100')}`}>
          <span className="text-2xl">{icon}</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600">Welcome back! Here's what's happening with {festivalData.name}</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
          <StatCard
            title="Total Students"
            value={stats.totalStudents}
            icon="👥"
            color="text-blue-600"
            description="Registered participants"
          />
          <StatCard
            title="Competitions"
            value={stats.totalCompetitions}
            icon="🎯"
            color="text-green-600"
            description="Total events"
          />
          <StatCard
            title="Completed Events"
            value={stats.completedCompetitions}
            icon="✅"
            color="text-purple-600"
            description="Results available"
          />
          <StatCard
            title="Students with Results"
            value={stats.studentsWithResults}
            icon="🏆"
            color="text-orange-600"
            description="Have participated"
          />
          <StatCard
            title="Gallery Images"
            value={stats.totalGalleryImages}
            icon="📸"
            color="text-pink-600"
            description="Photos uploaded"
          />
          <StatCard
            title="Announcements"
            value={stats.activeAnnouncements}
            icon="📢"
            color="text-yellow-600"
            description="Currently active"
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Activity */}
          <div className="lg:col-span-2">
            <div className="card">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">📊 Recent Activity</h2>
                <button
                  onClick={loadDashboardData}
                  className="btn-outline text-sm"
                >
                  Refresh
                </button>
              </div>
              
              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
                    <div className="flex-shrink-0">
                      <span className="text-xl">{activity.icon}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">{activity.message}</p>
                      <p className="text-xs text-gray-500">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="space-y-6">
            <div className="card">
              <h2 className="text-xl font-bold text-gray-900 mb-6">⚡ Quick Actions</h2>
              <div className="space-y-3">
                <button className="w-full btn-primary text-left">
                  <span className="mr-2">➕</span>
                  Add New Competition
                </button>
                <button className="w-full btn-secondary text-left">
                  <span className="mr-2">📊</span>
                  Reporting
                </button>
                <button className="w-full btn-outline text-left">
                  <span className="mr-2">📢</span>
                  Create Announcement
                </button>
                <button className="w-full btn-outline text-left">
                  <span className="mr-2">🏆</span>
                  Update Results
                </button>
              </div>
            </div>

            {/* Festival Info */}
            <div className="card">
              <h2 className="text-xl font-bold text-gray-900 mb-4">🎭 Festival Info</h2>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Name:</span>
                  <span className="font-medium">{festivalData.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Dates:</span>
                  <span className="font-medium">{festivalData.startDate} - {festivalData.endDate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Venue:</span>
                  <span className="font-medium">{festivalData.venue}</span>
                </div>
              </div>
            </div>

            {/* System Status */}
            <div className="card">
              <h2 className="text-xl font-bold text-gray-900 mb-4">🔧 System Status</h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Database</span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    <span className="w-1.5 h-1.5 bg-green-400 rounded-full mr-1"></span>
                    Online
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Registrations</span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    <span className="w-1.5 h-1.5 bg-green-400 rounded-full mr-1"></span>
                    Active
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Announcements</span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    <span className="w-1.5 h-1.5 bg-green-400 rounded-full mr-1"></span>
                    Broadcasting
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Firebase Student Initialization */}
          <div className="mt-8">
            <div className="card bg-blue-50 border-blue-200">
              <div className="flex items-start space-x-4">
                <div className="p-2 bg-blue-100 rounded-full">
                  <span className="text-blue-600 text-xl">🔄</span>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-blue-900 mb-2">
                    Initialize Students in Firebase
                  </h3>
                  <p className="text-sm text-blue-700 mb-4">
                    If students are not showing in the admin interface, click this button to force initialize all students in Firebase from localStorage data.
                  </p>
                  
                  <button
                    onClick={handleForceInitializeStudents}
                    disabled={isInitializingStudents}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isInitializingStudents ? 'Initializing Students...' : 'Initialize Students in Firebase'}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Clear Default Competitions */}
          <div className="mt-6">
            <div className="card bg-yellow-50 border-yellow-200">
              <div className="flex items-start space-x-4">
                <div className="p-2 bg-yellow-100 rounded-full">
                  <span className="text-yellow-600 text-xl">🧹</span>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-yellow-900 mb-2">
                    Clear All Competitions & Announcements
                  </h3>
                  <p className="text-sm text-yellow-700 mb-4">
                    If you see competitions you didn't add, click this to remove all existing competitions and announcements. This gives you a fresh start to add only your own events.
                  </p>
                  
                  <button
                    onClick={handleClearCompetitions}
                    disabled={isClearingCompetitions}
                    className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isClearingCompetitions ? 'Clearing All...' : 'Clear All Competitions & Announcements'}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Data Reset Section */}
          <div className="mt-8">
            <DataReset onReset={() => loadDashboardData()} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
