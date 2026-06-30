// AppNavigator.js
// Main navigation structure
// Checks token on startup — skips login if already logged in

import 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useState, useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { getToken, getUser } from '../utils/storage';
import { colors } from '../theme/colors';
import ProfileScreen from '../screens/customer/ProfileScreen';
import WorkerProfileSettingsScreen from '../screens/worker/WorkerProfileSettingsScreen';
import SplashScreen from '../screens/onboarding/SplashScreen';
import OnboardingScreen from '../screens/onboarding/OnboardingScreen';
import AddReviewScreen from '../screens/customer/AddReviewScreen';
import WorkerEditProfileScreen from '../screens/worker/WorkerEditProfileScreen';

// Auth Screens
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';

// Customer Screens
import CustomerHomeScreen from '../screens/customer/CustomerHomeScreen';
import WorkerProfileScreen from '../screens/customer/WorkerProfileScreen';
import BookingScreen from '../screens/customer/BookingScreen';
import MyBookingsScreen from '../screens/customer/MyBookingsScreen';

// Worker Screens
import WorkerDashboardScreen from '../screens/worker/WorkerDashboardScreen';

// Admin Screens
import AdminPanelScreen from '../screens/admin/AdminPanelScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Customer bottom tabs
function CustomerTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: '#9CA3AF',
        tabBarIcon: ({ color, size }) => {
          let iconName;
          if (route.name === 'Home') iconName = 'home-outline';
          else if (route.name === 'MyBookings') iconName = 'calendar-outline';
          else if (route.name === 'Profile') iconName = 'person-outline';
          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}>
      <Tab.Screen name="Home" component={CustomerHomeScreen} />
      <Tab.Screen name="MyBookings" component={MyBookingsScreen} options={{ title: 'My Bookings' }} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}
function WorkerTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: '#9CA3AF',
        tabBarIcon: ({ color, size }) => {
          let iconName;
          if (route.name === 'Dashboard') iconName = 'grid-outline';
          else if (route.name === 'Profile') iconName = 'person-outline';
          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}>
      <Tab.Screen name="Dashboard" component={WorkerDashboardScreen} />
      <Tab.Screen name="Profile" component={WorkerProfileSettingsScreen} />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const [isLoading, setIsLoading] = useState(true);
  const [initialRoute, setInitialRoute] = useState('Splash');

  // Check token on app startup
  useEffect(() => {
    checkToken();
  }, []);

  const checkToken = async () => {
    try {
      const token = await getToken();
      const user = await getUser();

      if (token && user) {
        // Token exists — navigate based on role
        if (user.role === 'customer') setInitialRoute('CustomerHome');
        else if (user.role === 'worker') setInitialRoute('WorkerDashboard');
        else if (user.role === 'admin') setInitialRoute('AdminPanel');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading while checking token
  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName={initialRoute}
        screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Splash" component={SplashScreen} />
<Stack.Screen name="Onboarding" component={OnboardingScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="CustomerHome" component={CustomerTabs} />
        <Stack.Screen name="WorkerProfile" component={WorkerProfileScreen} />
        <Stack.Screen name="Booking" component={BookingScreen} />
        <Stack.Screen name="WorkerDashboard" component={WorkerTabs} />
        <Stack.Screen name="AdminPanel" component={AdminPanelScreen} />
        <Stack.Screen name="AddReview" component={AddReviewScreen} />
        <Stack.Screen name="WorkerEditProfile" component={WorkerEditProfileScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}