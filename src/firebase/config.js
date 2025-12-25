import { initializeApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { initializeFirestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: "AIzaSyB3X6yx_3cRycIaQkxI3EB8Q3ZuSPSLrqE",
  authDomain: "territory-walk-game.firebaseapp.com",
  projectId: "territory-walk-game",
  storageBucket: "territory-walk-game.firebasestorage.app",
  messagingSenderId: "992107497450",
  appId: "1:992107497450:web:6ae31f31b62e4b84b2d493",
  measurementId: "G-B2J0BG78FE"
};

const app = initializeApp(firebaseConfig);
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});
export const db = initializeFirestore(app, {
  experimentalAutoDetectLongPolling: true,
  useFetchStreams: false,
  ignoreUndefinedProperties: true
});
export default app;
