// CustomerHomeScreen.styles.js
// All styles for CustomerHomeScreen
// Separated from logic for clean code

import { StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingTop: 50,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  greeting: {
    fontSize: 14,
    color: colors.textLight,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.textDark,
  },
  notifBtn: {
    padding: 8,
    backgroundColor: colors.primaryLight,
    borderRadius: 12,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.inputBackground,
    borderWidth: 1.5,
    borderColor: colors.inputBorder,
    borderRadius: 12,
    paddingHorizontal: 14,
    marginHorizontal: 20,
    marginBottom: 24,
  },
  searchInput: {
    flex: 1,
    padding: 12,
    fontSize: 14,
    color: colors.textMedium,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textDark,
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  categoriesRow: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  categoryBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: colors.primary,
    marginRight: 10,
    minWidth: 80,
  },
  categoryBtnActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  categoryText: {
    fontSize: 11,
    color: colors.primary,
    marginTop: 4,
    fontWeight: '500',
  },
  categoryTextActive: {
    color: colors.white,
  },
  workerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderWidth: 1.5,
    borderColor: colors.inputBorder,
    borderRadius: 14,
    padding: 14,
    marginHorizontal: 20,
    marginBottom: 12,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.primary,
  },
  workerInfo: {
    flex: 1,
  },
  workerName: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textDark,
    marginBottom: 2,
  },
  workerService: {
    fontSize: 12,
    color: colors.textLight,
    marginBottom: 4,
    textTransform: 'capitalize',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  rating: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.textDark,
  },
  reviews: {
    fontSize: 12,
    color: colors.textLight,
  },
  priceBox: {
    alignItems: 'flex-end',
  },
  price: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primary,
  },
  perHour: {
    fontSize: 11,
    color: colors.textLight,
  },
  emptyBox: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textDark,
    marginTop: 12,
  },
  emptySubText: {
    fontSize: 13,
    color: colors.textLight,
    marginTop: 4,
  },
});