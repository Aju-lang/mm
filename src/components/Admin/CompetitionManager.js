import React, { useState, useEffect } from 'react';
import {
  getCompetitions,
  addCompetition,
  updateCompetition,
  deleteCompetition,
  getStudents,
  registerStudentForEvent,
  updateResults
} from '../../utils/localStorage';

const CompetitionManager = () => {
  const [competitions, setCompetitions] = useState([]);
  const [students, setStudents] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedCompetition, setSelectedCompetition] = useState(null);
  const [showResultsModal, setShowResultsModal] = useState(false);
  const [newCompetition, setNewCompetition] = useState({
    name: '',
    description: '',
    category: 'Technical',
    date: '',
    time: '',
    venue: '',
    maxParticipants: 50
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setCompetitions(getCompetitions());
    setStudents(getStudents());
  };

  const handleAddCompetition = (e) => {
    e.preventDefault();
    addCompetition(newCompetition);
    setNewCompetition({
      name: '',
      description: '',
      category: 'Technical',
      date: '',
      time: '',
      venue: '',
      maxParticipants: 50
    });
    setShowAddForm(false);
    loadData();
  };

  const handleDeleteCompetition = (id) => {
    if (window.confirm('Are you sure you want to delete this competition?')) {
      deleteCompetition(id);
      loadData();
    }
  };

  const handleRegisterStudent = (studentCode, competitionId) => {
    registerStudentForEvent(studentCode, competitionId);
    loadData();
  };

  const handleUpdateResults = (competitionId, results) => {
    updateResults(competitionId, results);
    loadData();
    setShowResultsModal(false);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'upcoming': return 'text-blue-600 bg-blue-100';
      case 'ongoing': return 'text-yellow-600 bg-yellow-100';
      case 'completed': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const AddCompetitionForm = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleAddCompetition} className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-gray-900">Add New Competition</h3>
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
              <label className="block text-sm font-medium text-gray-700 mb-2">Competition Name</label>
              <input
                type="text"
                required
                className="input"
                value={newCompetition.name}
                onChange={(e) => setNewCompetition({...newCompetition, name: e.target.value})}
                placeholder="e.g., Coding Challenge"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                required
                className="input"
                rows={3}
                value={newCompetition.description}
                onChange={(e) => setNewCompetition({...newCompetition, description: e.target.value})}
                placeholder="Brief description of the competition"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <select
                  className="input"
                  value={newCompetition.category}
                  onChange={(e) => setNewCompetition({...newCompetition, category: e.target.value})}
                >
                  <option value="Technical">Technical</option>
                  <option value="Cultural">Cultural</option>
                  <option value="Academic">Academic</option>
                  <option value="Creative">Creative</option>
                  <option value="Sports">Sports</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Max Participants</label>
                <input
                  type="number"
                  required
                  min="1"
                  className="input"
                  value={newCompetition.maxParticipants}
                  onChange={(e) => setNewCompetition({...newCompetition, maxParticipants: parseInt(e.target.value)})}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                <input
                  type="date"
                  required
                  className="input"
                  value={newCompetition.date}
                  onChange={(e) => setNewCompetition({...newCompetition, date: e.target.value})}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Time</label>
                <input
                  type="time"
                  required
                  className="input"
                  value={newCompetition.time}
                  onChange={(e) => setNewCompetition({...newCompetition, time: e.target.value})}
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Venue</label>
              <input
                type="text"
                required
                className="input"
                value={newCompetition.venue}
                onChange={(e) => setNewCompetition({...newCompetition, venue: e.target.value})}
                placeholder="e.g., Computer Lab 1"
              />
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
              Add Competition
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  const ResultsModal = ({ competition, onClose, onSubmit }) => {
    const [results, setResults] = useState([]);

    useEffect(() => {
      if (competition) {
        const initialResults = competition.participants.map((participant, index) => ({
          ...participant,
          position: index + 1
        }));
        setResults(initialResults);
      }
    }, [competition]);

    const handleSubmit = (e) => {
      e.preventDefault();
      onSubmit(competition.id, results);
    };

    const moveUp = (index) => {
      if (index > 0) {
        const newResults = [...results];
        [newResults[index - 1], newResults[index]] = [newResults[index], newResults[index - 1]];
        newResults.forEach((result, i) => {
          result.position = i + 1;
        });
        setResults(newResults);
      }
    };

    const moveDown = (index) => {
      if (index < results.length - 1) {
        const newResults = [...results];
        [newResults[index], newResults[index + 1]] = [newResults[index + 1], newResults[index]];
        newResults.forEach((result, i) => {
          result.position = i + 1;
        });
        setResults(newResults);
      }
    };

    if (!competition) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <form onSubmit={handleSubmit} className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-900">Update Results: {competition.name}</h3>
              <button
                type="button"
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>
            
            <p className="text-gray-600 mb-4">Arrange participants by their final positions:</p>
            
            <div className="space-y-3 mb-6">
              {results.map((result, index) => (
                <div key={result.id} className="flex items-center justify-between bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center space-x-4">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white ${
                      result.position === 1 ? 'bg-yellow-500' :
                      result.position === 2 ? 'bg-gray-400' :
                      result.position === 3 ? 'bg-orange-500' : 'bg-blue-500'
                    }`}>
                      {result.position}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{result.name}</div>
                      <div className="text-sm text-gray-500">{result.code} • {result.department}</div>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      type="button"
                      onClick={() => moveUp(index)}
                      disabled={index === 0}
                      className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50"
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      onClick={() => moveDown(index)}
                      disabled={index === results.length - 1}
                      className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50"
                    >
                      ↓
                    </button>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="btn-outline"
              >
                Cancel
              </button>
              <button type="submit" className="btn-primary">
                Update Results
              </button>
            </div>
          </form>
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
            <p className="text-gray-600">Manage competitions, participants, and results</p>
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
                    <span className={`badge ${getStatusColor(competition.status)}`}>
                      {competition.status}
                    </span>
                    <span className="badge badge-secondary">{competition.category}</span>
                  </div>
                  <p className="text-gray-600 mb-3">{competition.description}</p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                    <div>📅 {competition.date} at {competition.time}</div>
                    <div>📍 {competition.venue}</div>
                    <div>👥 {competition.participants.length}/{competition.maxParticipants} registered</div>
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  <button
                    onClick={() => {
                      setSelectedCompetition(competition);
                      setShowResultsModal(true);
                    }}
                    className="btn-secondary text-sm"
                    disabled={competition.participants.length === 0}
                  >
                    🏆 Results
                  </button>
                  <button
                    onClick={() => handleDeleteCompetition(competition.id)}
                    className="btn-outline text-sm text-red-600 hover:bg-red-50"
                  >
                    🗑️ Delete
                  </button>
                </div>
              </div>
              
              {competition.participants.length > 0 && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Participants</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {competition.participants.map((participant) => (
                      <div key={participant.id} className="bg-gray-50 rounded-lg p-3">
                        <div className="font-medium text-gray-900">{participant.name}</div>
                        <div className="text-sm text-gray-500">
                          {participant.code} • {participant.department}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {competition.results.length > 0 && (
                <div className="mt-4">
                  <h4 className="font-semibold text-gray-900 mb-3">🏆 Results</h4>
                  <div className="space-y-2">
                    {competition.results.slice(0, 3).map((result) => (
                      <div key={result.id} className="flex items-center justify-between bg-yellow-50 rounded-lg p-3">
                        <div className="flex items-center space-x-3">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-sm font-bold ${
                            result.position === 1 ? 'bg-yellow-500' :
                            result.position === 2 ? 'bg-gray-400' :
                            'bg-orange-500'
                          }`}>
                            {result.position}
                          </div>
                          <span className="font-medium">{result.name}</span>
                          <span className="text-sm text-gray-500">({result.code})</span>
                        </div>
                      </div>
                    ))}
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
        
        {showResultsModal && (
          <ResultsModal
            competition={selectedCompetition}
            onClose={() => setShowResultsModal(false)}
            onSubmit={handleUpdateResults}
          />
        )}
      </div>
    </div>
  );
};

export default CompetitionManager;

