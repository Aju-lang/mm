import React, { useState, useEffect } from 'react';
import { getAnnouncements, updateAnnouncement } from '../../utils/localStorage';

const EnhancedAnnouncements = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);

  useEffect(() => {
    loadAnnouncements();
  }, []);

  const loadAnnouncements = () => {
    const activeAnnouncements = getAnnouncements().filter(a => a.active);
    setAnnouncements(activeAnnouncements);
  };

  const addReaction = (announcementId, emoji) => {
    const announcement = announcements.find(a => a.id === announcementId);
    if (!announcement) return;

    const reactions = announcement.reactions || {};
    reactions[emoji] = (reactions[emoji] || 0) + 1;

    updateAnnouncement(announcementId, { reactions });
    loadAnnouncements();
  };

  const getAnnouncementIcon = (type) => {
    const icons = {
      info: '📢',
      warning: '⚠️',
      success: '✅',
      error: '❌'
    };
    return icons[type] || '📢';
  };

  const getAnnouncementColor = (type) => {
    const colors = {
      info: 'from-blue-500 to-blue-600',
      warning: 'from-yellow-500 to-yellow-600',
      success: 'from-green-500 to-green-600',
      error: 'from-red-500 to-red-600'
    };
    return colors[type] || 'from-blue-500 to-blue-600';
  };

  const reactionEmojis = ['👍', '❤️', '😊', '👏', '🔥', '😮', '😢', '😡'];

  const AnnouncementModal = ({ announcement, onClose }) => {
    if (!announcement) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <span className="text-3xl">{getAnnouncementIcon(announcement.type)}</span>
                <h3 className="text-2xl font-bold text-gray-900">{announcement.title}</h3>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>
            
            <div className="mb-6">
              <p className="text-gray-700 text-lg leading-relaxed">{announcement.message}</p>
            </div>

            {/* Voice Message */}
            {announcement.audioData && (
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <h4 className="text-lg font-semibold text-gray-900 mb-3">🎤 Voice Message</h4>
                <audio controls className="w-full">
                  <source src={announcement.audioData} type="audio/wav" />
                  Your browser does not support the audio element.
                </audio>
              </div>
            )}

            {/* Reactions */}
            <div className="mb-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-3">React to this announcement</h4>
              <div className="flex flex-wrap gap-2 mb-4">
                {reactionEmojis.map(emoji => (
                  <button
                    key={emoji}
                    onClick={() => addReaction(announcement.id, emoji)}
                    className="text-2xl p-2 rounded-lg hover:bg-gray-100 transition-colors"
                    title={`React with ${emoji}`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>

              {/* Current Reactions */}
              {announcement.reactions && Object.keys(announcement.reactions).length > 0 && (
                <div>
                  <h5 className="text-sm font-medium text-gray-700 mb-2">Current reactions:</h5>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(announcement.reactions).map(([emoji, count]) => (
                      <span key={emoji} className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-800">
                        {emoji} {count}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="text-sm text-gray-500 mb-4">
              Posted: {new Date(announcement.createdAt).toLocaleString()}
            </div>

            <div className="flex justify-end">
              <button onClick={onClose} className="btn-primary">
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">📢 Announcements</h1>
          <p className="text-gray-600">Stay updated with the latest festival news</p>
        </div>

        <div className="space-y-6">
          {announcements.map((announcement) => (
            <div
              key={announcement.id}
              className={`card cursor-pointer hover:shadow-xl transition-shadow duration-300 bg-gradient-to-r ${getAnnouncementColor(announcement.type)} text-white`}
              onClick={() => setSelectedAnnouncement(announcement)}
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <span className="text-3xl">{getAnnouncementIcon(announcement.type)}</span>
                    <div>
                      <h3 className="text-xl font-bold">{announcement.title}</h3>
                      <span className="text-sm opacity-90 capitalize">{announcement.type}</span>
                    </div>
                  </div>
                  
                  {announcement.audioData && (
                    <div className="flex items-center space-x-2">
                      <span className="text-2xl">🎤</span>
                      <span className="text-sm opacity-90">Voice message</span>
                    </div>
                  )}
                </div>
                
                <p className="text-lg leading-relaxed mb-4 opacity-95">
                  {announcement.message}
                </p>
                
                <div className="flex items-center justify-between">
                  <div className="text-sm opacity-80">
                    {new Date(announcement.createdAt).toLocaleDateString()}
                  </div>
                  
                  {announcement.reactions && Object.keys(announcement.reactions).length > 0 && (
                    <div className="flex items-center space-x-2">
                      <span className="text-sm opacity-80">Reactions:</span>
                      <div className="flex space-x-1">
                        {Object.entries(announcement.reactions).slice(0, 3).map(([emoji, count]) => (
                          <span key={emoji} className="text-sm bg-white bg-opacity-20 px-2 py-1 rounded">
                            {emoji} {count}
                          </span>
                        ))}
                        {Object.keys(announcement.reactions).length > 3 && (
                          <span className="text-sm bg-white bg-opacity-20 px-2 py-1 rounded">
                            +{Object.keys(announcement.reactions).length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="mt-4 text-right">
                  <span className="text-sm opacity-80">Click to view details and react →</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {announcements.length === 0 && (
          <div className="text-center py-12">
            <span className="text-4xl mb-4 block">📢</span>
            <p className="text-gray-500">No announcements available at the moment.</p>
            <p className="text-sm text-gray-400 mt-2">Check back later for updates!</p>
          </div>
        )}

        {selectedAnnouncement && (
          <AnnouncementModal
            announcement={selectedAnnouncement}
            onClose={() => setSelectedAnnouncement(null)}
          />
        )}
      </div>
    </div>
  );
};

export default EnhancedAnnouncements;
