// app/(tabs)/profile.tsx
import { useState, useEffect, useRef } from 'react'
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  TextInput, Alert, ActivityIndicator, Image, Platform,
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

  const [bio, setBio]           = useState('')
  const [year, setYear]         = useState('')
  const [major, setMajor]       = useState('')
  const [classOf, setClassOf]   = useState('')
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

  // ── Upload image to Firebase Storage ──
  async function uploadImage(file: File, path: string): Promise<string> {
    const storageRef = ref(storage, path)
    await uploadBytes(storageRef, file)
    return await getDownloadURL(storageRef)
  }

  // ── Handle avatar upload ──
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

  // ── Handle photo prompt upload ──
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
        bio,
        year,
        major,
        classOf,
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
