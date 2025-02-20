import React from 'react';
import LoadingSpinner from '../LoadingSpinner';

const ExtractionSection = ({
  extractedDisease,
  extractedEvents,
  setExtractedDisease,
  setExtractedEvents,
  isProcessing,
  handleExtract,
  isBox2Hovered,
  setIsBox2Hovered
}) => (
  <div 
    className={`bg-surface-50 shadow-lg rounded-lg p-4 transition-opacity duration-500 ${!extractedDisease && !isBox2Hovered ? 'opacity-25' : ''}`}
    onMouseEnter={() => setIsBox2Hovered(true)}
    onMouseLeave={() => setIsBox2Hovered(false)}
  >
    <div className="flex justify-between items-center mb-2">
      <h2 className="text-xs font-medium text-gray-700">2 - Press Extract to get disease and actionable events</h2>
      <button 
        onClick={handleExtract}
        disabled={isProcessing}
        className={`text-xs px-3 py-1 bg-primary-600 text-white rounded hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 w-[60px] flex items-center justify-center ${
          isProcessing ? 'opacity-50 cursor-not-allowed' : ''
        }`}
      >
        {isProcessing ? <LoadingSpinner /> : 'Extract'}
      </button>
    </div>
    <div className="h-32 overflow-hidden">
      <div className="flex flex-col h-full space-y-2">
        <div className="flex items-center gap-2">
          <label className="text-[10px] font-light text-gray-700 w-20">Extracted disease</label>
          <div className="relative flex-1">
            <textarea
              className="w-full p-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-xs h-8 resize-none overflow-y-auto"
              value={extractedDisease}
              onChange={(e) => setExtractedDisease(e.target.value)}
            />
            {!extractedDisease && (
              <div className="absolute inset-0 flex items-center px-2 pointer-events-none">
                <span className="italic text-gray-400 text-[10px] font-light">Disease will appear here after extraction...</span>
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-[10px] font-light text-gray-700 w-20">Extracted events</label>
          <div className="relative flex-1">
            <textarea
              className="w-full p-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-xs h-16 resize-none overflow-y-auto"
              value={extractedEvents.length > 0 ? extractedEvents.join(', ') : ''}
              onChange={(e) => setExtractedEvents(e.target.value.split(',').map(event => event.trim()))}
            />
            {extractedEvents.length === 0 && (
              <div className="absolute inset-0 p-1.5 pointer-events-none">
                <span className="italic text-gray-400 text-[10px] font-light">Events will appear here after extraction...</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default ExtractionSection;
