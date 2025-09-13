import React, { useState, useEffect } from 'react';
import { hybridStorage, updateStudentRecords } from '../../utils/hybridStorage';

const StudentManager = () => {
  const [students, setStudents] = useState([]);
  const [competitions, setCompetitions] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('all');
  const [newStudent, setNewStudent] = useState({
    name: '',
    team: 'Team A',
    year: '1st'
  });

  useEffect(() => {
    loadData();
    
    // Set up real-time listeners for multi-device sync
    const unsubscribeStudents = hybridStorage.onStudentsChange((studentsData) => {
      setStudents(studentsData);
    });
    
    const unsubscribeCompetitions = hybridStorage.onCompetitionsChange((competitionsData) => {
      setCompetitions(competitionsData);
    });
    
    return () => {
      unsubscribeStudents();
      unsubscribeCompetitions();
    };
  }, []);

  const loadData = async () => {
    try {
      // Update student records first to get latest data
      await updateStudentRecords();
      const [studentsData, competitionsData] = await Promise.all([
        hybridStorage.getStudents(),
        hybridStorage.getCompetitions()
      ]);
      setStudents(studentsData);
      setCompetitions(competitionsData);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const handleAddStudent = async (e) => {
    e.preventDefault();
    try {
      await hybridStorage.addStudent(newStudent);
      setNewStudent({
        name: '',
        team: 'Team A',
        year: '1st'
      });
      setShowAddForm(false);
      await loadData();
    } catch (error) {
      console.error('Error adding student:', error);
      alert('Error adding student. Please try again.');
    }
  };

  const handleRegisterForEvent = async (studentId, competitionId) => {
    try {
      const student = students.find(s => s.id === studentId);
      if (student) {
        // This functionality is now handled through the competition manager
        // where students are selected for competitions
        console.log('Student registration is handled through Competition Manager');
        alert('Student registration is now handled through the Competition Manager. Please use the "Add Competition" feature to register students for events.');
      }
    } catch (error) {
      console.error('Error registering student:', error);
    }
  };

  const teams = [...new Set(students.map(s => s.team))];
  
  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTeam = filterDepartment === 'all' || student.team === filterDepartment;
    return matchesSearch && matchesTeam;
  });

  const AddStudentForm = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-md w-full">
        <form onSubmit={handleAddStudent} className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-gray-900">Add New Student</h3>
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ×
            </button>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Student Name</label>
              <input
                type="text"
                required
                className="input"
                value={newStudent.name}
                onChange={(e) => setNewStudent({...newStudent, name: e.target.value})}
                placeholder="Enter student name"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Team</label>
              <select
                className="input"
                value={newStudent.team}
                onChange={(e) => setNewStudent({...newStudent, team: e.target.value})}
              >
                <option value="Team A">Team A</option>
                <option value="Team B">Team B</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Year</label>
              <select
                className="input"
                value={newStudent.year}
                onChange={(e) => setNewStudent({...newStudent, year: e.target.value})}
              >
                <option value="1st">1st Year</option>
                <option value="2nd">2nd Year</option>
                <option value="3rd">3rd Year</option>
                <option value="4th">4th Year</option>
              </select>
            </div>
          </div>
          
          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="btn-outline"
            >
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              Add Student
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  const RegistrationModal = ({ student, onClose }) => {
    const [selectedCompetitions, setSelectedCompetitions] = useState([]);

    if (!student) return null;

    const availableCompetitions = competitions.filter(comp => 
      !student.events.includes(comp.id) && comp.status === 'upcoming'
    );

    const handleRegister = () => {
      selectedCompetitions.forEach(compId => {
        handleRegisterForEvent(student.id, compId);
      });
      onClose();
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-900">Register {student.name}</h3>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>
            
            <div className="mb-6">
              <h4 className="font-semibold text-gray-900 mb-3">Available Competitions</h4>
              {availableCompetitions.length > 0 ? (
                <div className="space-y-3">
                  {availableCompetitions.map(comp => (
                    <label key={comp.id} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedCompetitions.includes(comp.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedCompetitions([...selectedCompetitions, comp.id]);
                          } else {
                            setSelectedCompetitions(selectedCompetitions.filter(id => id !== comp.id));
                          }
                        }}
                        className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      />
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">{comp.name}</div>
                        <div className="text-sm text-gray-500">
                          {comp.date} at {comp.time} • {comp.venue}
                        </div>
                      </div>
                      <span className="badge badge-secondary">{comp.category}</span>
                    </label>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 italic">No available competitions for registration.</p>
              )}
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={onClose}
                className="btn-outline"
              >
                Cancel
              </button>
              <button
                onClick={handleRegister}
                disabled={selectedCompetitions.length === 0}
                className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Register ({selectedCompetitions.length})
              </button>
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
            <h1 className="text-3xl font-bold text-gray-900">Student Management</h1>
            <p className="text-gray-600">Manage student registrations and event participation</p>
          </div>
          <button
            onClick={() => setShowAddForm(true)}
            className="btn-primary"
          >
            ➕ Add Student
          </button>
        </div>

        {/* Filters */}
        <div className="card mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search by name or student code..."
                className="input"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="sm:w-48">
              <select
                className="input"
                value={filterDepartment}
                onChange={(e) => setFilterDepartment(e.target.value)}
              >
                <option value="all">All Teams</option>
                {teams.map(team => (
                  <option key={team} value={team}>{team}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Students Grid */}
        <div className="grid gap-6">
          {filteredStudents.map((student) => (
            <div key={student.id} className="card">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                      <span className="text-primary-600 font-bold text-lg">
                        {student.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">{student.name}</h3>
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <span>Code: {student.code}</span>
                        <span>•</span>
                        <span>{student.team}</span>
                        <span>•</span>
                        <span>{student.year} Year</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">{student.competitionsRegistered || 0}</div>
                      <div className="text-sm text-blue-700">Competitions Registered</div>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">{student.competitionsCompleted || 0}</div>
                      <div className="text-sm text-green-700">Competitions Completed</div>
                    </div>
                    <div className="text-center p-3 bg-yellow-50 rounded-lg">
                      <div className="text-2xl font-bold text-yellow-600">{student.points || 0}</div>
                      <div className="text-sm text-yellow-700">Total Points</div>
                    </div>
                    <div className="text-center p-3 bg-purple-50 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">{student.results ? student.results.length : 0}</div>
                      <div className="text-sm text-purple-700">Results Available</div>
                    </div>
                  </div>
                  
                  {student.events && student.events.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Registered Events</h4>
                      <div className="flex flex-wrap gap-2">
                        {student.events.map((eventName, index) => (
                          <span key={index} className="badge badge-primary">
                            {eventName}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {student.results && student.results.length > 0 && (
                    <div className="mt-4">
                      <h4 className="font-semibold text-gray-900 mb-2">Recent Results</h4>
                      <div className="space-y-2">
                        {student.results.slice(0, 3).map((result, index) => (
                          <div key={index} className="flex items-center justify-between bg-gray-50 rounded-lg p-2">
                            <span className="text-sm font-medium">{result.competitionName}</span>
                            <div className="flex items-center space-x-2">
                              {result.prize && (
                                <span className="badge badge-success">
                                  {result.prize === '1' ? '🥇 1st' : 
                                   result.prize === '2' ? '🥈 2nd' : 
                                   result.prize === '3' ? '🥉 3rd' : `Prize: ${result.prize}`}
                                </span>
                              )}
                              {result.reported && (
                                <span className="badge badge-primary">
                                  ✓ Participated
                                </span>
                              )}
                              <span className="text-sm text-green-600 font-medium">
                                +{result.points || 0} pts
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="flex flex-col space-y-2">
                  <button
                    onClick={() => setSelectedStudent(student)}
                    className="btn-outline text-sm"
                  >
                    👁️ View Details
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredStudents.length === 0 && (
          <div className="text-center py-12">
            <span className="text-4xl mb-4 block">👥</span>
            <p className="text-gray-500 mb-4">
              {searchTerm || filterDepartment !== 'all' 
                ? 'No students found matching your filters.' 
                : 'No students registered yet.'
              }
            </p>
            {!searchTerm && filterDepartment === 'all' && (
              <button
                onClick={() => setShowAddForm(true)}
                className="btn-primary"
              >
                Add Your First Student
              </button>
            )}
          </div>
        )}

        {showAddForm && <AddStudentForm />}
        
        {showRegistrationModal && (
          <RegistrationModal
            student={selectedStudent}
            onClose={() => {
              setShowRegistrationModal(false);
              setSelectedStudent(null);
            }}
          />
        )}
      </div>
    </div>
  );
};

export default StudentManager;
