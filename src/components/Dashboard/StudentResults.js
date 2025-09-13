import React, { useState, useEffect } from 'react';
import { getCompetitions, getFestivalData } from '../../utils/localStorage';

const StudentResults = () => {
  const [publishedResults, setPublishedResults] = useState([]);
  const [selectedResult, setSelectedResult] = useState(null);

  useEffect(() => {
    loadResults();
  }, []);

  const loadResults = () => {
    const competitions = getCompetitions();
    const published = competitions.filter(c => c.resultsPublished);
    setPublishedResults(published);
  };

  const generatePosterPreview = (competition) => {
    const festivalData = getFestivalData();
    const winners = competition.participants?.filter(p => p.prize && ['1', '2', '3'].includes(p.prize)) || [];
    
    return (
      <div className="w-full bg-gradient-to-br from-blue-500 via-purple-600 to-pink-600 text-white p-8 rounded-lg">
        <div className="text-center space-y-6">
          <div className="text-4xl">{festivalData.logo}</div>
          <div className="text-xl font-bold">{festivalData.name}</div>
          <div className="text-2xl font-bold">{competition.name}</div>
          <div className="text-lg">🏆 RESULTS 🏆</div>
          
          <div className="space-y-4">
            {winners
              .sort((a, b) => parseInt(a.prize) - parseInt(b.prize))
              .map((winner) => (
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
    );
  };

  const ResultModal = ({ competition, onClose }) => {
    if (!competition) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-900">{competition.name} - Results</h3>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Poster */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-4">🏆 Official Results Poster</h4>
                <div className="max-w-sm mx-auto">
                  {generatePosterPreview(competition)}
                </div>
              </div>
              
              {/* Details */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-4">📋 Competition Details</h4>
                
                <div className="space-y-4">
                  <div>
                    <h5 className="font-medium text-gray-900">Description:</h5>
                    <p className="text-gray-600">{competition.description}</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <h5 className="font-medium text-gray-900">Date:</h5>
                      <p className="text-gray-600">{competition.date}</p>
                    </div>
                    <div>
                      <h5 className="font-medium text-gray-900">Time:</h5>
                      <p className="text-gray-600">{competition.time}</p>
                    </div>
                    <div>
                      <h5 className="font-medium text-gray-900">Venue:</h5>
                      <p className="text-gray-600">{competition.venue}</p>
                    </div>
                    <div>
                      <h5 className="font-medium text-gray-900">Category:</h5>
                      <p className="text-gray-600">{competition.category}</p>
                    </div>
                  </div>
                  
                  <div>
                    <h5 className="font-medium text-gray-900 mb-2">🏆 Winners:</h5>
                    <div className="space-y-3">
                      {competition.participants
                        ?.filter(p => p.prize && ['1', '2', '3'].includes(p.prize))
                        .sort((a, b) => parseInt(a.prize) - parseInt(b.prize))
                        .map((winner) => (
                          <div key={winner.id} className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                            <div className="flex items-center space-x-3">
                              <span className="text-2xl">
                                {winner.prize === '1' ? '🥇' : winner.prize === '2' ? '🥈' : '🥉'}
                              </span>
                              <div>
                                <div className="font-medium text-gray-900">{winner.name}</div>
                                {winner.code && (
                                  <div className="text-sm text-gray-500">Code: {winner.code}</div>
                                )}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-sm font-medium text-gray-900">
                                {winner.prize === '1' ? '1st' : winner.prize === '2' ? '2nd' : '3rd'} Place
                              </div>
                              {winner.customPoints && (
                                <div className="text-sm text-gray-500">{winner.customPoints} points</div>
                              )}
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                  
                  <div className="text-sm text-gray-500">
                    Results published: {new Date(competition.publishedAt).toLocaleString()}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end mt-6">
              <button onClick={onClose} className="btn-primary">
                Close
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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">🏆 Competition Results</h1>
          <p className="text-gray-600">View published competition results and winners</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {publishedResults.map((competition) => {
            const winners = competition.participants?.filter(p => p.prize && ['1', '2', '3'].includes(p.prize)) || [];
            
            return (
              <div
                key={competition.id}
                className="card cursor-pointer hover:shadow-xl transition-shadow duration-300"
                onClick={() => setSelectedResult(competition)}
              >
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xl font-bold text-gray-900">{competition.name}</h3>
                    <span className="badge badge-success">Published</span>
                  </div>
                  <p className="text-gray-600 text-sm mb-3">{competition.description}</p>
                  
                  <div className="text-sm text-gray-500 mb-4">
                    📅 {competition.date} • 📍 {competition.venue}
                  </div>
                </div>
                
                {/* Mini Poster Preview */}
                <div className="mb-4">
                  <div className="w-full h-32 bg-gradient-to-br from-blue-500 via-purple-600 to-pink-600 text-white rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-2xl mb-1">🏆</div>
                      <div className="text-sm font-bold">RESULTS</div>
                      <div className="text-xs">{winners.length} winners</div>
                    </div>
                  </div>
                </div>
                
                {/* Winners Preview */}
                <div className="mb-4">
                  <h4 className="font-semibold text-gray-900 mb-2">🏆 Winners:</h4>
                  <div className="space-y-1">
                    {winners.slice(0, 3).map((winner) => (
                      <div key={winner.id} className="flex items-center justify-between text-sm">
                        <div className="flex items-center space-x-2">
                          <span>
                            {winner.prize === '1' ? '🥇' : winner.prize === '2' ? '🥈' : '🥉'}
                          </span>
                          <span className="font-medium">{winner.name}</span>
                        </div>
                        <span className="text-gray-500">
                          {winner.prize === '1' ? '1st' : winner.prize === '2' ? '2nd' : '3rd'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="text-center">
                  <span className="text-sm text-primary-600 hover:text-primary-700 font-medium">
                    Click to view full results →
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {publishedResults.length === 0 && (
          <div className="text-center py-12">
            <span className="text-4xl mb-4 block">🏆</span>
            <p className="text-gray-500 mb-2">No results published yet.</p>
            <p className="text-sm text-gray-400">
              Results will appear here once competitions are completed and published by admin.
            </p>
          </div>
        )}

        {selectedResult && (
          <ResultModal
            competition={selectedResult}
            onClose={() => setSelectedResult(null)}
          />
        )}
      </div>
    </div>
  );
};

export default StudentResults;
