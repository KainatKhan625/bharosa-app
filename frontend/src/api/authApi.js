// authApi.js
// All authentication API calls are defined here

import axios from 'axios';
import { Platform } from 'react-native';

// Use localhost for web browser, IP for mobile
const BASE_URL = Platform.OS === 'web'
  ? 'http://localhost:5000/api'
  : process.env.EXPO_PUBLIC_API_URL;

// Register new user
export const registerUser = async (userData) => {
  try {
    const response = await axios.post(`${BASE_URL}/auth/register`, userData);
    return response.data;
  } catch (error) {
    // Better error handling
    if (error.response) {
      throw error.response.data;
    } else if (error.request) {
      // Network error — backend se connection nahi
      throw { message: 'Cannot connect to server. Check your internet!' };
    } else {
      throw { message: error.message };
    }
  }
};

// Login existing user
export const loginUser = async (credentials) => {
  try {
    const response = await axios.post(`${BASE_URL}/auth/login`, credentials);
    return response.data;
  } catch (error) {
    if (error.response) {
      throw error.response.data;
    } else if (error.request) {
      throw { message: 'Cannot connect to server. Check your internet!' };
    } else {
      throw { message: error.message };
    }
  }
};