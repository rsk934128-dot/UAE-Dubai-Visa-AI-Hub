import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signInAnonymously, 
  signOut, 
  onAuthStateChanged,
  updateProfile,
  sendPasswordResetEmail,
  User
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc, 
  collection, 
  query, 
  where, 
  getDocs, 
  deleteDoc, 
  onSnapshot, 
  serverTimestamp,
  orderBy
} from 'firebase/firestore';

// Firebase configuration from firebase-applet-config.json
const firebaseConfig = {
  projectId: "gen-lang-client-0749162647",
  appId: "1:243132451310:web:1783882b5bf86b7aa0e6ff",
  apiKey: "AIzaSyBZAGtx8aC0Bxm38hn1qIWVCpprb-MTJJs",
  authDomain: "gen-lang-client-0749162647.firebaseapp.com",
  storageBucket: "gen-lang-client-0749162647.firebasestorage.app",
  messagingSenderId: "243132451310",
  measurementId: "",
  oAuthClientId: "243132451310-tjnkgn3129qbco2cnfdfd4sv4g9ab8i6.apps.googleusercontent.com"
};

// Initialize Firebase safely
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

export interface UserProfileData {
  uid: string;
  email: string | null;
  displayName: string | null;
  agencyName?: string;
  role?: string;
  photoURL?: string | null;
  createdAt?: any;
  lastLoginAt?: any;
}

// Auth API Helpers
export const registerWithEmail = async (email: string, pass: string, name: string, agencyName?: string) => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
  const user = userCredential.user;
  
  if (name) {
    await updateProfile(user, { displayName: name });
  }

  // Persist user profile record to Firestore
  try {
    await setDoc(doc(db, 'users', user.uid), {
      uid: user.uid,
      email: user.email,
      displayName: name || user.displayName || 'Dubai Visa Applicant',
      agencyName: agencyName || '',
      role: 'agent',
      createdAt: serverTimestamp(),
      lastLoginAt: serverTimestamp()
    }, { merge: true });
  } catch (err) {
    console.warn('Firestore profile sync error (falling back to local profile):', err);
  }

  return user;
};

export const loginWithEmail = async (email: string, pass: string) => {
  const userCredential = await signInWithEmailAndPassword(auth, email, pass);
  const user = userCredential.user;

  try {
    await setDoc(doc(db, 'users', user.uid), {
      lastLoginAt: serverTimestamp()
    }, { merge: true });
  } catch (err) {
    console.warn('Firestore lastLogin update note:', err);
  }

  return user;
};

export const loginWithGoogle = async () => {
  try {
    const userCredential = await signInWithPopup(auth, googleProvider);
    const user = userCredential.user;

    try {
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        lastLoginAt: serverTimestamp()
      }, { merge: true });
    } catch (err) {
      console.warn('Firestore sync note:', err);
    }

    return user;
  } catch (err: any) {
    console.error('Google Sign-In popup error:', err);
    throw err;
  }
};

export const loginAnonymously = async () => {
  const userCredential = await signInAnonymously(auth);
  return userCredential.user;
};

export const logout = async () => {
  return await signOut(auth);
};

export const resetPassword = async (email: string) => {
  return await sendPasswordResetEmail(auth, email);
};

// Firestore User Cloud Data Storage Helpers
export const syncPassportAuditToCloud = async (userId: string, auditEntry: any) => {
  if (!userId) return;
  try {
    const auditId = auditEntry.id || `audit_${Date.now()}`;
    const auditRef = doc(db, 'users', userId, 'passport_audits', auditId);
    
    // Create clean payload (limit large image base64 if needed for Firestore limits)
    const cleanPayload = {
      ...auditEntry,
      id: auditId,
      syncedAt: new Date().toISOString()
    };

    await setDoc(auditRef, cleanPayload, { merge: true });
    return auditId;
  } catch (err) {
    console.warn('Failed to sync passport audit to Firestore:', err);
  }
};

export const getCloudPassportAudits = async (userId: string) => {
  if (!userId) return [];
  try {
    const auditsRef = collection(db, 'users', userId, 'passport_audits');
    const snapshot = await getDocs(auditsRef);
    const list: any[] = [];
    snapshot.forEach(docSnap => {
      list.push(docSnap.data());
    });
    return list;
  } catch (err) {
    console.warn('Error fetching cloud passport audits:', err);
    return [];
  }
};

export const deleteCloudPassportAudit = async (userId: string, auditId: string) => {
  if (!userId || !auditId) return;
  try {
    await deleteDoc(doc(db, 'users', userId, 'passport_audits', auditId));
  } catch (err) {
    console.warn('Error deleting cloud audit:', err);
  }
};

export const syncApplicationToCloud = async (userId: string, appData: any) => {
  if (!userId || !appData?.id) return;
  try {
    const appRef = doc(db, 'users', userId, 'visa_applications', appData.id);
    await setDoc(appRef, {
      ...appData,
      updatedAt: new Date().toISOString()
    }, { merge: true });
  } catch (err) {
    console.warn('Failed to sync application to cloud:', err);
  }
};

export const getCloudApplications = async (userId: string) => {
  if (!userId) return [];
  try {
    const appsRef = collection(db, 'users', userId, 'visa_applications');
    const snapshot = await getDocs(appsRef);
    const list: any[] = [];
    snapshot.forEach(docSnap => {
      list.push(docSnap.data());
    });
    return list;
  } catch (err) {
    console.warn('Error fetching cloud visa applications:', err);
    return [];
  }
};
