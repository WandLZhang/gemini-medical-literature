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

import React from 'react';
import { ArrowRight } from 'lucide-react';

const SpecialtySelectionView = ({ currentSpecialty, onSpecialtyChange, onConfirm, className }) => {
  const specialties = [
    { id: 'oncology', label: 'Pediatric Oncology' },
    { id: 'adult_oncology', label: 'Adult Oncology' },
    { id: 'neurology', label: 'Neurology' }
  ];

  const handleConfirm = () => {
    if (currentSpecialty) {
      onConfirm(currentSpecialty);
    }
  };

  return (
    <div className={`bg-white border border-gray-200 rounded-3xl p-6 pb-5 w-full min-w-[600px] flex flex-col transition-all duration-300 ease-in-out shadow-sm hover:shadow-md relative mb-8 px-8 ${className || ''}`}>
      <div className="flex flex-col">
        <h2 className="text-gray-800 text-sm font-medium mb-4">Select your specialty to continue</h2>
        
        <div className="relative mb-4">
          <select
            value={currentSpecialty}
            onChange={(e) => onSpecialtyChange(e.target.value)}
            className="w-full appearance-none bg-white border border-gray-300 rounded-lg px-4 py-3 pr-10 text-sm text-gray-800 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 cursor-pointer"
          >
            <option value="" disabled>
              Choose a specialty
            </option>
            {specialties.map((specialty) => (
              <option key={specialty.id} value={specialty.id}>
                {specialty.label}
              </option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </div>
        </div>
      </div>
      
      <div className="flex items-center justify-end flex-shrink-0">
        <button
          onClick={handleConfirm}
          disabled={!currentSpecialty}
          className={`flex items-center justify-center rounded-full w-10 h-10 focus:outline-none focus:ring-2 transition-all duration-300 shadow-sm ${
            currentSpecialty
              ? "bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-300"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          }`}
        >
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default SpecialtySelectionView;
