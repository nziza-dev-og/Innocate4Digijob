
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

// Construct the full env var names expected in process.env
const fullEnvVarNames = requiredEnvVars.map(key => `NEXT_PUBLIC_FIREBASE_${key.replace(/([A-Z])/g, '_$1').toUpperCase()}`);
// Add any other non-Firebase config vars needed
fullEnvVarNames.push('NEXT_PUBLIC_ADMIN_SECRET_CODE');

// Check for missing variables
const missingEnvVars = fullEnvVarNames.filter(varName => !process.env[varName]);

if (missingEnvVars.length > 0) {
  const errorMessage = `Error: Missing critical environment variables: ${missingEnvVars.join(', ')}. Please ensure they are set in your .env file or deployment environment settings.`;
  console.error(errorMessage);
  // Throwing an error during build if critical Firebase vars are missing
  if (requiredEnvVars.some(key => `NEXT_PUBLIC_FIREBASE_${key.replace(/([A-Z])/g, '_$1').toUpperCase()}` in missingEnvVars.filter(v => v.startsWith("NEXT_PUBLIC_FIREBASE_")))) {
      // Only throw if essential Firebase config is missing
      if (typeof window === 'undefined') { // Throw only during build/server-side
          throw new Error(errorMessage);
      } else {
          // Log error prominently in the browser console
          console.error(errorMessage);
      }
  }
}

const firebaseConfig: FirebaseOptions = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET, // Ensure this matches .env (e.g., curblink.appspot.com)
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase
let app;
try {
  // Check if all necessary Firebase config keys have values
  const hasAllConfigKeys = requiredEnvVars
        .filter(key => key !== 'NEXT_PUBLIC_ADMIN_SECRET_CODE') // Exclude non-Firebase keys for this check
        .every(key => firebaseConfig[key as keyof FirebaseOptions]);

  if (!hasAllConfigKeys) {
      // Don't attempt initialization if core config is missing
      throw new Error("Firebase configuration is incomplete. Cannot initialize Firebase.");
  }
  
  app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
} catch (error) {
  console.error("Firebase initialization failed:", error instanceof Error ? error.message : error);
  // Avoid throwing here directly if client-side, let the app handle the missing connection gracefully.
  // But the build error indicates this needs fixing via environment variables.
  // The throw inside the missing variable check above should handle build failures.
  app = null; // Indicate that initialization failed
}

// Conditionally initialize Auth and Firestore only if app was successfully initialized
const auth = app ? getAuth(app) : null;
const db = app ? getFirestore(app) : null;

// Ensure auth and db are properly typed even when null
export { app, auth, db };
