import { useState, useEffect } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, Modal } from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { getAuth } from 'firebase/auth'
import { doc, onSnapshot } from 'firebase/firestore'
import { db } from '../firebase.config'
import { listenToDriverLocation, getUserById } from '../services/firestore'
import { UCLA, UI } from '../constants/Colors'

export default function TrackerScreen() {
  const { tripId } = useLocalSearchParams()
  const router = useRouter()
  const user = getAuth().currentUser

  const [tripData, setTripData] = useState<any>(null)
  const [matchProfile, setMatchProfile] = useState<any>(null)
  const [driverLocation, setDriverLocation] = useState<any>(null)
  const [userRole, setUserRole] = useState('passenger')
  const [showProfile, setShowProfile] = useState(false)

  useEffect(() => {
    if (!tripId) return
    const unsub = onSnapshot(doc(db, 'trips', tripId as string), async snap => {
      const data = snap.data()
      setTripData(data)
      if (data?.userId === user?.uid) {
        setUserRole(data?.role)
      } else {
        setUserRole(data?.role === 'driver' ? 'passenger' : 'driver')
      }
      if (data?.matchedWith) {
        const profile = await getUserById(data.matchedWith)
        setMatchProfile(profile)
      }
    })
    return unsub
  }, [tripId])

  useEffect(() => {
    if (userRole !== 'passenger' || !tripId) return
    const unsub = listenToDriverLocation(tripId as string, (lat: number, lng: number) => {
      setDriverLocation({ latitude: lat, longitude: lng })
    })
    return unsub
  }, [userRole, tripId])

  const matchName = matchProfile?.displayName || matchProfile?.username || 'Your Match'

  return (
    <View style={styles.container}>
      <Modal visible={showProfile} transparent animationType="slide" onRequestClose={() => setShowProfile(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <View style={styles.modalAvatar}><Text style={{ fontSize: 36 }}>🧑‍🎓</Text></View>
              <Text style={styles.modalName}>{matchName}</Text>
              <Text style={styles.modalEmail}>{matchProfile?.email || ''}</Text>
            </View>
            <View style={styles.modalBody}>
              {(matchProfile?.year || matchProfile?.major) ? (
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

      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.replace('/(tabs)/home')} style={styles.backBtn}>
          <Text style={styles.backText}>← Home</Text>
        </TouchableOpacity>
        <Text style={styles.topLabel}>
          {userRole === 'passenger' ? 'Your Driver' : 'Your Passenger'}
        </Text>
        <View style={styles.driverRow}>
          <View style={styles.driverAva}><Text style={{ fontSize: 20 }}>🧑</Text></View>
          <View style={{ flex: 1 }}>
            <Text style={styles.driverName}>{matchName}</Text>
            <Text style={styles.driverSub}>Destination: {tripData?.destination || '—'}</Text>
          </View>
          <View style={styles.actionBtns}>
            <TouchableOpacity style={styles.iconBtn} onPress={() => setShowProfile(true)}>
              <Text>👤</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconBtn} onPress={() => router.push({ pathname: '/chat/[id]', params: { id: tripData?.chatId, destination: tripData?.destination } })}>
              <Text>💬</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <View style={styles.mapPlaceholder}>
        <Text style={styles.mapEmoji}>🗺️</Text>
        <Text style={styles.mapText}>Live Map</Text>
        <Text style={styles.mapSub}>
          {driverLocation ? 'Driver location found!' : 'Waiting for driver location...'}
        </Text>
        <View style={styles.etaBadge}>
          <Text style={styles.etaNum}>~4 min</Text>
          <Text style={styles.etaLabel}>ETA away</Text>
        </View>
      </View>

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
  container:      { flex: 1, backgroundColor: UI.bg },
  topBar:         { backgroundColor: UCLA.blue, padding: 18, paddingTop: 52 },
  backBtn:        { marginBottom: 8 },
  backText:       { color: 'rgba(255,255,255,0.7)', fontSize: 14 },
  topLabel:       { fontSize: 11, color: 'rgba(255,255,255,0.5)', letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 12 },
  driverRow:      { backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 16, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)' },
  driverAva:      { width: 44, height: 44, borderRadius: 22, backgroundColor: UCLA.gold, alignItems: 'center', justifyContent: 'center' },
  driverName:     { fontSize: 16, fontWeight: '800', color: UI.white },
  driverSub:      { fontSize: 12, color: 'rgba(255,255,255,0.5)', marginTop: 2 },
  actionBtns:     { flexDirection: 'row', gap: 8 },
  iconBtn:        { width: 38, height: 38, borderRadius: 19, backgroundColor: 'rgba(255,255,255,0.12)', alignItems: 'center', justifyContent: 'center' },
  mapPlaceholder: { flex: 1, backgroundColor: '#d8eaf5', alignItems: 'center', justifyContent: 'center', gap: 10 },
  mapEmoji:       { fontSize: 60 },
  mapText:        { fontSize: 22, fontWeight: '800', color: UCLA.blue },
  mapSub:         { fontSize: 14, color: UI.soft, textAlign: 'center', paddingHorizontal: 20 },
  etaBadge:       { backgroundColor: UCLA.blue, borderRadius: 14, padding: 12, marginTop: 10 },
  etaNum:         { fontSize: 20, fontWeight: '900', color: UCLA.gold, textAlign: 'center' },
  etaLabel:       { fontSize: 11, color: 'rgba(255,255,255,0.6)', textAlign: 'center' },
  bottomBar:      { backgroundColor: UI.white, borderTopWidth: 1, borderTopColor: UI.border, flexDirection: 'row', padding: 14, gap: 10 },
  infoPill:       { flex: 1, backgroundColor: UI.bg, borderRadius: 12, padding: 11, borderWidth: 1.5, borderColor: UI.border },
  pillLabel:      { fontSize: 10, color: UI.soft, textTransform: 'uppercase', letterSpacing: 0.5 },
  pillVal:        { fontSize: 14, fontWeight: '700', color: UI.charcoal, marginTop: 3 },
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
