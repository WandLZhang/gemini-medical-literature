// src/components/Header/Header.js
import React from 'react';
import UserMenu from './UserMenu';

const Header = ({ user, firstName, handleLogin, handleLogout, showUserMenu, setShowUserMenu, isAuthenticated }) => {
  console.log('[USER_MENU_DEBUG] Header: Rendering, isAuthenticated:', isAuthenticated, 'showUserMenu:', showUserMenu, 'user:', user);

  const isAnonymous = user && user.isAnonymous;
  const showLoginButton = !isAuthenticated || isAnonymous;

  return (
    <header className="h-16 p-4 flex justify-end items-center bg-[#FF7F00] text-white z-100 relative">
      <div className="flex items-center">
        {showLoginButton ? (
          <div className="relative z-20">
            <button
              onClick={() => {
                console.log('[USER_MENU_DEBUG] Header: Login button clicked');
                handleLogin();
              }}
              className="mr-4 px-4 py-2 text-white hover:text-orange-200 transition-colors"
            >
              Login
            </button>
          </div>
        ) : (
          <UserMenu 
            user={user}
            firstName={firstName}
            handleLogout={handleLogout}
            showUserMenu={showUserMenu}
            setShowUserMenu={setShowUserMenu}
            isAuthenticated={isAuthenticated}
          />
        )}
      </div>
    </header>
  );
};

export default Header;
