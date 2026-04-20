// app/(tabs)/plan.tsx
// PERSON 3 — Plan a Trip screen
// User fills in destination, date, time, role (passenger/driver), preferences
// On submit → saves trip to Firestore → runs matching → navigates to match.tsx

import { useState } from 'react'
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  TextInput, Alert, ActivityIndicator, KeyboardAvoidingView, Platform,
} from 'react-native'
import { useRouter, useLocalSearchParams } from 'expo-router'
import { getAuth } from 'firebase/auth'
import { createTrip } from '../../services/firestore'
import { findMatch, confirmMatch } from '../../services/matching'
import { createChat } from '../../services/firestore'
import { UCLA, UI } from '../../constants/Colors'

type Role        = 'passenger' | 'driver'
type GenderPref  = 'girls' | 'guys' | 'no_pref'

export default function PlanTripScreen() {
  const router  = useRouter()
  const params  = useLocalSearchParams()   // destination passed from home
  const auth    = getAuth()
  const user    = auth.currentUser!

  // ── Form state ──
  const [role, setRole]               = useState<Role>('passenger')
  const [destination, setDest]        = useState((params.destination as string) || '')
  const [date, setDate]               = useState('')
  const [pickupTime, setPickupTime]   = useState('10:00 AM')
  const [duration, setDuration]       = useState('Half-day')
  const [genderPref, setGenderPref]   = useState<GenderPref>('no_pref')
  const [peopleCount, setPeople]      = useState('1')
  // Driver only
  const [carCapacity, setCapacity]    = useState('4')
  const [freeSpots, setFreeSpots]     = useState('2')
  const [loading, setLoading]         = useState(false)

  const TIMES     = ['8:00 AM','9:00 AM','10:00 AM','11:00 AM','12:00 PM','2:00 PM','4:00 PM','6:00 PM']
  const DURATIONS = ['A few hours', 'Half-day', 'Full-day']

  async function handleMatch() {
    if (!destination || !date) {
      return Alert.alert('Missing Info', 'Please fill in destination and date.')
    }
    setLoading(true)
    try {
      // 1. Save this trip to Firestore
      const tripData = {
        userId:      user.uid,
        username:    user.displayName || '',
        userPhotoURL: user.photoURL,
        role, destination, date, pickupTime, duration, genderPref,
        peopleCount:  parseInt(peopleCount) || 1,
        carCapacity:  role === 'driver' ? parseInt(carCapacity) : undefined,
        freeSpots:    role === 'driver' ? parseInt(freeSpots) : undefined,
        destinationLat: 0,  // TODO: use Google Places for real lat/lng
        destinationLng: 0,
        status: 'open' as const,
      }
      const myTripId = await createTrip(tripData)

      // 2. Run matching algorithm
      const match = await findMatch({ ...tripData, id: myTripId })

      if (!match) {
        // No match found yet — go to active plans to wait
        Alert.alert('Posted!', 'No match yet. We\'ll notify you when someone matches!')
        router.push('/(tabs)/active')
        return
      }

      // 3. Create a chat room for the matched pair
      const chatId = await createChat(user.uid, match.userId, myTripId)

      // 4. Mark both trips as matched
      await confirmMatch(myTripId, match.id!, user.uid, match.userId, chatId)

      // 5. Navigate to match result screen
      router.push({
        pathname: '/match',
        params: {
          matchUserId:   match.userId,
          matchUsername: match.username,
          destination,
          pickupTime,
          duration,
          chatId,
          tripId: myTripId,
        },
      })
    } catch (err: any) {
      Alert.alert('Error', err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.header}>
        <Text style={styles.title}>Plan a Trip 🗺️</Text>
        <Text style={styles.sub}>Find your perfect travel companion</Text>
      </View>

      <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
        {/* Role Toggle */}
        <View style={styles.toggleWrap}>
          <View style={styles.toggle}>
            {(['passenger', 'driver'] as Role[]).map(r => (
              <TouchableOpacity
                key={r}
                style={[styles.toggleBtn, role === r && styles.toggleBtnActive]}
                onPress={() => setRole(r)}
              >
                <Text style={[styles.toggleText, role === r && styles.toggleTextActive]}>
                  {r === 'passenger' ? '🙋 Passenger' : '🚗 Driver'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Destination */}
        <Card title="Destination">
          <TextInput
            style={styles.input}
            value={destination}
            onChangeText={setDest}
            placeholder="Where are you going?"
          />
        </Card>

        {/* Date */}
        <Card title="Date">
          <TextInput
            style={styles.input}
            value={date}
            onChangeText={setDate}
            placeholder="e.g. 2025-04-20"
          />
        </Card>

        {/* Pickup Time */}
        <Card title="Pick-up Time">
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.optionRow}>
              {TIMES.map(t => (
                <TouchableOpacity
                  key={t}
                  style={[styles.optionPill, pickupTime === t && styles.optionPillActive]}
                  onPress={() => setPickupTime(t)}
                >
                  <Text style={[styles.optionText, pickupTime === t && styles.optionTextActive]}>{t}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </Card>

        {/* Duration */}
        <Card title="Planned Duration">
          <View style={styles.optionRow}>
            {DURATIONS.map(d => (
              <TouchableOpacity
                key={d}
                style={[styles.optionPill, duration === d && styles.optionPillActive]}
                onPress={() => setDuration(d)}
              >
                <Text style={[styles.optionText, duration === d && styles.optionTextActive]}>{d}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </Card>

        {/* Gender Preference */}
        <Card title="Gender Preference">
          <RadioGroup
            options={[
              { value: 'girls',   label: 'Girls 👩' },
              { value: 'guys',    label: 'Guys 👦' },
              { value: 'no_pref', label: 'No preference 🙌' },
            ]}
            selected={genderPref}
            onSelect={(v) => setGenderPref(v as GenderPref)}
          />
        </Card>

        {/* Passenger: people count */}
        {role === 'passenger' && (
          <Card title="People you're bringing">
            <TextInput
              style={styles.input}
              value={peopleCount}
              onChangeText={setPeople}
              placeholder="e.g. 2"
              keyboardType="numeric"
            />
          </Card>
        )}

        {/* Driver: capacity & free spots */}
        {role === 'driver' && (
          <>
            <Card title="Car Capacity">
              <RadioGroup
                options={[
                  { value: '3', label: '3 people' },
                  { value: '4', label: '4 people' },
                  { value: '5', label: '5 or more' },
                ]}
                selected={carCapacity}
                onSelect={setCapacity}
              />
            </Card>
            <Card title="Free Spots">
              <RadioGroup
                options={[
                  { value: '1', label: '1 spot' },
                  { value: '2', label: '2 spots' },
                  { value: '3', label: 'All spots' },
                ]}
                selected={freeSpots}
                onSelect={setFreeSpots}
              />
            </Card>
          </>
        )}

        {/* Submit */}
        <View style={{ padding: 20 }}>
          <TouchableOpacity
            style={[styles.matchBtn, loading && { opacity: 0.7 }]}
            onPress={handleMatch}
            disabled={loading}
          >
            {loading
              ? <ActivityIndicator color={UI.white} />
              : <Text style={styles.matchBtnText}>🔍  Find My Match</Text>}
          </TouchableOpacity>
        </View>
        <View style={{ height: 20 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

// ── Small reusable components ──
function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={cardStyles.wrap}>
      <Text style={cardStyles.title}>{title}</Text>
      {children}
    </View>
  )
}
const cardStyles = StyleSheet.create({
  wrap:  { backgroundColor: UI.white, borderRadius: 18, padding: 18, marginHorizontal: 20, marginBottom: 12, shadowColor: UCLA.blue, shadowOpacity: 0.07, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 2 },
  title: { fontFamily: 'Nunito-ExtraBold', fontSize: 11, color: UI.soft, textTransform: 'uppercase', letterSpacing: 0.7, marginBottom: 14 },
})

function RadioGroup({ options, selected, onSelect }: any) {
  return (
    <View style={{ gap: 9 }}>
      {options.map((o: any) => (
        <TouchableOpacity
          key={o.value}
          style={[radioStyles.option, selected === o.value && radioStyles.selected]}
          onPress={() => onSelect(o.value)}
        >
          <View style={[radioStyles.dot, selected === o.value && radioStyles.dotSelected]}>
            {selected === o.value && <View style={radioStyles.dotInner} />}
          </View>
          <Text style={radioStyles.label}>{o.label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  )
}
const radioStyles = StyleSheet.create({
  option:     { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 13, borderRadius: 12, borderWidth: 2, borderColor: UI.border, backgroundColor: UI.white },
  selected:   { borderColor: UCLA.gold, backgroundColor: UCLA.goldPale },
  dot:        { width: 20, height: 20, borderRadius: 10, borderWidth: 2.5, borderColor: UI.border, alignItems: 'center', justifyContent: 'center' },
  dotSelected:{ borderColor: UCLA.goldDark, backgroundColor: UCLA.gold },
  dotInner:   { width: 8, height: 8, borderRadius: 4, backgroundColor: UI.charcoal },
  label:      { fontFamily: 'Nunito-Bold', fontSize: 15, color: UI.charcoal },
})

const styles = StyleSheet.create({
  header:          { backgroundColor: UCLA.blue, padding: 20, paddingTop: 56 },
  title:           { fontFamily: 'Nunito-Black', fontSize: 26, color: UI.white },
  sub:             { fontFamily: 'NunitoSans-Regular', fontSize: 14, color: 'rgba(255,255,255,0.65)', marginTop: 3 },
  container:       { flex: 1, backgroundColor: UI.bg },
  toggleWrap:      { padding: 20, paddingBottom: 8 },
  toggle:          { flexDirection: 'row', backgroundColor: UCLA.bluePale, borderRadius: 12, borderWidth: 1.5, borderColor: UCLA.blueLight, padding: 4 },
  toggleBtn:       { flex: 1, height: 44, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  toggleBtnActive: { backgroundColor: UCLA.blue, shadowColor: UCLA.blue, shadowOpacity: 0.35, shadowRadius: 8, shadowOffset: { width: 0, height: 3 }, elevation: 4 },
  toggleText:      { fontFamily: 'Nunito-ExtraBold', fontSize: 14, color: UI.soft },
  toggleTextActive:{ color: UI.white },
  input:           { height: 52, borderRadius: 12, borderWidth: 2, borderColor: UCLA.goldLight, backgroundColor: UCLA.goldPale, paddingHorizontal: 16, fontFamily: 'NunitoSans-Regular', fontSize: 15, color: UI.charcoal },
  optionRow:       { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  optionPill:      { height: 38, paddingHorizontal: 14, borderRadius: 19, borderWidth: 2, borderColor: UI.border, backgroundColor: UI.white, justifyContent: 'center' },
  optionPillActive:{ borderColor: UCLA.gold, backgroundColor: UCLA.goldPale },
  optionText:      { fontFamily: 'Nunito-Bold', fontSize: 13, color: UI.mid },
  optionTextActive:{ color: UI.charcoal },
  matchBtn:        { height: 54, borderRadius: 14, backgroundColor: UCLA.blue, alignItems: 'center', justifyContent: 'center', shadowColor: UCLA.blue, shadowOpacity: 0.4, shadowRadius: 12, shadowOffset: { width: 0, height: 4 }, elevation: 6 },
  matchBtnText:    { fontFamily: 'Nunito-ExtraBold', fontSize: 16, color: UI.white },
})
