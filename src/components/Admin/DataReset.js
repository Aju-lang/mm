import React, { useState } from 'react';
import { hybridStorage } from '../../utils/hybridStorage';

const DataReset = ({ onReset }) => {
  const [isResetting, setIsResetting] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const handleReset = async () => {
    if (!showConfirmation) {
      setShowConfirmation(true);
      return;
    }

    setIsResetting(true);
    try {
      // Get current students to preserve them
      const students = await hybridStorage.getStudents();
      console.log('Preserving students:', students.length);

      // Reset competitions (clear all competitions)
      const competitions = await hybridStorage.getCompetitions();
      for (const competition of competitions) {
        await hybridStorage.deleteCompetition(competition.id);
      }

      // Reset announcements (clear all announcements)
      const announcements = await hybridStorage.getAnnouncements();
      for (const announcement of announcements) {
        await hybridStorage.deleteAnnouncement(announcement.id);
      }

      // Reset gallery (clear all images)
      const gallery = await hybridStorage.getGallery();
      for (const image of gallery) {
        await hybridStorage.deleteGalleryImage(image.id);
      }

      // Reset student records but keep the students themselves
      const resetStudents = students.map(student => ({
        ...student,
        events: [],
        results: [],
        points: 0,
        competitionsRegistered: 0,
        competitionsCompleted: 0
      }));

      // Update all students with reset data
      for (const student of resetStudents) {
        await hybridStorage.updateStudent(student.id, student);
      }

      // Add default competitions
      const defaultCompetitions = [
        {
          name: 'Coding Challenge',
          description: 'Competitive programming contest',
          category: 'Technical',
          date: '2025-09-19',
          time: '10:00 AM',
          venue: 'Computer Lab 1',
          participants: [],
          results: [],
          status: 'upcoming'
        },
        {
          name: 'Web Design Contest',
          description: 'Create stunning web interfaces',
          category: 'Technical',
          date: '2025-09-19',
          time: '02:00 PM',
          venue: 'Computer Lab 2',
          participants: [],
          results: [],
          status: 'upcoming'
        },
        {
          name: 'Dance Battle',
          description: 'Show your dance moves',
          category: 'Cultural',
          date: '2025-09-20',
          time: '06:00 PM',
          venue: 'Main Auditorium',
          participants: [],
          results: [],
          status: 'upcoming'
        }
      ];

      for (const competition of defaultCompetitions) {
        await hybridStorage.addCompetition(competition);
      }

      // Add default announcements
      const defaultAnnouncements = [
        {
          title: 'Welcome to RENDEZVOUS 2025',
          message: 'Get ready for an amazing festival experience!',
          type: 'info',
          active: true
        },
        {
          title: 'Registration Open',
          message: 'Competition registration is now open. Register early!',
          type: 'info',
          active: true
        }
      ];

      for (const announcement of defaultAnnouncements) {
        await hybridStorage.addAnnouncement(announcement);
      }

      console.log('Data reset completed successfully');
      alert('✅ Data reset completed!\n\n✅ Students and teams preserved\n✅ Competitions reset to defaults\n✅ Announcements reset to defaults\n✅ Gallery cleared\n✅ Student records reset');
      
      if (onReset) {
        onReset();
      }
    } catch (error) {
      console.error('Error resetting data:', error);
      alert('❌ Error resetting data. Please try again.');
    } finally {
      setIsResetting(false);
      setShowConfirmation(false);
    }
  };

  const handleCancel = () => {
    setShowConfirmation(false);
  };

  return (
    <div className="card bg-red-50 border-red-200">
      <div className="flex items-start space-x-4">
        <div className="p-2 bg-red-100 rounded-full">
          <span className="text-red-600 text-xl">⚠️</span>
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-red-900 mb-2">
            Reset Festival Data
          </h3>
          <p className="text-sm text-red-700 mb-4">
            This will reset all competitions, announcements, gallery, and student records 
            while preserving student accounts and team assignments.
          </p>
          
          {!showConfirmation ? (
            <div className="space-y-2">
              <h4 className="font-medium text-red-800">What will be reset:</h4>
              <ul className="text-sm text-red-700 space-y-1 ml-4">
                <li>• All competitions (reset to defaults)</li>
                <li>• All announcements (reset to defaults)</li>
                <li>• All gallery images</li>
                <li>• Student participation records</li>
              </ul>
              
              <h4 className="font-medium text-green-800 mt-3">What will be preserved:</h4>
              <ul className="text-sm text-green-700 space-y-1 ml-4">
                <li>• All student accounts</li>
                <li>• Team assignments (Team A & Team B)</li>
                <li>• Student codes and basic info</li>
              </ul>
              
              <button
                onClick={handleReset}
                disabled={isResetting}
                className="mt-4 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isResetting ? 'Resetting...' : 'Reset Data'}
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <h4 className="font-bold text-yellow-800 mb-2">⚠️ Final Confirmation</h4>
                <p className="text-sm text-yellow-700 mb-3">
                  Are you absolutely sure you want to reset all festival data? This action cannot be undone.
                </p>
                <div className="flex space-x-3">
                  <button
                    onClick={handleReset}
                    disabled={isResetting}
                    className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50"
                  >
                    {isResetting ? 'Resetting...' : 'Yes, Reset Everything'}
                  </button>
                  <button
                    onClick={handleCancel}
                    disabled={isResetting}
                    className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 disabled:opacity-50"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DataReset;