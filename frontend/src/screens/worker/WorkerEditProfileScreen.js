// WorkerEditProfileScreen.js
// Worker can update their profile info
// Bio, hourly rate, experience, availability

import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator, Switch } from 'react-native';
import { useState, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Platform } from 'react-native';
import axios from 'axios';
import { getToken } from '../../utils/storage';
import { colors, typography, layout } from '../../theme/colors';


const BASE_URL = Platform.OS === 'web'
  ? 'http://localhost:5000/api'
  : process.env.EXPO_PUBLIC_API_URL;

export default function WorkerEditProfileScreen({ navigation }) {
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [formData, setFormData] = useState({
    bio: '',
    hourly_rate: '',
    experience_years: '',
    area: '',
    whatsapp: '',
    services_offered: '',
    is_available: true,
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = await getToken();
      // Get worker id from token
      const response = await axios.get(`${BASE_URL}/workers/profile/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const w = response.data.worker;
      setFormData({
        bio: w.bio || '',
        hourly_rate: w.hourly_rate?.toString() || '',
        experience_years: w.experience_years?.toString() || '',
        area: w.area || '',
        whatsapp: w.whatsapp || '',
        services_offered: w.services_offered || '',
        is_available: w.is_available,
      });
    } catch (err) {
      console.error(err);
    } finally {
      setFetching(false);
    }
  };

  const update = (field, value) => setFormData({ ...formData, [field]: value });

  const handleSave = async () => {
    try {
      setLoading(true);
      const token = await getToken();
      await axios.put(`${BASE_URL}/workers/profile`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      Alert.alert('Success', 'Profile updated!', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (err) {
      Alert.alert('Error', 'Could not update profile!');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={{ paddingBottom: 40 }}>

      {/* Header */}
      <TouchableOpacity
        style={{ padding: 16, paddingTop: 50 }}
        onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={24} color={colors.textDark} />
      </TouchableOpacity>

      <Text style={[typography.heading, { paddingHorizontal: 20, marginBottom: 4 }]}>
        Edit Profile
      </Text>
      <Text style={[typography.subtitle, { paddingHorizontal: 20, marginBottom: 24 }]}>
        Update your worker profile
      </Text>

      <View style={{ paddingHorizontal: 20 }}>

        {/* Availability Toggle */}
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: formData.is_available ? '#ECFDF5' : '#FEF2F2',
          padding: 16,
          borderRadius: 12,
          marginBottom: 20,
        }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <Ionicons
              name="radio-button-on"
              size={20}
              color={formData.is_available ? '#10B981' : '#EF4444'}
            />
            <Text style={{
              fontSize: 14, fontWeight: '600',
              color: formData.is_available ? '#10B981' : '#EF4444'
            }}>
              {formData.is_available ? 'Available for Work' : 'Not Available'}
            </Text>
          </View>
          <Switch
            value={formData.is_available}
            onValueChange={(val) => update('is_available', val)}
            trackColor={{ false: '#EF4444', true: '#10B981' }}
            thumbColor={colors.white}
          />
        </View>

        {/* Hourly Rate */}
        <View style={layout.fieldGroup}>
          <Text style={typography.label}>Hourly Rate (PKR)</Text>
          <TextInput
            style={layout.input}
            placeholder="e.g. 500"
            placeholderTextColor={colors.textLight}
            keyboardType="numeric"
            value={formData.hourly_rate}
            onChangeText={(text) => update('hourly_rate', text)}
          />
        </View>

        {/* Experience */}
        <View style={layout.fieldGroup}>
          <Text style={typography.label}>Years of Experience</Text>
          <TextInput
            style={layout.input}
            placeholder="e.g. 5"
            placeholderTextColor={colors.textLight}
            keyboardType="numeric"
            value={formData.experience_years}
            onChangeText={(text) => update('experience_years', text)}
          />
        </View>

        {/* Area */}
        <View style={layout.fieldGroup}>
          <Text style={typography.label}>Area / Locality</Text>
          <TextInput
            style={layout.input}
            placeholder="e.g. DHA Phase 5"
            placeholderTextColor={colors.textLight}
            value={formData.area}
            onChangeText={(text) => update('area', text)}
          />
        </View>

        {/* WhatsApp */}
        <View style={layout.fieldGroup}>
          <Text style={typography.label}>WhatsApp Number</Text>
          <TextInput
            style={layout.input}
            placeholder="e.g. 03001234567"
            placeholderTextColor={colors.textLight}
            keyboardType="phone-pad"
            value={formData.whatsapp}
            onChangeText={(text) => update('whatsapp', text)}
          />
        </View>

        {/* Bio */}
        <View style={layout.fieldGroup}>
          <Text style={typography.label}>About Me</Text>
          <TextInput
            style={[layout.input, { height: 100, textAlignVertical: 'top' }]}
            placeholder="Describe your experience and skills..."
            placeholderTextColor={colors.textLight}
            multiline
            numberOfLines={4}
            value={formData.bio}
            onChangeText={(text) => update('bio', text)}
          />
        </View>

        {/* Services Offered */}
        <View style={layout.fieldGroup}>
          <Text style={typography.label}>Services Offered</Text>
          <TextInput
            style={[layout.input, { height: 100, textAlignVertical: 'top' }]}
            placeholder="e.g. Pipe fitting, leak repair, bathroom installation..."
            placeholderTextColor={colors.textLight}
            multiline
            numberOfLines={4}
            value={formData.services_offered}
            onChangeText={(text) => update('services_offered', text)}
          />
        </View>

        {/* Save Button */}
        <TouchableOpacity
          style={layout.button}
          onPress={handleSave}
          disabled={loading}>
          {loading
            ? <ActivityIndicator color={colors.white} />
            : <Text style={layout.buttonText}>Save Changes</Text>}
        </TouchableOpacity>

      </View>
    </ScrollView>
  );
}