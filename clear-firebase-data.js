// Script to clear all student data from Firebase
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, deleteDoc, doc } = require('firebase/firestore');

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBqQqQqQqQqQqQqQqQqQqQqQqQqQqQqQ",
  authDomain: "campus-festival-management.firebaseapp.com",
  projectId: "campus-festival-management",
  storageBucket: "campus-festival-management.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdefghijklmnopqrstuv"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function clearAllStudentData() {
  try {
    console.log('🗑️ Clearing all student data from Firebase...');
    
    // Get all students
    const studentsRef = collection(db, 'students');
    const studentsSnapshot = await getDocs(studentsRef);
    
    console.log(`Found ${studentsSnapshot.size} students to delete`);
    
    // Delete all students
    const deletePromises = [];
    studentsSnapshot.forEach((studentDoc) => {
      deletePromises.push(deleteDoc(doc(db, 'students', studentDoc.id)));
    });
    
    await Promise.all(deletePromises);
    
    console.log(`✅ Successfully cleared ${studentsSnapshot.size} students from Firebase`);
    return { success: true, deletedCount: studentsSnapshot.size };
  } catch (error) {
    console.error('❌ Error clearing student data:', error);
    throw error;
  }
}

// Run the script
clearAllStudentData()
  .then(result => {
    console.log('✅ Student data cleared:', result);
    process.exit(0);
  })
  .catch(error => {
    console.error('❌ Error clearing student data:', error);
    process.exit(1);
  });
