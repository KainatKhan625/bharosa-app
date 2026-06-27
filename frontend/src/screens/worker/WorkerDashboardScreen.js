// WorkerDashboardScreen.js
// Worker can see incoming jobs and manage them
// Accept, reject or complete bookings

import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useState, useCallback } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Platform } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import axios from 'axios';
import { getToken, getUser } from '../../utils/storage';
import { colors, typography } from '../../theme/colors';

const BASE_URL = Platform.OS === 'web'
  ? 'http://localhost:5000/api'
  : process.env.EXPO_PUBLIC_API_URL;

const STATUS_CONFIG = {
  pending:   { color: '#F59E0B', bg: '#FFFBEB', icon: 'time-outline',            label: 'Pending' },
  accepted:  { color: '#2563EB', bg: '#EFF6FF', icon: 'checkmark-circle-outline', label: 'Accepted' },
  rejected:  { color: '#EF4444', bg: '#FEF2F2', icon: 'close-circle-outline',    label: 'Rejected' },
  completed: { color: '#10B981', bg: '#ECFDF5', icon: 'checkmark-done-outline',  label: 'Completed' },
  cancelled: { color: '#6B7280', bg: '#F9FAFB', icon: 'ban-outline',             label: 'Cancelled' },
};

export default function WorkerDashboardScreen({ navigation }) {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const loadData = async () => {
    try {
      setLoading(true);
      const userData = await getUser();
      setUser(userData);
      const token = await getToken();
      const response = await axios.get(`${BASE_URL}/bookings/worker`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBookings(response.data.bookings);
    } catch (err) {
      Alert.alert('Error', 'Could not load bookings!');
    } finally {
      setLoading(false);
    }
  };

  // Update booking status
  const updateStatus = async (bookingId, status) => {
    try {
      const token = await getToken();
      await axios.put(`${BASE_URL}/bookings/${bookingId}`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      loadData();
    } catch (err) {
      Alert.alert('Error', 'Could not update booking!');
    }
  };

  const BookingCard = ({ booking }) => {
    const config = STATUS_CONFIG[booking.status] || STATUS_CONFIG.pending;

    return (
      <View style={styles.card}>

        {/* Header */}
        <View style={styles.cardHeader}>
          <View style={styles.customerInfo}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {booking.customer_name?.charAt(0).toUpperCase()}
              </Text>
            </View>
            <View>
              <Text style={styles.customerName}>{booking.customer_name}</Text>
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
          <View style={styles.detailRow}>
            <Ionicons name="call-outline" size={14} color={colors.textLight} />
            <Text style={styles.detailText}>{booking.customer_phone}</Text>
          </View>
          {booking.problem_description && (
            <View style={styles.detailRow}>
              <Ionicons name="document-text-outline" size={14} color={colors.textLight} />
              <Text style={styles.detailText}>{booking.problem_description}</Text>
            </View>
          )}
        </View>

        {/* Action Buttons */}
        {booking.status === 'pending' && (
          <View style={styles.actionRow}>
            <TouchableOpacity
              style={styles.rejectBtn}
              onPress={() => updateStatus(booking.id, 'rejected')}>
              <Text style={styles.rejectBtnText}>Reject</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.acceptBtn}
              onPress={() => updateStatus(booking.id, 'accepted')}>
              <Text style={styles.acceptBtnText}>Accept</Text>
            </TouchableOpacity>
          </View>
        )}

        {booking.status === 'accepted' && (
          <TouchableOpacity
            style={styles.completeBtn}
            onPress={() => updateStatus(booking.id, 'completed')}>
            <Ionicons name="checkmark-done" size={16} color={colors.white} />
            <Text style={styles.completeBtnText}>Mark as Completed</Text>
          </TouchableOpacity>
        )}

      </View>
    );
  };

  // Stats
  const pending = bookings.filter(b => b.status === 'pending').length;
  const completed = bookings.filter(b => b.status === 'completed').length;
  const accepted = bookings.filter(b => b.status === 'accepted').length;

  return (
    <View style={styles.container}>

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Welcome back!</Text>
          <Text style={[typography.heading, { fontSize: 22 }]}>
            {user?.full_name || 'Worker'}
          </Text>
        </View>
        <View style={styles.notifBtn}>
          <Ionicons name="notifications-outline" size={24} color={colors.textDark} />
        </View>
      </View>

      {/* Stats Row */}
      <View style={styles.statsRow}>
        <View style={[styles.statBox, { backgroundColor: '#FFFBEB' }]}>
          <Text style={[styles.statNumber, { color: '#F59E0B' }]}>{pending}</Text>
          <Text style={styles.statLabel}>Pending</Text>
        </View>
        <View style={[styles.statBox, { backgroundColor: '#EFF6FF' }]}>
          <Text style={[styles.statNumber, { color: '#2563EB' }]}>{accepted}</Text>
          <Text style={styles.statLabel}>Active</Text>
        </View>
        <View style={[styles.statBox, { backgroundColor: '#ECFDF5' }]}>
          <Text style={[styles.statNumber, { color: '#10B981' }]}>{completed}</Text>
          <Text style={styles.statLabel}>Completed</Text>
        </View>
      </View>

      {/* Bookings List */}
      <Text style={styles.sectionTitle}>Job Requests</Text>

      {loading ? (
        <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 40 }} />
      ) : bookings.length === 0 ? (
        <View style={styles.emptyBox}>
          <Ionicons name="briefcase-outline" size={60} color={colors.textLight} />
          <Text style={styles.emptyText}>No job requests yet</Text>
          <Text style={styles.emptySubText}>New bookings will appear here!</Text>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 50,
  },
  greeting: {
    fontSize: 13,
    color: colors.textLight,
    marginBottom: 2,
  },
  notifBtn: {
    padding: 8,
    backgroundColor: '#EFF6FF',
    borderRadius: 12,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  statBox: {
    flex: 1,
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 11,
    color: colors.textLight,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textDark,
    paddingHorizontal: 20,
    marginBottom: 4,
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
  customerInfo: {
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
  customerName: {
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
    marginBottom: 10,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
  },
  detailText: {
    fontSize: 13,
    color: '#6B7280',
    flex: 1,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
  },
  rejectBtn: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: '#EF4444',
    borderRadius: 8,
    padding: 10,
    alignItems: 'center',
  },
  rejectBtnText: {
    fontSize: 13,
    color: '#EF4444',
    fontWeight: '500',
  },
  acceptBtn: {
    flex: 1,
    backgroundColor: colors.primary,
    borderRadius: 8,
    padding: 10,
    alignItems: 'center',
  },
  acceptBtnText: {
    fontSize: 13,
    color: colors.white,
    fontWeight: '500',
  },
  completeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#10B981',
    borderRadius: 8,
    padding: 10,
    marginTop: 4,
  },
  completeBtnText: {
    fontSize: 13,
    color: colors.white,
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