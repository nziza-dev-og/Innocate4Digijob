
"use client";

import type { User as FirebaseUser, AuthError } from "firebase/auth";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase/config";
import type { ReactNode} from 'react';
import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface AuthContextType {
  user: FirebaseUser | null;
  loading: boolean;
  error: AuthError | null;
  signUp: (email: string, password: string, fullName?: string, role?: string) => Promise<FirebaseUser | null>;
  signIn: (email: string, password: string) => Promise<FirebaseUser | null>;
  signOut: () => Promise<void>;
  isUserAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<AuthError | null>(null);
  const [isUserAdmin, setIsUserAdmin] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        // Check if user is admin
        const userDocRef = doc(db, "users", firebaseUser.uid);
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists() && userDocSnap.data().role === "admin") {
          setIsUserAdmin(true);
        } else {
          setIsUserAdmin(false);
        }
      } else {
        setUser(null);
        setIsUserAdmin(false);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, fullName?: string, role: string = "user") => {
    setLoading(true);
    setError(null);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;
      if (firebaseUser) {
        // Store additional user info in Firestore
        await setDoc(doc(db, "users", firebaseUser.uid), {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          fullName: fullName || "",
          role: role, // default role
          createdAt: new Date().toISOString(),
        });
      }
      setUser(firebaseUser);
      return firebaseUser;
    } catch (e) {
      setError(e as AuthError);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      setUser(userCredential.user);
      return userCredential.user;
    } catch (e) {
      setError(e as AuthError);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
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

  const value = { user, loading, error, signUp, signIn, signOut, isUserAdmin };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
