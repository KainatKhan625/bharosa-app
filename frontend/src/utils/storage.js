// storage.js
// Saves and retrieves token from phone storage
// Token persists even after app restart

import AsyncStorage from '@react-native-async-storage/async-storage';

// Save token after login/register
export const saveToken = async (token) => {
  await AsyncStorage.setItem('token', token);
};

// Save user info
export const saveUser = async (user) => {
  await AsyncStorage.setItem('user', JSON.stringify(user));
};

// Get token
export const getToken = async () => {
  return await AsyncStorage.getItem('token');
};

// Get user info
export const getUser = async () => {
  const user = await AsyncStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};

// Remove token on logout
export const clearStorage = async () => {
  await AsyncStorage.removeItem('token');
  await AsyncStorage.removeItem('user');
};