import {
  studentsService,
  competitionsService,
  announcementsService,
  galleryService,
  festivalDataService,
  initializeFirebaseData
} from './firebaseService';

// Fallback to localStorage if Firebase is not available
import * as localStorageUtils from './localStorage';

// Connection state
let isOnline = navigator.onLine;
let useFirebase = true;

// Listen for online/offline events
window.addEventListener('online', () => {
  isOnline = true;
  console.log('Back online - switching to Firebase');
  syncLocalToFirebase();
});

window.addEventListener('offline', () => {
  isOnline = false;
  console.log('Offline - using localStorage');
});

// Check if Firebase is available
const checkFirebaseConnection = async () => {
  try {
    await festivalDataService.get();
    useFirebase = true;
    return true;
  } catch (error) {
    console.warn('Firebase not available, using localStorage:', error.message);
    useFirebase = false;
    return false;
  }
};

// Sync localStorage data to Firebase when back online
const syncLocalToFirebase = async () => {
  if (!isOnline || !useFirebase) return;

  try {
    console.log('Syncing local data to Firebase...');
    
    // Ensure localStorage has data first
    localStorageUtils.initializeData();
    
    // Sync students
    const localStudents = localStorageUtils.getStudents();
    const firebaseStudents = await studentsService.getAll();
    
    console.log(`Syncing students - Local: ${localStudents.length}, Firebase: ${firebaseStudents.length}`);
    
    // If no students in Firebase, add all from localStorage
    if (firebaseStudents.length === 0 && localStudents.length > 0) {
      console.log('No students in Firebase, migrating all from localStorage...');
      for (const localStudent of localStudents) {
        await studentsService.create(localStudent);
        console.log(`Added student: ${localStudent.name}`);
      }
    } else {
      // Simple sync - update Firebase with localStorage data if different
      for (const localStudent of localStudents) {
        try {
          const firebaseStudent = firebaseStudents.find(s => s.code === localStudent.code);
          if (!firebaseStudent) {
            await studentsService.create(localStudent);
            console.log(`Added missing student: ${localStudent.name}`);
          } else if (JSON.stringify(localStudent) !== JSON.stringify(firebaseStudent)) {
            // Ensure we have a valid Firebase document ID
            const validId = firebaseStudent.id || localStudent.id;
            if (typeof validId === 'string' && validId.trim()) {
              await studentsService.update(validId, localStudent);
              console.log(`Updated student: ${localStudent.name} (ID: ${validId})`);
            } else {
              console.error('Invalid student ID for update:', { localStudent, firebaseStudent });
            }
          }
        } catch (studentError) {
          console.error(`Error syncing student ${localStudent.name}:`, studentError);
          // Continue with other students instead of failing completely
        }
      }
    }

    // Sync competitions (only if there are actual competitions to sync)
    const localCompetitions = localStorageUtils.getCompetitions();
    const firebaseCompetitions = await competitionsService.getAll();
    
    // Only sync if there are competitions in localStorage and they're different from Firebase
    if (localCompetitions.length > 0) {
      for (const localCompetition of localCompetitions) {
        const firebaseCompetition = firebaseCompetitions.find(c => c.id === localCompetition.id);
        if (!firebaseCompetition) {
          await competitionsService.create(localCompetition);
          console.log(`Added competition: ${localCompetition.name}`);
        } else if (JSON.stringify(localCompetition) !== JSON.stringify(firebaseCompetition)) {
          await competitionsService.update(firebaseCompetition.id, localCompetition);
          console.log(`Updated competition: ${localCompetition.name}`);
        }
      }
    }

    console.log('Firebase sync complete');
  } catch (error) {
    console.error('Error syncing to Firebase:', error);
  }
};

