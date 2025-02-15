import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, MessageSquare, Plus, Pencil, Trash2 } from 'lucide-react';
import { getUserChats, deleteChat, updateChatTitle, createNewChat } from '../firebase';

const formatChatTitle = (chat) => {
  if (chat.title) return chat.title;
  
  let timestamp;
  if (chat.createdAt?.seconds) {
    timestamp = new Date(chat.createdAt.seconds * 1000);
  } else if (chat.createdAt instanceof Date) {
    timestamp = chat.createdAt;
  } else {
    timestamp = new Date();
  }
  
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  }).format(timestamp);
};

const ChatHistoryItem = ({ chat, isActive, onClick, onRename, onDelete }) => {
  const [showOptions, setShowOptions] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);
  const [newTitle, setNewTitle] = useState(chat.title || '');

  const handleRename = async (e) => {
    e.preventDefault();
    if (newTitle.trim()) {
      await onRename(chat.id, newTitle.trim());
      setIsRenaming(false);
    }
  };

  if (isRenaming) {
    return (
      <form onSubmit={handleRename} className="p-1">
        <input
          type="text"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          placeholder="Enter chat title"
          className="w-full px-2 py-1 text-sm border rounded bg-white text-gray-900"
          autoFocus
          onBlur={() => setIsRenaming(false)}
        />
      </form>
    );
  }

  return (
    <div 
      className={`group flex items-center justify-between w-full text-left px-3 py-2 text-sm hover:bg-gray-700 rounded-md ${
        isActive ? 'bg-gray-700' : ''
      }`}
    >
      <button
        onClick={onClick}
        className="flex items-center flex-grow overflow-hidden text-white"
      >
        <MessageSquare size={16} className="mr-2 flex-shrink-0" />
        <span className="truncate">
          {formatChatTitle(chat)}
        </span>
      </button>
      
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsRenaming(true);
          }}
          className="p-1 hover:bg-gray-600 rounded text-white"
        >
          <Pencil size={14} />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(chat.id);
          }}
          className="p-1 hover:bg-gray-600 rounded text-red-400"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
};

const ExpandableSidebar = ({ user, onChatSelect, activeChat, initializeNewChat }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [chats, setChats] = useState([]);

  useEffect(() => {
    const loadChats = async () => {
      if (user) {
        const userChats = await getUserChats(user.uid);
        setChats(userChats);
      }
    };
    loadChats();
  }, [user]);

  const handleRenameChat = async (chatId, newTitle) => {
    try {
      await updateChatTitle(user.uid, chatId, newTitle);
      setChats(chats.map(chat => 
        chat.id === chatId ? { ...chat, title: newTitle } : chat
      ));
    } catch (error) {
      console.error('Error renaming chat:', error);
    }
  };

  const handleDeleteChat = async (chatId) => {
    if (window.confirm('Are you sure you want to delete this chat?')) {
      try {
        await deleteChat(user.uid, chatId);
        setChats(chats.filter(chat => chat.id !== chatId));
        if (activeChat?.id === chatId) {
          onChatSelect(null);
        }
      } catch (error) {
        console.error('Error deleting chat:', error);
      }
    }
  };

  const handleNewChat = async () => {
    if (user) {
      try {
        const chatId = await initializeNewChat();
        const newChat = {
          id: chatId,
          createdAt: {
            seconds: Math.floor(Date.now() / 1000),
            nanoseconds: 0
          },
          messages: []
        };
        setChats(prevChats => [newChat, ...prevChats]);
        onChatSelect(newChat);
        setIsExpanded(true); // Ensure sidebar is expanded when creating new chat
      } catch (error) {
        console.error('Error creating new chat:', error);
      }
    }
  };

  return (
    <div className={`fixed top-16 left-0 h-[calc(100vh-4rem)] bg-gray-800 shadow-lg transition-all duration-300 ease-in-out flex ${isExpanded ? 'w-64' : 'w-12'}`}>
      {/* Toggle button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="absolute right-0 top-4 translate-x-full bg-gray-800 p-2 rounded-r-lg shadow-lg hover:bg-gray-700 transition-colors text-white"
        aria-label={isExpanded ? 'Collapse sidebar' : 'Expand sidebar'}
      >
        {isExpanded ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
      </button>

      {/* Sidebar content */}
      <div className={`w-full overflow-hidden transition-opacity duration-300 ${isExpanded ? 'opacity-100' : 'opacity-0'}`}>
        <div className="p-4 text-white">
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
            Chat History
          </h2>
          <div className="space-y-2">
            {user ? (
              <>
                <button
                  onClick={handleNewChat}
                  className="flex items-center w-full text-left px-3 py-2 text-sm text-green-400 hover:bg-gray-700 rounded-md"
                >
                  <Plus size={16} className="mr-2" />
                  Start New Chat
                </button>
                <div className="max-h-[calc(100vh-12rem)] overflow-y-auto space-y-1">
                  {chats.map((chat) => (
                    <ChatHistoryItem
                      key={chat.id}
                      chat={chat}
                      isActive={activeChat?.id === chat.id}
                      onClick={() => onChatSelect(chat)}
                      onRename={handleRenameChat}
                      onDelete={handleDeleteChat}
                    />
                  ))}
                </div>
              </>
            ) : (
              <div className="text-sm text-gray-400 px-3 py-2">
                Sign in to view chat history
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExpandableSidebar;
