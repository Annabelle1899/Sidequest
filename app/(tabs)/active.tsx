import { useState, useEffect, useCallback, useRef } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, RefreshControl } from 'react-native'
import { useRouter, useFocusEffect } from 'expo-router'
import { getAuth } from 'firebase/auth'
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore'
import { db } from '../../firebase.config'
import { getUserById, Trip } from '../../services/firestore'
import { UCLA, UI } from '../../constants/Colors'

export default function ActivePlansScreen() {
  const router = useRouter()
  const user   = getAuth().currentUser!

  const [trips, setTrips]        = useState<Trip[]>([])
  const [refreshing, setRefresh] = useState(false)
  const handledRef               = useRef<Set<string>>(new Set())

  useEffect(() => {
    // Real-time listener for all my trips
    const q = query(
      collection(db, 'trips'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    )
    const unsub = onSnapshot(q, async snap => {
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() } as Trip))
      setTrips(data)

      // Check for newly matched trips
      for (const change of snap.docChanges()) {
        if (change.type !== 'modified') continue
        const trip = { id: change.doc.id, ...change.doc.data() } as any
        if (trip.status !== 'matched') continue
        if (!trip.matchedWith || !trip.chatId) continue
        if (handledRef.current.has(trip.id)) continue
        const matchedAt = trip.updatedAt?.toMillis?.() || 0
        if (Date.now() - matchedAt > 30000) continue
        handledRef.current.add(trip.id)
        const matchProfile = await getUserById(trip.matchedWith)
        const matchDisplayName = matchProfile?.displayName || matchProfile?.username || 'Your Match'
        router.push({
          pathname: '/match',
          params: {
            matchUserId:   trip.matchedWith,
            matchUsername: matchDisplayName,
            destination:   trip.destination,
            pickupTime:    trip.pickupTime,
            duration:      trip.duration,
            chatId:        trip.chatId,
            tripId:        trip.id,
          },
        })
      }
    })
    return unsub
  }, [])

  const active = trips.filter(t => t.status === 'open' || t.status === 'matched')
  const past   = trips.filter(t => t.status === 'completed' || t.status === 'cancelled')

  const EMOJI: Record<string, string> = {
    'The Grove': '🛍️', 'Santa Monica Pier': '🎡', 'Venice Beach': '🌊',
    'Griffith Park': '🌳', 'LACMA': '🎭', 'Beverly Hills': '💎',
    'Disneyland': '🏰', 'Universal Studios': '🎢', 'Malibu Beach': '🏖️',
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Active Plans ⭐</Text>
        <Text style={styles.sub}>Your upcoming trips</Text>
      </View>
      <ScrollView
        contentContainerStyle={styles.body}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={async () => { setRefresh(true); setTimeout(() => setRefresh(false), 1000) }} tintColor={UCLA.blue} />}
      >
        {active.length === 0 && past.length === 0 && (
          <View style={styles.empty}>
            <Text style={{ fontSize: 40 }}>🗺️</Text>
            <Text style={styles.emptyText}>No active plans yet</Text>
            <Text style={styles.emptySub}>Plan a trip to get started!</Text>
            <TouchableOpacity style={styles.planBtn} onPress={() => router.push('/(tabs)/plan')}>
              <Text style={styles.planBtnText}>Plan a Trip →</Text>
            </TouchableOpacity>
          </View>
        )}

        {active.length > 0 && (
          <View>
            <Text style={styles.sectionLabel}>ACTIVE</Text>
            {active.map(trip => (
              <TouchableOpacity
                key={trip.id}
                style={styles.tripCard}
                onPress={() => trip.status === 'matched' && trip.chatId
                  ? router.push({ pathname: '/tracker', params: { tripId: trip.id } })
                  : null
                }
              >
                <View style={styles.tripEmoji}>
                  <Text style={{ fontSize: 28 }}>{EMOJI[trip.destination] || '🗺️'}</Text>
                </View>
                <View style={styles.tripInfo}>
                  <Text style={styles.tripDest}>{trip.destination}</Text>
                  <Text style={styles.tripMeta}>{trip.date} · {trip.pickupTime} · {trip.role}</Text>
                  <View style={[styles.badge, trip.status === 'matched' ? styles.badgeMatched : styles.badgeOpen]}>
                    <Text style={styles.badgeText}>{trip.status === 'matched' ? '✅ Matched' : '🔍 Looking...'}</Text>
                  </View>
                </View>
                {trip.status === 'matched' && <Text style={{ fontSize: 20 }}>→</Text>}
              </TouchableOpacity>
            ))}
          </View>
        )}

        {past.length > 0 && (
          <View>
            <Text style={styles.sectionLabel}>PAST</Text>
            {past.map(trip => (
              <View key={trip.id} style={[styles.tripCard, { opacity: 0.6 }]}>
                <View style={styles.tripEmoji}>
                  <Text style={{ fontSize: 28 }}>{EMOJI[trip.destination] || '🗺️'}</Text>
                </View>
                <View style={styles.tripInfo}>
                  <Text style={styles.tripDest}>{trip.destination}</Text>
                  <Text style={styles.tripMeta}>{trip.date} · {trip.pickupTime}</Text>
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{trip.status}</Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container:    { flex: 1, backgroundColor: UI.bg },
  header:       { backgroundColor: UCLA.blue, padding: 20, paddingTop: 56 },
  title:        { fontSize: 26, fontWeight: '900', color: UI.white },
  sub:          { fontSize: 14, color: 'rgba(255,255,255,0.65)', marginTop: 3 },
  body:         { padding: 20, gap: 14 },
  empty:        { alignItems: 'center', paddingVertical: 60, gap: 10 },
  emptyText:    { fontSize: 18, fontWeight: '700', color: UI.mid },
  emptySub:     { fontSize: 14, color: UI.soft },
  planBtn:      { marginTop: 8, height: 46, paddingHorizontal: 24, borderRadius: 23, backgroundColor: UCLA.blue, alignItems: 'center', justifyContent: 'center' },
  planBtnText:  { fontSize: 15, fontWeight: '800', color: UI.white },
  sectionLabel: { fontSize: 11, color: UI.soft, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 10 },
  tripCard:     { backgroundColor: UI.white, borderRadius: 16, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 10 },
  tripEmoji:    { width: 52, height: 52, borderRadius: 26, backgroundColor: UCLA.goldPale, alignItems: 'center', justifyContent: 'center' },
  tripInfo:     { flex: 1, gap: 4 },
  tripDest:     { fontSize: 16, fontWeight: '800', color: UI.charcoal },
  tripMeta:     { fontSize: 12, color: UI.soft },
  badge:        { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 3, borderRadius: 10, backgroundColor: UI.bg },
  badgeOpen:    { backgroundColor: UCLA.bluePale },
  badgeMatched: { backgroundColor: '#D1FAE5' },
  badgeText:    { fontSize: 11, fontWeight: '700', color: UI.mid },
})
