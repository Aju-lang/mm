// Local Storage utilities for festival management

export const STORAGE_KEYS = {
  STUDENTS: 'festival_students',
  COMPETITIONS: 'festival_competitions',
  ADMINS: 'festival_admins',
  ANNOUNCEMENTS: 'festival_announcements',
  FESTIVAL_DATA: 'festival_data',
  GALLERY: 'festival_gallery'
};

// Initialize default data
export const initializeData = () => {
  // Initialize admins if not exists
  if (!localStorage.getItem(STORAGE_KEYS.ADMINS)) {
    const defaultAdmins = [
      { id: 1, username: 'admin', password: 'admin123' },
      { id: 2, username: 'festival', password: 'festival2024' }
    ];
    localStorage.setItem(STORAGE_KEYS.ADMINS, JSON.stringify(defaultAdmins));
  }

  // Initialize festival data if not exists
  if (!localStorage.getItem(STORAGE_KEYS.FESTIVAL_DATA)) {
    const festivalData = {
      name: 'RENDEZVOUS 2025',
      logo: '🎭',
      startDate: '2025-09-19',
      endDate: '2025-09-20',
      venue: 'MARKAZ MIHRAJ MALAYIL',
      description: 'Annual Cultural and Technical Festival'
    };
    localStorage.setItem(STORAGE_KEYS.FESTIVAL_DATA, JSON.stringify(festivalData));
  }

  // Initialize students if not exists
  if (!localStorage.getItem(STORAGE_KEYS.STUDENTS)) {
    const teamAStudents = [
      'ADIL MINHAJ', 'ASHIQUE', 'UNAIS', 'AFEEF', 'SAHAD', 'HASHIM', 'MUSTHAFA', 
      'SINAN', 'HADI', 'MUHAMMED JUBAIR', 'MUBARAK', 'SHAHEEM M', 'SANAD MUHAMMED', 
      'SHAMIL', 'SABITH', 'RAFHAN', 'UMER', 'ANAS', 'ANAS MUZAMMIL', 
      'NAHYAN', 'ADNAN'
    ];
    
    const teamBStudents = [
      'HATHIB', 'JINSHID', 'MIDLAJ', 'IBRAHIM', 'ADHIL KP', 'SHAFI', 'SALMAN', 
      'NIHAL', 'RUFAID', 'AZHIM', 'ABSHIR', 'HALEEM', 'FAYIZ', 'BASITH', 
      'KHALEEL', 'ANSHID', 'MUBASHIR', 'ADHIL CP', 'ABDUL HADI', 'HASBIN', 
      'YASEEN', 'SHAHEEM K'
    ];
    
    const allStudents = [];
    let codeCounter = 1;
    
    // Add Team A students
    teamAStudents.forEach((name) => {
      allStudents.push({
        id: codeCounter,
        name: name,
        code: `RV2025${String(codeCounter).padStart(3, '0')}`,
        team: 'Team A',
        year: '1st',
        events: [],
        results: [],
        points: 0
      });
      codeCounter++;
    });
    
    // Add Team B students
    teamBStudents.forEach((name) => {
      allStudents.push({
        id: codeCounter,
        name: name,
        code: `RV2025${String(codeCounter).padStart(3, '0')}`,
        team: 'Team B',
        year: '1st',
        events: [],
        results: [],
        points: 0
      });
      codeCounter++;
    });
    
    localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(allStudents));
  }

  // Initialize competitions if not exists
  if (!localStorage.getItem(STORAGE_KEYS.COMPETITIONS)) {
    const dummyCompetitions = [
      {
        id: 1,
        name: 'Coding Challenge',
        description: 'Competitive programming contest',
        category: 'Technical',
        date: '2025-09-19',
        time: '10:00 AM',
        venue: 'Computer Lab 1',
        maxParticipants: 50,
        participants: [],
        results: [],
        status: 'upcoming'
      },
      {
        id: 2,
        name: 'Web Design Contest',
        description: 'Create stunning web interfaces',
        category: 'Technical',
        date: '2025-09-19',
        time: '02:00 PM',
        venue: 'Computer Lab 2',
        maxParticipants: 30,
        participants: [],
        results: [],
        status: 'upcoming'
      },
      {
        id: 3,
        name: 'Dance Battle',
        description: 'Showcase your dance moves',
        category: 'Cultural',
        date: '2025-09-20',
        time: '06:00 PM',
        venue: 'Main Auditorium',
        maxParticipants: 100,
        participants: [],
        results: [],
        status: 'upcoming'
      },
      {
        id: 4,
        name: 'Quiz Championship',
        description: 'Test your general knowledge',
        category: 'Academic',
        date: '2025-09-20',
        time: '11:00 AM',
        venue: 'Seminar Hall',
        maxParticipants: 60,
        participants: [],
        results: [],
        status: 'upcoming'
      },
      {
        id: 5,
        name: 'Photography Contest',
        description: 'Capture the perfect moment',
        category: 'Creative',
        date: '2025-09-20',
        time: '09:00 AM',
        venue: 'Campus Grounds',
        maxParticipants: 40,
        participants: [],
        results: [],
        status: 'upcoming'
      }
    ];
    localStorage.setItem(STORAGE_KEYS.COMPETITIONS, JSON.stringify(dummyCompetitions));
  }

  // Initialize announcements if not exists
  if (!localStorage.getItem(STORAGE_KEYS.ANNOUNCEMENTS)) {
    const dummyAnnouncements = [
      {
        id: 1,
        title: 'Registration Open',
        message: 'Registration for TechFest 2024 is now open! Register before October 10th.',
        type: 'info',
        createdAt: new Date().toISOString(),
        active: true
      },
      {
        id: 2,
        title: 'Venue Update',
        message: 'Dance Battle venue has been changed to Main Auditorium.',
        type: 'warning',
        createdAt: new Date().toISOString(),
        active: true
      }
    ];
    localStorage.setItem(STORAGE_KEYS.ANNOUNCEMENTS, JSON.stringify(dummyAnnouncements));
  }
};

