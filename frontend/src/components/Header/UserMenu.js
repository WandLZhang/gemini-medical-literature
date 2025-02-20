// src/components/Header/UserMenu.js
import React from 'react';

const UserMenu = ({ user, handleLogin, handleLogout, showUserMenu, setShowUserMenu, isAuthenticated }) => {
  if (!isAuthenticated()) {
    return (
      <button
        onClick={handleLogin}
        className="bg-gray-800 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-700 transition-colors"
      >
        Login
      </button>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setShowUserMenu(!showUserMenu)}
        className="flex items-center focus:outline-none"
      >
        <img
          src={user.photoURL}
          alt="Profile"
          className="w-8 h-8 rounded-full"
        />
      </button>
      {showUserMenu && (
        <div className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-md shadow-lg py-1 z-10">
          <div className="px-4 py-2 text-sm text-gray-200">{user.displayName}</div>
          <div className="px-4 py-2 text-sm text-gray-300">{user.email}</div>
          <button
            onClick={handleLogout}
            className="block w-full text-left px-4 py-2 text-sm text-gray-200 hover:bg-gray-700"
          >
            Sign out
          </button>
        </div>
      )}
    </div>
  );
};

export default UserMenu;
