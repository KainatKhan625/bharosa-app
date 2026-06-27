// WorkerProfileScreen.js
// Shows detailed worker profile with all information
// Customer can call, WhatsApp, or book the worker

import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert, Linking } from 'react-native';
import { useState, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Platform } from 'react-native';
import axios from 'axios';
import { colors } from '../../theme/colors';
import styles from './WorkerProfileScreen.styles';
import { formatTime } from '../../utils/timeHelper';

const BASE_URL = Platform.OS === 'web'
  ? 'http://localhost:5000/api'
  : process.env.EXPO_PUBLIC_API_URL;

export default function WorkerProfileScreen({ navigation, route }) {
  const { workerId } = route.params;
  const [worker, setWorker] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWorkerProfile();
  }, []);

  const fetchWorkerProfile = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/workers/${workerId}`);
      setWorker(response.data.worker);
      setReviews(response.data.reviews);
    } catch (err) {
      Alert.alert('Error', 'Could not load worker profile!');
    } finally {
      setLoading(false);
    }
  };

  // Call worker
  const handleCall = () => {
    Linking.openURL(`tel:${worker.phone}`);
  };

  // WhatsApp worker
  const handleWhatsApp = () => {
    const number = worker.whatsapp || worker.phone;
    Linking.openURL(`https://wa.me/92${number?.replace(/^0/, '')}`);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!worker) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Worker not found!</Text>
      </View>
    );
  }

  return (
    <ScrollView 
  style={styles.container}
  contentContainerStyle={{ paddingBottom: 60 }}>

      {/* Back Button */}
      <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={24} color={colors.textDark} />
      </TouchableOpacity>

      {/* Worker Header */}
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {worker.full_name?.charAt(0).toUpperCase()}
          </Text>
        </View>

        <Text style={styles.workerName}>{worker.full_name}</Text>
        <Text style={styles.serviceType}>{worker.service_type}</Text>

        {/* Rating */}
        <View style={styles.ratingRow}>
          <Ionicons name="star" size={18} color="#F59E0B" />
          <Text style={styles.rating}>{worker.avg_rating || '0.0'}</Text>
          <Text style={styles.reviews}>({worker.total_reviews} reviews)</Text>
        </View>

        {/* Badges Row */}
        <View style={styles.badgesRow}>
          {/* Verified Badge */}
          {worker.is_verified && (
            <View style={styles.verifiedBadge}>
              <Ionicons name="checkmark-circle" size={14} color="#10B981" />
              <Text style={styles.verifiedText}>Verified</Text>
            </View>
          )}

          {/* Availability Badge */}
          <View style={[styles.availBadge, { backgroundColor: worker.is_available ? '#ECFDF5' : '#FEF2F2' }]}>
            <View style={[styles.availDot, { backgroundColor: worker.is_available ? '#10B981' : '#EF4444' }]} />
            <Text style={[styles.availText, { color: worker.is_available ? '#10B981' : '#EF4444' }]}>
              {worker.is_available ? 'Available Now' : 'Busy'}
            </Text>
          </View>
        </View>
      </View>

      {/* Stats Row */}
      <View style={styles.statsRow}>
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>{worker.total_jobs}</Text>
          <Text style={styles.statLabel}>Jobs Done</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>{worker.experience_years} yr</Text>
          <Text style={styles.statLabel}>Experience</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>PKR {worker.hourly_rate}</Text>
          <Text style={styles.statLabel}>Per Hour</Text>
        </View>
      </View>

      {/* Contact Buttons */}
      <View style={styles.contactRow}>
        <TouchableOpacity style={styles.callBtn} onPress={handleCall}>
          <Ionicons name="call" size={18} color={colors.white} />
          <Text style={styles.callBtnText}>Call</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.whatsappBtn} onPress={handleWhatsApp}>
          <Ionicons name="logo-whatsapp" size={18} color={colors.white} />
          <Text style={styles.whatsappBtnText}>WhatsApp</Text>
        </TouchableOpacity>
      </View>

      {/* Info Section */}
      <View style={styles.infoSection}>

        {/* Location */}
        <View style={styles.infoRow}>
          <Ionicons name="location-outline" size={18} color={colors.primary} />
          <Text style={styles.infoText}>
            {worker.area ? `${worker.area}, ${worker.city}` : worker.city}
          </Text>
        </View>

        {/* Working Hours */}
        <View style={styles.infoRow}>
          <Ionicons name="time-outline" size={18} color={colors.primary} />
          <Text style={styles.infoText}>
            Mon-Sat: {formatTime(worker.available_from) || '9:00 AM'} - {formatTime(worker.available_to) || '6:00 PM'}
          </Text>
        </View>

        {/* Emergency Rate */}
        {worker.emergency_rate > 0 && (
          <View style={styles.infoRow}>
            <Ionicons name="flash-outline" size={18} color="#F59E0B" />
            <Text style={styles.infoText}>
              Emergency Rate: PKR {worker.emergency_rate}/hr
            </Text>
          </View>
        )}

        {/* Bio */}
        {worker.bio && (
          <View style={styles.bioSection}>
            <Text style={styles.bioTitle}>About</Text>
            <Text style={styles.bioText}>{worker.bio}</Text>
          </View>
        )}

        {/* Services Offered */}
        {worker.services_offered && (
          <View style={styles.bioSection}>
            <Text style={styles.bioTitle}>Services Offered</Text>
            <Text style={styles.bioText}>{worker.services_offered}</Text>
          </View>
        )}

      </View>

      {/* Pricing Section */}
      <View style={styles.pricingSection}>
        <Text style={styles.sectionTitle}>Pricing</Text>
        <View style={styles.pricingRow}>
          <Text style={styles.pricingLabel}>Hourly Rate</Text>
          <Text style={styles.pricingValue}>PKR {worker.hourly_rate}/hr</Text>
        </View>
        {worker.emergency_rate > 0 && (
          <View style={styles.pricingRow}>
            <Text style={styles.pricingLabel}>Emergency Rate</Text>
            <Text style={[styles.pricingValue, { color: '#F59E0B' }]}>PKR {worker.emergency_rate}/hr</Text>
          </View>
        )}
      </View>

      {/* Reviews Section */}
      <Text style={styles.sectionTitle}>Reviews ({worker.total_reviews})</Text>
      {reviews.length === 0 ? (
        <View style={styles.emptyReviews}>
          <Ionicons name="chatbubble-outline" size={40} color={colors.textLight} />
          <Text style={styles.emptyText}>No reviews yet</Text>
        </View>
      ) : (
        reviews.map((review, index) => (
          <View key={index} style={styles.reviewCard}>
            <View style={styles.reviewHeader}>
              <Text style={styles.reviewerName}>{review.customer_name}</Text>
              <View style={styles.reviewRating}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <Ionicons
                    key={star}
                    name="star"
                    size={12}
                    color={star <= review.rating ? '#F59E0B' : '#E5E7EB'}
                  />
                ))}
              </View>
            </View>
            <Text style={styles.reviewComment}>{review.comment}</Text>
            <Text style={styles.reviewDate}>
              {new Date(review.created_at).toLocaleDateString()}
            </Text>
          </View>
        ))
      )}

      {/* Book Now Button */}
      <TouchableOpacity
        style={styles.bookBtn}
        onPress={() => navigation.navigate('Booking', { worker })}>
        <Text style={styles.bookBtnText}>Book Now — PKR {worker.hourly_rate}/hr</Text>
      </TouchableOpacity>

      {/* Extra space at bottom */}
<View style={{ height: 40 }} />

    </ScrollView>
  );
}