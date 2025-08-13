// Firebase configuration placeholder
// TODO: Replace with actual Firebase configuration when ready

export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Mock Firebase functions for development
export const mockFirebaseAuth = {
  signInWithEmailAndPassword: async (email: string, password: string) => {
    console.log('Mock Firebase: Sign in with email', email, password);
    // Return mock user
    return {
      user: {
        uid: 'mock-uid',
        email,
        displayName: 'Mock User',
        emailVerified: true,
      }
    };
  },
  
  createUserWithEmailAndPassword: async (email: string, password: string) => {
    console.log('Mock Firebase: Create user with email', email, password);
    // Return mock user
    return {
      user: {
        uid: 'mock-uid',
        email,
        displayName: null,
        emailVerified: false,
      }
    };
  },
  
  signInWithPopup: async () => {
    console.log('Mock Firebase: Sign in with Google popup');
    // Return mock user
    return {
      user: {
        uid: 'mock-google-uid',
        email: 'google@example.com',
        displayName: 'Google User',
        emailVerified: true,
        photoURL: 'https://via.placeholder.com/150',
      }
    };
  },
  
  signOut: async () => {
    console.log('Mock Firebase: Sign out');
    return Promise.resolve();
  },
  
  onAuthStateChanged: (callback: (user: any) => void) => {
    console.log('Mock Firebase: Auth state changed');
    // Mock no user initially
    callback(null);
    return () => {}; // Unsubscribe function
  },
};

export default firebaseConfig;
