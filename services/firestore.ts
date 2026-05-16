// services/firestore.ts
// SHARED — all team members import from here for database operations
// Covers: users, trips, chats, messages

import {
  doc, getDoc, setDoc, updateDoc, deleteDoc,
  collection, addDoc, getDocs, query,
  where, orderBy, onSnapshot, serverTimestamp,
  GeoPoint, Timestamp,
} from 'firebase/firestore'
import { db } from '../firebase.config'

// ═══════════════════════════════════════════
// TYPES — shared data shapes across the app
// ═══════════════════════════════════════════

export type UserProfile = {
  uid: string
  username: string
  displayName: string
  email: string
  year: string
  major: string
  bio: string
  interests: string[]
  photoURL: string | null
  rating: number
  totalTrips: number
  location: { latitude: number; longitude: number } | null
  createdAt: string
}

export type Trip = {
  id?: string
  userId: string
  username: string
  userPhotoURL: string | null
  role: 'passenger' | 'driver'
  destination: string
  destinationLat: number
  destinationLng: number
  date: string          // ISO string
  pickupTime: string    // e.g. "10:00 AM"
  duration: string      // e.g. "Half-day"
  genderPref: 'girls' | 'guys' | 'no_pref'
  peopleCount: number
  // Driver only:
  carCapacity?: number
  freeSpots?: number
  status: 'open' | 'matched' | 'completed' | 'cancelled'
  matchedWith?: string  // uid of matched user
  chatId?: string
  createdAt: any
}

export type Message = {
  id?: string
  text: string
  senderId: string
  senderName: string
  createdAt: any
  read: boolean
}

// ═══════════════════════════════════════════
// USER OPERATIONS
// ═══════════════════════════════════════════

export async function updateUserProfile(uid: string, data: Partial<UserProfile>) {
  await updateDoc(doc(db, 'users', uid), data)
}

export async function getUserById(uid: string): Promise<UserProfile | null> {
  const snap = await getDoc(doc(db, 'users', uid))
  return snap.exists() ? (snap.data() as UserProfile) : null
}

// ═══════════════════════════════════════════
// TRIP OPERATIONS  (Person 3 uses these)
// ═══════════════════════════════════════════

export async function createTrip(tripData: Omit<Trip, 'id' | 'createdAt'>): Promise<string> {
  const ref = await addDoc(collection(db, 'trips'), {
    ...tripData,
    createdAt: serverTimestamp(),
  })
  return ref.id
}

export async function getUserTrips(uid: string): Promise<Trip[]> {
  const q = query(
    collection(db, 'trips'),
    where('userId', '==', uid),
    orderBy('createdAt', 'desc')
  )
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as Trip))
}

export async function updateTripStatus(tripId: string, status: Trip['status']) {
  await updateDoc(doc(db, 'trips', tripId), { status })
}

export async function getOpenTrips(role: 'passenger' | 'driver', destination: string): Promise<Trip[]> {
  const oppositeRole = role === 'passenger' ? 'driver' : 'passenger'
  const q = query(
    collection(db, 'trips'),
    where('role', '==', oppositeRole),
    where('status', '==', 'open'),
    where('destination', '==', destination)
  )
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as Trip))
}

// ═══════════════════════════════════════════
// CHAT OPERATIONS  (Person 4 uses these)
// ═══════════════════════════════════════════

export async function createChat(userAId: string, userBId: string, tripId: string, destination?: string): Promise<string> {
  const ref = await addDoc(collection(db, 'chats'), {
    participants: [userAId, userBId],
    tripId,
    destination: destination || "",
    lastMessage: '',
    lastMessageAt: serverTimestamp(),
    createdAt: serverTimestamp(),
  })
  return ref.id
}

export async function sendMessage(chatId: string, message: Omit<Message, 'id' | 'createdAt'>) {
  // Add the message
  await addDoc(collection(db, 'chats', chatId, 'messages'), {
    ...message,
    createdAt: serverTimestamp(),
  })
  // Update last message on the chat doc
  await updateDoc(doc(db, 'chats', chatId), {
    lastMessage: message.text,
    lastSenderId: message.senderId,
    lastMessageAt: serverTimestamp(),
  })
}

export function listenToMessages(chatId: string, callback: (msgs: Message[]) => void) {
  const q = query(
    collection(db, 'chats', chatId, 'messages'),
    orderBy('createdAt', 'asc')
  )
  return onSnapshot(q, snap => {
    callback(snap.docs.map(d => ({ id: d.id, ...d.data() } as Message)))
  })
}

export async function getUserChats(uid: string) {
  const q = query(
    collection(db, 'chats'),
    where('participants', 'array-contains', uid),
    orderBy('lastMessageAt', 'desc')
  )
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

// ═══════════════════════════════════════════
// LOCATION OPERATIONS  (Person 2 & 4 use)
// ═══════════════════════════════════════════

export async function updateUserLocation(uid: string, lat: number, lng: number) {
  await updateDoc(doc(db, 'users', uid), {
    location: { latitude: lat, longitude: lng },
    locationUpdatedAt: new Date().toISOString(),
  })
}

export async function updateDriverLocation(tripId: string, lat: number, lng: number) {
  await updateDoc(doc(db, 'trips', tripId), {
    driverLat: lat,
    driverLng: lng,
    driverLocationUpdatedAt: serverTimestamp(),
  })
}

export function listenToDriverLocation(
  tripId: string,
  callback: (lat: number, lng: number) => void
) {
  return onSnapshot(doc(db, 'trips', tripId), snap => {
    const data = snap.data()
    if (data?.driverLat && data?.driverLng) {
      callback(data.driverLat, data.driverLng)
    }
  })
}
