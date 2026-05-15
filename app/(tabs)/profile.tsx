// app/(tabs)/profile.tsx
import { useState, useEffect, useRef } from 'react'
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  TextInput, Alert, ActivityIndicator, Image,
} from 'react-native'
import { getAuth } from 'firebase/auth'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { useRouter } from 'expo-router'
import { getUserById, updateUserProfile } from '../../services/firestore'
import { logOut } from '../../services/auth'
import { storage } from '../../firebase.config'
import { UCLA, UI } from '../../constants/Colors'

const PHOTO_PROMPTS = ['📸 Last weekend', '❤️ Something I love', '🎮 Fav pasttime']

export default function ProfileScreen() {
  const router = useRouter()
  const user   = getAuth().currentUser!

  const [profile, setProfile]     = useState<any>(null)
  const [editing, setEditing]     = useState(false)
  const [saving, setSaving]       = useState(false)
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [photoUrls, setPhotoUrls] = useState<(string | null)[]>([null, null, null])
  const [bio, setBio]             = useState('')
  const [year, setYear]           = useState('')
  const [major, setMajor]         = useState('')
  const [classOf, setClassOf]     = useState('')
  const [interests, setInterests] = useState('')

  const avatarInputRef = useRef<any>(null)
  const photoInputRefs = [useRef<any>(null), useRef<any>(null), useRef<any>(null)]

  useEffect(() => {
    getUserById(user.uid).then(p => {
      if (!p) return
      setProfile(p)
      setBio(p.bio || '')
      setYear(p.year || '')
      setMajor(p.major || '')
      setClassOf(p.classOf || '2026')
      setInterests(p.interests?.join(', ') || '')
      setAvatarUrl(p.photoURL || null)
      setPhotoUrls(p.photoUrls || [null, null, null])
    })
  }, [])

  async function uploadImage(file: File, path: string): Promise<string> {
    const storageRef = ref(storage, path)
    await uploadBytes(storageRef, file)
    return await getDownloadURL(storageRef)
  }

  async function handleAvatarChange(e: any) {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const url = await uploadImage(file, `avatars/${user.uid}`)
      setAvatarUrl(url)
      await updateUserProfile(user.uid, { photoURL: url })
    } catch {
      Alert.alert('Error', 'Could not upload avatar.')
    }
  }

  async function handlePhotoChange(e: any, index: number) {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const url = await uploadImage(file, `photos/${user.uid}/prompt_${index}`)
      const newUrls = [...photoUrls]
      newUrls[index] = url
      setPhotoUrls(newUrls)
      await updateUserProfile(user.uid, { photoUrls: newUrls })
    } catch {
      Alert.alert('Error', 'Could not upload photo.')
    }
  }

  async function handleSave() {
    setSaving(true)
    try {
      await updateUserProfile(user.uid, {
        bio, year, major, classOf,
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
      <View style={styles.cover}>
        <View style={styles.goldStripe} />
        <View style={styles.avaWrap}>
          <TouchableOpacity style={styles.ava} onPress={() => avatarInputRef.current?.click()}>
            {avatarUrl
              ? <Image source={{ uri: avatarUrl }} style={{ width: 82, height: 82, borderRadius: 41 }} />
              : <Text style={{ fontSize: 38 }}>🧑‍🎓</Text>
            }
            <View style={styles.avaEditBadge}>
              <Text style={{ fontSize: 12 }}>📷</Text>
            </View>
          </TouchableOpacity>
          <input
            ref={avatarInputRef}
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={handleAvatarChange}
          />
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
        <View style={{ marginTop: 50 }}>
          <Text style={styles.name}>{profile.displayName || profile.username}</Text>
          <Text style={styles.meta}>
            {year || 'Year'} · <Text style={{ color: UCLA.blue }}>{major || 'Major'}</Text> · UCLA
          </Text>
          <View style={styles.chipRow}>
            <Chip label={`🎓 Class of ${classOf}`} color="gold" />
            <Chip label={`⭐ ${profile.rating?.toFixed(1)} rating`} color="gold" />
            <Chip label={`🗺️ ${profile.totalTrips} trips`} color="blue" />
          </View>
        </View>

        <Card title="About Me">
          {editing
            ? <TextInput style={styles.fieldInput} value={bio} onChangeText={setBio} placeholder="Write something about yourself..." multiline />
            : <View style={styles.field}><Text style={styles.fieldText}>{bio || 'Write something about yourself...'}</Text></View>
          }
        </Card>

        <Card title="Year, Major & Class">
          {editing ? (
            <View style={{ gap: 8 }}>
              <TextInput style={styles.fieldInput} value={year} onChangeText={setYear} placeholder="e.g. 3rd Year" />
              <TextInput style={styles.fieldInput} value={major} onChangeText={setMajor} placeholder="e.g. Computer Science" />
              <TextInput style={styles.fieldInput} value={classOf} onChangeText={setClassOf} placeholder="e.g. 2026" keyboardType="numeric" />
            </View>
          ) : (
            <View style={styles.field}>
              <Text style={styles.fieldText}>{year || '—'} · {major || '—'} · Class of {classOf}</Text>
            </View>
          )}
        </Card>

        <Card title="Interests">
          {editing
            ? <TextInput style={styles.fieldInput} value={interests} onChangeText={setInterests} placeholder="Hiking, Music, Photography..." />
            : <View style={styles.field}><Text style={styles.fieldText}>{interests || 'Add your interests...'}</Text></View>
          }
        </Card>

        <Card title="Photo Prompts">
          <View style={styles.photoGrid}>
            {PHOTO_PROMPTS.map((prompt, i) => (
              <TouchableOpacity
                key={prompt}
                style={styles.photoSlot}
                onPress={() => photoInputRefs[i].current?.click()}
              >
                {photoUrls[i]
                  ? <Image source={{ uri: photoUrls[i]! }} style={{ width: '100%', height: '100%', borderRadius: 10 }} />
                  : <>
                      <Text style={{ fontSize: 24 }}>{prompt.split(' ')[0]}</Text>
                      <Text style={styles.photoLabel}>{prompt.split(' ').slice(1).join(' ')}</Text>
                      <Text style={{ fontSize: 10, color: UCLA.blue, marginTop: 4 }}>Tap to upload</Text>
                    </>
                }
                <input
                  ref={photoInputRefs[i]}
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={(e) => handlePhotoChange(e, i)}
                />
              </TouchableOpacity>
            ))}
          </View>
        </Card>

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

const cardS = StyleSheet.create({
  wrap:  { backgroundColor: UI.white, borderRadius: 18, padding: 18 },
  title: { fontSize: 11, color: UI.soft, textTransform: 'uppercase', letterSpacing: 0.7, marginBottom: 14 },
})
const chipS = StyleSheet.create({
  chip: { height: 30, paddingHorizontal: 12, borderRadius: 15, justifyContent: 'center', borderWidth: 1.5 },
  gold: { backgroundColor: UCLA.goldPale, borderColor: UCLA.goldLight },
  blue: { backgroundColor: UCLA.bluePale, borderColor: UCLA.blueLight },
  text: { fontSize: 12 },
})
const styles = StyleSheet.create({
  container:    { flex: 1, backgroundColor: UI.bg },
  cover:        { height: 155, backgroundColor: UCLA.blue, position: 'relative' },
  goldStripe:   { position: 'absolute', bottom: 0, left: 0, right: 0, height: 6, backgroundColor: UCLA.gold },
  avaWrap:      { position: 'absolute', bottom: -38, left: 20 },
  ava:          { width: 82, height: 82, borderRadius: 41, backgroundColor: UI.white, borderWidth: 4, borderColor: UCLA.gold, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  avaEditBadge: { position: 'absolute', bottom: 0, right: 0, backgroundColor: UCLA.gold, borderRadius: 10, width: 20, height: 20, alignItems: 'center', justifyContent: 'center' },
  coverBtns:    { position: 'absolute', bottom: 18, right: 20 },
  btnGold:      { height: 34, paddingHorizontal: 16, borderRadius: 17, backgroundColor: UCLA.gold, justifyContent: 'center' },
  btnGoldText:  { fontSize: 13, color: UI.charcoal },
  body:         { padding: 20, gap: 14 },
  name:         { fontSize: 22, fontWeight: '900', color: UI.charcoal },
  meta:         { fontSize: 13, color: UI.soft, marginTop: 3 },
  chipRow:      { flexDirection: 'row', gap: 8, flexWrap: 'wrap', marginTop: 12 },
  field:        { minHeight: 46, backgroundColor: UCLA.goldPale, borderRadius: 12, borderWidth: 1.5, borderColor: UCLA.goldLight, justifyContent: 'center', paddingHorizontal: 14, paddingVertical: 12, marginBottom: 8 },
  fieldText:    { fontSize: 14, color: UI.mid },
  fieldInput:   { minHeight: 46, backgroundColor: UCLA.goldPale, borderRadius: 12, borderWidth: 2, borderColor: UCLA.gold, paddingHorizontal: 14, paddingVertical: 12, fontSize: 14, color: UI.charcoal, marginBottom: 8 },
  photoGrid:    { flexDirection: 'row', gap: 9 },
  photoSlot:    { flex: 1, aspectRatio: 1, borderRadius: 12, backgroundColor: UCLA.bluePale, borderWidth: 2, borderColor: UCLA.blueLight, alignItems: 'center', justifyContent: 'center', gap: 4, overflow: 'hidden' },
  photoLabel:   { fontSize: 9, color: UI.soft, textAlign: 'center' },
  logoutBtn:    { height: 54, borderRadius: 14, borderWidth: 2, borderColor: '#FECACA', backgroundColor: '#FEF2F2', alignItems: 'center', justifyContent: 'center' },
  logoutText:   { fontSize: 16, fontWeight: '800', color: '#DC2626' },
})