// Generic CRUD operations
export const getData = (key) => {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error(`Error getting data for key ${key}:`, error);
    return [];
  }
};

export const setData = (key, data) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
    return true;
  } catch (error) {
    console.error(`Error setting data for key ${key}:`, error);
    return false;
  }
};

// Student operations
export const getStudents = () => getData(STORAGE_KEYS.STUDENTS);
export const setStudents = (students) => setData(STORAGE_KEYS.STUDENTS, students);

export const addStudent = (student) => {
  const students = getStudents();
  const newStudent = {
    ...student,
    id: Date.now(),
    code: generateStudentCode(),
    events: [],
    results: [],
    points: 0
  };
  students.push(newStudent);
  setStudents(students);
  return newStudent;
};

export const updateStudent = (id, updates) => {
  const students = getStudents();
  const index = students.findIndex(s => s.id === id);
  if (index !== -1) {
    students[index] = { ...students[index], ...updates };
    setStudents(students);
    return students[index];
  }
  return null;
};

export const getStudentByCode = (code) => {
  const students = getStudents();
  return students.find(s => s.code === code);
};

// Competition operations
export const getCompetitions = () => getData(STORAGE_KEYS.COMPETITIONS);
export const setCompetitions = (competitions) => setData(STORAGE_KEYS.COMPETITIONS, competitions);

export const addCompetition = (competition) => {
  const competitions = getCompetitions();
  const newCompetition = {
    ...competition,
    id: Date.now(),
    participants: competition.participants || [],
    results: competition.results || [],
    status: competition.status || 'upcoming'
  };
  competitions.push(newCompetition);
  setCompetitions(competitions);
  return newCompetition;
};

export const updateCompetition = (id, updates) => {
  const competitions = getCompetitions();
  const index = competitions.findIndex(c => c.id === id);
  if (index !== -1) {
    competitions[index] = { ...competitions[index], ...updates };
    setCompetitions(competitions);
    return competitions[index];
  }
  return null;
};

