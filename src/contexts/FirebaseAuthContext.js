import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  createUserWithEmailAndPassword
} from 'firebase/auth';
import { auth } from '../config/firebase';
import firebaseCollections from '../services/firebaseCollections';

const FirebaseAuthContext = createContext();

export const useFirebaseAuth = () => {
  const context = useContext(FirebaseAuthContext);
  if (!context) {
    throw new Error('useFirebaseAuth must be used within a FirebaseAuthProvider');
  }
  return context;
};

export const FirebaseAuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  // Check if user is admin
  const checkAdminStatus = async (user) => {
    if (!user) {
      setIsAdmin(false);
      return false;
    }

    try {
      // Check if user email exists in admins collection
      const admins = await firebaseCollections.admins.getAll();
      const adminUser = admins.find(admin => admin.email === user.email);
      
      if (adminUser) {
        setIsAdmin(true);
        console.log('✅ User is admin:', user.email);
        return true;
      } else {
        setIsAdmin(false);
        console.log('❌ User is not admin:', user.email);
        return false;
      }
    } catch (error) {
      console.error('Error checking admin status:', error);
      setIsAdmin(false);
      return false;
    }
  };

  // Sign in with email and password
  const signIn = async (email, password) => {
    try {
      console.log('🔐 Attempting to sign in:', email);
      const result = await signInWithEmailAndPassword(auth, email, password);
      const isAdminUser = await checkAdminStatus(result.user);
      
      if (!isAdminUser) {
        await signOut(auth);
        throw new Error('Access denied. Admin privileges required.');
      }
      
      console.log('✅ Admin signed in successfully:', email);
      return result;
    } catch (error) {
      console.error('❌ Sign in error:', error);
      throw error;
    }
  };

  // Sign out
  const logout = async () => {
    try {
      await signOut(auth);
      setIsAdmin(false);
      console.log('✅ User signed out successfully');
    } catch (error) {
      console.error('❌ Sign out error:', error);
      throw error;
    }
  };

  // Create admin account (for initial setup)
  const createAdminAccount = async (email, password, adminData = {}) => {
    try {
      console.log('👤 Creating admin account:', email);
      
      // Create Firebase Auth user
      const result = await createUserWithEmailAndPassword(auth, email, password);
      
      // Add to admins collection
      await firebaseCollections.admins.create({
        email: email,
        uid: result.user.uid,
        role: 'admin',
        ...adminData
      });
      
      console.log('✅ Admin account created successfully:', email);
      return result;
    } catch (error) {
      console.error('❌ Error creating admin account:', error);
      throw error;
    }
  };

  // Alternative admin login using custom credentials (fallback)
  const adminLogin = async (username, password) => {
    try {
      console.log('🔐 Attempting admin login with username:', username);
      
      // Check against admins collection
      const admins = await firebaseCollections.admins.getAll();
      const admin = admins.find(a => a.username === username && a.password === password);
      
      if (admin) {
        // Create a mock user object for compatibility
        const mockUser = {
          uid: admin.id,
          email: admin.email || `${username}@admin.local`,
          displayName: admin.name || username,
          isCustomAuth: true
        };
        
        setCurrentUser(mockUser);
        setIsAdmin(true);
        
        // Store in localStorage for persistence
        localStorage.setItem('adminSession', JSON.stringify({
          user: mockUser,
          timestamp: Date.now()
        }));
        
        console.log('✅ Admin logged in successfully:', username);
        return { user: mockUser };
      } else {
        throw new Error('Invalid admin credentials');
      }
    } catch (error) {
      console.error('❌ Admin login error:', error);
      throw error;
    }
  };

  // Check for existing admin session
  const checkAdminSession = () => {
    try {
      const session = localStorage.getItem('adminSession');
      if (session) {
        const { user, timestamp } = JSON.parse(session);
        
        // Check if session is still valid (24 hours)
        const sessionAge = Date.now() - timestamp;
        const maxAge = 24 * 60 * 60 * 1000; // 24 hours
        
        if (sessionAge < maxAge) {
          setCurrentUser(user);
          setIsAdmin(true);
          console.log('✅ Restored admin session:', user.displayName);
          return true;
        } else {
          localStorage.removeItem('adminSession');
          console.log('⏰ Admin session expired');
        }
      }
    } catch (error) {
      console.error('Error checking admin session:', error);
      localStorage.removeItem('adminSession');
    }
    return false;
  };

  // Clear admin session
  const clearAdminSession = () => {
    localStorage.removeItem('adminSession');
    setCurrentUser(null);
    setIsAdmin(false);
  };

  useEffect(() => {
    console.log('🔄 Setting up Firebase auth state listener');
    
    // Check for existing admin session first
    const hasSession = checkAdminSession();
    
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log('🔄 Auth state changed:', user ? user.email : 'No user');
      
      if (user && !user.isCustomAuth) {
        // Firebase Auth user
        setCurrentUser(user);
        await checkAdminStatus(user);
      } else if (!hasSession) {
        // No Firebase user and no admin session
        setCurrentUser(null);
        setIsAdmin(false);
      }
      
      setLoading(false);
    });

    if (hasSession) {
      setLoading(false);
    }

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    isAdmin,
    loading,
    signIn,
    logout,
    adminLogin,
    createAdminAccount,
    clearAdminSession,
    isAuthenticated: !!currentUser && isAdmin
  };

  return (
    <FirebaseAuthContext.Provider value={value}>
      {children}
    </FirebaseAuthContext.Provider>
  );
};

export default FirebaseAuthContext;
