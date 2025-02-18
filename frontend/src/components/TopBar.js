import React from 'react';
import Header from './Header/Header';

const TopBar = ({ user, handleLogin, handleLogout, showUserMenu, setShowUserMenu }) => (
  <div className="h-16 bg-gray-800 text-white flex items-center px-4 justify-between">
    <div>
      <span className="font-bold">Capricorn</span>{' '}
      <span className="font-light">| Medical Research</span>
    </div>
    <Header 
      user={user}
      handleLogin={handleLogin}
      handleLogout={handleLogout}
      showUserMenu={showUserMenu}
      setShowUserMenu={setShowUserMenu}
    />
  </div>
);

export default TopBar;
