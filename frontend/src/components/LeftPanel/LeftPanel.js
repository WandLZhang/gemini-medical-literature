import React from 'react';
import CaseInputSection from './CaseInputSection';
import ExtractionSection from './ExtractionSection';

const LeftPanel = ({
  caseNotes,
  setCaseNotes,
  labResults,
  setLabResults,
  extractedDisease,
  extractedEvents,
  setExtractedDisease,
  setExtractedEvents,
  isProcessing,
  handleExtract,
  isBox2Hovered,
  setIsBox2Hovered
}) => (
  <div className="w-[40%] pl-12 pt-10 z-0">
    <div className="space-y-4">
      <CaseInputSection
        caseNotes={caseNotes}
        setCaseNotes={setCaseNotes}
        labResults={labResults}
        setLabResults={setLabResults}
      />
      <ExtractionSection
        extractedDisease={extractedDisease}
        extractedEvents={extractedEvents}
        setExtractedDisease={setExtractedDisease}
        setExtractedEvents={setExtractedEvents}
        isProcessing={isProcessing}
        handleExtract={handleExtract}
        isBox2Hovered={isBox2Hovered}
        setIsBox2Hovered={setIsBox2Hovered}
      />
    </div>
  </div>
);

export default LeftPanel;
