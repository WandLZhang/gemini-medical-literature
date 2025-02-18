import React from 'react';

const CaseInputSection = ({
  caseNotes,
  setCaseNotes,
  labResults,
  setLabResults
}) => (
  <div className="bg-white shadow rounded-lg p-4">
    <div className="mb-1">
      <h2 className="text-xs font-medium text-gray-700">1 - Input your case notes and lab results</h2>
    </div>
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <label className="text-[10px] font-light text-gray-700 w-16">Case Notes</label>
        <textarea
          className="flex-1 p-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-xs h-16"
          value={caseNotes}
          onChange={(e) => setCaseNotes(e.target.value)}
          placeholder="Enter case notes here..."
        />
      </div>
      <div className="flex items-center gap-2">
        <label className="text-[10px] font-light text-gray-700 w-16">Lab Results</label>
        <textarea
          className="flex-1 p-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-xs h-16"
          value={labResults}
          onChange={(e) => setLabResults(e.target.value)}
          placeholder="Enter lab results here..."
        />
      </div>
    </div>
  </div>
);

export default CaseInputSection;
