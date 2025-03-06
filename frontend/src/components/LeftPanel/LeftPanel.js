import React from 'react';
import LoadingSpinner from '../LoadingSpinner';

const LeftPanel = ({
  isLoading
}) => (
  <div 
    className={`w-[60%] pl-6 pt-10 transition-all duration-500 ease-in-out transform 
      ${isLoading ? '-translate-x-[calc(100%-96px)] opacity-30' : 'translate-x-0 opacity-100'} 
      hover:translate-x-0 hover:opacity-100 absolute left-14 z-80`}
  >
    <div className="space-y-4 bg-transparent max-w-[800px] mx-auto">
      {/* Add any other components you want in the LeftPanel here */}
    </div>
  </div>
);

export default LeftPanel;
