
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Log missing variables during build/runtime
const requiredEnvVars = [
  'NEXT_PUBLIC_FIREBASE_API_KEY',
  'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
  'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
  'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
  'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
  'NEXT_PUBLIC_FIREBASE_APP_ID',
];

const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingEnvVars.length > 0) {
  console.error(`Missing Firebase environment variables: ${missingEnvVars.join(', ')}`);
  // Optionally throw an error during server-side build if critical vars are missing
  // if (typeof window === 'undefined') { // Only throw during server-side execution/build
  //   throw new Error(`Missing Firebase environment variables: ${missingEnvVars.join(', ')}`);
  // }
}


const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET, // Ensure this matches .env
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Validate config values (basic check)
if (!firebaseConfig.apiKey) {
  console.error("Firebase API Key is missing in environment variables.");
  // Consider throwing an error depending on the environment
}

// Initialize Firebase
// Check if Firebase app has already been initialized to prevent errors
let app;
try {
  app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
} catch (error) {
  console.error("Firebase initialization failed:", error);
  // Handle the error appropriately, maybe rethrow or set app to null
  // Depending on how the rest of the app handles a missing Firebase connection
  throw new Error("Could not initialize Firebase. Check configuration and environment variables.");
}

const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
