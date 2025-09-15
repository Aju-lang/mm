// Utility to clear all student data from Firebase
import firebaseCollections from '../services/firebaseCollections.js';

export const clearAllStudentData = async () => {
  try {
    console.log('🗑️ Clearing all student data from Firebase...');
    
    // Get all students
    const students = await firebaseCollections.students.getAll();
    console.log(`Found ${students.length} students to delete`);
    
    // Delete all students
    for (const student of students) {
      await firebaseCollections.students.delete(student.id);
      console.log(`✅ Deleted student: ${student.name} (${student.code})`);
    }
    
    console.log(`✅ Successfully cleared ${students.length} students from Firebase`);
    return { success: true, deletedCount: students.length };
  } catch (error) {
    console.error('❌ Error clearing student data:', error);
    throw error;
  }
};

export const clearAllData = async () => {
  try {
    console.log('🗑️ Clearing ALL data from Firebase...');
    
    // Clear students
    const students = await firebaseCollections.students.getAll();
    for (const student of students) {
      await firebaseCollections.students.delete(student.id);
    }
    console.log(`✅ Cleared ${students.length} students`);
    
    // Clear competitions
    const competitions = await firebaseCollections.competitions.getAll();
    for (const competition of competitions) {
      await firebaseCollections.competitions.delete(competition.id);
    }
    console.log(`✅ Cleared ${competitions.length} competitions`);
    
    // Clear announcements
    const announcements = await firebaseCollections.announcements.getAll();
    for (const announcement of announcements) {
      await firebaseCollections.announcements.delete(announcement.id);
    }
    console.log(`✅ Cleared ${announcements.length} announcements`);
    
    // Clear gallery
    const gallery = await firebaseCollections.gallery.getAll();
    for (const image of gallery) {
      await firebaseCollections.gallery.delete(image.id);
    }
    console.log(`✅ Cleared ${gallery.length} gallery images`);
    
    console.log('✅ Successfully cleared ALL data from Firebase');
    return { 
      success: true, 
      deletedCount: {
        students: students.length,
        competitions: competitions.length,
        announcements: announcements.length,
        gallery: gallery.length
      }
    };
  } catch (error) {
    console.error('❌ Error clearing all data:', error);
    throw error;
  }
};

export default {
  clearAllStudentData,
  clearAllData
};
