// app/(tabs)/profile.tsx
// PERSON 4 — Profile screen
// Shows + lets user edit their profile; handles logout

import { useState, useEffect } from 'react'
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  TextInput, Alert, ActivityIndicator,
} from 'react-native'
import { getAuth } from 'firebase/auth'
import { useRouter } from 'expo-router'
import { getUserById, updateUserProfile } from '../../services/firestore'
import { logOut } from '../../services/auth'
import { UCLA, UI } from '../../constants/Colors'

export default function ProfileScreen() {
  const router = useRouter()
  const user   = getAuth().currentUser!

  const [profile, setProfile]   = useState<any>(null)
  const [editing, setEditing]   = useState(false)
  const [saving, setSaving]     = useState(false)

  // Editable fields
  const [bio, setBio]           = useState('')
  const [year, setYear]         = useState('')
  const [major, setMajor]       = useState('')
  const [interests, setInterests] = useState('')

  useEffect(() => {
    getUserById(user.uid).then(p => {
      if (!p) return
      setProfile(p)
      setBio(p.bio || '')
      setYear(p.year || '')
      setMajor(p.major || '')
      setInterests(p.interests?.join(', ') || '')
    })
  }, [])

  async function handleSave() {
    setSaving(true)
    try {
      await updateUserProfile(user.uid, {
        bio,
        year,
        major,
        interests: interests.split(',').map(s => s.trim()).filter(Boolean),
      })
      setEditing(false)
      Alert.alert('Saved!', 'Your profile has been updated.')
    } catch {
      Alert.alert('Error', 'Could not save profile.')
    } finally {
      setSaving(false)
    }
  }

  async function handleLogout() {
    const confirm = window.confirm('Are you sure you want to log out?')
    if (confirm) {
      await logOut()
      router.replace('/(auth)/welcome')
    }
  }

  if (!profile) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: UI.bg }}>
        <ActivityIndicator color={UCLA.blue} />
      </View>
    )
  }

  return (
    <View style={styles.container}>
      {/* Blue cover */}
      <View style={styles.cover}>
        <View style={styles.goldStripe} />
        <View style={styles.avaWrap}>
          <View style={styles.ava}>
            <Text style={{ fontSize: 38 }}>🧑‍🎓</Text>
          </View>
        </View>
        <View style={styles.coverBtns}>
          {editing
            ? <TouchableOpacity style={styles.btnGold} onPress={handleSave} disabled={saving}>
                {saving ? <ActivityIndicator color={UI.charcoal} /> : <Text style={styles.btnGoldText}>Save ✓</Text>}
              </TouchableOpacity>
            : <TouchableOpacity style={styles.btnGold} onPress={() => setEditing(true)}>
                <Text style={styles.btnGoldText}>Edit Profile</Text>
              </TouchableOpacity>
          }
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.body}>
        {/* Name + meta */}
        <View style={{ marginTop: 50 }}>
          <Text style={styles.name}>{profile.displayName || profile.username}</Text>
          <Text style={styles.meta}>
            {profile.year || 'Year'} · <Text style={{ color: UCLA.blue }}>{profile.major || 'Major'}</Text> · UCLA
          </Text>
          <View style={styles.chipRow}>
            <Chip label="🎓 Class of 2026" color="gold" />
            <Chip label={`⭐ ${profile.rating?.toFixed(1)} rating`} color="gold" />
            <Chip label={`🗺️ ${profile.totalTrips} trips`} color="blue" />
          </View>
        </View>

        {/* About Me */}
        <Card title="About Me">
          {editing
            ? <TextInput style={styles.fieldInput} value={bio} onChangeText={setBio} placeholder="Write something about yourself..." multiline />
            : <View style={styles.field}><Text style={styles.fieldText}>{bio || 'Write something about yourself...'}</Text></View>
          }
        </Card>

        {/* Year & Major */}
        <Card title="Year & Major">
          {editing ? (
            <View style={{ gap: 8 }}>
              <TextInput style={styles.fieldInput} value={year} onChangeText={setYear} placeholder="e.g. 3rd Year" />
              <TextInput style={styles.fieldInput} value={major} onChangeText={setMajor} placeholder="e.g. Computer Science" />
            </View>
          ) : (
            <View style={styles.field}>
              <Text style={styles.fieldText}>{year || '—'} · {major || '—'}</Text>
            </View>
          )}
        </Card>

        {/* Interests */}
        <Card title="Interests">
          {editing
            ? <TextInput style={styles.fieldInput} value={interests} onChangeText={setInterests} placeholder="Hiking, Music, Photography..." />
            : <View style={styles.field}><Text style={styles.fieldText}>{interests || 'Add your interests...'}</Text></View>
          }
        </Card>

        {/* Photo Prompts */}
        <Card title="Photo Prompts">
          <View style={styles.photoGrid}>
            {['📸 Last weekend', '❤️ Something I love', '🎮 Fav pasttime'].map(p => (
              <TouchableOpacity key={p} style={styles.photoSlot}>
                <Text style={{ fontSize: 24 }}>{p.split(' ')[0]}</Text>
                <Text style={styles.photoLabel}>{p.split(' ').slice(1).join(' ')}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </Card>

        {/* Logout */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>
        <View style={{ height: 30 }} />
      </ScrollView>
    </View>
  )
}

function Card({ title, children }: any) {
  return (
    <View style={cardS.wrap}>
      <Text style={cardS.title}>{title}</Text>
      {children}
    </View>
  )
}
function Chip({ label, color }: { label: string; color: 'gold' | 'blue' }) {
  return (
    <View style={[chipS.chip, color === 'gold' ? chipS.gold : chipS.blue]}>
      <Text style={[chipS.text, color === 'gold' ? { color: '#a07800' } : { color: UCLA.blue }]}>{label}</Text>
    </View>
  )
}

const cardS  = StyleSheet.create({ wrap: { backgroundColor: UI.white, borderRadius: 18, padding: 18, shadowColor: UCLA.blue, shadowOpacity: 0.07, shadowRadius: 8, elevation: 2 }, title: { fontFamily: 'Nunito-ExtraBold', fontSize: 11, color: UI.soft, textTransform: 'uppercase', letterSpacing: 0.7, marginBottom: 14 } })
const chipS  = StyleSheet.create({ chip: { height: 30, paddingHorizontal: 12, borderRadius: 15, justifyContent: 'center', borderWidth: 1.5 }, gold: { backgroundColor: UCLA.goldPale, borderColor: UCLA.goldLight }, blue: { backgroundColor: UCLA.bluePale, borderColor: UCLA.blueLight }, text: { fontFamily: 'Nunito-Bold', fontSize: 12 } })

const styles = StyleSheet.create({
  container:  { flex: 1, backgroundColor: UI.bg },
  cover:      { height: 155, backgroundColor: UCLA.blue, position: 'relative' },
  goldStripe: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 6, backgroundColor: UCLA.gold },
  avaWrap:    { position: 'absolute', bottom: -38, left: 20 },
  ava:        { width: 82, height: 82, borderRadius: 41, backgroundColor: UI.white, borderWidth: 4, borderColor: UCLA.gold, alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 10, elevation: 5 },
  coverBtns:  { position: 'absolute', bottom: 18, right: 20, flexDirection: 'row', gap: 10 },
  btnGold:    { height: 34, paddingHorizontal: 16, borderRadius: 17, backgroundColor: UCLA.gold, justifyContent: 'center' },
  btnGoldText:{ fontFamily: 'Nunito-ExtraBold', fontSize: 13, color: UI.charcoal },
  body:       { padding: 20, gap: 14 },
  name:       { fontFamily: 'Nunito-Black', fontSize: 22, color: UI.charcoal },
  meta:       { fontFamily: 'NunitoSans-Regular', fontSize: 13, color: UI.soft, marginTop: 3 },
  chipRow:    { flexDirection: 'row', gap: 8, flexWrap: 'wrap', marginTop: 12 },
  field:      { height: 46, backgroundColor: UCLA.goldPale, borderRadius: 12, borderWidth: 1.5, borderColor: UCLA.goldLight, justifyContent: 'center', paddingHorizontal: 14, marginBottom: 8 },
  fieldText:  { fontFamily: 'NunitoSans-Regular', fontSize: 14, color: UI.mid },
  fieldInput: { minHeight: 46, backgroundColor: UCLA.goldPale, borderRadius: 12, borderWidth: 2, borderColor: UCLA.gold, paddingHorizontal: 14, paddingVertical: 12, fontFamily: 'NunitoSans-Regular', fontSize: 14, color: UI.charcoal, marginBottom: 8 },
  photoGrid:  { flexDirection: 'row', gap: 9 },
  photoSlot:  { flex: 1, aspectRatio: 1, borderRadius: 12, backgroundColor: UCLA.bluePale, borderWidth: 2, borderColor: UCLA.blueLight, alignItems: 'center', justifyContent: 'center', gap: 4 },
  photoLabel: { fontFamily: 'Nunito-Bold', fontSize: 9, color: UI.soft, textAlign: 'center' },
  logoutBtn:  { height: 54, borderRadius: 14, borderWidth: 2, borderColor: '#FECACA', backgroundColor: '#FEF2F2', alignItems: 'center', justifyContent: 'center' },
  logoutText: { fontFamily: 'Nunito-ExtraBold', fontSize: 16, color: '#DC2626' },
})
