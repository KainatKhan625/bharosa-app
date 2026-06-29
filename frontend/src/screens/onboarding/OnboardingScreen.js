// OnboardingScreen.js
// Shows 3 slides explaining app features
// User can skip or go through all slides

import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';

const { width } = Dimensions.get('window');

const SLIDES = [
  {
    id: 1,
    icon: 'search-outline',
    title: 'Find Trusted Workers',
    description: 'Browse verified plumbers, electricians, maids and more in your city.',
    color: '#2563EB',
  },
  {
    id: 2,
    icon: 'shield-checkmark-outline',
    title: 'CNIC Verified',
    description: 'Every worker is verified with CNIC. Safe and trustworthy service guaranteed.',
    color: '#10B981',
  },
  {
    id: 3,
    icon: 'cash-outline',
    title: 'Fixed Pricing',
    description: 'No bargaining! Transparent fixed prices. Know the cost before booking.',
    color: '#F59E0B',
  },
];

export default function OnboardingScreen({ navigation }) {
  const [currentSlide, setCurrentSlide] = useState(0);

  const handleNext = () => {
    if (currentSlide < SLIDES.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      navigation.replace('Login');
    }
  };

  const handleSkip = () => {
    navigation.replace('Login');
  };

  const slide = SLIDES[currentSlide];

  return (
    <View style={styles.container}>

      {/* Skip Button */}
      <TouchableOpacity style={styles.skipBtn} onPress={handleSkip}>
        <Text style={styles.skipText}>Skip</Text>
      </TouchableOpacity>

      {/* Slide Content */}
      <View style={styles.slideContainer}>

        {/* Icon */}
        <View style={[styles.iconCircle, { backgroundColor: slide.color + '20' }]}>
          <Ionicons name={slide.icon} size={80} color={slide.color} />
        </View>

        {/* Text */}
        <Text style={styles.title}>{slide.title}</Text>
        <Text style={styles.description}>{slide.description}</Text>

      </View>

      {/* Bottom Section */}
      <View style={styles.bottom}>

        {/* Dots */}
        <View style={styles.dotsRow}>
          {SLIDES.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                {
                  backgroundColor: index === currentSlide ? colors.primary : '#E5E7EB',
                  width: index === currentSlide ? 24 : 8,
                }
              ]}
            />
          ))}
        </View>

        {/* Next Button */}
        <TouchableOpacity
          style={[styles.nextBtn, { backgroundColor: slide.color }]}
          onPress={handleNext}>
          <Text style={styles.nextBtnText}>
            {currentSlide === SLIDES.length - 1 ? 'Get Started' : 'Next'}
          </Text>
          <Ionicons
            name={currentSlide === SLIDES.length - 1 ? 'checkmark' : 'arrow-forward'}
            size={20}
            color={colors.white}
          />
        </TouchableOpacity>

      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingTop: 50,
  },
  skipBtn: {
    alignSelf: 'flex-end',
    padding: 16,
    paddingRight: 20,
  },
  skipText: {
    fontSize: 14,
    color: colors.textLight,
    fontWeight: '500',
  },
  slideContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  iconCircle: {
    width: 160,
    height: 160,
    borderRadius: 80,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: colors.textDark,
    textAlign: 'center',
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    color: colors.textLight,
    textAlign: 'center',
    lineHeight: 24,
  },
  bottom: {
    padding: 30,
    paddingBottom: 50,
    gap: 24,
  },
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  dot: {
    height: 8,
    borderRadius: 4,
    transition: 'all 0.3s',
  },
  nextBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 16,
    borderRadius: 14,
  },
  nextBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.white,
  },
});