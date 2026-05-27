// authApi.js
// All authentication API calls are defined here
// Frontend uses these functions to talk to backend

import axios from 'axios';

// Backend URL loaded from .env file
const BASE_URL = process.env.EXPO_PUBLIC_API_URL;

// Register new user
// Sends user data to backend, returns token + user info
export const registerUser = async (userData) => {
  try {
    const response = await axios.post(`${BASE_URL}/auth/register`, userData);
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

// Login existing user
// Sends email & password, returns token + user info
export const loginUser = async (credentials) => {
  try {
    const response = await axios.post(`${BASE_URL}/auth/login`, credentials);
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};