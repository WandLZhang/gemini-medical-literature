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

const Footer = () => (
  <div className="bg-surface-700 text-white py-4 px-6">
    <div className="container mx-auto flex flex-col md:flex-row justify-center items-center">
      <div className="flex flex-col md:flex-row items-center gap-4">
        <div className="flex items-center gap-2">
          <img 
            src="/steth.svg" 
            alt="Medical caduceus symbol" 
            className="h-6 w-6"
          />
          <span className="text-xs">
            <a href="mailto:U.ilan-2@prinsesmaximacentrum.nl" className="text-modernOrange-200 hover:text-white transition-colors">Uri Ilan MD</a> - Medical Lead for Capricorn
          </span>
        </div>
        <div className="flex items-center gap-2">
          <img 
            src="/google.png" 
            alt="Google logo" 
            className="h-6 w-auto"
          />
          <span className="text-xs">
            Built by <a href="mailto:williszhang@google.com" className="text-modernOrange-200 hover:text-white transition-colors">Willis Zhang</a> and <a href="mailto:stonejiang@google.com" className="text-modernOrange-200 hover:text-white transition-colors">Stone Jiang</a>
          </span>
        </div>
      </div>
    </div>
  </div>
);

export default Footer;
