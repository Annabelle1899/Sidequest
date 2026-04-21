// services/auth.ts
// PERSON 1 — handles all login / signup / logout logic
// Called by: welcome.tsx, login.tsx, signup.tsx
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  signOut,
  onAuthStateChanged,
  User,
} from 'firebase/auth'
import { doc, setDoc, getDoc } from 'firebase/firestore'
import { getAuth } from 'firebase/auth'
import { db } from '../firebase.config'
import app from '../firebase.config'
const auth = getAuth(app)

// ─────────────────────────────────────────
// SIGN UP — creates account + saves profile
// ─────────────────────────────────────────
export async function signUp(
  email: string,
  password: string,
  username: string
): Promise<User> {
  // Validate UCLA email
  if (!email.endsWith('@g.ucla.edu') && !email.endsWith('@ucla.edu')) {
    throw new Error('Please use your UCLA email address (@g.ucla.edu)')
  }

  // Check username length
  if (username.length < 3) {
    throw new Error('Username must be at least 3 characters')
  }

  // 1. Create account in Firebase Auth (password is encrypted automatically)
  const result = await createUserWithEmailAndPassword(auth, email, password)

  // 2. Set display name
  await updateProfile(result.user, { displayName: username })

  // 3. Save user profile to Firestore database
  await setDoc(doc(db, 'users', result.user.uid), {
    uid:              result.user.uid,
    username:         username.toLowerCase(),
    displayName:      username,
    email,
    year:             '',          // e.g. "3rd Year"
    major:            '',          // e.g. "Computer Science"
    bio:              '',
    interests:        [],
    thingsWantToDo:   [],
    photoURL:         null,
    rating:           5.0,
    totalTrips:       0,
    role:             'both',      // 'passenger' | 'driver' | 'both'
    location:         null,
    createdAt:        new Date().toISOString(),
    isOnline:         true,
  })

  return result.user
}

// ─────────────────────────────────────────
// LOG IN
// ─────────────────────────────────────────
export async function logIn(email: string, password: string): Promise<User> {
  const result = await signInWithEmailAndPassword(auth, email, password)
  return result.user
}

// ─────────────────────────────────────────
// LOG OUT
// ─────────────────────────────────────────
export async function logOut(): Promise<void> {
  await signOut(auth)
}

// ─────────────────────────────────────────
// GET CURRENT USER PROFILE from Firestore
// ─────────────────────────────────────────
export async function getUserProfile(uid: string) {
  const snap = await getDoc(doc(db, 'users', uid))
  if (!snap.exists()) throw new Error('User profile not found')
  return snap.data()
}

// ─────────────────────────────────────────
// LISTEN to auth state changes
// Use this in _layout.tsx to redirect on login/logout
// ─────────────────────────────────────────
export function onAuthChange(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, callback)
}
