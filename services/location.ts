// services/location.ts
// PERSON 2 — GPS, distance, nearby users

import * as Location from 'expo-location'
import { updateUserLocation } from './firestore'

// ─────────────────────────────────────────
// REQUEST PERMISSION & GET CURRENT LOCATION
// ─────────────────────────────────────────
export async function getCurrentLocation(): Promise<{ latitude: number; longitude: number } | null> {
  const { status } = await Location.requestForegroundPermissionsAsync()
  if (status !== 'granted') {
    console.warn('Location permission denied')
    return null
  }
  const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced })
  return { latitude: loc.coords.latitude, longitude: loc.coords.longitude }
}

// ─────────────────────────────────────────
// SAVE MY LOCATION to Firestore
// Call this when app opens so others can find you
// ─────────────────────────────────────────
export async function saveMyLocation(uid: string) {
  const coords = await getCurrentLocation()
  if (!coords) return null
  await updateUserLocation(uid, coords.latitude, coords.longitude)
  return coords
}

// ─────────────────────────────────────────
// DISTANCE between two coordinates (meters)
// Uses Haversine formula
// ─────────────────────────────────────────
export function getDistance(
  a: { latitude: number; longitude: number },
  b: { latitude: number; longitude: number }
): number {
  const R = 6371000 // Earth radius in meters
  const lat1 = toRad(a.latitude)
  const lat2 = toRad(b.latitude)
  const dLat = toRad(b.latitude - a.latitude)
  const dLng = toRad(b.longitude - a.longitude)

  const x =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2

  return R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x))
}

function toRad(deg: number) { return (deg * Math.PI) / 180 }

// ─────────────────────────────────────────
// FORMAT distance nicely for display
// ─────────────────────────────────────────
export function formatDistance(meters: number): string {
  if (meters < 1000) return `${Math.round(meters)} m`
  return `${(meters / 1609.34).toFixed(1)} mi`
}

// ─────────────────────────────────────────
// WATCH position continuously (for tracker)
// Returns a cleanup function — call it to stop watching
// ─────────────────────────────────────────
export function watchLocation(
  callback: (coords: { latitude: number; longitude: number }) => void
): () => void {
  let subscription: Location.LocationSubscription | null = null

  Location.watchPositionAsync(
    { accuracy: Location.Accuracy.High, timeInterval: 5000, distanceInterval: 10 },
    (loc) => callback({ latitude: loc.coords.latitude, longitude: loc.coords.longitude })
  ).then(sub => { subscription = sub })

  return () => subscription?.remove()
}
