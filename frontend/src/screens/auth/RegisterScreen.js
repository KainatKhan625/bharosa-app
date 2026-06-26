// RegisterScreen.js
// New user registration screen
// Supports Customer and Worker roles with dynamic fields

import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { useState } from 'react';
import { Picker } from '@react-native-picker/picker';
import { registerUser } from '../../api/authApi';
import { colors, typography, layout } from '../../theme/colors';
import { Ionicons } from '@expo/vector-icons';
import { Platform } from 'react-native';
import { saveToken, saveUser } from '../../utils/storage';

export default function RegisterScreen({ navigation }) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '', email: '', phone: '',
    password: '', confirm_password: '',
    role: 'customer', city: 'karachi',
    service_type: 'plumber', cnic: '',
  });

  const update = (field, value) => setFormData({ ...formData, [field]: value });

  const handleRegister = async () => {
    if (!formData.full_name || !formData.email || !formData.phone || !formData.password) {
      Alert.alert('Error', 'Please fill all required fields!');
      return;
    }
    if (formData.password !== formData.confirm_password) {
      Alert.alert('Error', 'Passwords do not match!');
      return;
    }
    try {
      setLoading(true);
      const response = await registerUser(formData);
      await saveToken(response.token);  
await saveUser(response.user); 
      Alert.alert('Success', 'Registration successful!');
      if (response.user.role === 'customer') {
        navigation.navigate('CustomerHome');
      } else {
        navigation.navigate('WorkerDashboard');
      }
    } catch (error) {
      Alert.alert('Error', error.message || 'Registration failed!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={[layout.container, { paddingTop: 60 }]}>

      <Text style={typography.heading}>Create Account</Text>
      <Text style={[typography.subtitle, { marginBottom: 30 }]}>Please enter your details</Text>

      <View style={layout.fieldGroup}>
        <Text style={typography.label}>Full Name</Text>
        <TextInput style={layout.input} placeholder="Enter your full name"
          placeholderTextColor={colors.textLight}
          onChangeText={(text) => update('full_name', text)} />
      </View>

      <View style={layout.fieldGroup}>
        <Text style={typography.label}>Email</Text>
        <TextInput style={layout.input} placeholder="Enter your email"
          placeholderTextColor={colors.textLight} keyboardType="email-address"
          onChangeText={(text) => update('email', text)} />
      </View>

      <View style={layout.fieldGroup}>
        <Text style={typography.label}>Phone Number</Text>
        <TextInput style={layout.input} placeholder="Enter your phone number"
          placeholderTextColor={colors.textLight} keyboardType="phone-pad"
          onChangeText={(text) => update('phone', text)} />
      </View>

      <View style={layout.fieldGroup}>
        <Text style={typography.label}>Password</Text>
        <View style={layout.passwordContainer}>
          <TextInput style={layout.passwordInput} placeholder="Enter your password"
            placeholderTextColor={colors.textLight} secureTextEntry={!showPassword}
            onChangeText={(text) => update('password', text)} />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
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
          </TouchableOpacity>
        </View>
      </View>

      <View style={layout.fieldGroup}>
        <Text style={typography.label}>Repeat Password</Text>
        <View style={layout.passwordContainer}>
          <TextInput style={layout.passwordInput} placeholder="Repeat password"
            placeholderTextColor={colors.textLight} secureTextEntry={!showConfirmPassword}
            onChangeText={(text) => update('confirm_password', text)} />
          <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
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
          </TouchableOpacity>
        </View>
      </View>

      <View style={layout.fieldGroup}>
        <Text style={typography.label}>Role</Text>
        <View style={layout.pickerContainer}>
          <Picker selectedValue={formData.role}
            onValueChange={(val) => update('role', val)} style={layout.picker}>
            <Picker.Item label="Customer" value="customer" />
            <Picker.Item label="Worker" value="worker" />
          </Picker>
        </View>
      </View>

      {formData.role === 'worker' && (
        <>
          <View style={layout.fieldGroup}>
            <Text style={typography.label}>CNIC Number</Text>
            <TextInput style={layout.input} placeholder="Enter your CNIC"
              placeholderTextColor={colors.textLight} keyboardType="numeric"
              onChangeText={(text) => update('cnic', text)} />
          </View>
          <View style={layout.fieldGroup}>
            <Text style={typography.label}>Service Type</Text>
            <View style={layout.pickerContainer}>
              <Picker selectedValue={formData.service_type}
                onValueChange={(val) => update('service_type', val)} style={layout.picker}>
                <Picker.Item label="Plumber" value="plumber" />
                <Picker.Item label="Electrician" value="electrician" />
                <Picker.Item label="Carpenter" value="carpenter" />
                <Picker.Item label="Maid" value="maid" />
                <Picker.Item label="Painter" value="painter" />
                <Picker.Item label="AC Technician" value="ac_technician" />
              </Picker>
            </View>
          </View>
        </>
      )}

      <View style={layout.fieldGroup}>
        <Text style={typography.label}>City</Text>
        <View style={layout.pickerContainer}>
          <Picker selectedValue={formData.city}
            onValueChange={(val) => update('city', val)} style={layout.picker}>
            <Picker.Item label="Karachi" value="karachi" />
            <Picker.Item label="Lahore" value="lahore" />
            <Picker.Item label="Islamabad" value="islamabad" />
            <Picker.Item label="Rawalpindi" value="rawalpindi" />
            <Picker.Item label="Peshawar" value="peshawar" />
          </Picker>
        </View>
      </View>

      <TouchableOpacity style={layout.button} onPress={handleRegister} disabled={loading}>
        {loading ? <ActivityIndicator color={colors.white} /> :
          <Text style={layout.buttonText}>Register</Text>}
      </TouchableOpacity>

      {/* Login Link */}
      <TouchableOpacity onPress={() => navigation.navigate('Login')}>
        <Text style={[typography.subtitle, { textAlign: 'center' }]}>
          Already have an account? <Text style={typography.link}>Login</Text>
        </Text>
      </TouchableOpacity>
     

    </ScrollView>
  );
}