import { useState, useEffect } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Alert, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native'
import { useRouter, useLocalSearchParams } from 'expo-router'
import { getAuth } from 'firebase/auth'
import { createTrip, createChat, getUserById } from '../../services/firestore'
import { findMatch, confirmMatch } from '../../services/matching'
import { UCLA, UI } from '../../constants/Colors'

type Role = 'passenger' | 'driver'
type GenderPref = 'girls' | 'guys' | 'no_pref'

export default function PlanTripScreen() {
  const router = useRouter()
  const params = useLocalSearchParams()
  const user = getAuth().currentUser!

  const [role, setRole] = useState<Role>('passenger')
  const [destination, setDest] = useState('')
  const [date, setDate] = useState('')
  const [pickupTime, setPickupTime] = useState('10:00 AM')
  const [duration, setDuration] = useState('Half-day')
  const [genderPref, setGenderPref] = useState<GenderPref>('no_pref')
  const [peopleCount, setPeople] = useState('1')
  const [carCapacity, setCapacity] = useState('4')
  const [freeSpots, setFreeSpots] = useState('2')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setDest((params.destination as string) || '')
  }, [params.destination, params.t])

  const today = new Date().toLocaleDateString('en-CA', { timeZone: 'America/Los_Angeles' })
  const TIMES = ['8:00 AM','9:00 AM','10:00 AM','11:00 AM','12:00 PM','2:00 PM','4:00 PM','6:00 PM']
  const DURATIONS = ['A few hours', 'Half-day', 'Full-day']

  async function handleMatch() {
    if (!destination || !date) {
      return Alert.alert('Missing Info', 'Please fill in destination and date.')
    }
    if (date < today) {
      return Alert.alert('Invalid Date', 'Please select a future date!')
    }
    setLoading(true)
    try {
      const tripData = {
        userId: user.uid,
        username: user.displayName || '',
        userPhotoURL: user.photoURL,
        role, destination, date, pickupTime, duration, genderPref,
        peopleCount: parseInt(peopleCount) || 1,
        carCapacity: role === 'driver' ? parseInt(carCapacity) : null,
        freeSpots: role === 'driver' ? parseInt(freeSpots) : null,
        destinationLat: 0,
        destinationLng: 0,
        status: 'open' as const,
      }
      const myTripId = await createTrip(tripData)
      const match = await findMatch({ ...tripData, id: myTripId })
      if (!match) {
        Alert.alert('Posted!', "No match yet. We'll notify you when someone matches!")
        router.push('/(tabs)/active')
        return
      }
      const chatId = await createChat(user.uid, match.userId, myTripId, destination)
      await confirmMatch(myTripId, match.id!, user.uid, match.userId, chatId)
      const matchProfile = await getUserById(match.userId)
      const matchDisplayName = matchProfile?.displayName || matchProfile?.username || match.username
      router.push({
        pathname: '/match',
        params: {
          matchUserId: match.userId,
          matchUsername: matchDisplayName,
          destination, pickupTime, duration, chatId,
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
        <Text style={styles.title}>Plan a Trip</Text>
        <Text style={styles.sub}>Find your perfect travel companion</Text>
      </View>
      <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
        <View style={styles.toggleWrap}>
          <View style={styles.toggle}>
            {(['passenger', 'driver'] as Role[]).map(r => (
              <TouchableOpacity key={r} style={[styles.toggleBtn, role === r && styles.toggleBtnActive]} onPress={() => setRole(r)}>
                <Text style={[styles.toggleText, role === r && styles.toggleTextActive]}>{r === 'passenger' ? 'Passenger' : 'Driver'}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <Card title="Destination">
          <TextInput style={styles.input} value={destination} onChangeText={setDest} placeholder="Where are you going?" />
        </Card>

        <Card title="Date">
          <View style={styles.input}>
            <input
              type="date"
              value={date}
              min={today}
              ref={(el: any) => { if (el) { el.value = date } }}
              onChange={(e: any) => setDate(e.target.value)}
              onFocus={(e: any) => { if (!e.target.value) e.target.value = new Date().toISOString().split("T")[0] }}
              style={{
                border: 'none',
                background: 'transparent',
                fontSize: 15,
                color: '#1E293B',
                width: '100%',
                outline: 'none',
                padding: 0,
                fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
              }}
            />
          </View>
        </Card>

        <Card title="Pick-up Time">
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.optionRow}>
              {TIMES.map(t => (
                <TouchableOpacity key={t} style={[styles.optionPill, pickupTime === t && styles.optionPillActive]} onPress={() => setPickupTime(t)}>
                  <Text style={[styles.optionText, pickupTime === t && styles.optionTextActive]}>{t}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </Card>

        <Card title="Duration">
          <View style={styles.optionRow}>
            {DURATIONS.map(d => (
              <TouchableOpacity key={d} style={[styles.optionPill, duration === d && styles.optionPillActive]} onPress={() => setDuration(d)}>
                <Text style={[styles.optionText, duration === d && styles.optionTextActive]}>{d}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </Card>

        <Card title="Gender Preference">
          <RadioGroup options={[{ value: 'girls', label: 'Girls' }, { value: 'guys', label: 'Guys' }, { value: 'no_pref', label: 'No preference' }]} selected={genderPref} onSelect={(v) => setGenderPref(v as GenderPref)} />
        </Card>

        {role === 'passenger' && (
          <Card title="People you are bringing">
            <TextInput style={styles.input} value={peopleCount} onChangeText={setPeople} placeholder="e.g. 2" keyboardType="numeric" />
          </Card>
        )}

        {role === 'driver' && (
          <>
            <Card title="Car Capacity">
              <RadioGroup options={[{ value: '3', label: '3 people' }, { value: '4', label: '4 people' }, { value: '5', label: '5 or more' }]} selected={carCapacity} onSelect={setCapacity} />
            </Card>
            <Card title="Free Spots">
              <RadioGroup options={[{ value: '1', label: '1 spot' }, { value: '2', label: '2 spots' }, { value: '3', label: 'All spots' }]} selected={freeSpots} onSelect={setFreeSpots} />
            </Card>
          </>
        )}

        <View style={{ padding: 20 }}>
          <TouchableOpacity style={[styles.matchBtn, loading && { opacity: 0.7 }]} onPress={handleMatch} disabled={loading}>
            {loading ? <ActivityIndicator color={UI.white} /> : <Text style={styles.matchBtnText}>Find My Match</Text>}
          </TouchableOpacity>
        </View>
        <View style={{ height: 20 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={cardStyles.wrap}>
      <Text style={cardStyles.title}>{title}</Text>
      {children}
    </View>
  )
}

function RadioGroup({ options, selected, onSelect }: any) {
  return (
    <View style={{ gap: 9 }}>
      {options.map((o: any) => (
        <TouchableOpacity key={o.value} style={[radioStyles.option, selected === o.value && radioStyles.selected]} onPress={() => onSelect(o.value)}>
          <View style={[radioStyles.dot, selected === o.value && radioStyles.dotSelected]}>
            {selected === o.value && <View style={radioStyles.dotInner} />}
          </View>
          <Text style={radioStyles.label}>{o.label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  )
}

const cardStyles = StyleSheet.create({ wrap: { backgroundColor: UI.white, borderRadius: 18, padding: 18, marginHorizontal: 20, marginBottom: 12 }, title: { fontSize: 11, color: UI.soft, textTransform: 'uppercase', letterSpacing: 0.7, marginBottom: 14 } })
const radioStyles = StyleSheet.create({ option: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 13, borderRadius: 12, borderWidth: 2, borderColor: UI.border, backgroundColor: UI.white }, selected: { borderColor: UCLA.gold, backgroundColor: UCLA.goldPale }, dot: { width: 20, height: 20, borderRadius: 10, borderWidth: 2.5, borderColor: UI.border, alignItems: 'center', justifyContent: 'center' }, dotSelected: { borderColor: UCLA.goldDark, backgroundColor: UCLA.gold }, dotInner: { width: 8, height: 8, borderRadius: 4, backgroundColor: UI.charcoal }, label: { fontSize: 15, color: UI.charcoal } })
const styles = StyleSheet.create({
  header: { backgroundColor: UCLA.blue, padding: 20, paddingTop: 56 },
  title: { fontSize: 26, fontWeight: '900', color: UI.white },
  sub: { fontSize: 14, color: 'rgba(255,255,255,0.65)', marginTop: 3 },
  container: { flex: 1, backgroundColor: UI.bg },
  toggleWrap: { padding: 20, paddingBottom: 8 },
  toggle: { flexDirection: 'row', backgroundColor: UCLA.bluePale, borderRadius: 12, borderWidth: 1.5, borderColor: UCLA.blueLight, padding: 4 },
  toggleBtn: { flex: 1, height: 44, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  toggleBtnActive: { backgroundColor: UCLA.blue },
  toggleText: { fontSize: 14, color: UI.soft },
  toggleTextActive: { color: UI.white },
  input: { height: 52, borderRadius: 12, borderWidth: 2, borderColor: UCLA.goldLight, backgroundColor: UCLA.goldPale, paddingHorizontal: 16, paddingVertical: 12, fontSize: 15, color: UI.charcoal, justifyContent: 'center' },
  optionRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  optionPill: { height: 38, paddingHorizontal: 14, borderRadius: 19, borderWidth: 2, borderColor: UI.border, backgroundColor: UI.white, justifyContent: 'center' },
  optionPillActive: { borderColor: UCLA.gold, backgroundColor: UCLA.goldPale },
  optionText: { fontSize: 13, color: UI.mid },
  optionTextActive: { color: UI.charcoal },
  matchBtn: { height: 54, borderRadius: 14, backgroundColor: UCLA.blue, alignItems: 'center', justifyContent: 'center' },
  matchBtnText: { fontSize: 16, fontWeight: '800', color: UI.white },
})
