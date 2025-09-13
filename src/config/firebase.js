import { initializeApp } from 'firebase/app';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCR4VcrTEOn-iu5Fohv1D2dYiW63TrXlqQ",
  authDomain: "rendezvous-25.firebaseapp.com",
  projectId: "rendezvous-25",
  storageBucket: "rendezvous-25.firebasestorage.app",
  messagingSenderId: "149073824849",
  appId: "1:149073824849:web:1aafd9bebefdacd6137c70",
  measurementId: "G-PD44DPRL82"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
export const db = getFirestore(app);

// Initialize Auth
export const auth = getAuth(app);

// For development, you can use the emulator
// if (process.env.NODE_ENV === 'development') {
//   connectFirestoreEmulator(db, 'localhost', 8080);
// }

export default app;
