// colors.js
// Global theme — update here, entire app updates automatically

export const colors = {
  primary: '#2563EB',        // Blue — main color
  primaryLight: '#EFF6FF',   // Light blue — backgrounds
  background: '#FFFFFF',     // White background
  inputBackground: '#F9FAFB', // Input background
  inputBorder: '#E5E7EB',    // Input border
  textDark: '#111827',       // Dark headings
  textMedium: '#374151',     // Body text
  textLight: '#9CA3AF',      // Placeholder text
  label: '#374151',          // Form labels
  white: '#FFFFFF',          // White
  error: '#EF4444',          // Error red
  success: '#10B981',        // Success green
};

export const typography = {
  heading: { fontSize: 28, fontWeight: 'bold', color: '#111827' },
  subtitle: { fontSize: 14, color: '#9CA3AF' },
  label: { fontSize: 13, fontWeight: '500', color: '#374151', marginBottom: 6 },
  body: { fontSize: 14, color: '#374151' },
  link: { fontSize: 14, fontWeight: '600', color: '#2563EB' },
};

export const layout = {
  container: {
    flexGrow: 1,
    backgroundColor: '#FFFFFF',
    padding: 24,
  },
  input: {
    width: '100%',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    padding: 14,
    fontSize: 14,
    color: '#374151',
    backgroundColor: '#F9FAFB',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    paddingHorizontal: 14,
    backgroundColor: '#F9FAFB',
  },
  passwordInput: {
    flex: 1,
    padding: 14,
    fontSize: 14,
    color: '#374151',
  },
  fieldGroup: {
    width: '100%',
    marginBottom: 16,
  },
  button: {
    width: '100%',
    backgroundColor: '#2563EB',
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  outlineButton: {
    borderWidth: 1.5,
    borderColor: '#2563EB',
    borderRadius: 10,
    padding: 14,
    alignItems: 'center',
    marginBottom: 30,
  },
  pickerContainer: {
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    backgroundColor: '#F9FAFB',
    overflow: 'hidden',
  },
  picker: {
    height: 50,
    color: '#374151',
  },
};