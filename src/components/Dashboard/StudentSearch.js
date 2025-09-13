import React, { useState } from 'react';
import { getStudentByCode, getCompetitions, updateStudentRecords } from '../../utils/localStorage';

const StudentSearch = () => {
  const [searchCode, setSearchCode] = useState('');
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchCode.trim()) {
      setError('Please enter a student code');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      // Update student records first to get latest data
      updateStudentRecords();
      
      const foundStudent = getStudentByCode(searchCode.trim().toUpperCase());
      if (foundStudent) {
        setStudent(foundStudent);
        setError('');
      } else {
        setStudent(null);
        setError('Student not found. Please check the code and try again.');
      }
    } catch (err) {
      setError('An error occurred while searching. Please try again.');
    }
    
    setLoading(false);
  };

  const getCompetitionName = (competitionId) => {
    const competitions = getCompetitions();
    const competition = competitions.find(c => c.id === competitionId);
    return competition ? competition.name : 'Unknown Competition';
  };

  const getPositionBadge = (position) => {
    const badges = {
      1: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      2: 'bg-gray-100 text-gray-800 border-gray-200',
      3: 'bg-orange-100 text-orange-800 border-orange-200'
    };
    
    return badges[position] || 'bg-blue-100 text-blue-800 border-blue-200';
  };

  const getPositionEmoji = (position) => {
    const emojis = { 1: '🥇', 2: '🥈', 3: '🥉' };
    return emojis[position] || '🏆';
  };

  return (
    <div className="card">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">🔍 Student Search</h2>
      
      <form onSubmit={handleSearch} className="mb-6">
        <div className="flex gap-3">
          <div className="flex-1">
            <input
              type="text"
              value={searchCode}
              onChange={(e) => setSearchCode(e.target.value.toUpperCase())}
              placeholder="Enter student code (e.g., RV2025001)"
              className="input"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Searching...' : 'Search'}
          </button>
        </div>
        {error && (
          <p className="mt-2 text-sm text-red-600">{error}</p>
        )}
      </form>

      {student && (
        <div className="animate-fade-in">
          {/* Student Info */}
          <div className="bg-gradient-to-r from-primary-50 to-secondary-50 rounded-lg p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xl font-bold text-gray-900">{student.name}</h3>
                <p className="text-gray-600">Code: {student.code}</p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-primary-600">{student.points}</div>
                <div className="text-sm text-gray-600">Total Points</div>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Team:</span>
                <span className="ml-2 font-medium">{student.team}</span>
              </div>
              <div>
                <span className="text-gray-500">Year:</span>
                <span className="ml-2 font-medium">{student.year}</span>
              </div>
              <div>
                <span className="text-gray-500">Competitions:</span>
                <span className="ml-2 font-medium">{student.competitionsRegistered || 0}</span>
              </div>
            </div>
          </div>

          {/* Registered Events */}
          <div className="mb-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-3">📝 Registered Events</h4>
            {student.events && student.events.length > 0 ? (
              <div className="grid gap-3">
                {student.events.map((eventName, index) => (
                  <div key={index} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                    <span className="font-medium text-gray-900">{eventName}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 italic">No events registered yet.</p>
            )}
          </div>

          {/* Results */}
          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-3">🏆 Results</h4>
            {student.results && student.results.length > 0 ? (
              <div className="grid gap-3">
                {student.results.map((result, index) => (
                  <div key={index} className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h5 className="font-semibold text-gray-900">{result.competitionName}</h5>
                        <div className="flex items-center space-x-2 mt-1">
                          {result.reported && (
                            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                              ✓ Participated
                            </span>
                          )}
                          {result.prize && (
                            <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                              {result.prize === '1' ? '🥇 1st Place' : 
                               result.prize === '2' ? '🥈 2nd Place' : 
                               result.prize === '3' ? '🥉 3rd Place' : `Prize: ${result.prize}`}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-primary-600">+{result.points || 0}</div>
                        <div className="text-xs text-gray-500">points</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 italic">No results available yet.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentSearch;
