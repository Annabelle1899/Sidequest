import { initializeApp, getApps } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'

const firebaseConfig = {
  apiKey:            "AIzaSyD31ada6oGPiWmti6K66E-V7OerdXJFAg4",
  authDomain:        "sidequestsgroup3.firebaseapp.com",
  projectId:         "sidequestsgroup3",
  storageBucket:     "sidequestsgroup3.firebasestorage.app",
  messagingSenderId: "642661445081",
  appId:             "1:642661445081:web:a8ae187f256b31542c7dc8",
  measurementId:     "G-F70DE7KD19",
}

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]
export const auth    = getAuth(app)
export const db      = getFirestore(app)
export const storage = getStorage(app)
export default app
