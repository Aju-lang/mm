import { useState, useEffect, useCallback } from 'react';
import firebaseCollections from '../services/firebaseCollections';

// Generic hook for real-time Firestore data
export const useFirestoreCollection = (collectionName, options = {}) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const collection = firebaseCollections[collectionName];

  useEffect(() => {
    if (!collection) {
      setError(new Error(`Collection ${collectionName} not found`));
      setLoading(false);
      return;
    }

    console.log(`🔄 Setting up real-time listener for ${collectionName}`);
    setLoading(true);
    setError(null);

    // Set up real-time listener
    const unsubscribe = collection.onSnapshot(
      (documents) => {
        console.log(`📊 Real-time update for ${collectionName}:`, documents.length, 'documents');
        setData(documents);
        setLoading(false);
      },
      (err) => {
        console.error(`❌ Real-time error for ${collectionName}:`, err);
        setError(err);
        setLoading(false);
      }
    );

    // Cleanup function
    return () => {
      console.log(`🔄 Cleaning up listener for ${collectionName}`);
      unsubscribe();
    };
  }, [collectionName, collection]);

  // Refresh data manually
  const refresh = useCallback(async () => {
    if (!collection) return;
    
    try {
      setLoading(true);
      setError(null);
      const documents = await collection.getAll();
      setData(documents);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [collection]);

  return { data, loading, error, refresh };
};

// Hook for students data with real-time updates
export const useStudents = () => {
  const { data: students, loading, error, refresh } = useFirestoreCollection('students');

  const getStudentByCode = useCallback((code) => {
    return students.find(student => student.code === code) || null;
  }, [students]);

  const getStudentsByTeam = useCallback((team) => {
    return students.filter(student => student.team === team);
  }, [students]);

  const getLeaderboard = useCallback(() => {
    return [...students]
      .sort((a, b) => (b.points || 0) - (a.points || 0))
      .slice(0, 10);
  }, [students]);

  const getTeamLeaderboard = useCallback(() => {
    const teamStats = students.reduce((acc, student) => {
      const team = student.team || 'Unknown';
      if (!acc[team]) {
        acc[team] = {
          team,
          totalPoints: 0,
          studentCount: 0,
          students: []
        };
      }
      acc[team].totalPoints += student.points || 0;
      acc[team].studentCount += 1;
      acc[team].students.push(student);
      return acc;
    }, {});

    return Object.values(teamStats)
      .sort((a, b) => b.totalPoints - a.totalPoints);
  }, [students]);

  return {
    students,
    loading,
    error,
    refresh,
    getStudentByCode,
    getStudentsByTeam,
    getLeaderboard,
    getTeamLeaderboard
  };
};

// Hook for competitions data with real-time updates
export const useCompetitions = () => {
  const { data: competitions, loading, error, refresh } = useFirestoreCollection('competitions');

  const getCompetitionsByCategory = useCallback((category) => {
    return competitions.filter(comp => comp.category === category);
  }, [competitions]);

  const getUpcomingCompetitions = useCallback(() => {
    return competitions
      .filter(comp => comp.status === 'upcoming')
      .sort((a, b) => new Date(a.date) - new Date(b.date));
  }, [competitions]);

  const getCompletedCompetitions = useCallback(() => {
    return competitions.filter(comp => comp.status === 'completed');
  }, [competitions]);

  const getCompetitionById = useCallback((id) => {
    return competitions.find(comp => comp.id === id) || null;
  }, [competitions]);

  return {
    competitions,
    loading,
    error,
    refresh,
    getCompetitionsByCategory,
    getUpcomingCompetitions,
    getCompletedCompetitions,
    getCompetitionById
  };
};

// Hook for announcements data with real-time updates
export const useAnnouncements = () => {
  const { data: announcements, loading, error, refresh } = useFirestoreCollection('announcements');

  const getActiveAnnouncements = useCallback(() => {
    return announcements
      .filter(announcement => announcement.active)
      .sort((a, b) => new Date(b.createdAt?.toDate() || 0) - new Date(a.createdAt?.toDate() || 0));
  }, [announcements]);

  const getRecentAnnouncements = useCallback((limit = 5) => {
    return announcements
      .filter(announcement => announcement.active)
      .sort((a, b) => new Date(b.createdAt?.toDate() || 0) - new Date(a.createdAt?.toDate() || 0))
      .slice(0, limit);
  }, [announcements]);

  return {
    announcements,
    loading,
    error,
    refresh,
    getActiveAnnouncements,
    getRecentAnnouncements
  };
};

// Hook for gallery data with real-time updates
export const useGallery = () => {
  const { data: rawGallery, loading, error, refresh } = useFirestoreCollection('gallery');

  // Transform gallery data to include src property for compatibility
  const gallery = rawGallery.map(item => ({
    ...item,
    src: item.base64Image || item.imageUrl || item.src, // Support multiple formats
    imageUrl: item.base64Image || item.imageUrl || item.src
  }));

  const getGalleryByCategory = useCallback((category) => {
    if (category === 'All') return gallery;
    return gallery.filter(item => item.category === category);
  }, [gallery]);

  const getCategories = useCallback(() => {
    const categories = [...new Set(gallery.map(item => item.category))];
    return ['All', ...categories];
  }, [gallery]);

  const getGalleryStats = useCallback(() => {
    return {
      total: gallery.length,
      categories: new Set(gallery.map(item => item.category)).size,
      compressed: gallery.filter(item => item.compressed).length,
      storageType: 'Base64 (Firestore)'
    };
  }, [gallery]);

  return {
    gallery,
    loading,
    error,
    refresh,
    getGalleryByCategory,
    getCategories,
    getGalleryStats
  };
};

// Hook for festival data
export const useFestivalData = () => {
  const [festivalData, setFestivalData] = useState({
    name: 'RENDEZVOUS 2025',
    logo: '🎭',
    startDate: '2025-09-19',
    endDate: '2025-09-20',
    venue: 'MARKAZ MIHRAJ MALAYIL',
    description: 'Annual College Festival'
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadFestivalData = async () => {
      try {
        setLoading(true);
        const data = await firebaseCollections.festivalData.getById('main');
        if (data) {
          setFestivalData(data);
        }
      } catch (err) {
        console.error('Error loading festival data:', err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    loadFestivalData();
  }, []);

  const updateFestivalData = useCallback(async (newData) => {
    try {
      await firebaseCollections.festivalData.createWithId('main', newData);
      setFestivalData(newData);
    } catch (err) {
      console.error('Error updating festival data:', err);
      throw err;
    }
  }, []);

  return {
    festivalData,
    loading,
    error,
    updateFestivalData
  };
};

// Hook for combined dashboard statistics
export const useDashboardStats = () => {
  const { students } = useStudents();
  const { competitions } = useCompetitions();
  const { announcements } = useAnnouncements();
  const { gallery } = useGallery();
  const { festivalData } = useFestivalData();

  const stats = {
    totalStudents: students.length,
    totalCompetitions: competitions.length,
    completedCompetitions: competitions.filter(c => c.status === 'completed').length,
    upcomingCompetitions: competitions.filter(c => c.status === 'upcoming').length,
    activeAnnouncements: announcements.filter(a => a.active).length,
    galleryImages: gallery.length,
    daysToGo: Math.max(0, Math.ceil((new Date(festivalData.startDate) - new Date()) / (1000 * 60 * 60 * 24)))
  };

  return stats;
};

export default {
  useFirestoreCollection,
  useStudents,
  useCompetitions,
  useAnnouncements,
  useGallery,
  useFestivalData,
  useDashboardStats
};
