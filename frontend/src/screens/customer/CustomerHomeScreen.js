// CustomerHomeScreen.js
// Main screen for customers
// Browse services, search workers, view categories

import { View, Text, ScrollView, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native';
import { useState, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import styles from './CustomerHomeScreen.styles';
import axios from 'axios';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL;

// Service categories list
const CATEGORIES = [
  { id: 1, name: 'Plumber', icon: 'water-outline', value: 'plumber' },
  { id: 2, name: 'Electrician', icon: 'flash-outline', value: 'electrician' },
  { id: 3, name: 'Carpenter', icon: 'hammer-outline', value: 'carpenter' },
  { id: 4, name: 'Maid', icon: 'home-outline', value: 'maid' },
  { id: 5, name: 'Painter', icon: 'color-palette-outline', value: 'painter' },
  { id: 6, name: 'AC Technician', icon: 'snow-outline', value: 'ac_technician' },
];

export default function CustomerHomeScreen({ navigation }) {
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchText, setSearchText] = useState('');

  // Fetch workers when screen loads or category changes
  useEffect(() => {
    fetchWorkers();
  }, [selectedCategory]);

  // Fetch workers from backend API
  const fetchWorkers = async () => {
    try {
      setLoading(true);
      let url = `${BASE_URL}/workers`;
      if (selectedCategory) {
        url += `?service_type=${selectedCategory}`;
      }
      const response = await axios.get(url);
      setWorkers(response.data.workers);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Single worker card component
  const WorkerCard = ({ worker }) => (
    <TouchableOpacity
      style={styles.workerCard}
      onPress={() => navigation.navigate('WorkerProfile', { workerId: worker.id })}>

      {/* Worker Avatar — first letter of name */}
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>
          {worker.full_name?.charAt(0).toUpperCase()}
        </Text>
      </View>

      {/* Worker Details */}
      <View style={styles.workerInfo}>
        <Text style={styles.workerName}>{worker.full_name}</Text>
        <Text style={styles.workerService}>{worker.service_type}</Text>
        <View style={styles.ratingRow}>
          <Ionicons name="star" size={14} color="#F59E0B" />
          <Text style={styles.rating}>{worker.avg_rating || '0.0'}</Text>
          <Text style={styles.reviews}>({worker.total_reviews} reviews)</Text>
        </View>
      </View>

      {/* Hourly Rate */}
      <View style={styles.priceBox}>
        <Text style={styles.price}>PKR {worker.hourly_rate || '0'}</Text>
        <Text style={styles.perHour}>/hr</Text>
      </View>

    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container}>

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hello! </Text>
          <Text style={styles.headerTitle}>Find a Service</Text>
        </View>
        <TouchableOpacity style={styles.notifBtn}>
          <Ionicons name="notifications-outline" size={24} color={colors.textDark} />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search-outline" size={20} color={colors.textLight} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search for a service..."
          placeholderTextColor={colors.textLight}
          value={searchText}
          onChangeText={setSearchText}
        />
      </View>

      {/* Service Categories */}
      <Text style={styles.sectionTitle}>Categories</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesRow}>

        {/* All Button */}
        <TouchableOpacity
          style={[styles.categoryBtn, !selectedCategory && styles.categoryBtnActive]}
          onPress={() => setSelectedCategory(null)}>
          <Ionicons name="grid-outline" size={22} color={!selectedCategory ? colors.white : colors.primary} />
          <Text style={[styles.categoryText, !selectedCategory && styles.categoryTextActive]}>All</Text>
        </TouchableOpacity>

        {/* Category Buttons */}
        {CATEGORIES.map((cat) => (
          <TouchableOpacity
            key={cat.id}
            style={[styles.categoryBtn, selectedCategory === cat.value && styles.categoryBtnActive]}
            onPress={() => setSelectedCategory(cat.value)}>
            <Ionicons
              name={cat.icon}
              size={22}
              color={selectedCategory === cat.value ? colors.white : colors.primary}
            />
            <Text style={[styles.categoryText, selectedCategory === cat.value && styles.categoryTextActive]}>
              {cat.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Workers List */}
      <Text style={styles.sectionTitle}>
        {selectedCategory ? `${selectedCategory} Workers` : 'Available Workers'}
      </Text>

      {loading ? (
        <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 30 }} />
      ) : workers.length === 0 ? (
        <View style={styles.emptyBox}>
          <Ionicons name="people-outline" size={50} color={colors.textLight} />
          <Text style={styles.emptyText}>No workers available yet</Text>
          <Text style={styles.emptySubText}>Check back soon!</Text>
        </View>
      ) : (
        workers.map((worker) => (
          <WorkerCard key={worker.id} worker={worker} />
        ))
      )}

    </ScrollView>
  );
}