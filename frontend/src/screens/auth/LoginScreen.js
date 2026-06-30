// LoginScreen.js
// Existing user login screen
// Navigates to different home screens based on user role

import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator, Platform } from 'react-native';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { loginUser } from '../../api/authApi';
import { colors, typography, layout } from '../../theme/colors';
import { saveToken, saveUser, clearStorage } from '../../utils/storage';

export default function LoginScreen({ navigation }) {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '' });

  const update = (field, value) => setFormData({ ...formData, [field]: value });

  const handleLogin = async () => {
    if (!formData.email || !formData.password) {
      Alert.alert('Error', 'Please fill all fields!');
      return;
    }
    try {
      setLoading(true);
      await clearStorage(); 
      const response = await loginUser(formData);
      await saveToken(response.token); 
await saveUser(response.user); 
      if (response.user.role === 'customer') {
        navigation.navigate('CustomerHome');
      } else if (response.user.role === 'worker') {
        navigation.navigate('WorkerDashboard');
      } else {
        navigation.navigate('AdminPanel');
      }
    } catch (error) {
      Alert.alert('Error', error.message || 'Login failed!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={[layout.container, { justifyContent: 'center', flex: 1 }]}>

      {/* Header */}
      <Text style={[typography.heading, { marginBottom: 8, textAlign: 'center' }]}>Bharosa</Text>
      <Text style={[typography.subtitle, { marginBottom: 40, textAlign: 'center' }]}>
        Home services at your doorstep
      </Text>

      {/* Email */}
      <View style={layout.fieldGroup}>
        <Text style={typography.label}>Email Address</Text>
        <TextInput
          style={layout.input}
          placeholder="hello@example.com"
          placeholderTextColor={colors.textLight}
          keyboardType="email-address"
          autoCapitalize="none"
          onChangeText={(text) => update('email', text)}
        />
      </View>

      {/* Password */}
      <View style={layout.fieldGroup}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
          <Text style={typography.label}>Password</Text>
          <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
  <Text style={typography.link}>Forgot Password?</Text>
</TouchableOpacity>
        </View>
        <View style={layout.passwordContainer}>
          <TextInput
            style={layout.passwordInput}
            placeholder="Enter your password"
            placeholderTextColor={colors.textLight}
            secureTextEntry={!showPassword}
            onChangeText={(text) => update('password', text)}
          />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
            {Platform.OS === 'web' ? (
              <Text style={{ fontSize: 13, color: colors.textLight }}>
                {showPassword ? 'Hide' : 'Show'}
              </Text>
            ) : (
              <Ionicons
                name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                size={20}
                color={colors.textLight}
              />
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Login Button */}
      <TouchableOpacity style={layout.button} onPress={handleLogin} disabled={loading}>
        {loading
          ? <ActivityIndicator color={colors.white} />
          : <Text style={layout.buttonText}>Login</Text>}
      </TouchableOpacity>

      {/* Register Link */}
      <TouchableOpacity onPress={() => navigation.navigate('Register')}>
  <Text style={[typography.subtitle, { textAlign: 'center' }]}>
    Don't have an account? <Text style={typography.link}>Create an Account</Text>
  </Text>
</TouchableOpacity>

    </ScrollView>
  );
}