export const deleteCompetition = (id) => {
  const competitions = getCompetitions();
  const filtered = competitions.filter(c => c.id !== id);
  setCompetitions(filtered);
  return filtered;
};

// Registration operations
export const registerStudentForEvent = (studentCode, competitionId) => {
  const students = getStudents();
  const competitions = getCompetitions();
  
  const student = students.find(s => s.code === studentCode);
  const competition = competitions.find(c => c.id === competitionId);
  
  if (student && competition) {
    // Add event to student
    if (!student.events.includes(competitionId)) {
      student.events.push(competitionId);
      updateStudent(student.id, { events: student.events });
    }
    
    // Add participant to competition
    if (!competition.participants.some(p => p.code === studentCode)) {
      competition.participants.push({
        id: student.id,
        name: student.name,
        code: student.code,
        department: student.department
      });
      updateCompetition(competitionId, { participants: competition.participants });
    }
    
    return true;
  }
  return false;
};

// Results operations
export const updateResults = (competitionId, results) => {
  const competitions = getCompetitions();
  const students = getStudents();
  
  const competition = competitions.find(c => c.id === competitionId);
  if (!competition) return false;
  
  // Update competition results
  updateCompetition(competitionId, { results, status: 'completed' });
  
  // Update student points and results
  results.forEach((result, index) => {
    const student = students.find(s => s.code === result.code);
    if (student) {
      const points = result.position === 1 ? 100 : result.position === 2 ? 75 : result.position === 3 ? 50 : 25;
      
      // Update student results
      const existingResultIndex = student.results.findIndex(r => r.competitionId === competitionId);
      const newResult = {
        competitionId,
        competitionName: competition.name,
        position: result.position,
        points,
        date: new Date().toISOString()
      };
      
      if (existingResultIndex !== -1) {
        student.results[existingResultIndex] = newResult;
      } else {
        student.results.push(newResult);
      }
      
      // Update total points
      student.points = student.results.reduce((total, r) => total + r.points, 0);
      
      updateStudent(student.id, { 
        results: student.results, 
        points: student.points 
      });
    }
  });
  
  return true;
};

// Announcement operations
export const getAnnouncements = () => getData(STORAGE_KEYS.ANNOUNCEMENTS);
export const setAnnouncements = (announcements) => setData(STORAGE_KEYS.ANNOUNCEMENTS, announcements);

export const addAnnouncement = (announcement) => {
  const announcements = getAnnouncements();
  const newAnnouncement = {
    ...announcement,
    id: Date.now(),
    createdAt: new Date().toISOString(),
    active: true
  };
  announcements.push(newAnnouncement);
  setAnnouncements(announcements);
  return newAnnouncement;
};

export const updateAnnouncement = (id, updates) => {
  const announcements = getAnnouncements();
  const index = announcements.findIndex(a => a.id === id);
  if (index !== -1) {
    announcements[index] = { ...announcements[index], ...updates };
    setAnnouncements(announcements);
    return announcements[index];
  }
  return null;
};

export const deleteAnnouncement = (id) => {
  const announcements = getAnnouncements();
  const filtered = announcements.filter(a => a.id !== id);
  setAnnouncements(filtered);
  return filtered;
};

// Admin operations
export const getAdmins = () => getData(STORAGE_KEYS.ADMINS);
export const validateAdmin = (username, password) => {
  const admins = getAdmins();
  return admins.find(admin => admin.username === username && admin.password === password);
};

// Festival data operations
export const getFestivalData = () => getData(STORAGE_KEYS.FESTIVAL_DATA);
export const setFestivalData = (data) => setData(STORAGE_KEYS.FESTIVAL_DATA, data);

// Utility functions
export const generateStudentCode = () => {
  const prefix = 'RV2025';
  const students = getStudents();
  const lastNumber = students.length > 0 ? 
    Math.max(...students.map(s => parseInt(s.code.replace(prefix, '')) || 0)) : 0;
  return `${prefix}${String(lastNumber + 1).padStart(3, '0')}`;
};

