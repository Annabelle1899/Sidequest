import { initializeApp } from 'firebase/app'
import { initializeAuth, getReactNativePersistence } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'
import AsyncStorage from '@react-native-async-storage/async-storage'

const firebaseConfig = {
  apiKey:            "AIzaSyD31ada6oGPiWmti6K66E-V7OerdXJFAg4",
  authDomain:        "sidequestsgroup3.firebaseapp.com",
  projectId:         "sidequestsgroup3",
  storageBucket:     "sidequestsgroup3.firebasestorage.app",
  messagingSenderId: "642661445081",
  appId:             "1:642661445081:web:a8ae187f256b31542c7dc8",
  measurementId:     "G-F70DE7KD19",
}

const app = initializeApp(firebaseConfig)

export const auth    = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
})
export const db      = getFirestore(app)
export const storage = getStorage(app)
export default app