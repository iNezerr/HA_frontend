// Firebase Authentication Service
// This file will handle all Firebase authentication operations

import { mockFirebaseAuth } from '../config/firebase';

// Types
export interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  emailVerified: boolean;
  photoURL?: string | null;
}

export interface AuthError {
  code: string;
  message: string;
}

// Authentication service class
export class FirebaseAuthService {
  // Sign in with email and password
  static async signInWithEmail(email: string, password: string): Promise<AuthUser> {
    try {
      // TODO: Replace with actual Firebase auth when ready
      const result = await mockFirebaseAuth.signInWithEmailAndPassword(email, password);
      return result.user;
    } catch (error) {
      console.error('Sign in error:', error);
      throw {
        code: 'auth/invalid-credentials',
        message: 'Invalid email or password',
      } as AuthError;
    }
  }

  // Create user with email and password
  static async createUserWithEmail(email: string, password: string, displayName?: string): Promise<AuthUser> {
    try {
      // TODO: Replace with actual Firebase auth when ready
      const result = await mockFirebaseAuth.createUserWithEmailAndPassword(email, password);
      
      // If displayName is provided, update the user profile
      if (displayName) {
        // TODO: Update user profile with displayName
        (result.user as any).displayName = displayName;
      }
      
      return result.user;
    } catch (error) {
      console.error('Create user error:', error);
      throw {
        code: 'auth/email-already-in-use',
        message: 'An account with this email already exists',
      } as AuthError;
    }
  }

  // Sign in with Google
  static async signInWithGoogle(): Promise<AuthUser> {
    try {
      // TODO: Replace with actual Firebase Google auth when ready
      const result = await mockFirebaseAuth.signInWithPopup();
      return result.user;
    } catch (error) {
      console.error('Google sign in error:', error);
      throw {
        code: 'auth/popup-closed-by-user',
        message: 'Google sign in was cancelled',
      } as AuthError;
    }
  }

  // Sign out
  static async signOut(): Promise<void> {
    try {
      // TODO: Replace with actual Firebase auth when ready
      await mockFirebaseAuth.signOut();
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  }

  // Listen to auth state changes
  static onAuthStateChanged(callback: (user: AuthUser | null) => void): () => void {
    // TODO: Replace with actual Firebase auth state listener when ready
    return mockFirebaseAuth.onAuthStateChanged(callback);
  }

  // Send password reset email
  static async sendPasswordResetEmail(email: string): Promise<void> {
    try {
      // TODO: Implement with actual Firebase when ready
      console.log('Mock: Sending password reset email to', email);
    } catch (error) {
      console.error('Password reset error:', error);
      throw {
        code: 'auth/user-not-found',
        message: 'No account found with this email address',
      } as AuthError;
    }
  }

  // Send email verification
  static async sendEmailVerification(): Promise<void> {
    try {
      // TODO: Implement with actual Firebase when ready
      console.log('Mock: Sending email verification');
    } catch (error) {
      console.error('Email verification error:', error);
      throw error;
    }
  }
}

export default FirebaseAuthService;
