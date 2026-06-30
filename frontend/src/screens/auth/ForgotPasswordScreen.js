// ForgotPasswordScreen.js
// Step 1: User enters email, OTP sent
// Step 2: User enters OTP + new password, password reset

import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Platform } from 'react-native';
import axios from 'axios';
import { colors, typography, layout } from '../../theme/colors';

const BASE_URL = Platform.OS === 'web'
  ? 'http://localhost:5000/api'
  : process.env.EXPO_PUBLIC_API_URL;

export default function ForgotPasswordScreen({ navigation }) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    otp: '',
    new_password: '',
    confirm_password: '',
  });

  const update = (field, value) => setFormData({ ...formData, [field]: value });

  const handleSendOtp = async () => {
    if (!formData.email) {
      Alert.alert('Error', 'Please enter your email!');
      return;
    }
    try {
      setLoading(true);
      await axios.post(`${BASE_URL}/auth/send-otp`, { email: formData.email });
      Alert.alert('Success', 'OTP sent to your email!');
      setStep(2);
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Could not send OTP!');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!formData.otp || !formData.new_password || !formData.confirm_password) {
      Alert.alert('Error', 'Please fill all fields!');
      return;
    }
    if (formData.new_password !== formData.confirm_password) {
      Alert.alert('Error', 'Passwords do not match!');
      return;
    }
    if (formData.new_password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters!');
      return;
    }
    try {
      setLoading(true);
      await axios.post(`${BASE_URL}/auth/verify-otp`, {
        email: formData.email,
        otp: formData.otp,
        new_password: formData.new_password,
      });
      Alert.alert('Success', 'Password reset! You can now login.', [
        { text: 'OK', onPress: () => navigation.navigate('Login') }
      ]);
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Could not reset password!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={[layout.container, { justifyContent: 'center', flex: 1 }]}>

      <TouchableOpacity
        onPress={() => step === 1 ? navigation.goBack() : setStep(1)}
        style={{ marginBottom: 20 }}>
        <Ionicons name="arrow-back" size={24} color={colors.textDark} />
      </TouchableOpacity>

      {step === 1 ? (
        <>
          <Text style={[typography.heading, { marginBottom: 8 }]}>Forgot Password</Text>
          <Text style={[typography.subtitle, { marginBottom: 32 }]}>
            Enter your email to receive an OTP
          </Text>

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

          <TouchableOpacity style={layout.button} onPress={handleSendOtp} disabled={loading}>
            {loading
              ? <ActivityIndicator color={colors.white} />
              : <Text style={layout.buttonText}>Send OTP</Text>}
          </TouchableOpacity>
        </>
      ) : (
        <>
          <Text style={[typography.heading, { marginBottom: 8 }]}>Verify OTP</Text>
          <Text style={[typography.subtitle, { marginBottom: 32 }]}>
            Enter the 6-digit code sent to {formData.email}
          </Text>

          {/* OTP Code */}
          <View style={layout.fieldGroup}>
            <Text style={typography.label}>OTP Code</Text>
            <TextInput
              style={[layout.input, { fontSize: 20, letterSpacing: 8, textAlign: 'center' }]}
              placeholder="000000"
              placeholderTextColor={colors.textLight}
              keyboardType="number-pad"
              maxLength={6}
              value={formData.otp}
              onChangeText={(text) => {
                const numericText = text.replace(/[^0-9]/g, '').slice(0, 6);
                update('otp', numericText);
              }}
            />
          </View>

          {/* New Password */}
          <View style={layout.fieldGroup}>
            <Text style={typography.label}>New Password</Text>
            <View style={layout.passwordContainer}>
              <TextInput
                style={layout.passwordInput}
                placeholder="Enter new password"
                placeholderTextColor={colors.textLight}
                secureTextEntry={!showPassword}
                onChangeText={(text) => update('new_password', text)}
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

          {/* Confirm Password */}
          <View style={layout.fieldGroup}>
            <Text style={typography.label}>Confirm Password</Text>
            <View style={layout.passwordContainer}>
              <TextInput
                style={layout.passwordInput}
                placeholder="Re-enter new password"
                placeholderTextColor={colors.textLight}
                secureTextEntry={!showConfirmPassword}
                onChangeText={(text) => update('confirm_password', text)}
              />
              <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                {Platform.OS === 'web' ? (
                  <Text style={{ fontSize: 13, color: colors.textLight }}>
                    {showConfirmPassword ? 'Hide' : 'Show'}
                  </Text>
                ) : (
                  <Ionicons
                    name={showConfirmPassword ? 'eye-outline' : 'eye-off-outline'}
                    size={20}
                    color={colors.textLight}
                  />
                )}
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity style={layout.button} onPress={handleResetPassword} disabled={loading}>
            {loading
              ? <ActivityIndicator color={colors.white} />
              : <Text style={layout.buttonText}>Reset Password</Text>}
          </TouchableOpacity>

          <TouchableOpacity onPress={handleSendOtp} style={{ marginTop: 16 }}>
            <Text style={[typography.link, { textAlign: 'center' }]}>Resend OTP</Text>
          </TouchableOpacity>
        </>
      )}

    </ScrollView>
  );
}