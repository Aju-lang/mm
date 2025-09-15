import firebaseCollections from '../services/firebaseCollections';
import { initializeData, getStudents, getCompetitions, getAnnouncements, getGallery, getFestivalData } from './localStorage';

export class FirebaseMigration {
  constructor() {
    this.migrationStatus = {
      students: false,
      competitions: false,
      announcements: false,
      gallery: false,
      festivalData: false,
      admins: false
    };
  }

  // Check if migration is needed
  async checkMigrationStatus() {
    try {
      console.log('🔍 Checking migration status...');
      
      const results = await Promise.all([
        firebaseCollections.students.getAll(),
        firebaseCollections.competitions.getAll(),
        firebaseCollections.announcements.getAll(),
        firebaseCollections.gallery.getAll(),
        firebaseCollections.festivalData.getAll(),
        firebaseCollections.admins.getAll()
      ]);

      this.migrationStatus = {
        students: results[0].length > 0,
        competitions: results[1].length > 0,
        announcements: results[2].length > 0,
        gallery: results[3].length > 0,
        festivalData: results[4].length > 0,
        admins: results[5].length > 0
      };

      const needsMigration = !Object.values(this.migrationStatus).every(status => status);
      
      console.log('📊 Migration status:', this.migrationStatus);
      console.log(needsMigration ? '⚠️ Migration needed' : '✅ Migration complete');
      
      return { needsMigration, status: this.migrationStatus };
    } catch (error) {
      console.error('❌ Error checking migration status:', error);
      return { needsMigration: true, status: this.migrationStatus };
    }
  }

  // Migrate students data
  async migrateStudents() {
    try {
      console.log('👥 Migrating students data...');
      
      // Initialize localStorage data if needed
      initializeData();
      const localStudents = getStudents();
      
      if (localStudents.length === 0) {
        console.log('⚠️ No students found in localStorage');
        return { success: false, message: 'No students data to migrate' };
      }

      // Batch create students in Firebase
      const operations = localStudents.map(student => ({
        id: student.id || `student_${student.code}`,
        type: 'create',
        data: {
          name: student.name,
          code: student.code,
          team: student.team,
          year: student.year || '1st year',
          points: student.points || 0,
          events: student.events || [],
          results: student.results || [],
          competitionsRegistered: student.competitionsRegistered || 0,
          competitionsCompleted: student.competitionsCompleted || 0
        }
      }));

      await firebaseCollections.students.batchWrite(operations);
      console.log(`✅ Migrated ${localStudents.length} students to Firebase`);
      
      return { success: true, count: localStudents.length };
    } catch (error) {
      console.error('❌ Error migrating students:', error);
      throw error;
    }
  }

  // Migrate competitions data
  async migrateCompetitions() {
    try {
      console.log('🏆 Migrating competitions data...');
      
      const localCompetitions = getCompetitions();
      
      if (localCompetitions.length === 0) {
        console.log('⚠️ No competitions found in localStorage');
        return { success: false, message: 'No competitions data to migrate' };
      }

      const operations = localCompetitions.map(competition => ({
        id: competition.id || `comp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type: 'create',
        data: {
          name: competition.name,
          description: competition.description || '',
          category: competition.category || 'General',
          date: competition.date,
          time: competition.time,
          venue: competition.venue || '',
          participants: competition.participants || [],
          results: competition.results || [],
          status: competition.status || 'upcoming',
          maxParticipants: competition.maxParticipants || null,
          registrationDeadline: competition.registrationDeadline || null
        }
      }));

      await firebaseCollections.competitions.batchWrite(operations);
      console.log(`✅ Migrated ${localCompetitions.length} competitions to Firebase`);
      
      return { success: true, count: localCompetitions.length };
    } catch (error) {
      console.error('❌ Error migrating competitions:', error);
      throw error;
    }
  }

  // Migrate announcements data
  async migrateAnnouncements() {
    try {
      console.log('📢 Migrating announcements data...');
      
      const localAnnouncements = getAnnouncements();
      
      if (localAnnouncements.length === 0) {
        console.log('⚠️ No announcements found in localStorage');
        return { success: false, message: 'No announcements data to migrate' };
      }

      const operations = localAnnouncements.map(announcement => ({
        id: announcement.id || `ann_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type: 'create',
        data: {
          title: announcement.title,
          message: announcement.message,
          type: announcement.type || 'info',
          active: announcement.active !== false,
          priority: announcement.priority || 'normal',
          voiceUrl: announcement.voiceUrl || null,
          reactions: announcement.reactions || {}
        }
      }));

      await firebaseCollections.announcements.batchWrite(operations);
      console.log(`✅ Migrated ${localAnnouncements.length} announcements to Firebase`);
      
      return { success: true, count: localAnnouncements.length };
    } catch (error) {
      console.error('❌ Error migrating announcements:', error);
      throw error;
    }
  }

