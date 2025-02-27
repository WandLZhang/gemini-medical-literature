// src/components/Header/Header.js
import React from 'react';
import UserMenu from './UserMenu';

const Header = ({ user, handleLogin, handleLogout, showUserMenu, setShowUserMenu, isAuthenticated }) => {
  return (
    <header className="h-16 p-4 flex justify-end items-center bg-modernOrange-700 text-white">
      <div className="flex items-center">
        {!isAuthenticated && (
          <button
            onClick={handleLogin}
            className="mr-4 px-4 py-2 bg-white text-modernOrange-700 rounded hover:bg-modernOrange-100 transition-colors"
          >
            Login
          </button>
        )}
        <UserMenu 
          user={user}
          handleLogin={handleLogin}
          handleLogout={handleLogout}
          showUserMenu={showUserMenu}
          setShowUserMenu={setShowUserMenu}
          isAuthenticated={isAuthenticated}
        />
      </div>
    </header>
  );
};

export default Header;
