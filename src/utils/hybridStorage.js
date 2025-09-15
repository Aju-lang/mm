// Stub for hybridStorage - being replaced by Firebase system
// This file is kept for backward compatibility during migration

import firebaseCollections from '../services/firebaseCollections.js';

// Simple stub that redirects to Firebase collections
export const hybridStorage = {
  // Basic CRUD operations
  async getStudents() {
    return await firebaseCollections.students.getAll();
  },
  
  async getCompetitions() {
    return await firebaseCollections.competitions.getAll();
  },
  
  async getAnnouncements() {
    return await firebaseCollections.announcements.getAll();
  },
  
  async getGallery() {
    return await firebaseCollections.gallery.getAllWithImages();
  },
  
  async getFestivalData() {
    const data = await firebaseCollections.festivalData.getById('main');
    return data || {
      name: 'RENDEZVOUS 2025',
      logo: '🎭',
      startDate: '2025-09-19',
      endDate: '2025-09-20',
      venue: 'MARKAZ MIHRAJ MALAYIL',
      description: 'Annual College Festival'
    };
  },
  
  // Real-time listeners
  onStudentsChange(callback) {
    return firebaseCollections.students.onSnapshot(callback);
  },
  
  onCompetitionsChange(callback) {
    return firebaseCollections.competitions.onSnapshot(callback);
  },
  
  onAnnouncementsChange(callback) {
    return firebaseCollections.announcements.onSnapshot(callback);
  },
  
  onGalleryChange(callback) {
    return firebaseCollections.gallery.onSnapshot(callback);
  },
  
  // Initialize
  async initialize() {
    console.log('hybridStorage.initialize() called - using Firebase system');
    return true;
  },
  
  // Force sync
  async forceSync() {
    console.log('hybridStorage.forceSync() called - using Firebase system');
    return true;
  }
};

// Export individual functions for backward compatibility
export const updateStudentRecords = async () => {
  console.log('updateStudentRecords called - using Firebase system');
  return true;
};

export const forceInitializeStudents = async () => {
  console.log('forceInitializeStudents called - using Firebase system');
  return true;
};

export const resetStudentDataToOriginal = async () => {
  console.log('resetStudentDataToOriginal called - using Firebase system');
  return true;
};

export const clearAllCompetitionsAndAnnouncements = async () => {
  console.log('clearAllCompetitionsAndAnnouncements called - using Firebase system');
  return true;
};

export default hybridStorage;