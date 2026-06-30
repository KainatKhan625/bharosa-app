// WorkerProfileSettingsScreen.js
// Worker profile and logout screen

import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography } from '../../theme/colors';
import { clearStorage, getUser } from '../../utils/storage';
import { useState, useEffect } from 'react';

export default function WorkerProfileSettingsScreen({ navigation }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    const userData = await getUser();
    setUser(userData);
  };

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await clearStorage();
            navigation.reset({
              index: 0,
              routes: [{ name: 'Login' }],
            });
          }
        }
      ]
    );
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.background }}>

      {/* Header */}
      <View style={{
        padding: 20, paddingTop: 50,
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
        marginBottom: 20,
      }}>
        <View style={{
          width: 80, height: 80, borderRadius: 40,
          backgroundColor: '#EFF6FF',
          alignItems: 'center', justifyContent: 'center',
          marginBottom: 12,
        }}>
          <Text style={{ fontSize: 32, fontWeight: 'bold', color: colors.primary }}>
            {user?.full_name?.charAt(0).toUpperCase()}
          </Text>
        </View>
        <Text style={[typography.heading, { fontSize: 20 }]}>{user?.full_name}</Text>
        <Text style={typography.subtitle}>{user?.email}</Text>
        <View style={{
          flexDirection: 'row', alignItems: 'center', gap: 4,
          backgroundColor: '#ECFDF5', paddingHorizontal: 10,
          paddingVertical: 4, borderRadius: 20, marginTop: 8,
        }}>
          <Ionicons name="construct-outline" size={14} color="#10B981" />
          <Text style={{ fontSize: 12, color: '#10B981', fontWeight: '500' }}>Worker</Text>
        </View>
      </View>

      <View style={{ paddingHorizontal: 20 }}>

        <TouchableOpacity 
  onPress={() => navigation.navigate('WorkerEditProfile')}
  style={{
    flexDirection: 'row', alignItems: 'center', gap: 14,
    padding: 16, backgroundColor: '#F9FAFB',
    borderRadius: 12, marginBottom: 10,
  }}>
  <Ionicons name="person-outline" size={20} color={colors.primary} />
  <Text style={{ fontSize: 14, color: '#374151', fontWeight: '500' }}>Edit Profile</Text>
  <Ionicons name="chevron-forward" size={18} color="#9CA3AF" style={{ marginLeft: 'auto' }} />
</TouchableOpacity>

        <TouchableOpacity style={{
          flexDirection: 'row', alignItems: 'center', gap: 14,
          padding: 16, backgroundColor: '#F9FAFB',
          borderRadius: 12, marginBottom: 10,
        }}>
          <Ionicons name="cash-outline" size={20} color={colors.primary} />
          <Text style={{ fontSize: 14, color: '#374151', fontWeight: '500' }}>Earnings</Text>
          <Ionicons name="chevron-forward" size={18} color="#9CA3AF" style={{ marginLeft: 'auto' }} />
        </TouchableOpacity>

        <TouchableOpacity style={{
          flexDirection: 'row', alignItems: 'center', gap: 14,
          padding: 16, backgroundColor: '#F9FAFB',
          borderRadius: 12, marginBottom: 10,
        }}>
          <Ionicons name="help-circle-outline" size={20} color={colors.primary} />
          <Text style={{ fontSize: 14, color: '#374151', fontWeight: '500' }}>Help & Support</Text>
          <Ionicons name="chevron-forward" size={18} color="#9CA3AF" style={{ marginLeft: 'auto' }} />
        </TouchableOpacity>

        {/* Logout */}
        <TouchableOpacity
          onPress={handleLogout}
          style={{
            flexDirection: 'row', alignItems: 'center', gap: 14,
            padding: 16, backgroundColor: '#FEF2F2',
            borderRadius: 12, marginTop: 10,
          }}>
          <Ionicons name="log-out-outline" size={20} color="#EF4444" />
          <Text style={{ fontSize: 14, color: '#EF4444', fontWeight: '500' }}>Logout</Text>
        </TouchableOpacity>

      </View>
    </ScrollView>
  );
}