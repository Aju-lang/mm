import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import html2canvas from 'html2canvas';
import { hybridStorage, updateStudentRecords } from '../../utils/hybridStorage';

// Ref-based input component that doesn't use React state for the value
const UncontrolledInput = React.forwardRef(({ 
  defaultValue = '',
  onChange, 
  placeholder, 
  type = "text",
  required = false,
  className = "input"
}, ref) => {
  const inputRef = useRef(null);
  
  useEffect(() => {
    if (ref) {
      ref.current = inputRef.current;
    }
  }, [ref]);
  
  const handleChange = useCallback((e) => {
    const value = e.target.value;
    console.log('🔤 Uncontrolled input changed:', value);
    if (onChange) {
      onChange(value);
    }
  }, [onChange]);
  
  return (
    <input
      ref={inputRef}
      type={type}
      required={required}
      className={className}
      defaultValue={defaultValue}
      onChange={handleChange}
      placeholder={placeholder}
      autoComplete="off"
      spellCheck="false"
      style={{ outline: 'none' }}
      onFocus={(e) => {
        e.target.style.outline = '2px solid #3B82F6';
        console.log('🎯 Input focused');
      }}
      onBlur={(e) => {
        e.target.style.outline = '';
        console.log('👋 Input blurred');
      }}
    />
  );
});

