// src/hooks/useAuth.js
import { useCallback, useState, useEffect } from 'react';
import { getAuth, signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged } from 'firebase/auth';
import { signInAnonymousUser } from '../firebase';

export const useAuth = (setShowUserMenu) => {
  const [user, setUser] = useState(null);
  const [firstName, setFirstName] = useState('');
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const auth = getAuth();

  const handleLogin = useCallback(async () => {
    console.log('[AUTH_DEBUG] handleLogin called');
    const provider = new GoogleAuthProvider();
    provider.addScope('profile');
    provider.addScope('email');
    try {
      console.log('[AUTH_DEBUG] Attempting to sign in with popup');
      const result = await signInWithPopup(auth, provider);
      console.log('[AUTH_DEBUG] Sign in successful, user:', result.user);
      const user = result.user;
      const displayName = user.displayName || '';
      const firstName = displayName.split(' ')[0];
      setFirstName(firstName);
      setIsAuthenticated(true);
      console.log('[AUTH_DEBUG] Authentication state updated:', { firstName, isAuthenticated: true });
    } catch (error) {
      console.error('[AUTH_DEBUG] Error signing in with Google:', error);
      setIsAuthenticated(false);
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
    console.log('[AUTH_MENU_DEBUG] useAuth: Setting up auth state listener');
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      console.log('[AUTH_MENU_DEBUG] useAuth: Auth state changed:', {
        hasUser: !!firebaseUser,
        isAnonymous: firebaseUser?.isAnonymous,
        uid: firebaseUser?.uid
      });

      if (firebaseUser) {
        console.log('[AUTH_MENU_DEBUG] useAuth: Using existing user');
        setUser(firebaseUser);
        const displayName = firebaseUser.displayName || '';
        const firstName = displayName.split(' ')[0];
        setFirstName(firstName);
        setIsAuthenticated(true);
      } else {
        console.log('[AUTH_MENU_DEBUG] useAuth: No user, signing in anonymously');
        try {
          const anonymousUser = await signInAnonymousUser();
          console.log('[AUTH_MENU_DEBUG] useAuth: Anonymous sign in result:', {
            success: !!anonymousUser,
            uid: anonymousUser?.uid,
            isAnonymous: anonymousUser?.isAnonymous
          });
          setUser(anonymousUser);
          setFirstName('');
          setIsAuthenticated(false);
        } catch (error) {
          console.error('[AUTH_MENU_DEBUG] useAuth: Anonymous sign in error:', error);
          setIsAuthenticated(false);
        }
      }
      setLoading(false);
    });

    return () => {
      console.log('[AUTH_MENU_DEBUG] useAuth: Cleaning up auth state listener');
      unsubscribe();
    };
  }, [auth]);

  console.log('[AUTH_MENU_DEBUG] useAuth: Current auth state:', { user, isAuthenticated, firstName });

  return { user, firstName, loading, handleLogin, handleLogout, isAuthenticated };
};
