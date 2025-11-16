import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load user from storage on app start
  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const userData = await AsyncStorage.getItem('user');
      if (token && userData) {
        setUser(JSON.parse(userData));
      }
    } catch (error) {
      console.log('Error loading user:', error);
    } finally {
      setLoading(false);
    }
  };

  const register = async (name, email, password, otpVerified = false) => {
    try {
      console.log('Attempting registration...');
      const response = await api.post('/auth/register', { name, email, password, otpVerified });
      console.log('Registration response:', response.data);
      await AsyncStorage.setItem('token', response.data.token);
      await AsyncStorage.setItem('user', JSON.stringify(response.data.user));
      setUser(response.data.user);
      return response.data;
    } catch (error) {
      console.error('Registration error:', error.message);
      if (error.response) {
        console.error('Error response:', error.response.data);
      }
      throw error;
    }
  };

  const login = async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    await AsyncStorage.setItem('token', response.data.token);
    await AsyncStorage.setItem('user', JSON.stringify(response.data.user));
    setUser(response.data.user);
    return response.data;
  };

  const logout = async () => {
    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('user');
    setUser(null);
  };

  const updateUser = (updates) => {
    const updatedUser = { 
      ...user, 
      ...updates,
      profile: {
        ...user?.profile,
        ...updates.profile
      }
    };
    setUser(updatedUser);
    AsyncStorage.setItem('user', JSON.stringify(updatedUser));
  };

  return (
    <AuthContext.Provider value={{ user, loading, register, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};
