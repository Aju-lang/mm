import React, { useState, useEffect, useRef } from 'react';
import { 
  getAnnouncements, 
  addAnnouncement, 
  updateAnnouncement, 
  deleteAnnouncement 
} from '../../utils/localStorage';

const AnnouncementManager = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [audioUrl, setAudioUrl] = useState('');
  const [newAnnouncement, setNewAnnouncement] = useState({
    title: '',
    message: '',
    type: 'info'
  });
  
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  useEffect(() => {
    loadAnnouncements();
  }, []);

  const loadAnnouncements = () => {
    setAnnouncements(getAnnouncements());
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        const audioUrl = URL.createObjectURL(audioBlob);
        setAudioBlob(audioBlob);
        setAudioUrl(audioUrl);
        
        // Stop all tracks to release microphone
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      alert('Could not access microphone. Please check permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const clearRecording = () => {
    setAudioBlob(null);
    setAudioUrl('');
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    
    let audioData = null;
    if (audioBlob) {
      // Convert audio blob to base64
      const reader = new FileReader();
      audioData = await new Promise((resolve) => {
        reader.onload = () => resolve(reader.result);
        reader.readAsDataURL(audioBlob);
      });
    }

    const announcementData = {
      ...newAnnouncement,
      audioData,
      reactions: {}
    };

    addAnnouncement(announcementData);
    
    // Reset form
    setNewAnnouncement({ title: '', message: '', type: 'info' });
    clearRecording();
    setShowCreateModal(false);
    loadAnnouncements();
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this announcement?')) {
      deleteAnnouncement(id);
      loadAnnouncements();
    }
  };

  const toggleActive = (id, currentStatus) => {
    updateAnnouncement(id, { active: !currentStatus });
    loadAnnouncements();
  };

  const getTypeIcon = (type) => {
    const icons = {
      info: '📢',
      warning: '⚠️',
      success: '✅',
      error: '❌'
    };
    return icons[type] || '📢';
  };

  const getTypeColor = (type) => {
    const colors = {
      info: 'bg-blue-100 text-blue-800',
      warning: 'bg-yellow-100 text-yellow-800',
      success: 'bg-green-100 text-green-800',
      error: 'bg-red-100 text-red-800'
    };
    return colors[type] || 'bg-blue-100 text-blue-800';
  };

  const CreateModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleCreate} className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-gray-900">Create Announcement</h3>
            <button
              type="button"
              onClick={() => {
                setShowCreateModal(false);
                clearRecording();
                setNewAnnouncement({ title: '', message: '', type: 'info' });
              }}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ×
            </button>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
              <input
                type="text"
                required
                className="input"
                value={newAnnouncement.title}
                onChange={(e) => setNewAnnouncement({...newAnnouncement, title: e.target.value})}
                placeholder="Announcement title"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
              <select
                className="input"
                value={newAnnouncement.type}
                onChange={(e) => setNewAnnouncement({...newAnnouncement, type: e.target.value})}
              >
                <option value="info">📢 Information</option>
                <option value="warning">⚠️ Warning</option>
                <option value="success">✅ Success</option>
                <option value="error">❌ Error</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
              <textarea
                required
                className="input"
                rows={4}
                value={newAnnouncement.message}
                onChange={(e) => setNewAnnouncement({...newAnnouncement, message: e.target.value})}
                placeholder="Announcement message"
              />
            </div>

            {/* Voice Recording Section */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Voice Recording (Optional)</label>
              <div className="border border-gray-200 rounded-lg p-4">
                {!audioUrl ? (
                  <div className="text-center">
                    <button
                      type="button"
                      onClick={isRecording ? stopRecording : startRecording}
                      className={`btn-${isRecording ? 'outline' : 'secondary'} mb-2`}
                    >
                      {isRecording ? (
                        <>🔴 Stop Recording</>
                      ) : (
                        <>🎤 Start Recording</>
                      )}
                    </button>
                    {isRecording && (
                      <p className="text-sm text-red-600 animate-pulse">Recording in progress...</p>
                    )}
                  </div>
                ) : (
                  <div className="space-y-3">
                    <audio controls className="w-full">
                      <source src={audioUrl} type="audio/wav" />
                      Your browser does not support the audio element.
                    </audio>
                    <div className="flex space-x-2">
                      <button
                        type="button"
                        onClick={clearRecording}
                        className="btn-outline text-sm"
                      >
                        🗑️ Delete Recording
                      </button>
                      <button
                        type="button"
                        onClick={startRecording}
                        className="btn-secondary text-sm"
                      >
                        🎤 Record Again
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={() => {
                setShowCreateModal(false);
                clearRecording();
                setNewAnnouncement({ title: '', message: '', type: 'info' });
              }}
              className="btn-outline"
            >
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              Create Announcement
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Announcement Management</h1>
            <p className="text-gray-600">Create and manage announcements with voice messages</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn-primary"
          >
            📢 Create Announcement
          </button>
        </div>

        <div className="grid gap-6">
          {announcements.map((announcement) => (
            <div key={announcement.id} className="card">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <span className="text-2xl">{getTypeIcon(announcement.type)}</span>
                    <h3 className="text-xl font-bold text-gray-900">{announcement.title}</h3>
                    <span className={`badge ${getTypeColor(announcement.type)}`}>
                      {announcement.type}
                    </span>
                    <span className={`badge ${announcement.active ? 'badge-success' : 'bg-gray-100 text-gray-800'}`}>
                      {announcement.active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <p className="text-gray-600 mb-3">{announcement.message}</p>
                  
                  {announcement.audioData && (
                    <div className="mb-3">
                      <label className="text-sm font-medium text-gray-700 mb-2 block">Voice Message:</label>
                      <audio controls className="w-full max-w-md">
                        <source src={announcement.audioData} type="audio/wav" />
                        Your browser does not support the audio element.
                      </audio>
                    </div>
                  )}
                  
                  <div className="text-sm text-gray-500">
                    Created: {new Date(announcement.createdAt).toLocaleString()}
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  <button
                    onClick={() => toggleActive(announcement.id, announcement.active)}
                    className={`btn-${announcement.active ? 'outline' : 'secondary'} text-sm`}
                  >
                    {announcement.active ? 'Deactivate' : 'Activate'}
                  </button>
                  <button
                    onClick={() => handleDelete(announcement.id)}
                    className="btn-outline text-sm text-red-600 hover:bg-red-50"
                  >
                    🗑️ Delete
                  </button>
                </div>
              </div>
              
              {/* Reactions Display */}
              {announcement.reactions && Object.keys(announcement.reactions).length > 0 && (
                <div className="border-t border-gray-200 pt-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Student Reactions:</h4>
                  <div className="flex space-x-4">
                    {Object.entries(announcement.reactions).map(([emoji, count]) => (
                      <span key={emoji} className="badge badge-secondary">
                        {emoji} {count}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {announcements.length === 0 && (
          <div className="text-center py-12">
            <span className="text-4xl mb-4 block">📢</span>
            <p className="text-gray-500 mb-4">No announcements created yet.</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="btn-primary"
            >
              Create Your First Announcement
            </button>
          </div>
        )}

        {showCreateModal && <CreateModal />}
      </div>
    </div>
  );
};

export default AnnouncementManager;