// Hybrid service that uses Firebase when available, localStorage as fallback
export const hybridStorage = {
  // Initialize the system
  async initialize() {
    const firebaseAvailable = await checkFirebaseConnection();
    
    if (firebaseAvailable) {
      try {
        await initializeFirebaseData();
        console.log('Using Firebase for data storage');
      } catch (error) {
        console.error('Firebase initialization failed, falling back to localStorage');
        useFirebase = false;
        localStorageUtils.initializeData();
      }
    } else {
      console.log('Using localStorage for data storage');
      localStorageUtils.initializeData();
    }
  },

  // Students
  async getStudents() {
    if (useFirebase && isOnline) {
      try {
        const students = await studentsService.getAll();
        // Cache in localStorage for offline access
        localStorageUtils.setStudents(students);
        return students;
      } catch (error) {
        console.error('Firebase error, using localStorage:', error);
        return localStorageUtils.getStudents();
      }
    }
    return localStorageUtils.getStudents();
  },

  async addStudent(student) {
    // Always update localStorage first
    localStorageUtils.addStudent(student);
    
    if (useFirebase && isOnline) {
      try {
        const result = await studentsService.create(student);
        return result;
      } catch (error) {
        console.error('Firebase error, data saved locally:', error);
        return student;
      }
    }
    return student;
  },

  async updateStudent(studentId, updates) {
    // Update localStorage
    const students = localStorageUtils.getStudents();
    const index = students.findIndex(s => s.id === studentId || s.code === updates.code);
    if (index !== -1) {
      students[index] = { ...students[index], ...updates };
      localStorageUtils.setStudents(students);
    }

    if (useFirebase && isOnline) {
      try {
        const result = await studentsService.update(studentId, updates);
        return result;
      } catch (error) {
        console.error('Firebase error, data saved locally:', error);
        return updates;
      }
    }
    return updates;
  },

  async getStudentByCode(code) {
    if (useFirebase && isOnline) {
      try {
        const student = await studentsService.getByCode(code);
        return student;
      } catch (error) {
        console.error('Firebase error, using localStorage:', error);
        return localStorageUtils.getStudentByCode(code);
      }
    }
    return localStorageUtils.getStudentByCode(code);
  },

  // Competitions
  async getCompetitions() {
    if (useFirebase && isOnline) {
      try {
        const competitions = await competitionsService.getAll();
        // Cache in localStorage
        localStorageUtils.setCompetitions(competitions);
        return competitions;
      } catch (error) {
        console.error('Firebase error, using localStorage:', error);
        return localStorageUtils.getCompetitions();
      }
    }
    return localStorageUtils.getCompetitions();
  },

  async addCompetition(competition) {
    // Always update localStorage first
    const result = localStorageUtils.addCompetition(competition);
    
    if (useFirebase && isOnline) {
      try {
        await competitionsService.create(competition);
      } catch (error) {
        console.error('Firebase error, data saved locally:', error);
      }
    }
    return result;
  },

  async updateCompetition(competitionId, updates) {
    // Update localStorage
    localStorageUtils.updateCompetition(competitionId, updates);

    if (useFirebase && isOnline) {
      try {
        await competitionsService.update(competitionId, updates);
      } catch (error) {
        console.error('Firebase error, data saved locally:', error);
      }
    }
    return updates;
  },

  async deleteCompetition(competitionId) {
    // Delete from localStorage
    localStorageUtils.deleteCompetition(competitionId);

    if (useFirebase && isOnline) {
      try {
        await competitionsService.delete(competitionId);
      } catch (error) {
        console.error('Firebase error, data deleted locally:', error);
      }
    }
  },

  // Announcements
  async getAnnouncements() {
    if (useFirebase && isOnline) {
      try {
        const announcements = await announcementsService.getAll();
        // Cache in localStorage
        localStorageUtils.setAnnouncements(announcements);
        return announcements;
      } catch (error) {
        console.error('Firebase error, using localStorage:', error);
        return localStorageUtils.getAnnouncements();
      }
    }
    return localStorageUtils.getAnnouncements();
  },

  async addAnnouncement(announcement) {
    localStorageUtils.addAnnouncement(announcement);
    
    if (useFirebase && isOnline) {
      try {
        await announcementsService.create(announcement);
      } catch (error) {
        console.error('Firebase error, data saved locally:', error);
      }
    }
    return announcement;
  },

  async updateAnnouncement(announcementId, updates) {
    localStorageUtils.updateAnnouncement(announcementId, updates);

    if (useFirebase && isOnline) {
      try {
        await announcementsService.update(announcementId, updates);
      } catch (error) {
        console.error('Firebase error, data saved locally:', error);
      }
    }
    return updates;
  },

  async deleteAnnouncement(announcementId) {
    localStorageUtils.deleteAnnouncement(announcementId);

    if (useFirebase && isOnline) {
      try {
        await announcementsService.delete(announcementId);
      } catch (error) {
        console.error('Firebase error, data deleted locally:', error);
      }
    }
  },

  // Gallery
  async getGallery() {
    if (useFirebase && isOnline) {
      try {
        const gallery = await galleryService.getAll();
        localStorageUtils.setGallery(gallery);
        return gallery;
      } catch (error) {
        console.error('Firebase error, using localStorage:', error);
        return localStorageUtils.getGallery();
      }
    }
    return localStorageUtils.getGallery();
  },

  async addGalleryImage(image) {
    localStorageUtils.addGalleryImage(image);
    
    if (useFirebase && isOnline) {
      try {
        await galleryService.create(image);
      } catch (error) {
        console.error('Firebase error, data saved locally:', error);
      }
    }
    return image;
  },

  async deleteGalleryImage(imageId) {
    localStorageUtils.deleteGalleryImage(imageId);

    if (useFirebase && isOnline) {
      try {
        await galleryService.delete(imageId);
      } catch (error) {
        console.error('Firebase error, data deleted locally:', error);
      }
    }
  },

  // Festival Data
  async getFestivalData() {
    if (useFirebase && isOnline) {
      try {
        const data = await festivalDataService.get();
        if (data) {
          localStorageUtils.setData('festival_data', data);
          return data;
        }
      } catch (error) {
        console.error('Firebase error, using localStorage:', error);
      }
    }
    return localStorageUtils.getFestivalData();
  },

  // Real-time listeners (Firebase only)
  onStudentsChange(callback) {
    if (useFirebase && isOnline) {
      return studentsService.onSnapshot(callback);
    }
    return () => {}; // Return empty unsubscribe function
  },

  onCompetitionsChange(callback) {
    if (useFirebase && isOnline) {
      return competitionsService.onSnapshot(callback);
    }
    return () => {};
  },

  onAnnouncementsChange(callback) {
    if (useFirebase && isOnline) {
      return announcementsService.onSnapshot(callback);
    }
    return () => {};
  },

  onGalleryChange(callback) {
    if (useFirebase && isOnline) {
      return galleryService.onSnapshot(callback);
    }
    return () => {};
  },

  // Utility functions
  isUsingFirebase() {
    return useFirebase && isOnline;
  },

  isOnline() {
    return isOnline;
  },

  async forceSync() {
    if (isOnline && useFirebase) {
      await syncLocalToFirebase();
    }
  }
};

