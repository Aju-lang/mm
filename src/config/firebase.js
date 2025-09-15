import { initializeApp } from 'firebase/app';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getAuth, connectAuthEmulator } from 'firebase/auth';

// Firebase configuration - use environment variables in production
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY || "AIzaSyCR4VcrTEOn-iu5Fohv1D2dYiW63TrXlqQ",
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || "rendezvous-25.firebaseapp.com",
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || "rendezvous-25",
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || "rendezvous-25.firebasestorage.app",
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || "149073824849",
  appId: process.env.REACT_APP_FIREBASE_APP_ID || "1:149073824849:web:1aafd9bebefdacd6137c70",
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID || "G-PD44DPRL82"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
export const db = getFirestore(app);
export const auth = getAuth(app);

// For development, you can use emulators
if (process.env.NODE_ENV === 'development' && process.env.REACT_APP_USE_EMULATORS === 'true') {
  try {
    connectFirestoreEmulator(db, 'localhost', 8080);
    connectAuthEmulator(auth, 'http://localhost:9099');
  } catch (error) {
    console.log('Emulators already connected or not available');
  }
}

export default app;
