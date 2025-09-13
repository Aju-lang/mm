import React, { useState, useEffect } from 'react';
import { getCompetitions, getCompetitionsByCategory } from '../../utils/localStorage';

const CompetitionsList = () => {
  const [competitions, setCompetitions] = useState([]);
  const [competitionsByCategory, setCompetitionsByCategory] = useState({});
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedCompetition, setSelectedCompetition] = useState(null);

  useEffect(() => {
    loadCompetitions();
  }, []);

  const loadCompetitions = () => {
    const allCompetitions = getCompetitions();
    const categorized = getCompetitionsByCategory();
    setCompetitions(allCompetitions);
    setCompetitionsByCategory(categorized);
  };

  const getStatusBadge = (status) => {
    const badges = {
      upcoming: 'badge badge-primary',
      ongoing: 'badge badge-warning',
      completed: 'badge badge-success'
    };
    return badges[status] || 'badge badge-primary';
  };

  const getStatusIcon = (status) => {
    const icons = {
      upcoming: '📅',
      ongoing: '⏳',
      completed: '✅'
    };
    return icons[status] || '📅';
  };

  const getCategoryIcon = (category) => {
    const icons = {
      Technical: '💻',
      Cultural: '🎭',
      Academic: '📚',
      Creative: '🎨',
      Sports: '⚽'
    };
    return icons[category] || '🏆';
  };

  const filteredCompetitions = selectedCategory === 'all' 
    ? competitions 
    : competitions.filter(comp => comp.category === selectedCategory);

  const categories = ['all', ...Object.keys(competitionsByCategory)];

  const CompetitionModal = ({ competition, onClose }) => {
    if (!competition) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-2xl font-bold text-gray-900">{competition.name}</h3>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <span className="text-2xl">{getCategoryIcon(competition.category)}</span>
                <div>
                  <span className={getStatusBadge(competition.status)}>
                    {getStatusIcon(competition.status)} {competition.status}
                  </span>
                  <span className="ml-2 badge badge-secondary">{competition.category}</span>
                </div>
              </div>
              
              <p className="text-gray-700">{competition.description}</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 rounded-lg p-4">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">📅 Schedule</h4>
                  <p className="text-gray-700">Date: {competition.date}</p>
                  <p className="text-gray-700">Time: {competition.time}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">📍 Details</h4>
                  <p className="text-gray-700">Venue: {competition.venue}</p>
                  <p className="text-gray-700">Max Participants: {competition.maxParticipants}</p>
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">👥 Participants ({competition.participants.length})</h4>
                {competition.participants.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-40 overflow-y-auto">
                    {competition.participants.map((participant, index) => (
                      <div key={index} className="bg-white rounded-lg p-3 border border-gray-200">
                        <div className="font-medium text-gray-900">{participant.name}</div>
                        <div className="text-sm text-gray-500">
                          {participant.code} • {participant.department}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 italic">No participants registered yet.</p>
                )}
              </div>
              
              {competition.results.length > 0 && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">🏆 Results</h4>
                  <div className="space-y-2">
                    {competition.results.map((result, index) => (
                      <div key={index} className="flex items-center justify-between bg-white rounded-lg p-3 border border-gray-200">
                        <div>
                          <span className="font-medium text-gray-900">{result.name}</span>
                          <span className="text-sm text-gray-500 ml-2">({result.code})</span>
                        </div>
                        <span className="badge badge-success">
                          Position {result.position}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">🎯 Competitions</h2>
        <button
          onClick={loadCompetitions}
          className="btn-outline text-sm"
        >
          Refresh
        </button>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2 mb-6">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              selectedCategory === category
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {category === 'all' ? '🎯 All' : `${getCategoryIcon(category)} ${category}`}
          </button>
        ))}
      </div>

      {/* Competitions Grid */}
      <div className="grid gap-4">
        {filteredCompetitions.length > 0 ? (
          filteredCompetitions.map((competition) => (
            <div
              key={competition.id}
              className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow duration-300 cursor-pointer"
              onClick={() => setSelectedCompetition(competition)}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{getCategoryIcon(competition.category)}</span>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{competition.name}</h3>
                    <p className="text-sm text-gray-600">{competition.description}</p>
                  </div>
                </div>
                <span className={getStatusBadge(competition.status)}>
                  {getStatusIcon(competition.status)} {competition.status}
                </span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="flex items-center text-gray-600">
                  <span className="mr-2">📅</span>
                  <span>{competition.date} at {competition.time}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <span className="mr-2">📍</span>
                  <span>{competition.venue}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <span className="mr-2">👥</span>
                  <span>{competition.participants.length}/{competition.maxParticipants} registered</span>
                </div>
              </div>
              
              <div className="mt-4 flex items-center justify-between">
                <span className="badge badge-secondary">{competition.category}</span>
                <button className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                  View Details →
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8">
            <span className="text-4xl mb-4 block">🎯</span>
            <p className="text-gray-500">No competitions found for the selected category.</p>
          </div>
        )}
      </div>

      {/* Competition Modal */}
      <CompetitionModal 
        competition={selectedCompetition} 
        onClose={() => setSelectedCompetition(null)} 
      />
    </div>
  );
};

export default CompetitionsList;

