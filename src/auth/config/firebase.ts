import { initializeApp } from 'firebase/app';
import { getAnalytics } from "firebase/analytics";
import { 
  getAuth, 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  sendEmailVerification,
  updateProfile,
  User
} from 'firebase/auth';

// Firebase configuration
export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Analytics
export const analytics = getAnalytics(app);

// Initialize Firebase Authentication
export const auth = getAuth(app);

// Firebase Auth Methods
export const firebaseAuth = {
  // Sign in with email and password
  signInWithEmailAndPassword: (email: string, password: string) => 
    signInWithEmailAndPassword(auth, email, password),
  
  // Create user with email and password
  createUserWithEmailAndPassword: (email: string, password: string) => 
    createUserWithEmailAndPassword(auth, email, password),
  
  // Sign out
  signOut: () => signOut(auth),
  
  // Auth state observer
  onAuthStateChanged: (callback: (user: User | null) => void) => 
    onAuthStateChanged(auth, callback),
  
  // Send password reset email
  sendPasswordResetEmail: (email: string) => 
    sendPasswordResetEmail(auth, email),
  
  // Send email verification
  sendEmailVerification: (user: User) => 
    sendEmailVerification(user),
  
  // Update user profile
  updateProfile: (user: User, profile: { displayName?: string; photoURL?: string }) => 
    updateProfile(user, profile),
  
  // Get current user
  getCurrentUser: () => auth.currentUser,
  
  // Get ID token
  getIdToken: async (forceRefresh = false) => {
    const user = auth.currentUser;
    if (!user) throw new Error('No authenticated user');
    return await user.getIdToken(forceRefresh);
  },
};

export default app;
