// app/(tabs)/home.tsx
// PERSON 2 — Home screen
// Features: GPS location, search bar, nearby Bruins, category filter, recommended trips

import { useState, useEffect, useCallback } from 'react'
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  TextInput, FlatList, RefreshControl,
} from 'react-native'
import { useRouter } from 'expo-router'
import { getAuth } from 'firebase/auth'
import { collection, query, where, onSnapshot } from 'firebase/firestore'
import { db } from '../../firebase.config'
import { saveMyLocation, getDistance, formatDistance } from '../../services/location'
import { getUserById, UserProfile } from '../../services/firestore'
import { UCLA, UI } from '../../constants/Colors'

// ── Static recommended destinations ──
const RECOMMENDATIONS = [
  { id: '1', name: 'Sawtelle Ramen',    category: 'Food',     emoji: '🍜', bg: '#FFF8CC', distance: '2.4 mi' },
  { id: '2', name: 'Venice Beach',      category: 'Places',   emoji: '🌊', bg: '#EBF4FB', distance: '4.1 mi' },
  { id: '3', name: 'Griffith Park',     category: 'Nature',   emoji: '🌳', bg: '#D1FAE5', distance: '8.2 mi' },
  { id: '4', name: 'The Grove',         category: 'Shopping', emoji: '🛍️', bg: '#FFF8CC', distance: '5.0 mi' },
  { id: '5', name: 'Santa Monica Pier', category: 'Fun',      emoji: '🎡', bg: '#EBF4FB', distance: '3.8 mi' },
  { id: '6', name: 'LACMA',            category: 'Culture',  emoji: '🎭', bg: '#EDE9FE', distance: '4.5 mi' },
  { id: '7', name: 'In-N-Out Burger',  category: 'Food',     emoji: '🍔', bg: '#FFF8CC', distance: '1.2 mi' },
  { id: '8', name: 'Runyon Canyon',    category: 'Nature',   emoji: '🏔️', bg: '#D1FAE5', distance: '6.3 mi' },
]

const CATEGORIES = ['All', 'Food', 'Places', 'Nature', 'Shopping', 'Culture', 'Fun']

