"use client";

import type { User as FirebaseUser, AuthError } from "firebase/auth";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  updateProfile,
} from "firebase/auth";
import { doc, setDoc, getDoc, updateDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase/config";
import type { ReactNode} from 'react';
import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

// Define a more specific User type for our app context if needed
export interface AppUser extends FirebaseUser {
  role?: string;
  // add other custom fields if necessary
}

interface AuthContextType {
  user: AppUser | null;
  loading: boolean;
  error: AuthError | null;
  signUp: (email: string, password: string, fullName?: string, role?: string) => Promise<{ user: FirebaseUser | null; error: AuthError | null }>;
  signIn: (email: string, password: string) => Promise<{ user: FirebaseUser | null; isAdmin: boolean; error: AuthError | null }>;
  signOut: () => Promise<void>;
  isUserAdmin: boolean;
  updateUserProfile: (displayName?: string, photoURL?: string) => Promise<{ success: boolean; error: Error | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<AuthError | null>(null);
  const [isUserAdmin, setIsUserAdmin] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!auth) {
      console.error("Firebase Auth is not initialized. Auth state listener will not run.");
      setUser(null);
      setIsUserAdmin(false);
      setLoading(false);
      return;
    }
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setLoading(true); 
      if (firebaseUser) {
        if (!db) { // Check if db is initialized before trying to use it
          console.error("Firestore is not initialized. Cannot fetch user role.");
          setUser({ ...firebaseUser, role: "user" } as AppUser); // Default to user if db is not available
          setIsUserAdmin(false);
          setLoading(false);
          return;
        }
        const userDocRef = doc(db, "users", firebaseUser.uid);
        const userDocSnap = await getDoc(userDocRef);
        let userRole = "user"; 
        if (userDocSnap.exists()) {
          userRole = userDocSnap.data().role || "user";
          setIsUserAdmin(userRole === "admin");
        } else {
          setIsUserAdmin(false); 
        }
        setUser({ ...firebaseUser, role: userRole } as AppUser);
      } else {
        setUser(null);
        setIsUserAdmin(false);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, fullName?: string, role: string = "user"): Promise<{ user: FirebaseUser | null; error: AuthError | null }> => {
    if (!auth || !db) {
      const err = { name: "Firebase Error", message: "Firebase not initialized.", code: "firebase-not-initialized" } as AuthError;
      setError(err);
      setLoading(false);
      return { user: null, error: err };
    }
    setLoading(true);
    setError(null);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;
      
      if (fullName) {
        await updateProfile(firebaseUser, { displayName: fullName });
      }

      await setDoc(doc(db, "users", firebaseUser.uid), {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: fullName || firebaseUser.email?.split('@')[0] || "User",
        photoURL: firebaseUser.photoURL || null,
        role: role, 
        createdAt: new Date().toISOString(),
      });
      
      setLoading(false);
      return { user: firebaseUser, error: null };
    } catch (e) {
      setError(e as AuthError);
      setLoading(false);
      return { user: null, error: e as AuthError };
    }
  };

  const signIn = async (email: string, password: string): Promise<{ user: FirebaseUser | null; isAdmin: boolean; error: AuthError | null }> => {
    if (!auth || !db) {
      const err = { name: "Firebase Error", message: "Firebase not initialized.", code: "firebase-not-initialized" } as AuthError;
      setError(err);
      setLoading(false);
      return { user: null, isAdmin: false, error: err };
    }
    setLoading(true);
    setError(null);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;
      let isAdmin = false;
      let userRole = "user";

      if (firebaseUser) {
        const userDocRef = doc(db, "users", firebaseUser.uid);
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists()) {
          userRole = userDocSnap.data().role || "user";
          isAdmin = userRole === "admin";
        }
        setUser({ ...firebaseUser, role: userRole } as AppUser); 
        setIsUserAdmin(isAdmin);
      }
      setLoading(false);
      return { user: firebaseUser, isAdmin, error: null };
    } catch (e) {
      setError(e as AuthError);
      setLoading(false);
      return { user: null, isAdmin: false, error: e as AuthError };
    }
  };

  const signOut = async () => {
    if (!auth) {
      const err = { name: "Firebase Error", message: "Firebase Auth not initialized.", code: "firebase-not-initialized" } as AuthError;
      setError(err);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await firebaseSignOut(auth);
      setUser(null);
      setIsUserAdmin(false);
      router.push("/login"); 
    } catch (e) {
      setError(e as AuthError);
    } finally {
      setLoading(false);
    }
  };

  const updateUserProfile = async (displayName?: string, photoURL?: string): Promise<{ success: boolean; error: Error | null }> => {
    if (!auth || !db) {
      setLoading(false);
      return { success: false, error: new Error("Firebase not initialized.") };
    }
    if (!auth.currentUser) {
      setLoading(false);
      return { success: false, error: new Error("No user logged in") };
    }
    setLoading(true);
    try {
      const updates: { displayName?: string; photoURL?: string } = {};
      if (displayName) updates.displayName = displayName;
      // Allow empty string for photoURL to remove it, but undefined means no change
      if (photoURL !== undefined) updates.photoURL = photoURL;


      if (Object.keys(updates).length > 0) {
        await updateProfile(auth.currentUser, updates);
      }

      const userDocRef = doc(db, "users", auth.currentUser.uid);
      // Ensure photoURL is set to null in Firestore if it's an empty string
      const firestoreUpdates = {...updates};
      if (firestoreUpdates.photoURL === "") {
          firestoreUpdates.photoURL = null;
      }
      await updateDoc(userDocRef, firestoreUpdates);

      setUser(prevUser => prevUser ? ({
        ...prevUser,
        displayName: displayName !== undefined ? displayName : prevUser.displayName,
        photoURL: photoURL !== undefined ? photoURL : prevUser.photoURL,
      }) as AppUser : null);

      setLoading(false);
      return { success: true, error: null };
    } catch (e) {
      setLoading(false);
      return { success: false, error: e as Error };
    }
  };


  const value = { user, loading, error, signUp, signIn, signOut, isUserAdmin, updateUserProfile };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

