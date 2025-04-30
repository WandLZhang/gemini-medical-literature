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
import Header from './Header/Header';

const TopBar = ({ user, firstName, handleLogin, handleLogout, showUserMenu, setShowUserMenu, isAuthenticated }) => {
  console.log('[TOPBAR_DEBUG] Rendering TopBar, isAuthenticated:', isAuthenticated, 'showUserMenu:', showUserMenu);
  return (
    <div className="h-16 bg-surface-700 text-white flex items-center px-4 justify-between">
      <div>
        <span className="font-bold">Medical Literature Review</span>{' '}
        <span className="font-light">| powered by Google Gemini</span>
      </div>
      <Header 
        user={user}
        firstName={firstName}
        handleLogin={handleLogin}
        handleLogout={handleLogout}
        showUserMenu={showUserMenu}
        setShowUserMenu={setShowUserMenu}
        isAuthenticated={isAuthenticated}
      />
    </div>
  );
};

export default TopBar;
