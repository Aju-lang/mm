import React, { useState, useEffect } from 'react';
import { getLeaderboard, getTeamLeaderboard, updateStudentRecords } from '../../utils/localStorage';

const Leaderboard = () => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [teamLeaderboard, setTeamLeaderboard] = useState([]);
  const [activeTab, setActiveTab] = useState('individual');

  useEffect(() => {
    loadLeaderboards();
  }, []);

  const loadLeaderboards = () => {
    // Update student records first
    updateStudentRecords();
    
    // Individual leaderboard
    const individualData = getLeaderboard(10);
    setLeaderboard(individualData);

    // Team leaderboard
    const teamData = getTeamLeaderboard();
    setTeamLeaderboard(teamData);
  };

  const getRankEmoji = (rank) => {
    const emojis = { 1: '🥇', 2: '🥈', 3: '🥉' };
    return emojis[rank] || '🏆';
  };

  const getRankColor = (rank) => {
    switch (rank) {
      case 1:
        return 'from-yellow-400 to-yellow-600';
      case 2:
        return 'from-gray-400 to-gray-600';
      case 3:
        return 'from-orange-400 to-orange-600';
      default:
        return 'from-blue-400 to-blue-600';
    }
  };

  const IndividualLeaderboard = () => (
    <div className="space-y-4">
      {leaderboard.length > 0 ? (
        leaderboard.map((student, index) => {
          const rank = index + 1;
          return (
            <div
              key={student.id}
              className={`relative overflow-hidden rounded-lg border-2 ${
                rank <= 3 ? 'border-yellow-200 bg-gradient-to-r from-yellow-50 to-orange-50' : 'border-gray-200 bg-white'
              } p-4 shadow-sm hover:shadow-md transition-shadow duration-300`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className={`flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-r ${getRankColor(rank)} text-white font-bold text-lg`}>
                    #{rank}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{student.name}</h3>
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <span>Code: {student.code}</span>
                      <span>•</span>
                      <span>{student.team}</span>
                      <span>•</span>
                      <span>{student.year} Year</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl">{getRankEmoji(rank)}</span>
                    <div>
                      <div className="text-2xl font-bold text-primary-600">{student.points}</div>
                      <div className="text-sm text-gray-500">points</div>
                    </div>
                  </div>
                </div>
              </div>
              
              {rank <= 3 && (
                <div className="absolute top-0 right-0 bg-gradient-to-l from-yellow-400 to-transparent w-32 h-full opacity-20 pointer-events-none"></div>
              )}
            </div>
          );
        })
      ) : (
        <div className="text-center py-8">
          <span className="text-4xl mb-4 block">🏆</span>
          <p className="text-gray-500">No results available yet. Check back after competitions!</p>
        </div>
      )}
    </div>
  );

  const TeamLeaderboard = () => (
    <div className="space-y-4">
      {teamLeaderboard.length > 0 ? (
        teamLeaderboard.map((team, index) => {
          const rank = index + 1;
          return (
            <div
              key={team.department}
              className={`relative overflow-hidden rounded-lg border-2 ${
                rank <= 3 ? 'border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50' : 'border-gray-200 bg-white'
              } p-4 shadow-sm hover:shadow-md transition-shadow duration-300`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className={`flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-r ${getRankColor(rank)} text-white font-bold text-lg`}>
                    #{rank}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{team.team}</h3>
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <span>{team.studentCount} students</span>
                      <span>•</span>
                      <span>Avg: {team.avgPoints} points</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl">{getRankEmoji(rank)}</span>
                    <div>
                      <div className="text-2xl font-bold text-secondary-600">{team.totalPoints}</div>
                      <div className="text-sm text-gray-500">total points</div>
                    </div>
                  </div>
                </div>
              </div>
              
              {rank <= 3 && (
                <div className="absolute top-0 right-0 bg-gradient-to-l from-blue-400 to-transparent w-32 h-full opacity-20 pointer-events-none"></div>
              )}
            </div>
          );
        })
      ) : (
        <div className="text-center py-8">
          <span className="text-4xl mb-4 block">🏫</span>
          <p className="text-gray-500">No team data available yet.</p>
        </div>
      )}
    </div>
  );

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">🏆 Leaderboard</h2>
        <button
          onClick={loadLeaderboards}
          className="btn-outline text-sm"
        >
          Refresh
        </button>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg">
        <button
          onClick={() => setActiveTab('individual')}
          className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors ${
            activeTab === 'individual'
              ? 'bg-white text-primary-700 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Individual
        </button>
        <button
          onClick={() => setActiveTab('team')}
          className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors ${
            activeTab === 'team'
              ? 'bg-white text-primary-700 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Teams
        </button>
      </div>

      {/* Content */}
      {activeTab === 'individual' ? <IndividualLeaderboard /> : <TeamLeaderboard />}
    </div>
  );
};

export default Leaderboard;
