// MyBookingsScreen.js
// Shows all bookings made by the customer
// Customer can track booking status

import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useState, useEffect, useCallback } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Platform } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import axios from 'axios';
import { getToken } from '../../utils/storage';
import { colors, typography } from '../../theme/colors';

const BASE_URL = Platform.OS === 'web'
  ? 'http://localhost:5000/api'
  : process.env.EXPO_PUBLIC_API_URL;

// Status colors and icons
const STATUS_CONFIG = {
  pending:   { color: '#F59E0B', bg: '#FFFBEB', icon: 'time-outline',           label: 'Pending' },
  accepted:  { color: '#2563EB', bg: '#EFF6FF', icon: 'checkmark-circle-outline', label: 'Accepted' },
  rejected:  { color: '#EF4444', bg: '#FEF2F2', icon: 'close-circle-outline',   label: 'Rejected' },
  completed: { color: '#10B981', bg: '#ECFDF5', icon: 'checkmark-done-outline', label: 'Completed' },
  cancelled: { color: '#6B7280', bg: '#F9FAFB', icon: 'ban-outline',            label: 'Cancelled' },
};

export default function MyBookingsScreen({ navigation }) {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  // Refresh bookings every time screen is focused
  useFocusEffect(
    useCallback(() => {
      fetchBookings();
    }, [])
  );

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const token = await getToken();
      const response = await axios.get(`${BASE_URL}/bookings/customer`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBookings(response.data.bookings);
    } catch (err) {
      Alert.alert('Error', 'Could not load bookings!');
    } finally {
      setLoading(false);
    }
  };

  // Cancel booking
  const handleCancel = async (bookingId) => {
    Alert.alert(
      'Cancel Booking',
      'Are you sure you want to cancel?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: async () => {
            try {
              const token = await getToken();
              await axios.put(`${BASE_URL}/bookings/${bookingId}`,
                { status: 'cancelled' },
                { headers: { Authorization: `Bearer ${token}` } }
              );
              fetchBookings();
            } catch (err) {
              Alert.alert('Error', 'Could not cancel booking!');
            }
          }
        }
      ]
    );
  };

  const BookingCard = ({ booking }) => {
    const config = STATUS_CONFIG[booking.status] || STATUS_CONFIG.pending;

    return (
      <View style={styles.card}>

        {/* Header */}
        <View style={styles.cardHeader}>
          <View style={styles.workerInfo}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {booking.worker_name?.charAt(0).toUpperCase()}
              </Text>
            </View>
            <View>
              <Text style={styles.workerName}>{booking.worker_name}</Text>
              <Text style={styles.serviceType}>{booking.service_type}</Text>
            </View>
          </View>

          {/* Status Badge */}
          <View style={[styles.statusBadge, { backgroundColor: config.bg }]}>
            <Ionicons name={config.icon} size={14} color={config.color} />
            <Text style={[styles.statusText, { color: config.color }]}>
              {config.label}
            </Text>
          </View>
        </View>

        {/* Booking Details */}
        <View style={styles.details}>
          <View style={styles.detailRow}>
            <Ionicons name="location-outline" size={14} color={colors.textLight} />
            <Text style={styles.detailText}>{booking.address}</Text>
          </View>
          <View style={styles.detailRow}>
            <Ionicons name="calendar-outline" size={14} color={colors.textLight} />
            <Text style={styles.detailText}>
              {new Date(booking.scheduled_date).toLocaleDateString()} at {booking.scheduled_time?.slice(0, 5)}
            </Text>
          </View>
          {booking.estimated_price && (
            <View style={styles.detailRow}>
              <Ionicons name="cash-outline" size={14} color={colors.textLight} />
              <Text style={styles.detailText}>PKR {booking.estimated_price}/hr</Text>
            </View>
          )}
        </View>

        {/* Cancel Button — only for pending bookings */}
        {booking.status === 'pending' && (
          <TouchableOpacity
            style={styles.cancelBtn}
            onPress={() => handleCancel(booking.id)}>
            <Text style={styles.cancelBtnText}>Cancel Booking</Text>
          </TouchableOpacity>
        )}

      </View>
    );
  };

  return (
    <View style={styles.container}>

      {/* Header */}
      <View style={styles.header}>
        <Text style={[typography.heading, { fontSize: 22 }]}>My Bookings</Text>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 40 }} />
      ) : bookings.length === 0 ? (
        <View style={styles.emptyBox}>
          <Ionicons name="calendar-outline" size={60} color={colors.textLight} />
          <Text style={styles.emptyText}>No bookings yet</Text>
          <Text style={styles.emptySubText}>Book a service to get started!</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
          {bookings.map((booking) => (
            <BookingCard key={booking.id} booking={booking} />
          ))}
        </ScrollView>
      )}

    </View>
  );
}

const styles = {
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    padding: 20,
    paddingTop: 50,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    padding: 14,
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  workerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.primary,
  },
  workerName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  serviceType: {
    fontSize: 12,
    color: '#9CA3AF',
    textTransform: 'capitalize',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '500',
  },
  details: {
    gap: 6,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingTop: 10,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  detailText: {
    fontSize: 13,
    color: '#6B7280',
    flex: 1,
  },
  cancelBtn: {
    marginTop: 10,
    borderWidth: 1.5,
    borderColor: '#EF4444',
    borderRadius: 8,
    padding: 8,
    alignItems: 'center',
  },
  cancelBtnText: {
    fontSize: 13,
    color: '#EF4444',
    fontWeight: '500',
  },
  emptyBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  emptySubText: {
    fontSize: 13,
    color: '#9CA3AF',
  },
};