export default function HomeScreen() {
  const router   = useRouter()
  const auth     = getAuth()
  const user     = auth.currentUser

  const [myLocation, setMyLocation]     = useState<{ latitude: number; longitude: number } | null>(null)
  const [nearbyUsers, setNearbyUsers]   = useState<UserProfile[]>([])
  const [searchText, setSearchText]     = useState('')
  const [activeCategory, setCategory]   = useState('All')
  const [refreshing, setRefreshing]     = useState(false)

  // ── On mount: get GPS + save to Firestore ──
  useEffect(() => {
    async function init() {
      if (!user) return
      const coords = await saveMyLocation(user.uid)
      if (coords) setMyLocation(coords)
    }
    init()
  }, [user])

  // ── Listen to nearby users in real time ──
  useEffect(() => {
    if (!user) return
    const q = query(collection(db, 'users'), where('uid', '!=', user.uid))
    const unsub = onSnapshot(q, snap => {
      const all = snap.docs.map(d => d.data() as UserProfile)
      // Filter to users within 15km who have a location
      const nearby = myLocation
        ? all.filter(u => u.location && getDistance(myLocation, u.location) < 15000)
        : all.filter(u => u.location)
      setNearbyUsers(nearby.slice(0, 8)) // show max 8
    })
    return unsub
  }, [user, myLocation])

  // ── Pull-to-refresh ──
  const onRefresh = useCallback(async () => {
    setRefreshing(true)
    if (user) await saveMyLocation(user.uid)
    setRefreshing(false)
  }, [user])

  // ── Filter recommendations by category + search ──
  const filtered = RECOMMENDATIONS.filter(r => {
    const matchCat    = activeCategory === 'All' || r.category === activeCategory
    const matchSearch = r.name.toLowerCase().includes(searchText.toLowerCase())
    return matchCat && matchSearch
  })

  return (
    <View style={styles.container}>
      {/* ── Blue Header ── */}
      <View style={styles.header}>
        <View style={styles.locRow}>
          <View style={styles.locDot} />
          <Text style={styles.locText}>
            {myLocation ? 'De Neve Dr, UCLA' : 'Getting location...'}
          </Text>
        </View>
        <Text style={styles.greeting}>
          What's your next{'\n'}<Text style={{ color: UCLA.gold }}>Sidequest?</Text> 🌟
        </Text>

        {/* Search bar */}
        <View style={styles.searchBar}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search destinations..."
            placeholderTextColor="rgba(255,255,255,0.55)"
            value={searchText}
            onChangeText={setSearchText}
          />
          {searchText.length > 0 && (
            <TouchableOpacity onPress={() => setSearchText('')}>
              <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 16 }}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={UCLA.blue} />}
      >
        {/* ── Categories ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Explore</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.catRow}>
              {CATEGORIES.map(cat => (
                <TouchableOpacity
                  key={cat}
                  style={[styles.catPill, activeCategory === cat && styles.catPillActive]}
                  onPress={() => setCategory(cat)}
                >
                  <Text style={[styles.catText, activeCategory === cat && styles.catTextActive]}>
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* ── Nearby Bruins ── */}
        <View style={styles.section}>
          <View style={styles.sectionRow}>
            <Text style={styles.sectionTitle}>Bruins nearby</Text>
            <Text style={styles.seeAll}>See all</Text>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.peopleRow}>
              {nearbyUsers.length === 0 ? (
                <Text style={{ color: UI.soft, fontSize: 13, fontFamily: 'NunitoSans-Regular' }}>
                  No Bruins nearby yet
                </Text>
              ) : (
                nearbyUsers.map(u => (
                  <TouchableOpacity key={u.uid} style={styles.personItem}>
                    <View style={styles.personAvatar}>
                      <Text style={{ fontSize: 26 }}>👤</Text>
                    </View>
                    <Text style={styles.personName} numberOfLines={1}>
                      {u.displayName?.split(' ')[0] || u.username}
                    </Text>
                  </TouchableOpacity>
                ))
              )}
            </View>
          </ScrollView>
        </View>

        {/* ── Recommended Destinations ── */}
        <View style={styles.section}>
          <View style={styles.sectionRow}>
            <Text style={styles.sectionTitle}>Recommended</Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/plan')}>
              <Text style={styles.seeAll}>Plan +</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.grid}>
            {filtered.map((item, i) => (
              <TouchableOpacity
                key={item.id}
                style={[styles.recCard, i === filtered.length - 1 && filtered.length % 2 !== 0 && styles.recCardWide]}
                onPress={() => router.push({ pathname: '/(tabs)/plan', params: { destination: item.name } })}
              >
                <View style={[styles.recThumb, { backgroundColor: item.bg }]}>
                  <Text style={{ fontSize: 38 }}>{item.emoji}</Text>
                </View>
                <View style={styles.recInfo}>
                  <Text style={styles.recName} numberOfLines={1}>{item.name}</Text>
                  <Text style={styles.recMeta}>{item.emoji} {item.category} · {item.distance}</Text>
                </View>
                <View style={styles.recTag}>
                  <Text style={styles.recTagText}>{item.category}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={{ height: 20 }} />
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container:      { flex: 1, backgroundColor: UI.bg },
  header:         { backgroundColor: UCLA.blue, padding: 20, paddingTop: 56 },
  locRow:         { flexDirection: 'row', alignItems: 'center', gap: 7, marginBottom: 6 },
  locDot:         { width: 8, height: 8, borderRadius: 4, backgroundColor: UCLA.gold },
  locText:        { fontFamily: 'Nunito-Bold', fontSize: 13, color: 'rgba(255,255,255,0.7)' },
  greeting:       { fontFamily: 'Nunito-Black', fontSize: 26, color: UI.white, lineHeight: 32 },
  searchBar:      { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 12, borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.25)', paddingHorizontal: 14, height: 46, marginTop: 14 },
  searchIcon:     { fontSize: 16 },
  searchInput:    { flex: 1, fontFamily: 'NunitoSans-Regular', fontSize: 14, color: UI.white },
  section:        { paddingHorizontal: 20, paddingTop: 20 },
  sectionRow:     { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  sectionTitle:   { fontFamily: 'Nunito-Black', fontSize: 18, color: UI.charcoal },
  seeAll:         { fontFamily: 'Nunito-Bold', fontSize: 13, color: UCLA.blue },
  catRow:         { flexDirection: 'row', gap: 10, paddingBottom: 2, paddingRight: 20 },
  catPill:        { height: 38, paddingHorizontal: 16, borderRadius: 19, backgroundColor: UI.white, borderWidth: 2, borderColor: UI.border, justifyContent: 'center' },
  catPillActive:  { backgroundColor: UCLA.blue, borderColor: UCLA.blue },
  catText:        { fontFamily: 'Nunito-Bold', fontSize: 13, color: UI.mid },
  catTextActive:  { color: UI.white },
  peopleRow:      { flexDirection: 'row', gap: 16, paddingBottom: 4, paddingRight: 20 },
  personItem:     { alignItems: 'center', gap: 6 },
  personAvatar:   { width: 62, height: 62, borderRadius: 31, borderWidth: 3, borderColor: UCLA.gold, backgroundColor: UCLA.bluePale, alignItems: 'center', justifyContent: 'center' },
  personName:     { fontFamily: 'Nunito-Bold', fontSize: 11.5, color: UI.mid, maxWidth: 62 },
  grid:           { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  recCard:        { width: '47%', borderRadius: 18, overflow: 'hidden', backgroundColor: UI.white, shadowColor: UCLA.blue, shadowOpacity: 0.08, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 3 },
  recCardWide:    { width: '100%' },
  recThumb:       { height: 118, alignItems: 'center', justifyContent: 'center' },
  recInfo:        { padding: 10 },
  recName:        { fontFamily: 'Nunito-ExtraBold', fontSize: 14, color: UI.charcoal },
  recMeta:        { fontFamily: 'NunitoSans-Regular', fontSize: 12, color: UI.soft, marginTop: 2 },
  recTag:         { position: 'absolute', top: 10, left: 10, backgroundColor: UCLA.gold, borderRadius: 8, paddingHorizontal: 9, paddingVertical: 3 },
  recTagText:     { fontFamily: 'Nunito-ExtraBold', fontSize: 11, color: UI.charcoal },
})
