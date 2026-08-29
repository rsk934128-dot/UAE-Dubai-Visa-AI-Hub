import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  User, 
  onAuthStateChanged,
  signOut
} from 'firebase/auth';
import { doc, getDoc, onSnapshot } from 'firebase/firestore';
import { 
  auth, 
  db, 
  UserProfileData, 
  loginWithEmail as fbLoginWithEmail,
  registerWithEmail as fbRegisterWithEmail,
  loginWithGoogle as fbLoginWithGoogle,
  loginAnonymously as fbLoginAnonymously,
  logout as fbLogout,
  resetPassword as fbResetPassword
} from '../lib/firebase';

interface AuthContextType {
  user: User | null;
  userProfile: UserProfileData | null;
  loading: boolean;
  isAuthModalOpen: boolean;
  authModalMode: 'login' | 'register';
  openAuthModal: (mode?: 'login' | 'register') => void;
  closeAuthModal: () => void;
  loginWithEmail: (email: string, pass: string) => Promise<User>;
  registerWithEmail: (email: string, pass: string, name: string, agencyName?: string) => Promise<User>;
  loginWithGoogle: () => Promise<User>;
  loginAnonymously: () => Promise<User>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        // Set basic profile immediately
        setUserProfile({
          uid: currentUser.uid,
          email: currentUser.email,
          displayName: currentUser.displayName,
          photoURL: currentUser.photoURL,
          role: 'agent'
        });

        // Listen or fetch Firestore profile
        try {
          const userDocRef = doc(db, 'users', currentUser.uid);
          const unsubDoc = onSnapshot(userDocRef, (docSnap) => {
            if (docSnap.exists()) {
              const data = docSnap.data();
              setUserProfile(prev => ({
                ...prev,
                uid: currentUser.uid,
                email: data.email || currentUser.email,
                displayName: data.displayName || currentUser.displayName,
                agencyName: data.agencyName,
                role: data.role || 'agent',
                photoURL: data.photoURL || currentUser.photoURL
              }));
            }
          });
          return () => unsubDoc();
        } catch (err) {
          console.warn('Profile listener error:', err);
        }
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const openAuthModal = (mode: 'login' | 'register' = 'login') => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  const handleLoginWithEmail = async (email: string, pass: string) => {
    const res = await fbLoginWithEmail(email, pass);
    closeAuthModal();
    return res;
  };

  const handleRegisterWithEmail = async (email: string, pass: string, name: string, agencyName?: string) => {
    const res = await fbRegisterWithEmail(email, pass, name, agencyName);
    closeAuthModal();
    return res;
  };

  const handleLoginWithGoogle = async () => {
    const res = await fbLoginWithGoogle();
    closeAuthModal();
    return res;
  };

  const handleLoginAnonymously = async () => {
    const res = await fbLoginAnonymously();
    closeAuthModal();
    return res;
  };

  const handleLogout = async () => {
    await fbLogout();
    setUser(null);
    setUserProfile(null);
  };

  const handleResetPassword = async (email: string) => {
    await fbResetPassword(email);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        userProfile,
        loading,
        isAuthModalOpen,
        authModalMode,
        openAuthModal,
        closeAuthModal,
        loginWithEmail: handleLoginWithEmail,
        registerWithEmail: handleRegisterWithEmail,
        loginWithGoogle: handleLoginWithGoogle,
        loginAnonymously: handleLoginAnonymously,
        logout: handleLogout,
        resetPassword: handleResetPassword
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
