import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  setDoc,
  onSnapshot,
  query,
  orderBy,
  where,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../config/firebase';

// Collection names
const COLLECTIONS = {
  STUDENTS: 'students',
  COMPETITIONS: 'competitions',
  ANNOUNCEMENTS: 'announcements',
  GALLERY: 'gallery',
  FESTIVAL_DATA: 'festivalData',
  ADMINS: 'admins'
};

// Generic CRUD operations
export const firebaseService = {
  // Create document
  async create(collectionName, data) {
    try {
      const docRef = await addDoc(collection(db, collectionName), {
        ...data,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      return { id: docRef.id, ...data };
    } catch (error) {
      console.error('Error creating document:', error);
      throw error;
    }
  },

  // Create document with custom ID
  async createWithId(collectionName, id, data) {
    try {
      await setDoc(doc(db, collectionName, id), {
        ...data,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      return { id, ...data };
    } catch (error) {
      console.error('Error creating document with ID:', error);
      throw error;
    }
  },

  // Read all documents
  async getAll(collectionName) {
    try {
      const querySnapshot = await getDocs(collection(db, collectionName));
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error getting documents:', error);
      throw error;
    }
  },

  // Read single document
  async getById(collectionName, id) {
    try {
      const docRef = doc(db, collectionName, id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() };
      } else {
        return null;
      }
    } catch (error) {
      console.error('Error getting document:', error);
      throw error;
    }
  },

  // Update document
  async update(collectionName, id, data) {
    try {
      const docRef = doc(db, collectionName, id);
      await updateDoc(docRef, {
        ...data,
        updatedAt: serverTimestamp()
      });
      return { id, ...data };
    } catch (error) {
      console.error('Error updating document:', error);
      throw error;
    }
  },

  // Delete document
  async delete(collectionName, id) {
    try {
      await deleteDoc(doc(db, collectionName, id));
      return id;
    } catch (error) {
      console.error('Error deleting document:', error);
      throw error;
    }
  },

  // Real-time listener
  onSnapshot(collectionName, callback, errorCallback) {
    try {
      const unsubscribe = onSnapshot(
        collection(db, collectionName),
        (snapshot) => {
          const data = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          callback(data);
        },
        errorCallback || ((error) => console.error('Snapshot error:', error))
      );
      return unsubscribe;
    } catch (error) {
      console.error('Error setting up listener:', error);
      throw error;
    }
  },

  // Query with conditions
  async query(collectionName, conditions = []) {
    try {
      let q = collection(db, collectionName);
      
      conditions.forEach(condition => {
        if (condition.type === 'where') {
          q = query(q, where(condition.field, condition.operator, condition.value));
        } else if (condition.type === 'orderBy') {
          q = query(q, orderBy(condition.field, condition.direction || 'asc'));
        }
      });

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error querying documents:', error);
      throw error;
    }
  }
};

// Specific service functions for each collection
export const studentsService = {
  getAll: () => firebaseService.getAll(COLLECTIONS.STUDENTS),
  getById: (id) => firebaseService.getById(COLLECTIONS.STUDENTS, id),
  create: (data) => firebaseService.create(COLLECTIONS.STUDENTS, data),
  update: (id, data) => firebaseService.update(COLLECTIONS.STUDENTS, id, data),
  delete: (id) => firebaseService.delete(COLLECTIONS.STUDENTS, id),
  onSnapshot: (callback, errorCallback) => firebaseService.onSnapshot(COLLECTIONS.STUDENTS, callback, errorCallback),
  getByCode: async (code) => {
    const students = await firebaseService.query(COLLECTIONS.STUDENTS, [
      { type: 'where', field: 'code', operator: '==', value: code }
    ]);
    return students.length > 0 ? students[0] : null;
  }
};

export const competitionsService = {
  getAll: () => firebaseService.getAll(COLLECTIONS.COMPETITIONS),
  getById: (id) => firebaseService.getById(COLLECTIONS.COMPETITIONS, id),
  create: (data) => firebaseService.create(COLLECTIONS.COMPETITIONS, data),
  update: (id, data) => firebaseService.update(COLLECTIONS.COMPETITIONS, id, data),
  delete: (id) => firebaseService.delete(COLLECTIONS.COMPETITIONS, id),
  onSnapshot: (callback, errorCallback) => firebaseService.onSnapshot(COLLECTIONS.COMPETITIONS, callback, errorCallback)
};

export const announcementsService = {
  getAll: () => firebaseService.getAll(COLLECTIONS.ANNOUNCEMENTS),
  getById: (id) => firebaseService.getById(COLLECTIONS.ANNOUNCEMENTS, id),
  create: (data) => firebaseService.create(COLLECTIONS.ANNOUNCEMENTS, data),
  update: (id, data) => firebaseService.update(COLLECTIONS.ANNOUNCEMENTS, id, data),
  delete: (id) => firebaseService.delete(COLLECTIONS.ANNOUNCEMENTS, id),
  onSnapshot: (callback, errorCallback) => firebaseService.onSnapshot(COLLECTIONS.ANNOUNCEMENTS, callback, errorCallback),
  getActive: async () => {
    return await firebaseService.query(COLLECTIONS.ANNOUNCEMENTS, [
      { type: 'where', field: 'active', operator: '==', value: true }
    ]);
  }
};

export const galleryService = {
  getAll: () => firebaseService.getAll(COLLECTIONS.GALLERY),
  getById: (id) => firebaseService.getById(COLLECTIONS.GALLERY, id),
  create: (data) => firebaseService.create(COLLECTIONS.GALLERY, data),
  update: (id, data) => firebaseService.update(COLLECTIONS.GALLERY, id, data),
  delete: (id) => firebaseService.delete(COLLECTIONS.GALLERY, id),
  onSnapshot: (callback, errorCallback) => firebaseService.onSnapshot(COLLECTIONS.GALLERY, callback, errorCallback)
};

export const festivalDataService = {
  get: () => firebaseService.getById(COLLECTIONS.FESTIVAL_DATA, 'main'),
  update: (data) => firebaseService.createWithId(COLLECTIONS.FESTIVAL_DATA, 'main', data)
};

// Initialize default data if collections are empty
export const initializeFirebaseData = async () => {
  try {
    console.log('Initializing Firebase data...');

    // Check if festival data exists
    const festivalData = await festivalDataService.get();
    if (!festivalData) {
      await festivalDataService.update({
        name: 'RENDEZVOUS 2025',
        logo: '🎭',
        startDate: '2025-09-19',
        endDate: '2025-09-20',
        venue: 'MARKAZ MIHRAJ MALAYIL',
        description: 'Annual Cultural and Technical Festival'
      });
      console.log('Festival data initialized');
    }

    // Check if students exist
    const students = await studentsService.getAll();
    if (students.length === 0) {
      // Initialize default students (Team A and Team B)
      const teamAStudents = [
        'ABDUL RASHEED', 'MOHAMMED ASHRAF', 'ABDUL SAMAD', 'MOHAMMED NIHAL',
        'MOHAMMED SABIR', 'ABDUL VAHID', 'MOHAMMED SHAFI', 'MOHAMMED AFSAL',
        'MOHAMMED RAFI', 'ABDUL MAJEED', 'MOHAMMED SALIM', 'ABDUL KAREEM',
        'MOHAMMED FAIZ', 'ABDUL RAHIM', 'MOHAMMED NASIR', 'ABDUL SALAM',
        'MOHAMMED YASIR', 'ABDUL BASIT', 'MOHAMMED ZAID', 'ABDUL HAKIM',
        'MOHAMMED ADIL', 'ABDUL AZIZ', 'MOHAMMED HARIS'
      ];

      const teamBStudents = [
        'AHMED HASSAN', 'OMAR KHALIL', 'YUSUF MALIK', 'IBRAHIM SHAH',
        'ISMAIL KHAN', 'HAMZA AHMED', 'BILAL OMAR', 'TARIQ YUSUF',
        'SAAD IBRAHIM', 'USMAN ISMAIL', 'FAISAL HAMZA', 'WALEED BILAL',
        'HASSAN TARIQ', 'KHALIL SAAD', 'MALIK USMAN', 'SHAH FAISAL',
        'KHAN WALEED', 'AHMED HASSAN ALI', 'OMAR KHALIL AHMED', 'YUSUF MALIK OMAR',
        'IBRAHIM SHAH YUSUF', 'ISMAIL KHAN IBRAHIM'
      ];

      let codeCounter = 1;

      // Add Team A students
      for (const name of teamAStudents) {
        await studentsService.create({
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
      }

      // Add Team B students
      for (const name of teamBStudents) {
        await studentsService.create({
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
      }
      console.log('Students initialized');
    }

    // Check if competitions exist
    const competitions = await competitionsService.getAll();
    if (competitions.length === 0) {
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
        await competitionsService.create(competition);
      }
      console.log('Competitions initialized');
    }

    console.log('Firebase initialization complete');
  } catch (error) {
    console.error('Error initializing Firebase data:', error);
    throw error;
  }
};

export default firebaseService;
