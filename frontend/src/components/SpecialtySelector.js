// Copyright 2025 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     https://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import React, { useState, useEffect } from 'react';

const SpecialtySelector = ({ isOpen, onClose, onSelectSpecialty }) => {
  const [selectedSpecialty, setSelectedSpecialty] = useState('oncology');
  const [animationClass, setAnimationClass] = useState('opacity-0 scale-95');

  // Handle the fade-in animation
  useEffect(() => {
    let animationTimer;
    if (isOpen) {
      animationTimer = setTimeout(() => {
        setAnimationClass('opacity-100 scale-100');
      }, 10);
    } else {
      setAnimationClass('opacity-0 scale-95');
    }
    return () => clearTimeout(animationTimer);
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = () => {
    setAnimationClass('opacity-0 scale-95');
    setTimeout(() => {
      onSelectSpecialty(selectedSpecialty);
      onClose();
    }, 200); // Match this with the animation duration
  };

  return (
    <div 
      className="fixed inset-0 z-50 overflow-auto bg-black bg-opacity-40 flex items-center justify-center transition-opacity duration-300 ease-out"
      style={{ backdropFilter: 'blur(2px)' }}
    >
      <div 
        className={`bg-white rounded-xl p-7 w-96 shadow-2xl transition-all duration-300 ease-out transform ${animationClass}`}
      >
        <h2 className="text-2xl font-semibold mb-6 text-gray-800">Select Specialty</h2>
        
        <div className="mb-6 space-y-4">
          {/* Pediatric Oncology Option */}
          <div 
            className={`border border-gray-200 rounded-lg p-4 cursor-pointer transition hover:border-blue-400 hover:bg-blue-50 ${selectedSpecialty === 'oncology' ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200' : ''}`}
            onClick={() => setSelectedSpecialty('oncology')}
          >
            <div className="flex items-center">
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selectedSpecialty === 'oncology' ? 'border-blue-500' : 'border-gray-400'}`}>
                {selectedSpecialty === 'oncology' && <div className="w-3 h-3 rounded-full bg-blue-500"></div>}
              </div>
              <label htmlFor="oncology" className="ml-3 text-lg cursor-pointer">Pediatric Oncology</label>
            </div>
          </div>
          
          {/* Adult Oncology Option */}
          <div 
            className={`border border-gray-200 rounded-lg p-4 cursor-pointer transition hover:border-blue-400 hover:bg-blue-50 ${selectedSpecialty === 'adult_oncology' ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200' : ''}`}
            onClick={() => setSelectedSpecialty('adult_oncology')}
          >
            <div className="flex items-center">
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selectedSpecialty === 'adult_oncology' ? 'border-blue-500' : 'border-gray-400'}`}>
                {selectedSpecialty === 'adult_oncology' && <div className="w-3 h-3 rounded-full bg-blue-500"></div>}
              </div>
              <label htmlFor="adult_oncology" className="ml-3 text-lg cursor-pointer">Adult Oncology</label>
            </div>
          </div>
          
          {/* Neurology Option */}
          <div 
            className={`border border-gray-200 rounded-lg p-4 cursor-pointer transition hover:border-blue-400 hover:bg-blue-50 ${selectedSpecialty === 'neurology' ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200' : ''}`}
            onClick={() => setSelectedSpecialty('neurology')}
          >
            <div className="flex items-center">
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selectedSpecialty === 'neurology' ? 'border-blue-500' : 'border-gray-400'}`}>
                {selectedSpecialty === 'neurology' && <div className="w-3 h-3 rounded-full bg-blue-500"></div>}
              </div>
              <label htmlFor="neurology" className="ml-3 text-lg cursor-pointer">Neurology</label>
            </div>
          </div>
        </div>
        
        <div className="flex justify-end mt-6">
          <button
            onClick={handleSubmit}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-6 rounded-lg 
                       transition duration-200 ease-in-out transform hover:scale-105 
                       focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 shadow-md"
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
};

export default SpecialtySelector;
