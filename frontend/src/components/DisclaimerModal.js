import React from 'react';

const DisclaimerModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full p-6 shadow-xl">
        <h2 className="text-xl font-bold mb-4 text-gray-800">Important Disclaimer</h2>
        <div className="space-y-4 text-gray-600">
          <p>
            This medical research assistant utilizes artificial intelligence to analyze medical literature and research papers. Please be aware of the following important points:
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li>This tool is designed to assist medical professionals in research and literature review only.</li>
            <li>It does not provide direct treatment plans or medical advice.</li>
            <li>The AI analysis may not always reflect complete accuracy and should be verified against primary sources.</li>
            <li>All information should be critically evaluated and validated by qualified medical professionals.</li>
            <li>This tool should not be used as a substitute for professional medical judgment.</li>
            <li>The accuracy and completeness of the analysis depend on the available research data and AI limitations.</li>
          </ul>
          <p className="font-medium mt-4">
            By continuing to use this tool, you acknowledge these limitations and agree to use the information provided only as a supplementary research aid.
          </p>
        </div>
        <button
          onClick={onClose}
          className="mt-6 w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors"
        >
          I Understand
        </button>
      </div>
    </div>
  );
};

export default DisclaimerModal;
