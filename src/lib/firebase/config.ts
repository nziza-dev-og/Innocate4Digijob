// Modified src/lib/firebase/config.ts with improved error handling and fallback

import { initializeApp, getApps, getApp, type FirebaseOptions } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Define the required environment variable keys
const requiredEnvVars: (keyof FirebaseOptions | 'NEXT_PUBLIC_ADMIN_SECRET_CODE')[] = [
  'apiKey',
  'authDomain',
  'projectId',
  'storageBucket',
  'messagingSenderId',
  'appId',
];

// Better error message function with instructions
const createErrorMessage = (missingVars: string[]) => {
  return `
Error: Missing critical environment variables: ${missingVars.join(', ')}. 
Please ensure they are set in your .env.local file or deployment environment settings.

To fix this:
1. Create a .env.local file in your project root
2. Add the missing variables with proper values from your Firebase console
3. Restart your development server
`;
};

// Construct the full env var names expected in process.env
const fullEnvVarNames = [
  ...requiredEnvVars
    .filter(key => key !== 'NEXT_PUBLIC_ADMIN_SECRET_CODE')
    .map(key => `NEXT_PUBLIC_FIREBASE_${key.replace(/([A-Z])/g, '_$1').toUpperCase()}`),
  'NEXT_PUBLIC_ADMIN_SECRET_CODE'
];

// Check for missing variables
const missingEnvVars = fullEnvVarNames.filter(varName => !process.env[varName]);

// Initialize Firebase with proper error handling
let app;
let auth = null;
let db = null;

// Only attempt Firebase initialization if we're in a browser environment 
// or if all required variables are present
const shouldInitializeFirebase = typeof window !== 'undefined' || missingEnvVars.length === 0;

if (missingEnvVars.length > 0) {
  const errorMessage = createErrorMessage(missingEnvVars);
  console.error(errorMessage);
  
  // Only throw during build/server-side for critical Firebase configurations
  if (typeof window === 'undefined') {
    // Use a non-blocking approach that allows development to continue
    // but makes the error very visible
    console.error('\x1b[31m%s\x1b[0m', 'FIREBASE CONFIG ERROR - FIX BEFORE DEPLOYMENT');
    
    // Option: uncomment to throw error and break build if you want to enforce this
    // throw new Error(errorMessage);
  }
} 

if (shouldInitializeFirebase) {
  try {
    const firebaseConfig: FirebaseOptions = {
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    };

    app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
    auth = getAuth(app);
    db = getFirestore(app);
  } catch (error) {
    console.error("Firebase initialization failed:", error instanceof Error ? error.message : error);
    // Keep app as undefined/null if initialization failed
  }
}

export { app, auth, db };