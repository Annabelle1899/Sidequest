// app/match.tsx
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native'
import { useRouter, useLocalSearchParams } from 'expo-router'
import { UCLA, UI } from '../constants/Colors'

export default function MatchScreen() {
  const router = useRouter()
  const { matchUsername, destination, pickupTime, duration, chatId, tripId } = useLocalSearchParams()

  return (
    <View style={styles.container}>
      <View style={styles.hero}>
        <View style={styles.heroBadge}><Text style={{ fontSize: 34 }}>🎉</Text></View>
        <Text style={styles.heroTitle}>Your Match!</Text>
        <Text style={styles.heroSub}>We found your Bruin companion</Text>
      </View>

      <ScrollView contentContainerStyle={styles.body}>
        <View style={styles.card}>
          <View style={styles.personRow}>
            <View style={styles.avatar}><Text style={{ fontSize: 28 }}>🧑</Text></View>
            <View>
              <Text style={styles.matchName}>{matchUsername}</Text>
              <Text style={styles.matchDetail}>UCLA Student</Text>
            </View>
          </View>
          <View style={styles.divider} />
          <View style={styles.statsRow}>
            {[
              { label: 'Destination', val: destination },
              { label: 'Pickup',      val: pickupTime  },
              { label: 'Duration',    val: duration    },
            ].map(s => (
              <View key={s.label} style={styles.statBox}>
                <Text style={styles.statLabel}>{s.label}</Text>
                <Text style={styles.statVal} numberOfLines={1}>{s.val}</Text>
              </View>
            ))}
          </View>
        </View>

        <TouchableOpacity
          style={styles.btnBlue}
          onPress={() => router.push({ pathname: '/tracker', params: { tripId } })}
        >
          <Text style={styles.btnBlueText}>📍  Open Location Tracker</Text>
        </TouchableOpacity>

        <View style={styles.contactBox}>
          <Text style={styles.contactLabel}>Contact Info</Text>
          <Text style={styles.contactVal}>Visible after matching ✓</Text>
          <Text style={styles.contactSub}>Check the chat for details</Text>
        </View>

        <TouchableOpacity
          style={styles.btnGold}
          onPress={() => router.push({ pathname: '/chat/[id]', params: { id: chatId } })}
        >
          <Text style={styles.btnGoldText}>💬  Send a Message</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.btnGhost}
          onPress={() => router.push('/(tabs)/active')}
        >
          <Text style={styles.btnGhostText}>View Active Plans</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.btnHome}
          onPress={() => router.replace('/(tabs)/home')}
        >
          <Text style={styles.btnHomeText}>🏠  Back to Home</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container:    { flex: 1, backgroundColor: UI.bg },
  hero:         { backgroundColor: UCLA.blue, padding: 28, alignItems: 'center', gap: 8 },
  heroBadge:    { width: 68, height: 68, borderRadius: 34, backgroundColor: UCLA.gold, alignItems: 'center', justifyContent: 'center' },
  heroTitle:    { fontSize: 24, fontWeight: '900', color: UI.white },
  heroSub:      { fontSize: 14, color: 'rgba(255,255,255,0.65)' },
  body:         { padding: 20, gap: 12 },
  card:         { backgroundColor: UI.white, borderRadius: 18, padding: 18 },
  personRow:    { flexDirection: 'row', alignItems: 'center', gap: 14 },
  avatar:       { width: 56, height: 56, borderRadius: 28, backgroundColor: UCLA.goldPale, borderWidth: 3, borderColor: UCLA.gold, alignItems: 'center', justifyContent: 'center' },
  matchName:    { fontSize: 20, fontWeight: '900', color: UI.charcoal },
  matchDetail:  { fontSize: 13, color: UI.soft, marginTop: 2 },
  divider:      { height: 1, backgroundColor: UI.border, marginVertical: 14 },
  statsRow:     { flexDirection: 'row', gap: 8 },
  statBox:      { flex: 1, backgroundColor: UI.bg, borderRadius: 12, padding: 12, alignItems: 'center', borderWidth: 1.5, borderColor: UI.border },
  statLabel:    { fontSize: 10, color: UI.soft, textTransform: 'uppercase', letterSpacing: 0.5 },
  statVal:      { fontSize: 14, fontWeight: '900', color: UI.charcoal, marginTop: 4 },
  contactBox:   { backgroundColor: UCLA.goldPale, borderWidth: 2, borderColor: UCLA.goldLight, borderRadius: 18, padding: 16 },
  contactLabel: { fontSize: 11, color: '#a07800', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 7 },
  contactVal:   { fontSize: 18, fontWeight: '900', color: UI.charcoal },
  contactSub:   { fontSize: 13, color: UI.mid, marginTop: 3 },
  btnBlue:      { height: 54, borderRadius: 14, backgroundColor: UCLA.blue, alignItems: 'center', justifyContent: 'center' },
  btnBlueText:  { fontSize: 16, fontWeight: '800', color: UI.white },
  btnGold:      { height: 54, borderRadius: 14, backgroundColor: UCLA.gold, alignItems: 'center', justifyContent: 'center' },
  btnGoldText:  { fontSize: 16, fontWeight: '800', color: UI.charcoal },
  btnGhost:     { height: 54, borderRadius: 14, borderWidth: 2, borderColor: UI.border, backgroundColor: UI.bg, alignItems: 'center', justifyContent: 'center' },
  btnGhostText: { fontSize: 16, fontWeight: '700', color: UI.mid },
  btnHome:      { height: 54, borderRadius: 14, borderWidth: 2, borderColor: UCLA.blueLight, backgroundColor: UCLA.bluePale, alignItems: 'center', justifyContent: 'center' },
  btnHomeText:  { fontSize: 16, fontWeight: '700', color: UCLA.blue },
})
