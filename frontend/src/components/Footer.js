import React from 'react';

const Footer = () => (
  <div className="bg-gray-800 text-white py-2 px-4 flex flex-col items-center gap-1">
    <div className="flex items-center gap-2">
      <img 
        src="/maxima-logo.png" 
        alt="Prinses Máxima Centrum logo" 
        className="h-4 w-auto"
      />
      <span className="text-xs text-gray-300">
        In collaboration with <a href="mailto:U.ilan-2@prinsesmaximacentrum.nl" className="text-gray-300 hover:text-white">Uri Ilan</a> @ Prinses Máxima Centrum
      </span>
    </div>
    <div className="flex items-center gap-2">
      <img 
        src="/google.png" 
        alt="Google logo" 
        className="h-4 w-auto"
      />
      <span className="text-xs text-gray-300">
        Built by <a href="mailto:willis.zhng@gmail.com" className="text-gray-300 hover:text-white">Willis Zhang</a> and <a href="mailto:stonejiang@google.com" className="text-gray-300 hover:text-white">Stone Jiang</a>
      </span>
    </div>
  </div>
);

export default Footer;
