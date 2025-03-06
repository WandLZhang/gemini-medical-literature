import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Mic, MicOff, ArrowRight } from 'lucide-react';
import LoadingSpinner from './LoadingSpinner';
import { redactSensitiveInfo } from '../utils/api';
import useDebounce from '../hooks/useDebounce';

// Define the SpeechRecognition interface
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

const ChatInput = ({ message, setMessage, handleSendMessage, isLoading }) => {
  const textareaRef = useRef(null);
  const [isListening, setIsListening] = useState(false);
  const [hasInput, setHasInput] = useState(false);
  const [error, setError] = useState(null);
  const [interimTranscript, setInterimTranscript] = useState('');
  const recognitionRef = useRef(null);
  const [isRedacting, setIsRedacting] = useState(false);
  const [localMessage, setLocalMessage] = useState(message);
  const debouncedLocalMessage = useDebounce(localMessage, 500);

  useEffect(() => {
    if (textareaRef.current) {
      adjustTextareaHeight(textareaRef.current);
    }
  }, [localMessage]);

  useEffect(() => {
    const hasInputNow = localMessage.trim().length > 0;
    setHasInput(hasInputNow);
  }, [localMessage]);

  useEffect(() => {
    setLocalMessage(message);
  }, [message]);

  useEffect(() => {
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;

      recognitionRef.current.onresult = (event) => {
        let finalTranscript = '';
        let currentInterimTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            currentInterimTranscript += event.results[i][0].transcript;
          }
        }

        if (finalTranscript) {
          setMessage(prevMessage => {
            const newMessage = (prevMessage + ' ' + finalTranscript).trim();
            handleRedaction(newMessage, setMessage);
            return newMessage;
          });
          setHasInput(true);
        }
        setInterimTranscript(currentInterimTranscript);
      };

      recognitionRef.current.onerror = (event) => {
        setError(`Speech recognition error: ${event.error}`);
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
        setInterimTranscript('');
      };
    } else {
      setError('Speech Recognition API is not supported in this browser.');
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, []);

  const handleRedaction = useCallback(
    async (text) => {
      if (!text.trim()) return;
      
      try {
        setIsRedacting(true);
        const redactedText = await redactSensitiveInfo(text);
        setMessage(redactedText);
      } catch (error) {
        console.error('Redaction failed:', error);
      } finally {
        setIsRedacting(false);
      }
    },
    [setMessage]
  );

  useEffect(() => {
    if (debouncedLocalMessage !== message) {
      handleRedaction(debouncedLocalMessage);
    }
  }, [debouncedLocalMessage, handleRedaction, message]);

  const handleTextareaKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (message.trim()) {
        handleSendMessage(e);
      }
    }
  };

  const handleButtonClick = (e) => {
    e.preventDefault(); // Prevent form submission
    
    if (isListening) {
      // Stop recording
      recognitionRef.current.stop();
      setIsListening(false);
      setHasInput(message.trim().length > 0);
    } else if (hasInput && !isLoading && !isListening) {
      // Only send message if the button shows the send icon (blue arrow)
      handleSendMessage();
    } else if (!hasInput && !isListening) {
      // Start recording
      if (!recognitionRef.current) return;
      setError(null);
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (error) {
        setError(`Failed to start recognition: ${error.message}`);
        setIsListening(false);
      }
    }
  };

  const adjustTextareaHeight = (textarea) => {
    if (!textarea) return;
    textarea.style.height = 'auto';
    const newHeight = textarea.scrollHeight + 4;
    const maxHeight = window.innerHeight * 0.35;
    if (newHeight <= maxHeight) {
      textarea.style.height = newHeight + 'px';
    } else {
      textarea.style.height = maxHeight + 'px';
      textarea.style.overflowY = 'auto';
    }
  };

  const handleTextareaChange = (e) => {
    const newText = e.target.value;
    if (!isListening) {
      setLocalMessage(newText);
    }
    adjustTextareaHeight(textareaRef.current);
  };

  return (
    <div className="w-full p-2">
      <form onSubmit={(e) => {
        e.preventDefault();
        if (message.trim()) {
          handleSendMessage(e);
        }
      }} className="flex items-center gap-2 relative max-w-[70%] mx-auto">
        <div className="w-full bg-white border border-gray-200 rounded-3xl relative shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out p-1">
        {isRedacting && (
          <div className="absolute top-0 left-0 right-0 bg-blue-100 bg-opacity-90 text-blue-700 px-2 py-1 text-xs z-10">
            <div className="flex items-center">
              <svg className="animate-spin h-3 w-3 mr-1 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Redacting sensitive information...
            </div>
          </div>
        )}
          <textarea
            ref={textareaRef}
            value={localMessage + (isListening ? ' ' + interimTranscript : '')}
            onChange={handleTextareaChange}
            onKeyDown={handleTextareaKeyDown}
            placeholder="Ask questions here..."
            className="w-full bg-transparent text-gray-800 text-sm placeholder-gray-400 border-none focus:outline-none resize-none py-2.5 px-4 pr-12"
            disabled={isLoading}
            style={{ minHeight: '3em', maxHeight: '35vh' }}
          />
          <button
            onClick={handleButtonClick}
            disabled={isLoading}
            className={`absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center justify-center rounded-full w-10 h-10 focus:outline-none focus:ring-2 transition-all duration-300 shadow-sm ${
              isLoading ? "bg-blue-600 text-white focus:ring-blue-300" :
              isListening ? "bg-red-500 hover:bg-red-600 text-white focus:ring-red-300 animate-pulse" :
              hasInput ? "bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-300" :
              "bg-gray-700 hover:bg-gray-800 text-white focus:ring-gray-400"
            }`}
          >
            {isLoading ? (
              <LoadingSpinner />
            ) : isListening ? (
              <MicOff className="w-5 h-5" />
            ) : hasInput ? (
              <ArrowRight className="w-5 h-5" />
            ) : (
              <Mic className="w-5 h-5" />
            )}
          </button>
        </div>
      </form>
      {error && (
        <div className="text-red-500 flex items-center mt-2">
          {error}
        </div>
      )}
    </div>
  );
};

export default ChatInput;
