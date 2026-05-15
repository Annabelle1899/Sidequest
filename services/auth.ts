// services/auth.ts
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  signOut,
  onAuthStateChanged,
  sendEmailVerification,
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
  if (!email.endsWith('@g.ucla.edu') && !email.endsWith('@ucla.edu')) {
    throw new Error('Please use your UCLA email address (@g.ucla.edu)')
  }
  if (username.length < 3) {
    throw new Error('Username must be at least 3 characters')
  }

  const result = await createUserWithEmailAndPassword(auth, email, password)

  await updateProfile(result.user, { displayName: username })

  // Send verification email to UCLA inbox
  await sendEmailVerification(result.user)

  await setDoc(doc(db, 'users', result.user.uid), {
    uid:            result.user.uid,
    username:       username.toLowerCase(),
    displayName:    username,
    email,
    year:           '',
    major:          '',
    bio:            '',
    interests:      [],
    thingsWantToDo: [],
    photoURL:       null,
    rating:         5.0,
    totalTrips:     0,
    role:           'both',
    location:       null,
    createdAt:      new Date().toISOString(),
    isOnline:       true,
  })

  return result.user
}

// ─────────────────────────────────────────
// LOG IN
// ─────────────────────────────────────────
export async function logIn(email: string, password: string): Promise<User> {
  const result = await signInWithEmailAndPassword(auth, email, password)

  // Check if email is verified
  if (!result.user.emailVerified) {
    await signOut(auth)
    throw new Error('Please verify your UCLA email before logging in. Check your inbox!')
  }

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
// ─────────────────────────────────────────
export function onAuthChange(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, callback)
}
