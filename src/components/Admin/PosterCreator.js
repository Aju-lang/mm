import React, { useState, useRef } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { getCompetitions, getFestivalData } from '../../utils/localStorage';

const PosterCreator = () => {
  const [selectedTemplate, setSelectedTemplate] = useState(1);
  const [posterData, setPosterData] = useState({
    eventName: '',
    winners: ['', '', ''],
    date: '',
    venue: '',
    customText: ''
  });
  const [competitions, setCompetitions] = useState([]);
  const posterRef = useRef(null);

  React.useEffect(() => {
    setCompetitions(getCompetitions());
  }, []);

  const festivalData = getFestivalData();

  const templates = [
    {
      id: 1,
      name: 'Classic Gold',
      bgColor: 'bg-gradient-to-br from-yellow-400 via-yellow-500 to-yellow-600',
      textColor: 'text-white',
      accentColor: 'text-yellow-100'
    },
    {
      id: 2,
      name: 'Modern Blue',
      bgColor: 'bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700',
      textColor: 'text-white',
      accentColor: 'text-blue-100'
    },
    {
      id: 3,
      name: 'Elegant Purple',
      bgColor: 'bg-gradient-to-br from-purple-500 via-purple-600 to-purple-700',
      textColor: 'text-white',
      accentColor: 'text-purple-100'
    },
    {
      id: 4,
      name: 'Vibrant Red',
      bgColor: 'bg-gradient-to-br from-red-500 via-red-600 to-red-700',
      textColor: 'text-white',
      accentColor: 'text-red-100'
    },
    {
      id: 5,
      name: 'Fresh Green',
      bgColor: 'bg-gradient-to-br from-green-500 via-green-600 to-green-700',
      textColor: 'text-white',
      accentColor: 'text-green-100'
    },
    {
      id: 6,
      name: 'Sunset Orange',
      bgColor: 'bg-gradient-to-br from-orange-400 via-orange-500 to-red-500',
      textColor: 'text-white',
      accentColor: 'text-orange-100'
    },
    {
      id: 7,
      name: 'Ocean Teal',
      bgColor: 'bg-gradient-to-br from-teal-500 via-cyan-600 to-blue-600',
      textColor: 'text-white',
      accentColor: 'text-teal-100'
    },
    {
      id: 8,
      name: 'Royal Indigo',
      bgColor: 'bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500',
      textColor: 'text-white',
      accentColor: 'text-indigo-100'
    },
    {
      id: 9,
      name: 'Monochrome',
      bgColor: 'bg-gradient-to-br from-gray-800 via-gray-900 to-black',
      textColor: 'text-white',
      accentColor: 'text-gray-300'
    },
    {
      id: 10,
      name: 'Minimalist White',
      bgColor: 'bg-white border-4 border-gray-300',
      textColor: 'text-gray-900',
      accentColor: 'text-gray-600'
    }
  ];

  const currentTemplate = templates.find(t => t.id === selectedTemplate);

  const handleInputChange = (field, value) => {
    setPosterData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleWinnerChange = (index, value) => {
    const newWinners = [...posterData.winners];
    newWinners[index] = value;
    setPosterData(prev => ({
      ...prev,
      winners: newWinners
    }));
  };

  const loadCompetitionData = (competitionId) => {
    const competition = competitions.find(c => c.id === parseInt(competitionId));
    if (competition) {
      const winners = competition.results.slice(0, 3).map(r => r.name);
      while (winners.length < 3) winners.push('');
      
      setPosterData({
        eventName: competition.name,
        winners,
        date: competition.date,
        venue: competition.venue,
        customText: `Congratulations to all participants of ${competition.name}!`
      });
    }
  };

  const downloadPoster = async (format = 'png') => {
    if (!posterRef.current) return;

    try {
      const canvas = await html2canvas(posterRef.current, {
        scale: 2,
        backgroundColor: null,
        useCORS: true
      });

      if (format === 'png') {
        const link = document.createElement('a');
        link.download = `${posterData.eventName || 'poster'}.png`;
        link.href = canvas.toDataURL();
        link.click();
      } else if (format === 'pdf') {
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const imgWidth = 210;
        const pageHeight = 295;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        let heightLeft = imgHeight;

        let position = 0;

        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;

        while (heightLeft >= 0) {
          position = heightLeft - imgHeight;
          pdf.addPage();
          pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
          heightLeft -= pageHeight;
        }

        pdf.save(`${posterData.eventName || 'poster'}.pdf`);
      }
    } catch (error) {
      console.error('Error generating poster:', error);
      alert('Error generating poster. Please try again.');
    }
  };

  const PosterPreview = () => (
    <div
      ref={posterRef}
      className={`w-full h-[600px] ${currentTemplate.bgColor} ${currentTemplate.textColor} p-8 relative overflow-hidden`}
      style={{ aspectRatio: '3/4' }}
    >
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-full h-full opacity-10">
        <div className="absolute top-4 left-4 w-16 h-16 border-2 border-current rounded-full"></div>
        <div className="absolute top-8 right-8 w-12 h-12 border-2 border-current rotate-45"></div>
        <div className="absolute bottom-8 left-8 w-20 h-20 border-2 border-current rounded-full"></div>
        <div className="absolute bottom-4 right-4 w-8 h-8 border-2 border-current"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col justify-center items-center text-center space-y-6">
        {/* Festival Logo */}
        <div className="text-6xl mb-4">
          {festivalData.logo}
        </div>

        {/* Festival Name */}
        <div className={`text-2xl font-bold ${currentTemplate.accentColor} mb-2`}>
          {festivalData.name}
        </div>

        {/* Event Name */}
        <div className="text-4xl font-bold mb-8">
          {posterData.eventName || 'Event Name'}
        </div>

        {/* Winners Section */}
        {posterData.winners.some(w => w.trim()) && (
          <div className="space-y-4 mb-8">
            <div className="text-2xl font-semibold mb-4">🏆 Winners 🏆</div>
            
            {posterData.winners[0] && (
              <div className="mb-3">
                <div className="text-3xl mb-1">🥇</div>
                <div className="text-xl font-bold">1st Place</div>
                <div className="text-lg">{posterData.winners[0]}</div>
              </div>
            )}
            
            <div className="flex justify-center space-x-8">
              {posterData.winners[1] && (
                <div className="text-center">
                  <div className="text-2xl mb-1">🥈</div>
                  <div className="text-lg font-bold">2nd Place</div>
                  <div className="text-base">{posterData.winners[1]}</div>
                </div>
              )}
              
              {posterData.winners[2] && (
                <div className="text-center">
                  <div className="text-2xl mb-1">🥉</div>
                  <div className="text-lg font-bold">3rd Place</div>
                  <div className="text-base">{posterData.winners[2]}</div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Event Details */}
        <div className={`space-y-2 ${currentTemplate.accentColor}`}>
          {posterData.date && (
            <div className="flex items-center justify-center space-x-2">
              <span>📅</span>
              <span>{posterData.date}</span>
            </div>
          )}
          {posterData.venue && (
            <div className="flex items-center justify-center space-x-2">
              <span>📍</span>
              <span>{posterData.venue}</span>
            </div>
          )}
        </div>

        {/* Custom Text */}
        {posterData.customText && (
          <div className={`text-lg italic max-w-md ${currentTemplate.accentColor} mt-6`}>
            "{posterData.customText}"
          </div>
        )}

        {/* Footer */}
        <div className={`text-sm ${currentTemplate.accentColor} mt-auto pt-8`}>
          {festivalData.venue} • {new Date().getFullYear()}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">🎨 Poster Creator</h1>
          <p className="text-gray-600">Create beautiful posters for your festival events</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Controls */}
          <div className="space-y-6">
            {/* Template Selection */}
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Choose Template</h3>
              <div className="grid grid-cols-2 gap-3">
                {templates.map(template => (
                  <button
                    key={template.id}
                    onClick={() => setSelectedTemplate(template.id)}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      selectedTemplate === template.id
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className={`w-full h-16 ${template.bgColor} rounded mb-2`}></div>
                    <div className="text-sm font-medium text-gray-900">{template.name}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Load from Competition */}
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Load</h3>
              <select
                className="input"
                onChange={(e) => e.target.value && loadCompetitionData(e.target.value)}
                defaultValue=""
              >
                <option value="">Select a competition to load data...</option>
                {competitions.filter(c => c.results.length > 0).map(comp => (
                  <option key={comp.id} value={comp.id}>
                    {comp.name} ({comp.results.length} results)
                  </option>
                ))}
              </select>
            </div>

            {/* Poster Details */}
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Poster Details</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Event Name
                  </label>
                  <input
                    type="text"
                    className="input"
                    value={posterData.eventName}
                    onChange={(e) => handleInputChange('eventName', e.target.value)}
                    placeholder="e.g., Coding Challenge"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date
                  </label>
                  <input
                    type="date"
                    className="input"
                    value={posterData.date}
                    onChange={(e) => handleInputChange('date', e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Venue
                  </label>
                  <input
                    type="text"
                    className="input"
                    value={posterData.venue}
                    onChange={(e) => handleInputChange('venue', e.target.value)}
                    placeholder="e.g., Computer Lab 1"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Winners
                  </label>
                  <div className="space-y-2">
                    {[0, 1, 2].map(index => (
                      <input
                        key={index}
                        type="text"
                        className="input"
                        value={posterData.winners[index]}
                        onChange={(e) => handleWinnerChange(index, e.target.value)}
                        placeholder={`${index + 1}${index === 0 ? 'st' : index === 1 ? 'nd' : 'rd'} Place Winner`}
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Custom Message
                  </label>
                  <textarea
                    className="input"
                    rows={3}
                    value={posterData.customText}
                    onChange={(e) => handleInputChange('customText', e.target.value)}
                    placeholder="Add a congratulatory message or event description..."
                  />
                </div>
              </div>
            </div>

            {/* Download Options */}
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Download</h3>
              <div className="flex space-x-3">
                <button
                  onClick={() => downloadPoster('png')}
                  className="btn-primary flex-1"
                  disabled={!posterData.eventName}
                >
                  📱 Download PNG
                </button>
                <button
                  onClick={() => downloadPoster('pdf')}
                  className="btn-secondary flex-1"
                  disabled={!posterData.eventName}
                >
                  📄 Download PDF
                </button>
              </div>
              {!posterData.eventName && (
                <p className="text-sm text-gray-500 mt-2">
                  Please enter an event name to enable downloads.
                </p>
              )}
            </div>
          </div>

          {/* Preview */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Preview</h3>
            <div className="bg-gray-100 p-4 rounded-lg">
              <div className="max-w-sm mx-auto">
                <PosterPreview />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PosterCreator;

