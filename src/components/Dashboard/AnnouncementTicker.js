import React, { useState, useEffect } from 'react';
import { getAnnouncements } from '../../utils/localStorage';

const AnnouncementTicker = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const loadAnnouncements = () => {
      const data = getAnnouncements().filter(a => a.active);
      setAnnouncements(data);
    };

    loadAnnouncements();
    
    // Refresh announcements every 30 seconds
    const interval = setInterval(loadAnnouncements, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (announcements.length > 1) {
      const timer = setInterval(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % announcements.length);
      }, 5000); // Change announcement every 5 seconds

      return () => clearInterval(timer);
    }
  }, [announcements.length]);

  if (announcements.length === 0) {
    return null;
  }

  const getAnnouncementIcon = (type) => {
    switch (type) {
      case 'info':
        return '📢';
      case 'warning':
        return '⚠️';
      case 'success':
        return '✅';
      case 'error':
        return '❌';
      default:
        return '📢';
    }
  };

  const getAnnouncementColor = (type) => {
    switch (type) {
      case 'info':
        return 'bg-blue-600 text-blue-50';
      case 'warning':
        return 'bg-yellow-600 text-yellow-50';
      case 'success':
        return 'bg-green-600 text-green-50';
      case 'error':
        return 'bg-red-600 text-red-50';
      default:
        return 'bg-blue-600 text-blue-50';
    }
  };

  const currentAnnouncement = announcements[currentIndex];

  return (
    <div className={`${getAnnouncementColor(currentAnnouncement.type)} py-3 px-4 relative overflow-hidden`}>
      <div className="max-w-7xl mx-auto flex items-center justify-center">
        <div className="flex items-center space-x-3">
          <span className="text-lg">{getAnnouncementIcon(currentAnnouncement.type)}</span>
          <div className="flex-1 min-w-0">
            <div className="animate-fade-in">
              <span className="font-semibold mr-2">{currentAnnouncement.title}:</span>
              <span>{currentAnnouncement.message}</span>
            </div>
          </div>
        </div>
        
        {announcements.length > 1 && (
          <div className="ml-4 flex space-x-1">
            {announcements.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  index === currentIndex ? 'bg-white' : 'bg-white bg-opacity-50'
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AnnouncementTicker;
