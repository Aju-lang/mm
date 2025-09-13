import React, { useState, useEffect } from 'react';
import { 
  getStudents, 
  getCompetitions, 
  getAnnouncements,
  getFestivalData,
  getGallery,
  updateStudentRecords
} from '../../utils/localStorage';

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
  }, []);

  const loadDashboardData = () => {
    const students = getStudents();
    const competitions = getCompetitions();
    const announcements = getAnnouncements();

    const gallery = getGallery();
    
    // Update student records first
    updateStudentRecords();

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
  };

  const festivalData = getFestivalData();

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

        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
