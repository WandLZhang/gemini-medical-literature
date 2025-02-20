// src/hooks/useAuth.js
import { useCallback, useState, useEffect } from 'react';
import { getAuth, signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged } from 'firebase/auth';
import { signInAnonymousUser } from '../firebase';

export const useAuth = (setShowUserMenu) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const auth = getAuth();

  const isAuthenticated = useCallback(() => {
    return user && !user.isAnonymous;
  }, [user]);

  const handleLogin = useCallback(async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error('Error signing in with Google:', error);
    }
  }, [auth]);

  const handleLogout = useCallback(async () => {
    try {
      await signOut(auth);
      setShowUserMenu(false);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  }, [auth, setShowUserMenu]);

  // Set up auth state listener
  useEffect(() => {
    console.log('[AUTH_DEBUG] Setting up auth state listener');
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      console.log('[AUTH_DEBUG] Auth state changed:', {
        hasUser: !!firebaseUser,
        isAnonymous: firebaseUser?.isAnonymous,
        uid: firebaseUser?.uid
      });

      if (firebaseUser) {
        console.log('[AUTH_DEBUG] Using existing user');
        setUser(firebaseUser);
      } else {
        console.log('[AUTH_DEBUG] No user, signing in anonymously');
        try {
          const anonymousUser = await signInAnonymousUser();
          console.log('[AUTH_DEBUG] Anonymous sign in result:', {
            success: !!anonymousUser,
            uid: anonymousUser?.uid,
            isAnonymous: anonymousUser?.isAnonymous
          });
          setUser(anonymousUser);
        } catch (error) {
          console.error('[AUTH_DEBUG] Anonymous sign in error:', error);
        }
      }
      setLoading(false);
    });

    return () => {
      console.log('[AUTH_DEBUG] Cleaning up auth state listener');
      unsubscribe();
    };
  }, [auth]);

  return { user, loading, handleLogin, handleLogout, isAuthenticated };
};
