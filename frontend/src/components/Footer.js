import React from 'react';

const Footer = () => (
  <div className="bg-gray-800 text-white py-2 px-4 flex flex-col items-center space-y-1">
    <div className="text-xs text-gray-300 italic">
      "To cure every child with cancer, with optimal quality of life."
    </div>
    <div className="flex items-center gap-1">
      <img 
        src="/maxima-logo.png" 
        alt="Prinses Máxima Centrum logo" 
        className="h-4 w-auto"
      />
      <span className="text-xs text-gray-300">
        <a href="mailto:U.ilan-2@prinsesmaximacentrum.nl" className="text-gray-300 hover:text-white">Uri Ilan MD</a> is the Medical Lead for Capricorn and Innovation Lead @ Prinses Máxima Centrum
      </span>
    </div>
    <div className="flex items-center gap-1">
      <img 
        src="/google.png" 
        alt="Google logo" 
        className="h-4 w-auto"
      />
      <span className="text-xs text-gray-300">
        Built by <a href="mailto:williszhang@google.com" className="text-gray-300 hover:text-white">Willis Zhang</a> and <a href="mailto:stonejiang@google.com" className="text-gray-300 hover:text-white">Stone Jiang</a>
      </span>
    </div>
  </div>
);

export default Footer;
