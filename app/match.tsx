import { useState, useEffect } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal } from 'react-native'
import { useRouter, useLocalSearchParams } from 'expo-router'
import { getUserById } from '../services/firestore'
import { UCLA, UI } from '../constants/Colors'

export default function MatchScreen() {
  const router = useRouter()
  const { matchUsername, matchUserId, destination, pickupTime, duration, chatId, tripId } = useLocalSearchParams()
  const [matchProfile, setMatchProfile] = useState<any>(null)
  const [showProfile, setShowProfile] = useState(false)

  useEffect(() => {
    if (matchUserId) {
      getUserById(matchUserId as string).then(p => setMatchProfile(p))
    }
  }, [matchUserId])

  return (
    <View style={styles.container}>
      {/* Profile Modal */}
      <Modal visible={showProfile} transparent animationType="slide" onRequestClose={() => setShowProfile(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <View style={styles.modalAvatar}><Text style={{ fontSize: 36 }}>🧑‍🎓</Text></View>
              <Text style={styles.modalName}>{matchProfile?.displayName || matchUsername}</Text>
              <Text style={styles.modalEmail}>{matchProfile?.email || ''}</Text>
            </View>
            <View style={styles.modalBody}>
              {matchProfile?.year || matchProfile?.major ? (
                <View style={styles.modalRow}>
                  <Text style={styles.modalLabel}>📚 Year & Major</Text>
                  <Text style={styles.modalVal}>{matchProfile?.year || '—'} · {matchProfile?.major || '—'}</Text>
                </View>
              ) : null}
              {matchProfile?.bio ? (
                <View style={styles.modalRow}>
                  <Text style={styles.modalLabel}>💬 Bio</Text>
                  <Text style={styles.modalVal}>{matchProfile.bio}</Text>
                </View>
              ) : null}
              {matchProfile?.interests?.length > 0 ? (
                <View style={styles.modalRow}>
                  <Text style={styles.modalLabel}>❤️ Interests</Text>
                  <Text style={styles.modalVal}>{matchProfile.interests.join(', ')}</Text>
                </View>
              ) : null}
              <View style={styles.modalRow}>
                <Text style={styles.modalLabel}>⭐ Rating</Text>
                <Text style={styles.modalVal}>{matchProfile?.rating?.toFixed(1) || '5.0'}</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.modalClose} onPress={() => setShowProfile(false)}>
              <Text style={styles.modalCloseText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <View style={styles.hero}>
        <View style={styles.heroBadge}><Text style={{ fontSize: 34 }}>🎉</Text></View>
        <Text style={styles.heroTitle}>Your Match!</Text>
        <Text style={styles.heroSub}>We found your Bruin companion</Text>
      </View>

      <ScrollView contentContainerStyle={styles.body}>
        <View style={styles.card}>
          <View style={styles.personRow}>
            <TouchableOpacity style={styles.avatar} onPress={() => setShowProfile(true)}>
              <Text style={{ fontSize: 28 }}>🧑</Text>
            </TouchableOpacity>
            <View style={{ flex: 1 }}>
              <Text style={styles.matchName}>{matchUsername}</Text>
              <Text style={styles.matchDetail}>UCLA Student · Tap avatar to view profile</Text>
            </View>
            <TouchableOpacity style={styles.profileBtn} onPress={() => setShowProfile(true)}>
              <Text style={{ fontSize: 18 }}>👤</Text>
            </TouchableOpacity>
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

        <TouchableOpacity style={styles.btnBlue} onPress={() => router.push({ pathname: '/tracker', params: { tripId } })}>
          <Text style={styles.btnBlueText}>📍  Open Location Tracker</Text>
        </TouchableOpacity>

        <View style={styles.contactBox}>
          <Text style={styles.contactLabel}>Contact Info</Text>
          <Text style={styles.contactVal}>Visible after matching ✓</Text>
          <Text style={styles.contactSub}>Check the chat for details</Text>
        </View>

        <TouchableOpacity style={styles.btnGold} onPress={() => router.push({ pathname: '/chat/[id]', params: { id: chatId, destination: destination } })}>
          <Text style={styles.btnGoldText}>💬  Send a Message</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.btnGhost} onPress={() => router.push('/(tabs)/active')}>
          <Text style={styles.btnGhostText}>View Active Plans</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.btnHome} onPress={() => router.replace('/(tabs)/home')}>
          <Text style={styles.btnHomeText}>🏠  Back to Home</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container:      { flex: 1, backgroundColor: UI.bg },
  hero:           { backgroundColor: UCLA.blue, padding: 28, alignItems: 'center', gap: 8 },
  heroBadge:      { width: 68, height: 68, borderRadius: 34, backgroundColor: UCLA.gold, alignItems: 'center', justifyContent: 'center' },
  heroTitle:      { fontSize: 24, fontWeight: '900', color: UI.white },
  heroSub:        { fontSize: 14, color: 'rgba(255,255,255,0.65)' },
  body:           { padding: 20, gap: 12 },
  card:           { backgroundColor: UI.white, borderRadius: 18, padding: 18 },
  personRow:      { flexDirection: 'row', alignItems: 'center', gap: 14 },
  avatar:         { width: 56, height: 56, borderRadius: 28, backgroundColor: UCLA.goldPale, borderWidth: 3, borderColor: UCLA.gold, alignItems: 'center', justifyContent: 'center' },
  profileBtn:     { width: 40, height: 40, borderRadius: 20, backgroundColor: UCLA.bluePale, alignItems: 'center', justifyContent: 'center' },
  matchName:      { fontSize: 20, fontWeight: '900', color: UI.charcoal },
  matchDetail:    { fontSize: 12, color: UI.soft, marginTop: 2 },
  divider:        { height: 1, backgroundColor: UI.border, marginVertical: 14 },
  statsRow:       { flexDirection: 'row', gap: 8 },
  statBox:        { flex: 1, backgroundColor: UI.bg, borderRadius: 12, padding: 12, alignItems: 'center', borderWidth: 1.5, borderColor: UI.border },
  statLabel:      { fontSize: 10, color: UI.soft, textTransform: 'uppercase', letterSpacing: 0.5 },
  statVal:        { fontSize: 14, fontWeight: '900', color: UI.charcoal, marginTop: 4 },
  contactBox:     { backgroundColor: UCLA.goldPale, borderWidth: 2, borderColor: UCLA.goldLight, borderRadius: 18, padding: 16 },
  contactLabel:   { fontSize: 11, color: '#a07800', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 7 },
  contactVal:     { fontSize: 18, fontWeight: '900', color: UI.charcoal },
  contactSub:     { fontSize: 13, color: UI.mid, marginTop: 3 },
  btnBlue:        { height: 54, borderRadius: 14, backgroundColor: UCLA.blue, alignItems: 'center', justifyContent: 'center' },
  btnBlueText:    { fontSize: 16, fontWeight: '800', color: UI.white },
  btnGold:        { height: 54, borderRadius: 14, backgroundColor: UCLA.gold, alignItems: 'center', justifyContent: 'center' },
  btnGoldText:    { fontSize: 16, fontWeight: '800', color: UI.charcoal },
  btnGhost:       { height: 54, borderRadius: 14, borderWidth: 2, borderColor: UI.border, backgroundColor: UI.bg, alignItems: 'center', justifyContent: 'center' },
  btnGhostText:   { fontSize: 16, fontWeight: '700', color: UI.mid },
  btnHome:        { height: 54, borderRadius: 14, borderWidth: 2, borderColor: UCLA.blueLight, backgroundColor: UCLA.bluePale, alignItems: 'center', justifyContent: 'center' },
  btnHomeText:    { fontSize: 16, fontWeight: '700', color: UCLA.blue },
  modalOverlay:   { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalCard:      { backgroundColor: UI.white, borderRadius: 24, padding: 24, margin: 16 },
  modalHeader:    { alignItems: 'center', marginBottom: 20 },
  modalAvatar:    { width: 80, height: 80, borderRadius: 40, backgroundColor: UCLA.goldPale, borderWidth: 3, borderColor: UCLA.gold, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  modalName:      { fontSize: 22, fontWeight: '900', color: UI.charcoal },
  modalEmail:     { fontSize: 13, color: UI.soft, marginTop: 4 },
  modalBody:      { gap: 14, marginBottom: 20 },
  modalRow:       { backgroundColor: UI.bg, borderRadius: 12, padding: 14 },
  modalLabel:     { fontSize: 11, color: UI.soft, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 },
  modalVal:       { fontSize: 15, color: UI.charcoal },
  modalClose:     { height: 50, borderRadius: 14, backgroundColor: UCLA.blue, alignItems: 'center', justifyContent: 'center' },
  modalCloseText: { fontSize: 16, fontWeight: '800', color: UI.white },
})
