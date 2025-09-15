/**
 * Firebase Authentication Service
 * Handles Firebase authentication operations
 */

import { 
  User, 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  sendEmailVerification,
  updateProfile,
  onAuthStateChanged
} from 'firebase/auth';
import { firebaseAuth } from '../config/firebase';

export interface FirebaseUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  emailVerified: boolean;
  phoneNumber: string | null;
}

export interface RegisterWithEmailParams {
  email: string;
  password: string;
  displayName: string;
}

export interface LoginWithEmailParams {
  email: string;
  password: string;
}

export class FirebaseAuthService {
  /**
   * Register a new user with email and password
   */
  static async registerWithEmail({ email, password, displayName }: RegisterWithEmailParams): Promise<FirebaseUser> {
    try {
      const userCredential = await createUserWithEmailAndPassword(firebaseAuth, email, password);
      const user = userCredential.user;
      
      // Update user profile with display name
      if (displayName) {
        await updateProfile(user, { displayName });
      }
      
      // Send email verification
      await sendEmailVerification(user);
      
      return this.formatUser(user);
    } catch (error: any) {
      console.error('Firebase registration error:', error);
      throw new Error(this.getErrorMessage(error.code));
    }
  }

  /**
   * Sign in with email and password
   */
  static async loginWithEmail({ email, password }: LoginWithEmailParams): Promise<FirebaseUser> {
    try {
      const userCredential = await signInWithEmailAndPassword(firebaseAuth, email, password);
      return this.formatUser(userCredential.user);
    } catch (error: any) {
      console.error('Firebase login error:', error);
      throw new Error(this.getErrorMessage(error.code));
    }
  }

  /**
   * Sign out current user
   */
  static async logout(): Promise<void> {
    try {
      await signOut(firebaseAuth);
    } catch (error: any) {
      console.error('Firebase logout error:', error);
      throw new Error('Failed to sign out. Please try again.');
    }
  }

  /**
   * Send password reset email
   */
  static async sendPasswordResetEmail(email: string): Promise<void> {
    try {
      await sendPasswordResetEmail(firebaseAuth, email);
    } catch (error: any) {
      console.error('Firebase password reset error:', error);
      throw new Error(this.getErrorMessage(error.code));
    }
  }

  /**
   * Send email verification
   */
  static async sendEmailVerification(): Promise<void> {
    try {
      const user = firebaseAuth.currentUser;
      if (!user) {
        throw new Error('No authenticated user found');
      }
      await sendEmailVerification(user);
    } catch (error: any) {
      console.error('Firebase email verification error:', error);
      throw new Error('Failed to send verification email. Please try again.');
    }
  }

  /**
   * Get current user's ID token
   */
  static async getIdToken(forceRefresh = false): Promise<string> {
    try {
      const user = firebaseAuth.currentUser;
      if (!user) {
        throw new Error('No authenticated user found');
      }
      return await user.getIdToken(forceRefresh);
    } catch (error: any) {
      console.error('Firebase get token error:', error);
      throw new Error('Failed to get authentication token');
    }
  }

  /**
   * Get current user
   */
  static getCurrentUser(): FirebaseUser | null {
    const user = firebaseAuth.currentUser;
    return user ? this.formatUser(user) : null;
  }

  /**
   * Listen to auth state changes
   */
  static onAuthStateChanged(callback: (user: FirebaseUser | null) => void): () => void {
    return onAuthStateChanged(firebaseAuth, (user: User | null) => {
      callback(user ? this.formatUser(user) : null);
    });
  }

  /**
   * Format Firebase user to our interface
   */
  private static formatUser(user: User): FirebaseUser {
    return {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
      emailVerified: user.emailVerified,
      phoneNumber: user.phoneNumber,
    };
  }

  /**
   * Convert Firebase error codes to user-friendly messages
   */
  private static getErrorMessage(errorCode: string): string {
    switch (errorCode) {
      case 'auth/user-not-found':
        return 'No account found with this email address.';
      case 'auth/wrong-password':
        return 'Invalid password. Please try again.';
      case 'auth/email-already-in-use':
        return 'An account with this email already exists.';
      case 'auth/weak-password':
        return 'Password should be at least 6 characters long.';
      case 'auth/invalid-email':
        return 'Please enter a valid email address.';
      case 'auth/user-disabled':
        return 'This account has been disabled.';
      case 'auth/too-many-requests':
        return 'Too many failed attempts. Please try again later.';
      case 'auth/network-request-failed':
        return 'Network error. Please check your connection.';
      case 'auth/popup-closed-by-user':
        return 'Sign-in cancelled by user.';
      case 'auth/popup-blocked':
        return 'Popup blocked. Please allow popups for this site.';
      case 'auth/invalid-credential':
        return 'Invalid email or password.';
      default:
        return 'An error occurred during authentication. Please try again.';
    }
  }
}

export default FirebaseAuthService;