// Auto-update student records
export const updateStudentRecords = async () => {
  const students = await hybridStorage.getStudents();
  const competitions = await hybridStorage.getCompetitions();
  
  const updatedStudents = students.map(student => {
    // Find competitions this student is registered for
    const registeredCompetitions = competitions.filter(comp => 
      comp.participants && comp.participants.some(p => p.id === student.id || p.studentCode === student.code)
    );
    
    // Find completed competitions
    const completedCompetitions = registeredCompetitions.filter(comp => comp.status === 'completed');
    
    // Calculate total points from all competitions
    let totalPoints = 0;
    const results = [];
    
    registeredCompetitions.forEach(comp => {
      const participation = comp.participants.find(p => p.id === student.id || p.studentCode === student.code);
      if (participation) {
        // Add points from prizes
        if (participation.prize === '1') totalPoints += 10;
        else if (participation.prize === '2') totalPoints += 7;
        else if (participation.prize === '3') totalPoints += 5;
        else if (participation.reported) totalPoints += 2; // Participation points
        
        // Add custom points
        if (participation.customPoints) totalPoints += participation.customPoints;
        
        // Add to results
        if (participation.prize || participation.reported) {
          results.push({
            competitionId: comp.id,
            competitionName: comp.name,
            prize: participation.prize,
            points: participation.customPoints || 0,
            reported: participation.reported
          });
        }
      }
    });
    
    return {
      ...student,
      events: registeredCompetitions.map(comp => comp.name),
      results: results,
      points: totalPoints,
      competitionsRegistered: registeredCompetitions.length,
      competitionsCompleted: completedCompetitions.length
    };
  });
  
  // Update each student
  for (const student of updatedStudents) {
    await hybridStorage.updateStudent(student.id, student);
  }
  
  return updatedStudents;
};

