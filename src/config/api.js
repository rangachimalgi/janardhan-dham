import { Platform } from 'react-native';

// API Configuration
// For local development:
// - iOS Simulator: use localhost
// - Android Emulator: use 10.0.2.2
// - Physical Device: use your computer's IP address (e.g., 192.168.1.100)
//   Update the IP_ADDRESS below with your computer's local IP

const IP_ADDRESS = '192.168.1.3'; // Change this to your computer's IP for physical devices
const PORT = '8000';

// Production API URL - Your Render backend URL
// For native Android/iOS apps: Just update this URL directly
// For web builds: You can also set EXPO_PUBLIC_API_URL environment variable
const PRODUCTION_API_URL = process.env.EXPO_PUBLIC_API_URL || 'https://event-space-new.onrender.com/api';

// Force production mode (set to true to always use production API)
// Set to true if you want to always use Render backend, even in development
const FORCE_PRODUCTION = false; // Set to false for local testing, true for production

const getBaseURL = () => {
  // Check if we should force production mode FIRST (before env var check)
  // This allows local testing even if EXPO_PUBLIC_API_URL is set
  if (FORCE_PRODUCTION) {
    console.log('🔧 FORCE_PRODUCTION is enabled - using production API');
    return PRODUCTION_API_URL;
  }

  // Check environment variable (for production builds)
  // Only use if not in development mode
  if (process.env.EXPO_PUBLIC_API_URL && (process.env.NODE_ENV === 'production' || !__DEV__)) {
    console.log('🌐 Using EXPO_PUBLIC_API_URL from environment:', process.env.EXPO_PUBLIC_API_URL);
    return process.env.EXPO_PUBLIC_API_URL;
  }

  // For release builds (APK/IPA), __DEV__ will be false
  // For production web builds, NODE_ENV will be 'production'
  const isProduction = process.env.NODE_ENV === 'production' || !__DEV__;
  
  console.log('🔍 Environment check:', {
    __DEV__,
    NODE_ENV: process.env.NODE_ENV,
    Platform: Platform.OS,
    isProduction,
  });

  if (isProduction) {
    console.log('✅ Production mode detected - using:', PRODUCTION_API_URL);
    return PRODUCTION_API_URL;
  }

  // Development mode (only when __DEV__ is true)
  let devURL;
  if (Platform.OS === 'android') {
    devURL = `http://192.168.1.3:${PORT}/api`;
  } else if (Platform.OS === 'ios') {
    devURL = `http://${IP_ADDRESS}:${PORT}/api`;
  } else {
    devURL = `http://localhost:${PORT}/api`;
  }
  
  console.log('🛠️ Development mode - using:', devURL);
  return devURL;
};

const API_BASE_URL = getBaseURL();

// Log the final API URL being used
console.log('📍 Final API Base URL:', API_BASE_URL);

export default API_BASE_URL;
