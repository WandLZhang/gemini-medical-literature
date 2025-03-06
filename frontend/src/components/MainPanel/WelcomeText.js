import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

const WelcomeText = ({ show, firstName }) => {
  const [greeting, setGreeting] = useState('');
  const [isVisible, setIsVisible] = useState(false);
  const textRef = useRef(null);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) {
      return 'Good morning';
    } else if (hour >= 12 && hour < 18) {
      return 'Good afternoon';
    } else {
      return 'Good evening';
    }
  };

  useEffect(() => {
    setGreeting(getGreeting());
    const interval = setInterval(() => {
      setGreeting(getGreeting());
    }, 60000); // Update every minute
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (show) {
      setIsVisible(false);
      const timer = setTimeout(() => setIsVisible(true), 100);
      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
    }
  }, [show]);

  return (
    <div className={`transition-opacity duration-500 ease-in-out ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
      <div className="text-4xl font-thin text-surface-700 relative inline-flex items-center" ref={textRef}>
        <motion.svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 40 40"
          className="w-10 h-10 mr-2"
          initial={{ opacity: 0, x: '100%' }}
          animate={{ opacity: isVisible ? 0.6 : 0, x: isVisible ? '0%' : '100%' }}
          transition={{ duration: 0.5, ease: 'easeInOut' }}
        >
          <circle cx="20" cy="20" r="15" fill="#FF6B00" fillOpacity="0.6" />
        </motion.svg>
        {`${greeting}${firstName ? `, ${firstName}` : ''}`}
      </div>
    </div>
  );
};

export default WelcomeText;
