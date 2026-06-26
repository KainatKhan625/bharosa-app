// WorkerProfileScreen.js
// Shows detailed worker profile
// Customer can view worker info and book them

import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useState, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { Platform } from 'react-native';
import { getToken } from '../../utils/storage';
import { colors, typography } from '../../theme/colors';
import styles from './WorkerProfileScreen.styles';

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
    <ScrollView style={styles.container}>

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

        {/* Verified Badge */}
        {worker.is_verified && (
          <View style={styles.verifiedBadge}>
            <Ionicons name="checkmark-circle" size={16} color="#10B981" />
            <Text style={styles.verifiedText}>Verified Worker</Text>
          </View>
        )}
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

      {/* Info Section */}
      <View style={styles.infoSection}>
        <View style={styles.infoRow}>
          <Ionicons name="location-outline" size={18} color={colors.primary} />
          <Text style={styles.infoText}>{worker.city}</Text>
        </View>
        <View style={styles.infoRow}>
          <Ionicons name="call-outline" size={18} color={colors.primary} />
          <Text style={styles.infoText}>{worker.phone}</Text>
        </View>
        {worker.bio && (
          <View style={styles.infoRow}>
            <Ionicons name="information-circle-outline" size={18} color={colors.primary} />
            <Text style={styles.infoText}>{worker.bio}</Text>
          </View>
        )}
      </View>

      {/* Reviews Section */}
      <Text style={styles.sectionTitle}>Reviews</Text>
      {reviews.length === 0 ? (
        <View style={styles.emptyReviews}>
          <Text style={styles.emptyText}>No reviews yet</Text>
        </View>
      ) : (
        reviews.map((review, index) => (
          <View key={index} style={styles.reviewCard}>
            <View style={styles.reviewHeader}>
              <Text style={styles.reviewerName}>{review.customer_name}</Text>
              <View style={styles.reviewRating}>
                <Ionicons name="star" size={14} color="#F59E0B" />
                <Text style={styles.reviewRatingText}>{review.rating}</Text>
              </View>
            </View>
            <Text style={styles.reviewComment}>{review.comment}</Text>
          </View>
        ))
      )}

      {/* Book Now Button */}
      <TouchableOpacity
        style={styles.bookBtn}
        onPress={() => navigation.navigate('Booking', { worker })}>
        <Text style={styles.bookBtnText}>Book Now</Text>
      </TouchableOpacity>

    </ScrollView>
  );
}