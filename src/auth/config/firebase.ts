import { initializeApp } from 'firebase/app';
import { getAnalytics } from "firebase/analytics";
import { 
  getAuth, 
  GoogleAuthProvider
} from 'firebase/auth';

// Firebase configuration
export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Auth
const auth = getAuth(app);
export { auth as firebaseAuth };

// Google Auth Provider
export const googleProvider = new GoogleAuthProvider();

// Analytics
try {
  getAnalytics(app);
} catch (error) {
  console.warn('Analytics not initialized:', error);
}

export default app;
