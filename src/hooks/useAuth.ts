import { useEffect, useState } from "react";
import type { User } from "firebase/auth";
import { onAuthStateChanged, signInWithPopup, signOut } from "firebase/auth";
import { auth, googleProvider, isFirebaseConfigured } from "../lib/firebase";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(isFirebaseConfigured);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    if (!auth) {
      setAuthLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (nextUser) => {
      setUser(nextUser);
      setAuthLoading(false);
    });

    return unsubscribe;
  }, []);

  const handleSignIn = async () => {
    if (!auth || !googleProvider) {
      setAuthError("Firebase is not configured yet.");
      return;
    }

    try {
      setAuthError(null);
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Google sign-in failed:", error);
      setAuthError("Google sign-in did not complete. Please try again.");
    }
  };

  const handleSignOut = async () => {
    if (!auth) {
      return;
    }

    try {
      setAuthError(null);
      await signOut(auth);
    } catch (error) {
      console.error("Sign-out failed:", error);
      setAuthError("Could not sign out right now.");
    }
  };

  return {
    user,
    authLoading,
    authError,
    isFirebaseConfigured,
    signIn: handleSignIn,
    signOut: handleSignOut,
  };
}
