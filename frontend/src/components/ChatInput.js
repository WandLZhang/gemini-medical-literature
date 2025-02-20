import React, { useRef, useEffect } from 'react';
import { Send } from 'lucide-react';

const ChatInput = ({ message, setMessage, handleSendMessage, isLoading }) => {
  const textareaRef = useRef(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [message]);

const handleTextareaKeyDown = (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    if (message.trim()) {
      handleSendMessage(e);
    }
  }
};

  return (
    <div className="px-4 pt-1 pb-2 bg-surface-50">
      <form onSubmit={(e) => {
        e.preventDefault();
        if (message.trim()) {
          handleSendMessage(e);
        }
      }} className="flex items-center gap-2 relative max-w-[70%] mx-auto">
        <textarea
          ref={textareaRef}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleTextareaKeyDown}
          placeholder="Ask questions here..."
          className="w-full py-2.5 px-4 bg-white rounded-full focus:outline-none focus:ring-2 focus:ring-primary-300 resize-none min-h-[44px] max-h-[200px] overflow-y-auto pr-12 text-sm text-surface-600 placeholder-surface-400 border border-surface-200"
          disabled={isLoading}
          rows={1}
        />
        <button
          type="submit"
          className="absolute right-2 p-2 bg-primary-600 text-white rounded-full hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-300 transition-colors duration-200 flex items-center justify-center disabled:bg-surface-200 disabled:text-surface-400"
          disabled={isLoading || !message.trim()}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </form>
    </div>
  );
};

export default ChatInput;
