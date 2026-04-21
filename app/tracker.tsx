// app/tracker.tsx
// PERSON 4 — Live Location Tracker screen

import { useState, useEffect } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { getAuth } from 'firebase/auth'
import { doc, onSnapshot } from 'firebase/firestore'
import { db } from '../firebase.config'
import { updateDriverLocation, listenToDriverLocation } from '../services/firestore'
import { UCLA, UI } from '../constants/Colors'

export default function TrackerScreen() {
  const { tripId } = useLocalSearchParams<{ tripId: string }>()
  const router = useRouter()
  const user = getAuth().currentUser!

  const [tripData, setTripData] = useState<any>(null)
  const [driverLocation, setDriverLocation] = useState<{ latitude: number; longitude: number } | null>(null)
  const [userRole, setUserRole] = useState<'driver' | 'passenger'>('passenger')

  useEffect(() => {
    if (!tripId) return
    const unsub = onSnapshot(doc(db, 'trips', tripId), snap => {
      const data = snap.data()
      setTripData(data)
      setUserRole(data?.userId === user?.uid ? data?.role : 'passenger')
    })
    return unsub
  }, [tripId])

  useEffect(() => {
    if (userRole !== 'passenger' || !tripId) return
    const unsub = listenToDriverLocation(tripId, (lat, lng) => {
      setDriverLocation({ latitude: lat, longitude: lng })
    })
    return unsub
  }, [userRole, tripId])

  return (
    <View style={styles.container}>
      {/* Blue top bar */}
      <View style={styles.topBar}>
        <Text style={styles.topLabel}>
          {userRole === 'driver' ? 'Your Passengers' : 'Your Driver'}
        </Text>
        <View style={styles.driverRow}>
          <View style={styles.driverAva}><Text style={{ fontSize: 20 }}>🧑</Text></View>
          <View style={{ flex: 1 }}>
            <Text style={styles.driverName}>{tripData?.username || 'Loading...'}</Text>
            <Text style={styles.driverSub}>Destination: {tripData?.destination || '—'}</Text>
          </View>
          <View style={styles.actionBtns}>
            <TouchableOpacity style={styles.iconBtn} onPress={() => router.push('/(tabs)/profile')}>
              <Text>👤</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconBtn} onPress={() => router.push({ pathname: '/chat/[id]', params: { id: tripData?.chatId } })}>
              <Text>💬</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Map placeholder for web */}
      <View style={styles.mapPlaceholder}>
        <Text style={styles.mapEmoji}>🗺️</Text>
        <Text style={styles.mapText}>Live Map</Text>
        <Text style={styles.mapSub}>
          {driverLocation
            ? `Driver at ${driverLocation.latitude.toFixed(4)}, ${driverLocation.longitude.toFixed(4)}`
            : 'Waiting for driver location...'}
        </Text>
        <View style={styles.etaBadge}>
          <Text style={styles.etaNum}>~4 min</Text>
          <Text style={styles.etaLabel}>ETA away</Text>
        </View>
      </View>

      {/* Bottom info pills */}
      <View style={styles.bottomBar}>
        <View style={styles.infoPill}>
          <Text style={styles.pillLabel}>Destination</Text>
          <Text style={styles.pillVal} numberOfLines={1}>{tripData?.destination || '—'}</Text>
        </View>
        <View style={styles.infoPill}>
          <Text style={styles.pillLabel}>Pickup Time</Text>
          <Text style={styles.pillVal}>{tripData?.pickupTime || '—'}</Text>
        </View>
        <TouchableOpacity style={[styles.infoPill, { backgroundColor: UCLA.goldPale, borderColor: UCLA.goldLight }]}>
          <Text style={styles.pillLabel}>Pickup</Text>
          <Text style={[styles.pillVal, { color: UCLA.blue, fontSize: 13 }]}>Modify ✏️</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container:        { flex: 1, backgroundColor: UI.bg },
  topBar:           { backgroundColor: UCLA.blue, padding: 18, paddingTop: 52 },
  topLabel:         { fontSize: 11, color: 'rgba(255,255,255,0.5)', letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 12 },
  driverRow:        { backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 16, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)' },
  driverAva:        { width: 44, height: 44, borderRadius: 22, backgroundColor: UCLA.gold, alignItems: 'center', justifyContent: 'center' },
  driverName:       { fontSize: 16, fontWeight: '800', color: UI.white },
  driverSub:        { fontSize: 12, color: 'rgba(255,255,255,0.5)', marginTop: 2 },
  actionBtns:       { flexDirection: 'row', gap: 8 },
  iconBtn:          { width: 38, height: 38, borderRadius: 19, backgroundColor: 'rgba(255,255,255,0.12)', alignItems: 'center', justifyContent: 'center' },
  mapPlaceholder:   { flex: 1, backgroundColor: '#d8eaf5', alignItems: 'center', justifyContent: 'center', gap: 10 },
  mapEmoji:         { fontSize: 60 },
  mapText:          { fontSize: 22, fontWeight: '800', color: UCLA.blue },
  mapSub:           { fontSize: 14, color: UI.soft, textAlign: 'center', paddingHorizontal: 20 },
  etaBadge:         { backgroundColor: UCLA.blue, borderRadius: 14, padding: 12, marginTop: 10 },
  etaNum:           { fontSize: 20, fontWeight: '900', color: UCLA.gold, textAlign: 'center' },
  etaLabel:         { fontSize: 11, color: 'rgba(255,255,255,0.6)', textAlign: 'center' },
  bottomBar:        { backgroundColor: UI.white, borderTopWidth: 1, borderTopColor: UI.border, flexDirection: 'row', padding: 14, gap: 10 },
  infoPill:         { flex: 1, backgroundColor: UI.bg, borderRadius: 12, padding: 11, borderWidth: 1.5, borderColor: UI.border },
  pillLabel:        { fontSize: 10, color: UI.soft, textTransform: 'uppercase', letterSpacing: 0.5 },
  pillVal:          { fontSize: 14, fontWeight: '700', color: UI.charcoal, marginTop: 3 },
})