export const getLeaderboard = (limit = 10) => {
  const students = getStudents();
  return students
    .filter(s => s.points > 0)
    .sort((a, b) => b.points - a.points)
    .slice(0, limit);
};

export const getCompetitionsByCategory = () => {
  const competitions = getCompetitions();
  return competitions.reduce((acc, comp) => {
    if (!acc[comp.category]) {
      acc[comp.category] = [];
    }
    acc[comp.category].push(comp);
    return acc;
  }, {});
};

// Force reset student data (for admin use)
export const resetStudentData = () => {
  localStorage.removeItem(STORAGE_KEYS.STUDENTS);
  initializeData(); // This will recreate the students with new data
};

// Gallery operations
export const getGallery = () => getData(STORAGE_KEYS.GALLERY);
export const setGallery = (gallery) => setData(STORAGE_KEYS.GALLERY, gallery);

export const addGalleryImage = (imageData) => {
  const gallery = getGallery();
  const newImage = {
    id: Date.now(),
    ...imageData,
    uploadedAt: new Date().toISOString()
  };
  gallery.push(newImage);
  setGallery(gallery);
  return newImage;
};

export const deleteGalleryImage = (id) => {
  const gallery = getGallery();
  const filtered = gallery.filter(img => img.id !== id);
  setGallery(filtered);
  return filtered;
};

// Team leaderboard
export const getTeamLeaderboard = () => {
  const students = getStudents();
  const teamStats = students.reduce((acc, student) => {
    if (!acc[student.team]) {
      acc[student.team] = {
        team: student.team,
        totalPoints: 0,
        studentCount: 0,
        avgPoints: 0
      };
    }
    acc[student.team].totalPoints += student.points;
    acc[student.team].studentCount += 1;
    return acc;
  }, {});

  return Object.values(teamStats)
    .map(team => ({
      ...team,
      avgPoints: team.studentCount > 0 ? Math.round(team.totalPoints / team.studentCount) : 0
    }))
    .sort((a, b) => b.totalPoints - a.totalPoints);
};

// Automatic student record updates
export const updateStudentRecords = () => {
  const students = getStudents();
  const competitions = getCompetitions();
  
  const updatedStudents = students.map(student => {
    // Find competitions this student is registered for
    const registeredCompetitions = competitions.filter(comp => 
      comp.participants && comp.participants.some(p => p.id === student.id)
    );
    
    // Find completed competitions
    const completedCompetitions = registeredCompetitions.filter(comp => comp.status === 'completed');
    
    // Calculate total points from all competitions
    let totalPoints = 0;
    const results = [];
    
    registeredCompetitions.forEach(comp => {
      const participation = comp.participants.find(p => p.id === student.id);
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
  
  setStudents(updatedStudents);
  return updatedStudents;
};

// Data persistence verification
export const verifyDataPersistence = () => {
  const keys = Object.values(STORAGE_KEYS);
  const status = {};
  
  keys.forEach(key => {
    try {
      const data = localStorage.getItem(key);
      status[key] = {
        exists: !!data,
        size: data ? data.length : 0,
        lastModified: new Date().toISOString()
      };
    } catch (error) {
      status[key] = {
        exists: false,
        error: error.message
      };
    }
  });
  
  console.log('Data Persistence Status:', status);
  return status;
};

// Force save all current data
export const forceSaveAllData = () => {
  try {
    // Re-save all data to ensure persistence
    const students = getStudents();
    const competitions = getCompetitions();
    const announcements = getAnnouncements();
    const gallery = getGallery();
    const festivalData = getFestivalData();
    
    setStudents(students);
    setCompetitions(competitions);
    setAnnouncements(announcements);
    setGallery(gallery);
    setData(STORAGE_KEYS.FESTIVAL_DATA, festivalData);
    
    console.log('All data force-saved to localStorage');
    return true;
  } catch (error) {
    console.error('Error force-saving data:', error);
    return false;
  }
};
