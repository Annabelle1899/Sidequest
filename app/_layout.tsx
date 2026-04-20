// app/_layout.tsx
// PERSON 1 — root of the app, handles auth redirect logic
// If logged in → go to tabs. If not → go to auth screens.

import { useEffect, useState } from 'react'
import { Stack } from 'expo-router'
import { View, ActivityIndicator } from 'react-native'
import { onAuthChange } from '../services/auth'
import { useRouter, useSegments } from 'expo-router'
import type { User } from 'firebase/auth'
import { UCLA } from '../constants/Colors'

export default function RootLayout() {
  const [user, setUser]       = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router   = useRouter()
  const segments = useSegments()

  useEffect(() => {
    // Listen for login/logout — runs once on app start
    const unsubscribe = onAuthChange((firebaseUser) => {
      setUser(firebaseUser)
      setLoading(false)
    })
    return unsubscribe
  }, [])

  useEffect(() => {
    if (loading) return

    const inAuthGroup = segments[0] === '(auth)'

    if (!user && !inAuthGroup) {
      // Not logged in → send to welcome screen
      router.replace('/(auth)/welcome')
    } else if (user && inAuthGroup) {
      // Logged in → send to home
      router.replace('/(tabs)/home')
    }
  }, [user, loading, segments])

  // Show spinner while checking auth state
  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: UCLA.blue }}>
        <ActivityIndicator size="large" color={UCLA.gold} />
      </View>
    )
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(auth)"  />
      <Stack.Screen name="(tabs)"  />
      <Stack.Screen name="match"   />
      <Stack.Screen name="tracker" />
      <Stack.Screen name="chat/[id]" />
    </Stack>
  )
}
