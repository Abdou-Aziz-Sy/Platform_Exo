import React from 'react';
import { FaSun, FaMoon } from 'react-icons/fa';
import { useTheme } from '../../context/ThemeContext';
import { motion } from 'framer-motion';

const ThemeToggle = () => {
    const { darkMode, toggleDarkMode } = useTheme();

    return (
        <motion.button
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            onClick={toggleDarkMode}
            className="fixed bottom-6 right-6 p-3 rounded-full bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white shadow-lg transition-all duration-300 ease-in-out z-50 group"
            aria-label="Toggle dark mode"
        >
            <motion.div
                animate={{ rotate: darkMode ? 180 : 0 }}
                transition={{ duration: 0.3 }}
            >
                {darkMode ? <FaSun className="w-6 h-6" /> : <FaMoon className="w-6 h-6" />}
            </motion.div>
            <span className="absolute right-full mr-2 bg-gray-900 text-white px-2 py-1 rounded text-sm opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                {darkMode ? 'Mode clair' : 'Mode sombre'}
            </span>
        </motion.button>
    );
};

export default ThemeToggle; 