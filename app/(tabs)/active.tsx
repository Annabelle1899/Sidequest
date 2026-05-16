// app/(tabs)/active.tsx
// PERSON 3 — Active Plans screen
// Shows current user's open/matched/completed trips from Firestore

import { useState, useEffect, useCallback } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, RefreshControl } from 'react-native'
import { useRouter, useFocusEffect } from 'expo-router'
import { getAuth } from 'firebase/auth'
import { getUserTrips, Trip } from '../../services/firestore'
import { UCLA, UI } from '../../constants/Colors'

export default function ActivePlansScreen() {
  const router = useRouter()
  const user   = getAuth().currentUser!

  const [trips, setTrips]         = useState<Trip[]>([])
  const [refreshing, setRefresh]  = useState(false)

  async function loadTrips() {
    const data = await getUserTrips(user.uid)
    setTrips(data)
  }

  useFocusEffect(useCallback(() => { loadTrips() }, []))

  const active = trips.filter(t => t.status === 'open' || t.status === 'matched')
  const past   = trips.filter(t => t.status === 'completed' || t.status === 'cancelled')

  const EMOJI: Record<string, string> = {
    'The Grove': '🛍️', 'Santa Monica Pier': '🎡', 'Venice Beach': '🌊',
    'Griffith Park': '🌳', 'Sawtelle Ramen': '🍜',
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>
          Active Plans{' '}
          <Text style={styles.badge}>{active.length}</Text>
        </Text>
        <Text style={styles.sub}>Your upcoming trips & quests</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.body}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={async () => { setRefresh(true); await loadTrips(); setRefresh(false) }} tintColor={UCLA.gold} />}
      >
        {active.length === 0 && (
          <View style={styles.empty}>
            <Text style={{ fontSize: 40 }}>🗺️</Text>
            <Text style={styles.emptyText}>No active trips yet</Text>
            <Text style={styles.emptySub}>Plan a trip to get started!</Text>
          </View>
        )}

        {active.map(trip => (
          <TouchableOpacity
            key={trip.id}
            style={styles.tripCard}
            onPress={() => trip.status === 'matched'
              ? router.push({ pathname: '/tracker', params: { tripId: trip.id } })
              : null
            }
          >
            <View style={[styles.tripIcon, { backgroundColor: UCLA.goldPale }]}>
              <Text style={{ fontSize: 24 }}>{EMOJI[trip.destination] || '📍'}</Text>
            </View>
            <View style={styles.tripInfo}>
              <Text style={styles.tripName}>{trip.destination}</Text>
              <Text style={styles.tripMeta}>{trip.date} · {trip.pickupTime}</Text>
            </View>
            <View style={[styles.statusBadge, trip.status === 'matched' ? styles.statusActive : styles.statusPending]}>
              <Text style={[styles.statusText, trip.status === 'matched' ? { color: '#15803D' } : { color: '#a07800' }]}>
                {trip.status === 'matched' ? 'Matched ✓' : 'Open'}
              </Text>
            </View>
          </TouchableOpacity>
        ))}

        {past.length > 0 && (
          <>
            <Text style={styles.sectionLabel}>Past Trips</Text>
            {past.map(trip => (
              <View key={trip.id} style={[styles.tripCard, { opacity: 0.55 }]}>
                <View style={[styles.tripIcon, { backgroundColor: '#F3F4F6' }]}>
                  <Text style={{ fontSize: 24 }}>{EMOJI[trip.destination] || '📍'}</Text>
                </View>
                <View style={styles.tripInfo}>
                  <Text style={styles.tripName}>{trip.destination}</Text>
                  <Text style={styles.tripMeta}>{trip.date} · {trip.duration}</Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: UI.bg }]}>
                  <Text style={[styles.statusText, { color: UI.soft }]}>Done</Text>
                </View>
              </View>
            ))}
          </>
        )}

        <TouchableOpacity style={styles.planBtn} onPress={() => router.push('/(tabs)/plan')}>
          <Text style={styles.planBtnText}>+ Plan a New Trip</Text>
        </TouchableOpacity>
        <View style={{ height: 20 }} />
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container:    { flex: 1, backgroundColor: UI.bg },
  header:       { backgroundColor: UCLA.blue, padding: 20, paddingTop: 56 },
  title:        { fontFamily: 'Nunito-Black', fontSize: 26, color: UI.white },
  badge:        { backgroundColor: UCLA.gold, color: UI.charcoal, borderRadius: 12, paddingHorizontal: 9, paddingVertical: 2, fontSize: 12, fontFamily: 'Nunito-ExtraBold' },
  sub:          { fontFamily: 'NunitoSans-Regular', fontSize: 14, color: 'rgba(255,255,255,0.65)', marginTop: 3 },
  body:         { padding: 20, gap: 12 },
  empty:        { alignItems: 'center', paddingVertical: 40, gap: 8 },
  emptyText:    { fontFamily: 'Nunito-Bold', fontSize: 18, color: UI.mid },
  emptySub:     { fontFamily: 'NunitoSans-Regular', fontSize: 14, color: UI.soft },
  sectionLabel: { fontFamily: 'Nunito-ExtraBold', fontSize: 14, color: UI.soft, marginTop: 8 },
  tripCard:     { backgroundColor: UI.white, borderRadius: 18, padding: 15, flexDirection: 'row', alignItems: 'center', gap: 13, shadowColor: UCLA.blue, shadowOpacity: 0.07, shadowRadius: 8, elevation: 2, borderWidth: 2, borderColor: 'transparent' },
  tripIcon:     { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  tripInfo:     { flex: 1 },
  tripName:     { fontFamily: 'Nunito-ExtraBold', fontSize: 16, color: UI.charcoal },
  tripMeta:     { fontFamily: 'NunitoSans-Regular', fontSize: 12, color: UI.soft, marginTop: 2 },
  statusBadge:  { height: 26, borderRadius: 13, paddingHorizontal: 11, justifyContent: 'center' },
  statusActive: { backgroundColor: '#DCFCE7' },
  statusPending:{ backgroundColor: UCLA.goldPale },
  statusText:   { fontFamily: 'Nunito-ExtraBold', fontSize: 11 },
  planBtn:      { height: 54, borderRadius: 14, backgroundColor: UCLA.gold, alignItems: 'center', justifyContent: 'center', marginTop: 8, shadowColor: UCLA.gold, shadowOpacity: 0.35, shadowRadius: 10, elevation: 4 },
  planBtnText:  { fontFamily: 'Nunito-ExtraBold', fontSize: 16, color: UI.charcoal },
})
