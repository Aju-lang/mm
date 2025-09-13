import React, { useState, useEffect } from 'react';
import { getCompetitions, updateCompetition, getFestivalData } from '../../utils/localStorage';

const ResultsManager = () => {
  const [competitions, setCompetitions] = useState([]);
  const [pendingResults, setPendingResults] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const allCompetitions = getCompetitions();
    setCompetitions(allCompetitions);
    
    // Filter competitions that have results but are not published
    const pending = allCompetitions.filter(comp => 
      comp.participants && 
      comp.participants.some(p => p.prize && ['1', '2', '3'].includes(p.prize)) &&
      !comp.resultsPublished
    );
    setPendingResults(pending);
  };

  const publishResults = (competitionId) => {
    if (window.confirm('Are you sure you want to publish these results? Students will be able to see them.')) {
      updateCompetition(competitionId, { 
        resultsPublished: true, 
        publishedAt: new Date().toISOString() 
      });
      loadData();
    }
  };

  const generatePosterPreview = (competition) => {
    const festivalData = getFestivalData();
    const winners = competition.participants?.filter(p => p.prize && ['1', '2', '3'].includes(p.prize)) || [];
    
    return (
      <div className="w-full max-w-sm bg-gradient-to-br from-blue-500 via-purple-600 to-pink-600 text-white p-6 rounded-lg">
        <div className="text-center space-y-4">
          <div className="text-3xl">{festivalData.logo}</div>
          <div className="text-lg font-bold">{festivalData.name}</div>
          <div className="text-xl font-bold">{competition.name}</div>
          <div className="text-sm">🏆 RESULTS 🏆</div>
          
          <div className="space-y-3">
            {winners
              .sort((a, b) => parseInt(a.prize) - parseInt(b.prize))
              .map((winner) => (
                <div key={winner.id} className="text-center">
                  <div className="text-lg mb-1">
                    {winner.prize === '1' ? '🥇' : winner.prize === '2' ? '🥈' : '🥉'}
                  </div>
                  <div className="text-sm font-bold">
                    {winner.prize === '1' ? '1st' : winner.prize === '2' ? '2nd' : '3rd'} Place
                  </div>
                  <div className="text-xs">{winner.name}</div>
                  {winner.code && (
                    <div className="text-xs opacity-80">Code: {winner.code}</div>
                  )}
                </div>
              ))
            }
          </div>
          
          <div className="text-xs opacity-80">
            📅 {competition.date} • 📍 {competition.venue}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Results Management</h1>
          <p className="text-gray-600">Review and publish competition results</p>
        </div>

        {/* Pending Results */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">📋 Pending Results ({pendingResults.length})</h2>
          
          {pendingResults.length > 0 ? (
            <div className="grid gap-6">
              {pendingResults.map((competition) => (
                <div key={competition.id} className="card">
                  <div className="flex items-start space-x-6">
                    {/* Poster Preview */}
                    <div className="flex-shrink-0">
                      {generatePosterPreview(competition)}
                    </div>
                    
                    {/* Competition Details */}
                    <div className="flex-1">
                      <div className="mb-4">
                        <h3 className="text-xl font-bold text-gray-900 mb-2">{competition.name}</h3>
                        <p className="text-gray-600 mb-3">{competition.description}</p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 mb-4">
                          <div>📅 {competition.date} at {competition.time}</div>
                          <div>📍 {competition.venue}</div>
                          <div>👥 {competition.participants?.length || 0} participants</div>
                        </div>
                      </div>
                      
                      {/* Winners List */}
                      <div className="mb-4">
                        <h4 className="font-semibold text-gray-900 mb-2">🏆 Winners</h4>
                        <div className="space-y-2">
                          {competition.participants
                            ?.filter(p => p.prize && ['1', '2', '3'].includes(p.prize))
                            .sort((a, b) => parseInt(a.prize) - parseInt(b.prize))
                            .map((winner) => (
                              <div key={winner.id} className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                                <div className="flex items-center space-x-3">
                                  <span className="text-lg">
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
                      
                      {/* Publish Button */}
                      <div className="flex justify-end">
                        <button
                          onClick={() => publishResults(competition.id)}
                          className="btn-primary"
                        >
                          ✅ Publish Results
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <span className="text-4xl mb-4 block">📋</span>
              <p className="text-gray-500">No pending results to review.</p>
              <p className="text-sm text-gray-400 mt-2">
                Results will appear here after competitions are completed and winners are assigned.
              </p>
            </div>
          )}
        </div>

        {/* Published Results */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">✅ Published Results</h2>
          
          {competitions.filter(c => c.resultsPublished).length > 0 ? (
            <div className="grid gap-4">
              {competitions
                .filter(c => c.resultsPublished)
                .map((competition) => (
                  <div key={competition.id} className="card">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">{competition.name}</h3>
                        <div className="text-sm text-gray-600">
                          Published: {new Date(competition.publishedAt).toLocaleString()}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="badge badge-success">Published</span>
                        <span className="text-sm text-gray-500">
                          {competition.participants?.filter(p => p.prize).length || 0} winners
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">No results published yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResultsManager;
