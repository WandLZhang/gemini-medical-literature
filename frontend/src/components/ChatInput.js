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
      handleSendMessage(e);
    }
  };

  return (
    <div className="p-4">
      <form onSubmit={handleSendMessage} className="flex items-center gap-2 relative">
        <textarea
          ref={textareaRef}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleTextareaKeyDown}
          placeholder="Ask questions here..."
          className="w-full py-3 px-4 bg-white/70 rounded-full focus:outline-none resize-none min-h-[48px] max-h-[200px] overflow-y-auto pr-14 text-sm text-gray-600 placeholder-gray-400"
          disabled={isLoading}
          rows={1}
        />
        <button
          type="submit"
          className="absolute right-1 p-2.5 bg-gray-100 text-black rounded-full hover:bg-gray-200 focus:outline-none transition-colors duration-200 flex items-center justify-center"
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
