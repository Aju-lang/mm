import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot, 
  query, 
  where, 
  orderBy, 
  limit,
  serverTimestamp,
  writeBatch
} from 'firebase/firestore';
import { db } from '../config/firebase';

// Collection names
export const COLLECTIONS = {
  STUDENTS: 'students',
  COMPETITIONS: 'competitions',
  ANNOUNCEMENTS: 'announcements',
  GALLERY: 'gallery',
  ADMINS: 'admins',
  FESTIVAL_DATA: 'festivalData'
};

// Generic CRUD operations
export class FirebaseCollection {
  constructor(collectionName) {
    this.collectionName = collectionName;
    this.collectionRef = collection(db, collectionName);
  }

  // Create a new document
  async create(data) {
    try {
      const docRef = await addDoc(this.collectionRef, {
        ...data,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      console.log(`✅ Document created in ${this.collectionName}:`, docRef.id);
      return docRef.id;
    } catch (error) {
      console.error(`❌ Error creating document in ${this.collectionName}:`, error);
      throw error;
    }
  }

  // Create with custom ID
  async createWithId(id, data) {
    try {
      const docRef = doc(this.collectionRef, id);
      await updateDoc(docRef, {
        ...data,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      console.log(`✅ Document created with ID in ${this.collectionName}:`, id);
      return id;
    } catch (error) {
      console.error(`❌ Error creating document with ID in ${this.collectionName}:`, error);
      throw error;
    }
  }

  // Get all documents
  async getAll() {
    try {
      const querySnapshot = await getDocs(this.collectionRef);
      const documents = [];
      querySnapshot.forEach((doc) => {
        documents.push({ id: doc.id, ...doc.data() });
      });
      console.log(`📚 Retrieved ${documents.length} documents from ${this.collectionName}`);
      return documents;
    } catch (error) {
      console.error(`❌ Error getting documents from ${this.collectionName}:`, error);
      throw error;
    }
  }

  // Get document by ID
  async getById(id) {
    try {
      const docRef = doc(this.collectionRef, id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        console.log(`📄 Retrieved document from ${this.collectionName}:`, id);
        return { id: docSnap.id, ...docSnap.data() };
      } else {
        console.log(`❌ No document found in ${this.collectionName} with ID:`, id);
        return null;
      }
    } catch (error) {
      console.error(`❌ Error getting document from ${this.collectionName}:`, error);
      throw error;
    }
  }

  // Update document
  async update(id, data) {
    try {
      const docRef = doc(this.collectionRef, id);
      await updateDoc(docRef, {
        ...data,
        updatedAt: serverTimestamp()
      });
      console.log(`✅ Document updated in ${this.collectionName}:`, id);
    } catch (error) {
      console.error(`❌ Error updating document in ${this.collectionName}:`, error);
      throw error;
    }
  }

  // Delete document
  async delete(id) {
    try {
      const docRef = doc(this.collectionRef, id);
      await deleteDoc(docRef);
      console.log(`✅ Document deleted from ${this.collectionName}:`, id);
    } catch (error) {
      console.error(`❌ Error deleting document from ${this.collectionName}:`, error);
      throw error;
    }
  }

  // Real-time listener for all documents
  onSnapshot(callback) {
    console.log(`🔄 Setting up real-time listener for ${this.collectionName}`);
    return onSnapshot(this.collectionRef, (snapshot) => {
      const documents = [];
      snapshot.forEach((doc) => {
        documents.push({ id: doc.id, ...doc.data() });
      });
      console.log(`🔄 Real-time update for ${this.collectionName}:`, documents.length, 'documents');
      callback(documents);
    }, (error) => {
      console.error(`❌ Real-time listener error for ${this.collectionName}:`, error);
    });
  }

  // Query with conditions
  async query(conditions = [], orderByField = null, limitCount = null) {
    try {
      let q = this.collectionRef;
      
      // Add where conditions
      conditions.forEach(condition => {
        q = query(q, where(condition.field, condition.operator, condition.value));
      });
      
      // Add ordering
      if (orderByField) {
        q = query(q, orderBy(orderByField.field, orderByField.direction || 'asc'));
      }
      
      // Add limit
      if (limitCount) {
        q = query(q, limit(limitCount));
      }
      
      const querySnapshot = await getDocs(q);
      const documents = [];
      querySnapshot.forEach((doc) => {
        documents.push({ id: doc.id, ...doc.data() });
      });
      
      console.log(`🔍 Query result for ${this.collectionName}:`, documents.length, 'documents');
      return documents;
    } catch (error) {
      console.error(`❌ Error querying ${this.collectionName}:`, error);
      throw error;
    }
  }

  // Batch operations
  async batchWrite(operations) {
    try {
      const batch = writeBatch(db);
      
      operations.forEach(operation => {
        const docRef = doc(this.collectionRef, operation.id);
        
        switch (operation.type) {
          case 'create':
          case 'update':
            batch.set(docRef, {
              ...operation.data,
              updatedAt: serverTimestamp()
            }, { merge: true });
            break;
          case 'delete':
            batch.delete(docRef);
            break;
          default:
            console.warn(`Unknown batch operation type: ${operation.type}`);
        }
      });
      
      await batch.commit();
      console.log(`✅ Batch operation completed for ${this.collectionName}:`, operations.length, 'operations');
    } catch (error) {
      console.error(`❌ Error in batch operation for ${this.collectionName}:`, error);
      throw error;
    }
  }
}

// Initialize collection services
export const studentsCollection = new FirebaseCollection(COLLECTIONS.STUDENTS);
export const competitionsCollection = new FirebaseCollection(COLLECTIONS.COMPETITIONS);
export const announcementsCollection = new FirebaseCollection(COLLECTIONS.ANNOUNCEMENTS);
export const galleryCollection = new FirebaseCollection(COLLECTIONS.GALLERY);
export const adminsCollection = new FirebaseCollection(COLLECTIONS.ADMINS);
export const festivalDataCollection = new FirebaseCollection(COLLECTIONS.FESTIVAL_DATA);

// Specialized methods for specific collections

// Students collection methods
studentsCollection.getByCode = async function(code) {
  try {
    const students = await this.query([
      { field: 'code', operator: '==', value: code }
    ]);
    return students.length > 0 ? students[0] : null;
  } catch (error) {
    console.error('Error getting student by code:', error);
    throw error;
  }
};

studentsCollection.getByTeam = async function(team) {
  try {
    return await this.query([
      { field: 'team', operator: '==', value: team }
    ]);
  } catch (error) {
    console.error('Error getting students by team:', error);
    throw error;
  }
};

studentsCollection.updatePoints = async function(studentId, points) {
  try {
    await this.update(studentId, { points });
    console.log(`✅ Updated points for student ${studentId}: ${points}`);
  } catch (error) {
    console.error('Error updating student points:', error);
    throw error;
  }
};

// Competitions collection methods
competitionsCollection.getByCategory = async function(category) {
  try {
    return await this.query([
      { field: 'category', operator: '==', value: category }
    ]);
  } catch (error) {
    console.error('Error getting competitions by category:', error);
    throw error;
  }
};

competitionsCollection.getUpcoming = async function() {
  try {
    return await this.query([
      { field: 'status', operator: '==', value: 'upcoming' }
    ], { field: 'date', direction: 'asc' });
  } catch (error) {
    console.error('Error getting upcoming competitions:', error);
    throw error;
  }
};

competitionsCollection.updateResults = async function(competitionId, results) {
  try {
    await this.update(competitionId, { 
      results,
      status: 'completed',
      completedAt: serverTimestamp()
    });
    console.log(`✅ Updated results for competition ${competitionId}`);
  } catch (error) {
    console.error('Error updating competition results:', error);
    throw error;
  }
};

// Announcements collection methods
announcementsCollection.getActive = async function() {
  try {
    return await this.query([
      { field: 'active', operator: '==', value: true }
    ], { field: 'createdAt', direction: 'desc' });
  } catch (error) {
    console.error('Error getting active announcements:', error);
    throw error;
  }
};

// Gallery collection methods
galleryCollection.getByCategory = async function(category) {
  try {
    return await this.query([
      { field: 'category', operator: '==', value: category }
    ], { field: 'createdAt', direction: 'desc' });
  } catch (error) {
    console.error('Error getting gallery by category:', error);
    throw error;
  }
};

export default {
  students: studentsCollection,
  competitions: competitionsCollection,
  announcements: announcementsCollection,
  gallery: galleryCollection,
  admins: adminsCollection,
  festivalData: festivalDataCollection
};
