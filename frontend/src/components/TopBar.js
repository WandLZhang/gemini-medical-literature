import React from 'react';
import Header from './Header/Header';

const TopBar = ({ user, firstName, handleLogin, handleLogout, showUserMenu, setShowUserMenu, isAuthenticated }) => {
  console.log('[TOPBAR_DEBUG] Rendering TopBar, isAuthenticated:', isAuthenticated, 'showUserMenu:', showUserMenu);
  return (
    <div className="h-16 bg-[#FF7F00] text-white flex items-center px-4 justify-between">
      <div>
        <span className="font-bold">Capricorn</span>{' '}
        <span className="font-light">| Medical Research</span>
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