const EnhancedCompetitionManager = () => {
  console.log('🔄 EnhancedCompetitionManager rendering...');
  
  const [competitions, setCompetitions] = useState([]);
  const [students, setStudents] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [selectedCompetition, setSelectedCompetition] = useState(null);
  const [showReportingModal, setShowReportingModal] = useState(false);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [inputMethod, setInputMethod] = useState('checkboxes'); // 'checkboxes' or 'manual'
  const [newCompetition, setNewCompetition] = useState({
    name: '',
    description: '',
    category: 'Technical',
    date: '',
    time: '',
    venue: '',
    participantNames: ''
  });
  
  const posterRef = useRef(null);
  const nameInputRef = useRef(null);
  const descriptionInputRef = useRef(null);
  const venueInputRef = useRef(null);
  
  // Debug: Track what causes re-renders
  useEffect(() => {
    console.log('🔍 State changed - competitions:', competitions.length);
  }, [competitions]);
  
  useEffect(() => {
    console.log('🔍 State changed - students:', students.length);
  }, [students]);
  
  useEffect(() => {
    console.log('🔍 State changed - showAddForm:', showAddForm);
  }, [showAddForm]);
  
  useEffect(() => {
    console.log('🔍 State changed - newCompetition:', newCompetition);
  }, [newCompetition]);

  useEffect(() => {
    console.log('🚀 Initial data load');
    loadData();
  }, []); // Only run once on mount
  
  // Separate useEffect for listeners to avoid conflicts
  useEffect(() => {
    // Completely disable listeners when form is open
    if (showAddForm || isTyping) {
      console.log('🔇 Listeners disabled - form open or typing');
      return;
    }
    
    console.log('🔊 Setting up Firebase listeners');
    
    // Set up real-time listeners for multi-device sync with debouncing
    let competitionUpdateTimeout;
    let studentUpdateTimeout;
    
    const unsubscribeCompetitions = hybridStorage.onCompetitionsChange((competitionsData) => {
      console.log('🔄 Firebase competitions changed');
      // Skip updates if user is typing to prevent focus loss
      if (isTyping || showAddForm) {
        console.log('🔇 Skipping competition update - form active');
        return;
      }
      
      // Debounce updates to prevent rapid re-renders during typing
      clearTimeout(competitionUpdateTimeout);
      competitionUpdateTimeout = setTimeout(() => {
        setCompetitions(prev => {
          // Only update if data actually changed to prevent unnecessary re-renders
          if (JSON.stringify(prev) !== JSON.stringify(competitionsData)) {
            console.log('📊 Updating competitions from Firebase');
            return competitionsData;
          }
          return prev;
        });
      }, 500); // Increased debounce to 500ms
    });
    
    const unsubscribeStudents = hybridStorage.onStudentsChange((studentsData) => {
      console.log('🔄 Firebase students changed');
      // Skip updates if form is open
      if (showAddForm || isTyping) {
        console.log('🔇 Skipping student update - form active');
        return;
      }
      
      // Debounce updates to prevent rapid re-renders during typing
      clearTimeout(studentUpdateTimeout);
      studentUpdateTimeout = setTimeout(() => {
        setStudents(prev => {
          // Only update if data actually changed to prevent unnecessary re-renders
          if (JSON.stringify(prev) !== JSON.stringify(studentsData)) {
            console.log('👥 Updating students from Firebase');
            return studentsData;
          }
          return prev;
        });
      }, 500); // Increased debounce to 500ms
    });
    
    return () => {
      console.log('🧹 Cleaning up Firebase listeners');
      clearTimeout(competitionUpdateTimeout);
      clearTimeout(studentUpdateTimeout);
      unsubscribeCompetitions();
      unsubscribeStudents();
    };
  }, [showAddForm, isTyping]);

  const loadData = useCallback(async () => {
    try {
      console.log('🔄 Loading data in EnhancedCompetitionManager...');
      const [competitionsData, studentsData] = await Promise.all([
        hybridStorage.getCompetitions(),
        hybridStorage.getStudents()
      ]);
      console.log('📊 Loaded:', { competitions: competitionsData.length, students: studentsData.length });
      setCompetitions(competitionsData);
      setStudents(studentsData);
      // Update student records automatically
      await updateStudentRecords();
    } catch (error) {
      console.error('Error loading data:', error);
    }
  }, []);

  const handleAddCompetition = async (e) => {
    e.preventDefault();
    
    console.log('🚀 Adding competition...');
    
    // Get values from refs instead of state to avoid re-render issues
    const competitionName = nameInputRef.current?.value || '';
    const competitionDescription = descriptionInputRef.current?.value || newCompetition.description;
    const competitionVenue = venueInputRef.current?.value || newCompetition.venue;
    
    console.log('📋 Competition data:', {
      name: competitionName,
      description: competitionDescription,
      venue: competitionVenue,
      category: newCompetition.category,
      date: newCompetition.date,
      time: newCompetition.time
    });
    
    let participants = [];
    
    if (inputMethod === 'checkboxes') {
      // Use selected students from checkboxes
      participants = selectedStudents
        .map(studentId => {
          const student = students.find(s => s.id === studentId);
          if (!student) {
            console.error('Student not found for ID:', studentId);
            return null;
          }
          return {
            id: student.id,
            name: student.name,
            studentCode: student.code,
            team: student.team,
            code: '',
            registered: true,
            reported: false,
            prize: '',
            customPoints: ''
          };
        })
        .filter(participant => participant !== null);
    } else {
      // Parse participant names from manual input
      const participantNames = newCompetition.participantNames
        .split('\n')
        .map(name => name.trim())
        .filter(name => name.length > 0);
      
      participants = participantNames.map((name, index) => ({
        id: Date.now() + index,
        name: name,
        studentCode: '',
        team: '',
        code: '',
        registered: true,
        reported: false,
        prize: '',
        customPoints: ''
      }));
    }
    
    const competition = {
      name: competitionName,
      description: competitionDescription,
      category: newCompetition.category,
      date: newCompetition.date,
      time: newCompetition.time,
      venue: competitionVenue,
      participants,
      status: 'upcoming',
      results: []
    };
    
    console.log('🎯 Final competition object:', competition);
    
    await hybridStorage.addCompetition(competition);
    console.log('Added competition with participants:', competition.participants);
    
    // Reset form
    setNewCompetition({
      name: '',
      description: '',
      category: 'Technical',
      date: '',
      time: '',
      venue: '',
      participantNames: ''
    });
    
    // Clear input refs
    if (nameInputRef.current) nameInputRef.current.value = '';
    if (descriptionInputRef.current) descriptionInputRef.current.value = '';
    if (venueInputRef.current) venueInputRef.current.value = '';
    
    setSelectedStudents([]);
    setInputMethod('checkboxes');
    setShowAddForm(false);
    
    // Reload data and force sync across devices
    await loadData();
    await hybridStorage.forceSync();
    
    console.log('✅ Competition added and synced!');
  };

  const handleDeleteCompetition = async (id) => {
    if (window.confirm('Are you sure you want to delete this competition?')) {
      await hybridStorage.deleteCompetition(id);
      await loadData();
    }
  };

  // Handle student selection for checkboxes
  const handleStudentSelection = (student, isSelected) => {
    if (isSelected) {
      setSelectedStudents([...selectedStudents, student.id]);
    } else {
      setSelectedStudents(selectedStudents.filter(id => id !== student.id));
    }
  };

  // Select all students
  const handleSelectAll = () => {
    setSelectedStudents(students.map(s => s.id));
  };

  // Clear all selections
  const handleClearAll = () => {
    setSelectedStudents([]);
  };

  // Generate code letters for participants (alphabetical order to random names)
  const generateCodeLetters = (competitionId) => {
    const competition = competitions.find(c => c.id === competitionId);
    if (!competition) return;

    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    
    // Shuffle the participants array to randomize assignment
    const shuffledParticipants = [...competition.participants];
    for (let i = shuffledParticipants.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffledParticipants[i], shuffledParticipants[j]] = [shuffledParticipants[j], shuffledParticipants[i]];
    }
    
    // Assign letters in alphabetical order to the shuffled participants
    const updatedParticipants = competition.participants.map((participant) => {
      const shuffledIndex = shuffledParticipants.findIndex(p => p.id === participant.id);
      const code = alphabet[shuffledIndex % alphabet.length];
      return { ...participant, code };
    });

    updateCompetitionData(competitionId, { participants: updatedParticipants });
  };

  // Update report status
  const updateReportStatus = (competitionId, participantId, reported) => {
    const competition = competitions.find(c => c.id === competitionId);
    if (!competition) return;

    const updatedParticipants = competition.participants.map(p =>
      p.id === participantId ? { ...p, reported } : p
    );

    updateCompetitionData(competitionId, { participants: updatedParticipants });
  };

  // Update prize for participant
  const updateParticipantPrize = (competitionId, participantId, prize) => {
    const competition = competitions.find(c => c.id === competitionId);
    if (!competition) return;

    const updatedParticipants = competition.participants.map(p =>
      p.id === participantId ? { ...p, prize } : p
    );

    updateCompetitionData(competitionId, { participants: updatedParticipants });
  };

  // Update points for participant
  const updateParticipantPoints = (competitionId, participantId, points) => {
    const competition = competitions.find(c => c.id === competitionId);
    if (!competition) return;

    const updatedParticipants = competition.participants.map(p =>
      p.id === participantId ? { ...p, customPoints: parseInt(points) || 0 } : p
    );

    updateCompetitionData(competitionId, { participants: updatedParticipants });
  };

  // Update competition data in database
  const updateCompetitionData = async (competitionId, updates) => {
    await hybridStorage.updateCompetition(competitionId, updates);
    await loadData(); // Reload data to ensure consistency
  };


  // Generate poster
  const generatePoster = async (competition) => {
    if (!posterRef.current) return;

    try {
      const canvas = await html2canvas(posterRef.current, {
        scale: 2,
        backgroundColor: '#ffffff'
      });

      const link = document.createElement('a');
      link.download = `${competition.name.replace(/\s+/g, '_')}_Results.png`;
      link.href = canvas.toDataURL();
      link.click();
    } catch (error) {
      console.error('Error generating poster:', error);
      alert('Error generating poster. Please try again.');
    }
  };

  const AddCompetitionForm = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleAddCompetition} className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-gray-900">Add New Competition</h3>
            <button
              type="button"
              onClick={() => {
                setShowAddForm(false);
                setSelectedStudents([]);
                setInputMethod('checkboxes');
              }}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ×
            </button>
          </div>
          
          <div className="space-y-6">
            {/* Basic Competition Details */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Competition Name</label>
                <UncontrolledInput
                  ref={nameInputRef}
                  type="text"
                  required
                  className="input"
                  defaultValue={newCompetition.name}
                  onChange={useCallback((value) => {
                    console.log('📝 Competition name changing to:', value);
                    // Don't update state immediately - only on form submit
                  }, [])}
                  placeholder="e.g., Coding Challenge"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <select
                  className="input"
                  value={newCompetition.category}
                  onChange={(e) => setNewCompetition(prev => ({...prev, category: e.target.value}))}
                >
                  <option value="Technical">Technical</option>
                  <option value="Cultural">Cultural</option>
                  <option value="Academic">Academic</option>
                  <option value="Creative">Creative</option>
                  <option value="Sports">Sports</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                required
                className="input"
                rows={2}
                value={newCompetition.description}
                onChange={(e) => {
                  e.persist();
                  const value = e.target.value;
                  setNewCompetition(prev => ({...prev, description: value}));
                }}
                placeholder="Brief description of the competition"
                autoComplete="off"
              />
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                <input
                  type="date"
                  required
                  className="input"
                  value={newCompetition.date}
                  onChange={(e) => {
                    e.persist();
                    const value = e.target.value;
                    setNewCompetition(prev => ({...prev, date: value}));
                  }}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Time</label>
                <input
                  type="time"
                  required
                  className="input"
                  value={newCompetition.time}
                  onChange={(e) => {
                    e.persist();
                    const value = e.target.value;
                    setNewCompetition(prev => ({...prev, time: value}));
                  }}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Venue</label>
                <input
                  type="text"
                  required
                  className="input"
                  value={newCompetition.venue}
                  onChange={(e) => {
                    e.persist();
                    const value = e.target.value;
                    setNewCompetition(prev => ({...prev, venue: value}));
                  }}
                  placeholder="e.g., Computer Lab 1"
                  autoComplete="off"
                />
              </div>
            </div>
            
            {/* Participant Selection Method */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Participant Selection Method</label>
              <div className="flex space-x-4 mb-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="inputMethod"
                    value="checkboxes"
                    checked={inputMethod === 'checkboxes'}
                    onChange={(e) => setInputMethod(e.target.value)}
                    className="mr-2"
                  />
                  Select from Registered Students
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="inputMethod"
                    value="manual"
                    checked={inputMethod === 'manual'}
                    onChange={(e) => setInputMethod(e.target.value)}
                    className="mr-2"
                  />
                  Type Names Manually
                </label>
              </div>

              {inputMethod === 'checkboxes' ? (
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-medium text-gray-900">
                      Select Students ({selectedStudents.length} selected)
                    </h4>
                    <div className="space-x-2">
                      <button
                        type="button"
                        onClick={handleSelectAll}
                        className="text-sm text-blue-600 hover:text-blue-700"
                      >
                        Select All
                      </button>
                      <button
                        type="button"
                        onClick={handleClearAll}
                        className="text-sm text-red-600 hover:text-red-700"
                      >
                        Clear All
                      </button>
                    </div>
                  </div>
                  
                  <div className="max-h-60 overflow-y-auto space-y-2">
                    {students.map((student) => (
                      <label key={student.id} className="flex items-center space-x-3 p-3 border border-gray-100 rounded-lg hover:bg-gray-50 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedStudents.includes(student.id)}
                          onChange={(e) => handleStudentSelection(student, e.target.checked)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">{student.name}</div>
                          <div className="text-sm text-gray-500">
                            {student.code} • {student.team} • {student.year} Year
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                  
                  {students.length === 0 && (
                    <div className="text-center py-8">
                      <p className="text-gray-500 mb-2">No students loaded.</p>
                      <p className="text-sm text-gray-400">Go to Admin Dashboard and click "Initialize Students in Firebase" if this persists.</p>
                    </div>
                  )}
                </div>
              ) : (
                <div>
                  <textarea
                    required
                    className="input"
                    rows={6}
                    value={newCompetition.participantNames}
                    onChange={(e) => {
                      e.persist();
                      const value = e.target.value;
                      setNewCompetition(prev => ({...prev, participantNames: value}));
                    }}
                    placeholder="Enter participant names, one per line:&#10;John Doe&#10;Jane Smith&#10;Bob Johnson"
                    autoComplete="off"
                  />
                  <p className="text-xs text-gray-500 mt-1">Enter each participant's name on a new line</p>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={() => {
                setShowAddForm(false);
                setSelectedStudents([]);
                setInputMethod('checkboxes');
              }}
              className="btn-outline"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn-primary"
              disabled={inputMethod === 'checkboxes' && selectedStudents.length === 0}
            >
              Add Competition ({inputMethod === 'checkboxes' ? selectedStudents.length : 'Manual'} participants)
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  const ReportingModal = ({ competition, onClose }) => {
    const [festivalData, setFestivalData] = useState({
      name: 'RENDEZVOUS 2025',
      logo: '🎭',
      venue: 'MARKAZ MIHRAJ MALAYIL'
    });

    useEffect(() => {
      const loadFestivalData = async () => {
        const data = await hybridStorage.getFestivalData();
        setFestivalData(data);
      };
      loadFestivalData();
    }, []);

    if (!competition) return null;
    const winners = competition.participants?.filter(p => p.prize && ['1', '2', '3'].includes(p.prize)) || [];
    
    // Debug log to check participants
    console.log('Competition participants:', competition.participants);
    console.log('Students available:', students);

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-900">Reporting: {competition.name}</h3>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>
            
            {/* Competition Info */}
            <div className="mb-6 p-4 bg-blue-50 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div><strong>Date:</strong> {competition.date}</div>
                <div><strong>Time:</strong> {competition.time}</div>
                <div><strong>Venue:</strong> {competition.venue}</div>
              </div>
            </div>

            {/* Generate Code Letters */}
            <div className="mb-6">
              <button
                onClick={() => generateCodeLetters(competition.id)}
                className="btn-secondary"
              >
                🎲 Provide Code Letters
              </button>
              <p className="text-sm text-gray-600 mt-2">
                Click to automatically assign random capital letters to all participants
              </p>
            </div>

            {/* Participants Table */}
            <div className="mb-8">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">
                📝 Participants ({competition.participants?.length || 0})
              </h4>
              
              {competition.participants && competition.participants.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full border border-gray-200 rounded-lg">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Student Name</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Student Code</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Team</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Competition Code</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Report Status</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Prize</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Points</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {competition.participants.map((participant) => {
                        const student = students.find(s => s.id === participant.id);
                        return (
                          <tr key={participant.id} className="hover:bg-gray-50">
                            <td className="px-4 py-3 text-sm font-medium text-gray-900">
                              {participant.name}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-600">
                              {participant.studentCode || 'N/A'}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-600">
                              {student?.team || 'N/A'}
                            </td>
                            <td className="px-4 py-3 text-sm">
                              {participant.code ? (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                  {participant.code}
                                </span>
                              ) : (
                                <span className="text-gray-400">Not assigned</span>
                              )}
                            </td>
                            <td className="px-4 py-3 text-sm">
                              <button
                                onClick={() => updateReportStatus(competition.id, participant.id, !participant.reported)}
                                className={`px-3 py-1 rounded text-xs font-medium ${
                                  participant.reported
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                                }`}
                              >
                                {participant.reported ? 'Reported' : 'Report'}
                              </button>
                            </td>
                            <td className="px-4 py-3 text-sm">
                              <select
                                value={participant.prize || ''}
                                onChange={(e) => updateParticipantPrize(competition.id, participant.id, e.target.value)}
                                className="text-xs border border-gray-300 rounded px-2 py-1 w-full"
                              >
                                <option value="">No Prize</option>
                                <option value="1">🥇 1st Prize</option>
                                <option value="2">🥈 2nd Prize</option>
                                <option value="3">🥉 3rd Prize</option>
                              </select>
                            </td>
                            <td className="px-4 py-3 text-sm">
                              <input
                                type="number"
                                min="0"
                                placeholder="Points"
                                value={participant.customPoints || ''}
                                onChange={(e) => updateParticipantPoints(competition.id, participant.id, e.target.value)}
                                className="w-16 text-xs border border-gray-300 rounded px-2 py-1"
                              />
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>No participants found for this competition.</p>
                  <p className="text-sm mt-2">Please add participants when creating the competition.</p>
                </div>
              )}
            </div>

            {/* Poster Generation */}
            {winners.length > 0 && (
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-semibold text-gray-900">🎨 Generate Results Poster</h4>
                  <button
                    onClick={() => generatePoster(competition)}
                    className="btn-primary"
                  >
                    📄 Generate Poster
                  </button>
                </div>
                
                {/* Poster Preview */}
                <div className="bg-gray-100 p-4 rounded-lg">
                  <div 
                    ref={posterRef}
                    className="w-full max-w-md mx-auto bg-gradient-to-br from-blue-500 via-purple-600 to-pink-600 text-white p-8 rounded-lg"
                    style={{ aspectRatio: '3/4' }}
                  >
                    <div className="text-center space-y-6">
                      <div className="text-4xl">{festivalData.logo}</div>
                      <div className="text-xl font-bold">{festivalData.name}</div>
                      <div className="text-2xl font-bold">{competition.name}</div>
                      <div className="text-lg">🏆 RESULTS 🏆</div>
                      
                      <div className="space-y-4">
                        {winners
                          .sort((a, b) => parseInt(a.prize) - parseInt(b.prize))
                          .map((winner, index) => (
                            <div key={winner.id} className="text-center">
                              <div className="text-2xl mb-1">
                                {winner.prize === '1' ? '🥇' : winner.prize === '2' ? '🥈' : '🥉'}
                              </div>
                              <div className="text-lg font-bold">
                                {winner.prize === '1' ? '1st' : winner.prize === '2' ? '2nd' : '3rd'} Place
                              </div>
                              <div className="text-base">{winner.name}</div>
                              {winner.code && (
                                <div className="text-sm opacity-80">Code: {winner.code}</div>
                              )}
                              {winner.customPoints && (
                                <div className="text-sm opacity-80">{winner.customPoints} Points</div>
                              )}
                            </div>
                          ))
                        }
                      </div>
                      
                      <div className="text-sm opacity-80">
                        📅 {competition.date} • 📍 {competition.venue}
                      </div>
                      <div className="text-xs opacity-70">
                        {festivalData.venue} • 2025
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Competition Completion */}
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <h4 className="text-lg font-semibold text-green-800 mb-2">🏁 Competition Status</h4>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-700">
                    Status: <span className="font-medium">{competition.status === 'completed' ? 'Completed' : 'Ongoing'}</span>
                  </p>
                  {competition.status === 'completed' && (
                    <p className="text-xs text-green-600 mt-1">
                      Competition completed and results are ready for publishing
                    </p>
                  )}
                </div>
                {competition.status !== 'completed' && (
                  <button
                    onClick={() => {
                      updateCompetitionData(competition.id, { status: 'completed' });
                      loadData();
                    }}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                  >
                    ✅ Mark as Completed
                  </button>
                )}
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <button onClick={onClose} className="btn-outline">
                Close
              </button>
              {winners.length > 0 && (
                <button
                  onClick={() => generatePoster(competition)}
                  className="btn-primary"
                >
                  📄 Generate Final Poster
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Competition Management</h1>
            <p className="text-gray-600">Manage competitions, participants, and reporting</p>
          </div>
          <button
            onClick={() => setShowAddForm(true)}
            className="btn-primary"
          >
            ➕ Add Competition
          </button>
        </div>

        <div className="grid gap-6">
          {competitions.map((competition) => (
            <div key={competition.id} className="card">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-xl font-bold text-gray-900">{competition.name}</h3>
                    <span className="badge badge-primary">{competition.category}</span>
                  </div>
                  <p className="text-gray-600 mb-3">{competition.description}</p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                    <div>📅 {competition.date} at {competition.time}</div>
                    <div>📍 {competition.venue}</div>
                    <div>👥 {competition.participants?.length || 0} participants</div>
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  <button
                    onClick={() => {
                      setSelectedCompetition(competition);
                      setShowReportingModal(true);
                    }}
                    className="btn-secondary text-sm"
                  >
                    📊 Reporting
                  </button>
                  <button
                    onClick={() => handleDeleteCompetition(competition.id)}
                    className="btn-outline text-sm text-red-600 hover:bg-red-50"
                  >
                    🗑️ Delete
                  </button>
                </div>
              </div>
              
              {competition.participants && competition.participants.length > 0 && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">
                    Participants ({competition.participants.length})
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {competition.participants.slice(0, 6).map((participant) => (
                      <div key={participant.id} className="bg-gray-50 rounded-lg p-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium text-gray-900">{participant.name}</div>
                            {participant.studentCode && (
                              <div className="text-xs text-gray-500">{participant.studentCode}</div>
                            )}
                          </div>
                          <div className="flex space-x-1">
                            {participant.code && (
                              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                {participant.code}
                              </span>
                            )}
                            {participant.registered && (
                              <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                                ✓
                              </span>
                            )}
                            {participant.prize && (
                              <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                                {participant.prize === '1' ? '🥇' : participant.prize === '2' ? '🥈' : '🥉'}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                    {competition.participants.length > 6 && (
                      <div className="bg-gray-100 rounded-lg p-3 flex items-center justify-center text-gray-500">
                        +{competition.participants.length - 6} more
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {competitions.length === 0 && (
          <div className="text-center py-12">
            <span className="text-4xl mb-4 block">🎯</span>
            <p className="text-gray-500 mb-4">No competitions created yet.</p>
            <button
              onClick={() => setShowAddForm(true)}
              className="btn-primary"
            >
              Create Your First Competition
            </button>
          </div>
        )}

        {showAddForm && <AddCompetitionForm />}
        
        {showReportingModal && (
          <ReportingModal
            competition={selectedCompetition}
            onClose={() => {
              setShowReportingModal(false);
              setSelectedCompetition(null);
            }}
          />
        )}
      </div>
    </div>
  );
};

export default EnhancedCompetitionManager;
