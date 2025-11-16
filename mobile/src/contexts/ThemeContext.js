import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ThemeContext = createContext();

export const useTheme = () => useContext(ThemeContext);

export const lightTheme = {
  background: '#f5f5f5',
  cardBackground: '#fff',
  text: '#333',
  textSecondary: '#666',
  textTertiary: '#999',
  primary: '#007AFF',
  border: '#e0e0e0',
  inputBackground: '#f8f8f8',
  error: '#ff3b30',
  success: '#34c759',
  shadow: '#000',
  gradient: ['#667eea', '#764ba2', '#f093fb'],
  headerGradient: ['#667eea', '#764ba2'],
  cardGradient: ['#ffffff', '#f8f9ff'],
  buttonGradient: ['#667eea', '#764ba2'],
};

export const darkTheme = {
  background: '#000',
  cardBackground: '#1c1c1e',
  text: '#fff',
  textSecondary: '#aaa',
  textTertiary: '#666',
  primary: '#0a84ff',
  border: '#38383a',
  inputBackground: '#2c2c2e',
  error: '#ff453a',
  success: '#32d74b',
  shadow: '#000',
  gradient: ['#0f2027', '#203a43', '#2c5364'],
  headerGradient: ['#141e30', '#243b55'],
  cardGradient: ['#1c1c1e', '#2a2a2e'],
  buttonGradient: ['#141e30', '#243b55'],
};

export const ThemeProvider = ({ children }) => {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    loadTheme();
  }, []);

  const loadTheme = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem('theme');
      if (savedTheme !== null) {
        setIsDark(savedTheme === 'dark');
      }
    } catch (error) {
      console.log('Error loading theme:', error);
    }
  };

  const toggleTheme = async () => {
    const newTheme = !isDark;
    setIsDark(newTheme);
    try {
      await AsyncStorage.setItem('theme', newTheme ? 'dark' : 'light');
    } catch (error) {
      console.log('Error saving theme:', error);
    }
  };

  const theme = isDark ? darkTheme : lightTheme;

  return (
    <ThemeContext.Provider value={{ theme, isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
