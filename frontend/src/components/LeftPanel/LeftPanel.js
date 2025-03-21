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
