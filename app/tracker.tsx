// app/tracker.tsx
// PERSON 4 — Live Location Tracker screen
// Driver: uploads their GPS every 5 sec
// Passenger: watches driver location update in real time

import { useState, useEffect } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native'
import MapView, { Marker, Polyline } from 'react-native-maps'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { getAuth } from 'firebase/auth'
import { doc, onSnapshot } from 'firebase/firestore'
import { db } from '../firebase.config'
import { watchLocation } from '../services/location'
import { updateDriverLocation, listenToDriverLocation } from '../services/firestore'
import { UCLA, UI } from '../constants/Colors'

const { height } = Dimensions.get('window')

export default function TrackerScreen() {
  const { tripId } = useLocalSearchParams<{ tripId: string }>()
  const router = useRouter()
  const user   = getAuth().currentUser!

  const [myLocation, setMyLocation]         = useState<{ latitude: number; longitude: number } | null>(null)
  const [driverLocation, setDriverLocation] = useState<{ latitude: number; longitude: number } | null>(null)
  const [tripData, setTripData]             = useState<any>(null)
  const [userRole, setUserRole]             = useState<'driver' | 'passenger'>('passenger')

  // ── Load trip data ──
  useEffect(() => {
    if (!tripId) return
    const unsub = onSnapshot(doc(db, 'trips', tripId), snap => {
      const data = snap.data()
      setTripData(data)
      setUserRole(data?.userId === user.uid ? data?.role : 'passenger')
    })
    return unsub
  }, [tripId])

  // ── Watch MY location ──
  useEffect(() => {
    const stop = watchLocation((coords) => {
      setMyLocation(coords)

      // If I'm the driver, push location to Firestore
      if (userRole === 'driver' && tripId) {
        updateDriverLocation(tripId, coords.latitude, coords.longitude)
      }
    })
    return stop
  }, [userRole, tripId])

  // ── Passenger: listen to driver's location ──
  useEffect(() => {
    if (userRole !== 'passenger' || !tripId) return
    const unsub = listenToDriverLocation(tripId, (lat, lng) => {
      setDriverLocation({ latitude: lat, longitude: lng })
    })
    return unsub
  }, [userRole, tripId])

  const center = myLocation || { latitude: 34.0689, longitude: -118.4452 }

  return (
    <View style={styles.container}>
      {/* Blue top bar with driver info */}
      <View style={styles.topBar}>
        <Text style={styles.topLabel}>
          {userRole === 'driver' ? 'Your Passengers' : 'Your Driver'}
        </Text>
        <View style={styles.driverRow}>
          <View style={styles.driverAva}><Text style={{ fontSize: 20 }}>🧑</Text></View>
          <View style={{ flex: 1 }}>
            <Text style={styles.driverName}>
              {tripData?.username || 'Loading...'}
            </Text>
            <Text style={styles.driverSub}>
              Destination: {tripData?.destination || '—'}
            </Text>
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

      {/* MAP */}
      <MapView
        style={styles.map}
        region={{
          latitude:       center.latitude,
          longitude:      center.longitude,
          latitudeDelta:  0.02,
          longitudeDelta: 0.02,
        }}
        showsUserLocation={true}
        showsMyLocationButton={true}
      >
        {/* My pin */}
        {myLocation && (
          <Marker coordinate={myLocation} title="You" pinColor={UCLA.blue} />
        )}

        {/* Driver pin */}
        {driverLocation && (
          <Marker coordinate={driverLocation} title="Driver" pinColor={UCLA.gold} />
        )}

        {/* Route line between driver and me */}
        {myLocation && driverLocation && (
          <Polyline
            coordinates={[driverLocation, myLocation]}
            strokeColor={UCLA.blue}
            strokeWidth={4}
            lineDashPattern={[8, 4]}
          />
        )}
      </MapView>

      {/* ETA badge overlay */}
      <View style={styles.etaBadge}>
        <Text style={styles.etaNum}>~4 min</Text>
        <Text style={styles.etaLabel}>ETA away</Text>
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
  container:  { flex: 1, backgroundColor: UI.bg },
  topBar:     { backgroundColor: UCLA.blue, padding: 18, paddingTop: 52 },
  topLabel:   { fontFamily: 'Nunito-ExtraBold', fontSize: 11, color: 'rgba(255,255,255,0.5)', letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 12 },
  driverRow:  { backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 16, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)' },
  driverAva:  { width: 44, height: 44, borderRadius: 22, backgroundColor: UCLA.gold, alignItems: 'center', justifyContent: 'center' },
  driverName: { fontFamily: 'Nunito-ExtraBold', fontSize: 16, color: UI.white },
  driverSub:  { fontFamily: 'NunitoSans-Regular', fontSize: 12, color: 'rgba(255,255,255,0.5)', marginTop: 2 },
  actionBtns: { flexDirection: 'row', gap: 8 },
  iconBtn:    { width: 38, height: 38, borderRadius: 19, backgroundColor: 'rgba(255,255,255,0.12)', alignItems: 'center', justifyContent: 'center' },
  map:        { flex: 1 },
  etaBadge:   { position: 'absolute', top: 180, right: 16, backgroundColor: UCLA.blue, borderRadius: 14, padding: 12, shadowColor: UCLA.blue, shadowOpacity: 0.35, shadowRadius: 10, elevation: 6 },
  etaNum:     { fontFamily: 'Nunito-Black', fontSize: 20, color: UCLA.gold },
  etaLabel:   { fontFamily: 'Nunito-SemiBold', fontSize: 11, color: 'rgba(255,255,255,0.6)' },
  bottomBar:  { backgroundColor: UI.white, borderTopWidth: 1, borderTopColor: UI.border, flexDirection: 'row', padding: 14, gap: 10 },
  infoPill:   { flex: 1, backgroundColor: UI.bg, borderRadius: 12, padding: 11, borderWidth: 1.5, borderColor: UI.border },
  pillLabel:  { fontFamily: 'Nunito-ExtraBold', fontSize: 10, color: UI.soft, textTransform: 'uppercase', letterSpacing: 0.5 },
  pillVal:    { fontFamily: 'Nunito-ExtraBold', fontSize: 14, color: UI.charcoal, marginTop: 3 },
})
