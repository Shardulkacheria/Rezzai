'use client';

import { useTheme } from '@/contexts/ThemeContext';
import { Sun, Moon } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={toggleTheme}
      className={`p-2 rounded-lg transition-all duration-300 ${
        theme === 'light' 
          ? 'bg-yellow-100 hover:bg-yellow-200 text-yellow-600' 
          : 'bg-gray-700 hover:bg-gray-600 text-yellow-400'
      }`}
      title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      <motion.div
        initial={false}
        animate={{ rotate: theme === 'light' ? 0 : 180 }}
        transition={{ duration: 0.3 }}
      >
        {theme === 'light' ? <Sun size={20} /> : <Moon size={20} />}
      </motion.div>
    </motion.button>
  );
}


