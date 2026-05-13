// Firebase configuration for Las Higueras Activa
// Phone Authentication via Firebase Auth

import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, RecaptchaVerifier, signInWithPhoneNumber, type ConfirmationResult } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase (singleton pattern)
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Messaging instance (only on client)
let messaging: any = null;
if (typeof window !== 'undefined') {
  try {
    messaging = getMessaging(app);
  } catch (e) {
    console.error('Firebase Messaging failed to initialize:', e);
  }
}

// Set language to Spanish
auth.languageCode = 'es';

/**
 * Request permission for notifications and return FCM token
 */
export async function requestNotificationToken(swRegistration?: ServiceWorkerRegistration): Promise<string | null> {
  if (!messaging) {
    console.warn('Firebase Messaging not initialized');
    return null;
  }
  
  try {
    const permission = await Notification.requestPermission();
    console.log('Notification permission:', permission);
    
    if (permission === 'granted') {
      const tokenOptions: any = {
        vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY || 'BAZG0Wpq9iRY41lhqRVZyXdv-nJPOXXJFhrY1dyWmNxfkILGTYCthuXyP_IrAth_h3kKloqwlW-OpGHQW2rk4iQ'
      };
      
      // Pass the service worker registration if available
      if (swRegistration) {
        tokenOptions.serviceWorkerRegistration = swRegistration;
      }
      
      const token = await getToken(messaging, tokenOptions);
      console.log('FCM Token obtained:', token ? token.substring(0, 20) + '...' : 'NULL');
      return token;
    }
    
    console.warn('Notification permission denied');
    return null;
  } catch (error) {
    console.error('Error getting notification token:', error);
    return null;
  }
}

// Extend Window interface for our custom properties
declare global {
  interface Window {
    __recaptchaVerifier?: RecaptchaVerifier;
    __confirmationResult?: ConfirmationResult;
  }
}

/**
 * Initialize invisible reCAPTCHA verifier
 * Must be called before sending SMS
 */
export function setupRecaptcha(buttonId: string): RecaptchaVerifier {
  // Clear any existing verifier
  if (window.__recaptchaVerifier) {
    try {
      window.__recaptchaVerifier.clear();
    } catch {
      // Ignore cleanup errors
    }
  }

  const verifier = new RecaptchaVerifier(auth, buttonId, {
    size: 'invisible',
    callback: () => {
      // reCAPTCHA solved - will proceed with phone auth
      console.log('reCAPTCHA verificado');
    },
    'expired-callback': () => {
      console.log('reCAPTCHA expirado, recargando...');
    },
  });

  window.__recaptchaVerifier = verifier;
  return verifier;
}

/**
 * Send SMS verification code to a phone number
 * @param phoneNumber - Phone number WITH country code (e.g., "+543584123456")
 * @returns ConfirmationResult to verify the code later
 */
export async function sendVerificationCode(phoneNumber: string): Promise<ConfirmationResult> {
  const verifier = window.__recaptchaVerifier;
  
  if (!verifier) {
    throw new Error('reCAPTCHA no inicializado. Recargá la página e intentá de nuevo.');
  }

  const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, verifier);
  
  // Store confirmation result for later verification
  window.__confirmationResult = confirmationResult;
  
  return confirmationResult;
}

/**
 * Verify the SMS code entered by the user
 * @param code - 6-digit code from SMS
 * @returns Firebase User object on success
 */
export async function verifyCode(code: string) {
  const confirmationResult = window.__confirmationResult;
  
  if (!confirmationResult) {
    throw new Error('No hay verificación en curso. Solicitá un nuevo código.');
  }

  const result = await confirmationResult.confirm(code);
  return result.user;
}

export { auth, app, db, storage, messaging, onMessage };
