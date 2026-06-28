// AdminPanelScreen.js
// Admin can verify workers, view stats, manage users

import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useState, useCallback } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Platform } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import axios from 'axios';
import { getToken, clearStorage } from '../../utils/storage';
import { colors, typography } from '../../theme/colors';

const BASE_URL = Platform.OS === 'web'
  ? 'http://localhost:5000/api'
  : process.env.EXPO_PUBLIC_API_URL;

export default function AdminPanelScreen({ navigation }) {
  const [stats, setStats] = useState(null);
  const [pendingWorkers, setPendingWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const loadData = async () => {
    try {
      setLoading(true);
      const token = await getToken();
      const headers = { Authorization: `Bearer ${token}` };

      const [statsRes, workersRes] = await Promise.all([
        axios.get(`${BASE_URL}/admin/stats`, { headers }),
        axios.get(`${BASE_URL}/admin/workers/pending`, { headers }),
      ]);

      setStats(statsRes.data.stats);
      setPendingWorkers(workersRes.data.workers);
    } catch (err) {
      Alert.alert('Error', 'Could not load data!');
    } finally {
      setLoading(false);
    }
  };

  // Verify or reject worker
  const handleVerification = async (workerId, isVerified) => {
    try {
      const token = await getToken();
      await axios.put(
        `${BASE_URL}/admin/workers/${workerId}/verify`,
        { is_verified: isVerified },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      Alert.alert('Success', isVerified ? 'Worker verified!' : 'Worker rejected!');
      loadData();
    } catch (err) {
      Alert.alert('Error', 'Could not update worker!');
    }
  };

  // Logout
  const handleLogout = async () => {
    Alert.alert('Logout', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout', style: 'destructive',
        onPress: async () => {
          await clearStorage();
          navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
        }
      }
    ]);
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>

      {/* Header */}
      <View style={{
        padding: 20, paddingTop: 50,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
      }}>
        <View>
          <Text style={{ fontSize: 13, color: colors.textLight }}>Admin Panel</Text>
          <Text style={[typography.heading, { fontSize: 22 }]}>Bharosa</Text>
        </View>
        <TouchableOpacity
          onPress={handleLogout}
          style={{ padding: 8, backgroundColor: '#FEF2F2', borderRadius: 10 }}>
          <Ionicons name="log-out-outline" size={22} color="#EF4444" />
        </TouchableOpacity>
      </View>

      {/* Tab Bar */}
      <View style={{
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
      }}>
        {['dashboard', 'workers'].map((tab) => (
          <TouchableOpacity
            key={tab}
            onPress={() => setActiveTab(tab)}
            style={{
              flex: 1, padding: 14, alignItems: 'center',
              borderBottomWidth: activeTab === tab ? 2 : 0,
              borderBottomColor: colors.primary,
            }}>
            <Text style={{
              fontSize: 13, fontWeight: '500',
              color: activeTab === tab ? colors.primary : colors.textLight,
            }}>
              {tab === 'dashboard' ? 'Dashboard' : `Pending (${pendingWorkers.length})`}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && stats && (
          <View>
            <Text style={[typography.heading, { fontSize: 18, marginBottom: 16 }]}>
              App Statistics
            </Text>

            {/* Stats Grid */}
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 20 }}>
              {[
                { label: 'Total Users', value: stats.total_users, icon: 'people-outline', color: '#2563EB', bg: '#EFF6FF' },
                { label: 'Verified Workers', value: stats.total_workers, icon: 'construct-outline', color: '#10B981', bg: '#ECFDF5' },
                { label: 'Total Bookings', value: stats.total_bookings, icon: 'calendar-outline', color: '#F59E0B', bg: '#FFFBEB' },
                { label: 'Revenue (PKR)', value: stats.total_revenue || 0, icon: 'cash-outline', color: '#8B5CF6', bg: '#F5F3FF' },
              ].map((stat, index) => (
                <View key={index} style={{
                  width: '47%',
                  backgroundColor: stat.bg,
                  borderRadius: 14,
                  padding: 16,
                }}>
                  <Ionicons name={stat.icon} size={24} color={stat.color} />
                  <Text style={{
                    fontSize: 24, fontWeight: 'bold',
                    color: stat.color, marginTop: 8, marginBottom: 4,
                  }}>
                    {stat.value}
                  </Text>
                  <Text style={{ fontSize: 12, color: colors.textLight }}>
                    {stat.label}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Pending Workers Tab */}
        {activeTab === 'workers' && (
          <View>
            <Text style={[typography.heading, { fontSize: 18, marginBottom: 16 }]}>
              Pending Verifications
            </Text>

            {pendingWorkers.length === 0 ? (
              <View style={{ alignItems: 'center', paddingVertical: 40 }}>
                <Ionicons name="checkmark-done-circle-outline" size={60} color="#10B981" />
                <Text style={{ fontSize: 16, fontWeight: '600', color: colors.textDark, marginTop: 12 }}>
                  All workers verified!
                </Text>
              </View>
            ) : (
              pendingWorkers.map((worker) => (
                <View key={worker.id} style={{
                  backgroundColor: colors.white,
                  borderRadius: 14,
                  borderWidth: 1.5,
                  borderColor: '#E5E7EB',
                  padding: 14,
                  marginBottom: 12,
                }}>
                  {/* Worker Info */}
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                    <View style={{
                      width: 44, height: 44, borderRadius: 22,
                      backgroundColor: '#EFF6FF',
                      alignItems: 'center', justifyContent: 'center',
                    }}>
                      <Text style={{ fontSize: 18, fontWeight: 'bold', color: colors.primary }}>
                        {worker.full_name?.charAt(0).toUpperCase()}
                      </Text>
                    </View>
                    <View>
                      <Text style={{ fontSize: 15, fontWeight: '600', color: colors.textDark }}>
                        {worker.full_name}
                      </Text>
                      <Text style={{ fontSize: 12, color: colors.textLight, textTransform: 'capitalize' }}>
                        {worker.service_type}
                      </Text>
                    </View>
                  </View>

                  {/* Details */}
                  <View style={{ gap: 6, borderTopWidth: 1, borderTopColor: '#F3F4F6', paddingTop: 10, marginBottom: 12 }}>
                    <View style={{ flexDirection: 'row', gap: 6 }}>
                      <Ionicons name="mail-outline" size={14} color={colors.textLight} />
                      <Text style={{ fontSize: 13, color: colors.textMedium }}>{worker.email}</Text>
                    </View>
                    <View style={{ flexDirection: 'row', gap: 6 }}>
                      <Ionicons name="call-outline" size={14} color={colors.textLight} />
                      <Text style={{ fontSize: 13, color: colors.textMedium }}>{worker.phone}</Text>
                    </View>
                    <View style={{ flexDirection: 'row', gap: 6 }}>
                      <Ionicons name="card-outline" size={14} color={colors.textLight} />
                      <Text style={{ fontSize: 13, color: colors.textMedium }}>CNIC: {worker.cnic}</Text>
                    </View>
                    <View style={{ flexDirection: 'row', gap: 6 }}>
                      <Ionicons name="location-outline" size={14} color={colors.textLight} />
                      <Text style={{ fontSize: 13, color: colors.textMedium }}>{worker.city}</Text>
                    </View>
                  </View>

                  {/* Action Buttons */}
                  <View style={{ flexDirection: 'row', gap: 10 }}>
                    <TouchableOpacity
                      style={{
                        flex: 1, borderWidth: 1.5, borderColor: '#EF4444',
                        borderRadius: 8, padding: 10, alignItems: 'center',
                      }}
                      onPress={() => handleVerification(worker.id, false)}>
                      <Text style={{ fontSize: 13, color: '#EF4444', fontWeight: '500' }}>Reject</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={{
                        flex: 1, backgroundColor: '#10B981',
                        borderRadius: 8, padding: 10, alignItems: 'center',
                      }}
                      onPress={() => handleVerification(worker.id, true)}>
                      <Text style={{ fontSize: 13, color: colors.white, fontWeight: '500' }}>✓ Verify</Text>
                    </TouchableOpacity>
                  </View>

                </View>
              ))
            )}
          </View>
        )}

      </ScrollView>
    </View>
  );
}