// AddReviewScreen.js
// Customer can add review after booking is completed

import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator, StyleSheet } from 'react-native';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Platform } from 'react-native';
import axios from 'axios';
import { getToken } from '../../utils/storage';
import { colors, typography, layout } from '../../theme/colors';

const BASE_URL = Platform.OS === 'web'
  ? 'http://localhost:5000/api'
  : process.env.EXPO_PUBLIC_API_URL;

export default function AddReviewScreen({ navigation, route }) {
  const { booking } = route.params;
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) {
      Alert.alert('Error', 'Please select a rating!');
      return;
    }

    try {
      setLoading(true);
      const token = await getToken();

      await axios.post(`${BASE_URL}/reviews`, {
        booking_id: booking.id,
        rating,
        comment: comment.trim(),
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      Alert.alert('Success', 'Review submitted!', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);

    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'Could not submit review!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>

      {/* Header */}
      <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={24} color={colors.textDark} />
      </TouchableOpacity>

      <Text style={[typography.heading, { paddingHorizontal: 20, marginBottom: 4 }]}>
        Add Review
      </Text>
      <Text style={[typography.subtitle, { paddingHorizontal: 20, marginBottom: 30 }]}>
        {booking.worker_name} — {booking.service_type}
      </Text>

      {/* Star Rating */}
      <View style={styles.starsContainer}>
        <Text style={styles.ratingLabel}>Your Rating</Text>
        <View style={styles.starsRow}>
          {[1, 2, 3, 4, 5].map((star) => (
            <TouchableOpacity
              key={star}
              onPress={() => setRating(star)}>
              <Ionicons
                name={star <= rating ? 'star' : 'star-outline'}
                size={40}
                color={star <= rating ? '#F59E0B' : '#E5E7EB'}
              />
            </TouchableOpacity>
          ))}
        </View>
        <Text style={styles.ratingText}>
          {rating === 0 ? 'Tap to rate' :
           rating === 1 ? 'Poor' :
           rating === 2 ? 'Fair' :
           rating === 3 ? 'Good' :
           rating === 4 ? 'Very Good' : 'Excellent!'}
        </Text>
      </View>

      {/* Comment */}
      <View style={[layout.fieldGroup, { paddingHorizontal: 20 }]}>
        <Text style={typography.label}>Comment (Optional)</Text>
        <TextInput
          style={[layout.input, { height: 120, textAlignVertical: 'top' }]}
          placeholder="Share your experience..."
          placeholderTextColor={colors.textLight}
          multiline
          numberOfLines={4}
          value={comment}
          onChangeText={setComment}
        />
      </View>

      {/* Submit Button */}
      <TouchableOpacity
        style={[layout.button, { marginHorizontal: 20 }]}
        onPress={handleSubmit}
        disabled={loading}>
        {loading
          ? <ActivityIndicator color={colors.white} />
          : <Text style={layout.buttonText}>Submit Review</Text>}
      </TouchableOpacity>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingTop: 50,
  },
  backBtn: {
    padding: 16,
    marginBottom: 8,
  },
  starsContainer: {
    alignItems: 'center',
    paddingVertical: 30,
    marginHorizontal: 20,
    backgroundColor: colors.inputBackground,
    borderRadius: 16,
    marginBottom: 24,
  },
  ratingLabel: {
    fontSize: 14,
    color: colors.textLight,
    marginBottom: 16,
  },
  starsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  ratingText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textDark,
  },
});