// BookingScreen.js
// Customer books a worker for a service
// Fills booking details and submits

import { View, Text, ScrollView, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Platform } from 'react-native';
import axios from 'axios';
import { getToken } from '../../utils/storage';
import { colors, typography, layout } from '../../theme/colors';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';

const BASE_URL = Platform.OS === 'web'
  ? 'http://localhost:5000/api'
  : process.env.EXPO_PUBLIC_API_URL;

export default function BookingScreen({ navigation, route }) {
  const { worker } = route.params;
  const [loading, setLoading] = useState(false);
  const [date, setDate] = useState(new Date());
  const [time, setTime] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [formData, setFormData] = useState({
    address: '',
    city: 'karachi',
    scheduled_date: '',
    scheduled_time: '',
    problem_description: '',
  });

  const update = (field, value) => setFormData({ ...formData, [field]: value });

  const handleBooking = async () => {
    if (!formData.address || !formData.scheduled_date || !formData.scheduled_time) {
      Alert.alert('Error', 'Please fill all required fields!');
      return;
    }

    try {
      setLoading(true);
      const token = await getToken();

      await axios.post(`${BASE_URL}/bookings`, {
        worker_id: worker.id,
        service_type: worker.service_type,
        address: formData.address,
        city: formData.city,
        scheduled_date: formData.scheduled_date,
        scheduled_time: formData.scheduled_time,
        problem_description: formData.problem_description,
        estimated_price: worker.hourly_rate,
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      Alert.alert(
        'Success!',
        'Booking submitted! Worker will confirm soon.',
        [{ text: 'OK', onPress: () => navigation.navigate('MyBookings') }]
      );

    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'Booking failed!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={[layout.container, { paddingTop: 50, paddingBottom: 40 }]}>

      {/* Back Button */}
      <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginBottom: 16 }}>
        <Ionicons name="arrow-back" size={24} color={colors.textDark} />
      </TouchableOpacity>

      {/* Header */}
      <Text style={[typography.heading, { marginBottom: 4 }]}>Book Service</Text>
      <Text style={[typography.subtitle, { marginBottom: 24 }]}>
        {worker.full_name} — {worker.service_type}
      </Text>

      {/* Worker Info Card */}
      <View style={{
        backgroundColor: colors.primaryLight,
        borderRadius: 12,
        padding: 14,
        marginBottom: 24,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
      }}>
        <View style={{
          width: 44,
          height: 44,
          borderRadius: 22,
          backgroundColor: colors.primary,
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <Text style={{ color: colors.white, fontSize: 18, fontWeight: 'bold' }}>
            {worker.full_name?.charAt(0).toUpperCase()}
          </Text>
        </View>
        <View>
          <Text style={{ fontSize: 15, fontWeight: '600', color: colors.textDark }}>
            {worker.full_name}
          </Text>
          <Text style={{ fontSize: 13, color: colors.primary }}>
            PKR {worker.hourly_rate}/hr
          </Text>
        </View>
      </View>

      {/* Address */}
      <View style={layout.fieldGroup}>
        <Text style={typography.label}>Address *</Text>
        <TextInput
          style={layout.input}
          placeholder="Enter your full address"
          placeholderTextColor={colors.textLight}
          multiline
          numberOfLines={2}
          onChangeText={(text) => update('address', text)}
        />
      </View>

      {/* City */}
      <View style={layout.fieldGroup}>
        <Text style={typography.label}>City *</Text>
        <View style={layout.pickerContainer}>
          <Picker
            selectedValue={formData.city}
            onValueChange={(val) => update('city', val)}
            style={layout.picker}>
            <Picker.Item label="Karachi" value="karachi" />
            <Picker.Item label="Lahore" value="lahore" />
            <Picker.Item label="Islamabad" value="islamabad" />
            <Picker.Item label="Rawalpindi" value="rawalpindi" />
            <Picker.Item label="Peshawar" value="peshawar" />
          </Picker>
        </View>
      </View>

      {/* Date */}
<View style={layout.fieldGroup}>
  <Text style={typography.label}>Date *</Text>
  <TouchableOpacity
    style={layout.input}
    onPress={() => setShowDatePicker(true)}>
    <Text style={{ color: formData.scheduled_date ? colors.textDark : colors.textLight }}>
      {formData.scheduled_date || 'Select date'}
    </Text>
  </TouchableOpacity>
  {showDatePicker && (
    <DateTimePicker
      value={date}
      mode="date"
      minimumDate={new Date()}
      onChange={(event, selectedDate) => {
        setShowDatePicker(false);
        if (selectedDate) {
          setDate(selectedDate);
          // Auto format to YYYY-MM-DD
          const formatted = selectedDate.toISOString().split('T')[0];
          update('scheduled_date', formatted);
        }
      }}
    />
  )}
</View>

{/* Time */}
<View style={layout.fieldGroup}>
  <Text style={typography.label}>Time *</Text>
  <TouchableOpacity
    style={layout.input}
    onPress={() => setShowTimePicker(true)}>
    <Text style={{ color: formData.scheduled_time ? colors.textDark : colors.textLight }}>
      {formData.scheduled_time || 'Select time'}
    </Text>
  </TouchableOpacity>
  {showTimePicker && (
    <DateTimePicker
      value={time}
      mode="time"
      onChange={(event, selectedTime) => {
        setShowTimePicker(false);
        if (selectedTime) {
          setTime(selectedTime);
          // Auto format to HH:MM
          const hours = selectedTime.getHours().toString().padStart(2, '0');
          const minutes = selectedTime.getMinutes().toString().padStart(2, '0');
          update('scheduled_time', `${hours}:${minutes}`);
        }
      }}
    />
  )}
</View>

      {/* Problem Description */}
      <View style={layout.fieldGroup}>
        <Text style={typography.label}>Problem Description</Text>
        <TextInput
          style={[layout.input, { height: 100, textAlignVertical: 'top' }]}
          placeholder="Describe the problem in detail..."
          placeholderTextColor={colors.textLight}
          multiline
          numberOfLines={4}
          onChangeText={(text) => update('problem_description', text)}
        />
      </View>

      {/* Price Info */}
      <View style={{
        backgroundColor: colors.primaryLight,
        borderRadius: 12,
        padding: 14,
        marginBottom: 20,
      }}>
        <Text style={{ fontSize: 13, color: colors.textMedium, marginBottom: 4 }}>
          Estimated Cost
        </Text>
        <Text style={{ fontSize: 18, fontWeight: 'bold', color: colors.primary }}>
          PKR {worker.hourly_rate}/hr
        </Text>
        <Text style={{ fontSize: 11, color: colors.textLight, marginTop: 4 }}>
          Final price may vary based on work done
        </Text>
      </View>

      {/* Submit Button */}
      <TouchableOpacity
        style={layout.button}
        onPress={handleBooking}
        disabled={loading}>
        {loading
          ? <ActivityIndicator color={colors.white} />
          : <Text style={layout.buttonText}>Confirm Booking</Text>}
      </TouchableOpacity>

    </ScrollView>
  );
}