// Function to reset student data to original names
export const resetStudentDataToOriginal = async () => {
  const originalTeamAStudents = [
    'ADIL MINHAJ', 'ASHIQUE', 'UNAIS', 'AFEEF', 'SAHAD', 'HASHIM', 'MUSTHAFA', 
    'SINAN', 'HADI', 'MUHAMMED JUBAIR', 'MUBARAK', 'SHAHEEM M', 'SANAD MUHAMMED', 
    'SHAMIL', 'SABITH', 'RAFHAN', 'UMER', 'ANAS', 'ANAS MUZAMMIL', 
    'NAHYAN', 'ADNAN'
  ];
  
  const originalTeamBStudents = [
    'HATHIB', 'JINSHID', 'MIDLAJ', 'IBRAHIM', 'ADHIL KP', 'SHAFI', 'SALMAN', 
    'NIHAL', 'RUFAID', 'AZHIM', 'ABSHIR', 'HALEEM', 'FAYIZ', 'BASITH', 
    'KHALEEL', 'ANSHID', 'MUBASHIR', 'ADHIL CP', 'ABDUL HADI', 'HASBIN', 
    'YASEEN', 'SHAHEEM K'
  ];

  try {
    // Get current students to preserve their IDs and participation data
    const currentStudents = await hybridStorage.getStudents();
    
    // Clear all current students
    for (const student of currentStudents) {
      await hybridStorage.deleteStudent(student.id);
    }
    
    const allStudents = [];
    let codeCounter = 1;
    
    // Add Team A students
    originalTeamAStudents.forEach((name) => {
      allStudents.push({
        id: codeCounter,
        name: name,
        code: `RV2025${String(codeCounter).padStart(3, '0')}`,
        team: 'Team A',
        year: '1st',
        events: [],
        results: [],
        points: 0,
        competitionsRegistered: 0,
        competitionsCompleted: 0
      });
      codeCounter++;
    });
    
    // Add Team B students
    originalTeamBStudents.forEach((name) => {
      allStudents.push({
        id: codeCounter,
        name: name,
        code: `RV2025${String(codeCounter).padStart(3, '0')}`,
        team: 'Team B',
        year: '1st',
        events: [],
        results: [],
        points: 0,
        competitionsRegistered: 0,
        competitionsCompleted: 0
      });
      codeCounter++;
    });
    
    // Add all students to Firebase
    for (const student of allStudents) {
      await hybridStorage.addStudent(student);
    }
    
    console.log('Student data reset to original names successfully');
    return allStudents;
  } catch (error) {
    console.error('Error resetting student data:', error);
    throw error;
  }
};

// Force initialize student data - useful for debugging
export const forceInitializeStudents = async () => {
  try {
    console.log('Force initializing students...');
    
    // Check if Firebase is available
    const firebaseAvailable = await checkFirebaseConnection();
    if (!firebaseAvailable) {
      throw new Error('Firebase connection not available. Please check your Firebase configuration.');
    }
    
    console.log('Firebase connection confirmed');
    
    // Clear existing Firebase data
    console.log('Clearing existing students from Firebase...');
    const existingStudents = await studentsService.getAll();
    console.log(`Found ${existingStudents.length} existing students in Firebase`);
    
    for (const student of existingStudents) {
      await studentsService.delete(student.id);
      console.log(`Deleted: ${student.name || student.id}`);
    }
    
    // Initialize localStorage data
    console.log('Initializing localStorage data...');
    localStorageUtils.initializeData();
    
    // Get fresh data from localStorage
    const localStudents = localStorageUtils.getStudents();
    console.log(`Found ${localStudents.length} students in localStorage`);
    
    if (localStudents.length === 0) {
      throw new Error('No students found in localStorage. Please check if student data is properly initialized.');
    }
    
    // Add all students to Firebase
    console.log('Adding students to Firebase...');
    for (let i = 0; i < localStudents.length; i++) {
      const student = localStudents[i];
      try {
        await studentsService.create(student);
        console.log(`Added (${i + 1}/${localStudents.length}): ${student.name} (${student.code})`);
      } catch (studentError) {
        console.error(`Failed to add student ${student.name}:`, studentError);
        // Continue with other students
      }
    }
    
    // Verify the students were added
    const finalStudents = await studentsService.getAll();
    console.log(`Verification: ${finalStudents.length} students now in Firebase`);
    
    console.log('Force initialization complete!');
    return localStudents;
  } catch (error) {
    console.error('Error force initializing students:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      stack: error.stack
    });
    throw error;
  }
};

// Clear all competitions and announcements (useful for fresh start)
export const clearAllCompetitionsAndAnnouncements = async () => {
  try {
    console.log('Clearing all competitions and announcements...');
    
    // Clear from Firebase
    const competitions = await competitionsService.getAll();
    for (const competition of competitions) {
      await competitionsService.delete(competition.id);
    }
    
    const announcements = await announcementsService.getAll();
    for (const announcement of announcements) {
      await announcementsService.delete(announcement.id);
    }
    
    // Clear from localStorage
    localStorageUtils.setCompetitions([]);
    localStorageUtils.setAnnouncements([]);
    
    console.log('All competitions and announcements cleared successfully');
  } catch (error) {
    console.error('Error clearing competitions and announcements:', error);
    throw error;
  }
};

export default hybridStorage;