  // Migrate gallery data
  async migrateGallery() {
    try {
      console.log('🖼️ Migrating gallery data...');
      
      const localGallery = getGallery();
      
      if (localGallery.length === 0) {
        console.log('⚠️ No gallery items found in localStorage');
        return { success: false, message: 'No gallery data to migrate' };
      }

      const operations = localGallery.map(item => ({
        id: item.id || `gallery_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type: 'create',
        data: {
          title: item.title,
          description: item.description || '',
          category: item.category || 'General',
          src: item.src,
          imageUrl: item.src, // Alias for consistency
          fileName: item.fileName || '',
          fileSize: item.fileSize || 0,
          uploadedBy: 'migration'
        }
      }));

      await firebaseCollections.gallery.batchWrite(operations);
      console.log(`✅ Migrated ${localGallery.length} gallery items to Firebase`);
      
      return { success: true, count: localGallery.length };
    } catch (error) {
      console.error('❌ Error migrating gallery:', error);
      throw error;
    }
  }

  // Migrate festival data
  async migrateFestivalData() {
    try {
      console.log('🎭 Migrating festival data...');
      
      const localFestivalData = getFestivalData();
      
      await firebaseCollections.festivalData.createWithId('main', {
        name: localFestivalData.name || 'RENDEZVOUS 2025',
        logo: localFestivalData.logo || '🎭',
        startDate: localFestivalData.startDate || '2025-09-19',
        endDate: localFestivalData.endDate || '2025-09-20',
        venue: localFestivalData.venue || 'MARKAZ MIHRAJ MALAYIL',
        description: localFestivalData.description || 'Annual College Festival',
        theme: localFestivalData.theme || '',
        organizers: localFestivalData.organizers || []
      });

      console.log('✅ Migrated festival data to Firebase');
      return { success: true, count: 1 };
    } catch (error) {
      console.error('❌ Error migrating festival data:', error);
      throw error;
    }
  }

  // Create default admin account
  async createDefaultAdmin() {
    try {
      console.log('👤 Creating default admin account...');
      
      // Check if admin already exists
      const existingAdmins = await firebaseCollections.admins.getAll();
      if (existingAdmins.length > 0) {
        console.log('✅ Admin accounts already exist');
        return { success: true, message: 'Admin accounts already exist' };
      }

      // Create default admin
      await firebaseCollections.admins.create({
        username: 'admin',
        password: 'admin123', // In production, this should be hashed
        email: 'admin@rendezvous.local',
        name: 'System Administrator',
        role: 'super_admin',
        permissions: ['all']
      });

      console.log('✅ Created default admin account');
      console.log('🔐 Default credentials: admin / admin123');
      
      return { success: true, count: 1 };
    } catch (error) {
      console.error('❌ Error creating default admin:', error);
      throw error;
    }
  }

  // Run full migration
  async runFullMigration(options = {}) {
    try {
      console.log('🚀 Starting full migration to Firebase...');
      
      const results = {
        students: { success: false, count: 0 },
        competitions: { success: false, count: 0 },
        announcements: { success: false, count: 0 },
        gallery: { success: false, count: 0 },
        festivalData: { success: false, count: 0 },
        admins: { success: false, count: 0 }
      };

      const errors = [];

      // Check migration status first
      const { needsMigration, status } = await this.checkMigrationStatus();
      
      if (!needsMigration && !options.force) {
        console.log('✅ Migration not needed - all data already exists in Firebase');
        return { success: true, results, message: 'Migration not needed' };
      }

      // Migrate students
      if (!status.students || options.force) {
        try {
          results.students = await this.migrateStudents();
        } catch (error) {
          errors.push({ type: 'students', error: error.message });
        }
      }

      // Migrate competitions
      if (!status.competitions || options.force) {
        try {
          results.competitions = await this.migrateCompetitions();
        } catch (error) {
          errors.push({ type: 'competitions', error: error.message });
        }
      }

      // Migrate announcements
      if (!status.announcements || options.force) {
        try {
          results.announcements = await this.migrateAnnouncements();
        } catch (error) {
          errors.push({ type: 'announcements', error: error.message });
        }
      }

      // Migrate gallery
      if (!status.gallery || options.force) {
        try {
          results.gallery = await this.migrateGallery();
        } catch (error) {
          errors.push({ type: 'gallery', error: error.message });
        }
      }

      // Migrate festival data
      if (!status.festivalData || options.force) {
        try {
          results.festivalData = await this.migrateFestivalData();
        } catch (error) {
          errors.push({ type: 'festivalData', error: error.message });
        }
      }

      // Create admin account
      if (!status.admins || options.force) {
        try {
          results.admins = await this.createDefaultAdmin();
        } catch (error) {
          errors.push({ type: 'admins', error: error.message });
        }
      }

      const totalMigrated = Object.values(results).reduce((sum, result) => sum + (result.count || 0), 0);
      
      if (errors.length > 0) {
        console.log('⚠️ Migration completed with errors:', errors);
        return { 
          success: false, 
          results, 
          errors, 
          totalMigrated,
          message: `Migration completed with ${errors.length} errors. ${totalMigrated} items migrated.`
        };
      } else {
        console.log(`✅ Migration completed successfully! ${totalMigrated} items migrated.`);
        return { 
          success: true, 
          results, 
          totalMigrated,
          message: `Migration completed successfully! ${totalMigrated} items migrated.`
        };
      }
    } catch (error) {
      console.error('❌ Migration failed:', error);
      throw error;
    }
  }

  // Clear all Firebase data (for testing)
  async clearAllFirebaseData() {
    try {
      console.log('🗑️ Clearing all Firebase data...');
      
      const collections = [
        firebaseCollections.students,
        firebaseCollections.competitions,
        firebaseCollections.announcements,
        firebaseCollections.gallery,
        firebaseCollections.festivalData,
        firebaseCollections.admins
      ];

      for (const collection of collections) {
        const documents = await collection.getAll();
        for (const doc of documents) {
          await collection.delete(doc.id);
        }
      }

      console.log('✅ All Firebase data cleared');
    } catch (error) {
      console.error('❌ Error clearing Firebase data:', error);
      throw error;
    }
  }
}

// Create singleton instance
const firebaseMigration = new FirebaseMigration();

export default firebaseMigration;
