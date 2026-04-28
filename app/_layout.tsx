// app/_layout.tsx
import { useEffect, useState } from 'react'
import { Stack } from 'expo-router'
import { View, ActivityIndicator } from 'react-native'
import { onAuthChange } from '../services/auth'
import { useRouter, useSegments } from 'expo-router'
import type { User } from 'firebase/auth'
import { UCLA } from '../constants/Colors'
import { useFonts, Nunito_400Regular, Nunito_700Bold, Nunito_800ExtraBold, Nunito_900Black } from '@expo-google-fonts/nunito'
import * as SplashScreen from 'expo-splash-screen'

SplashScreen.preventAutoHideAsync()

export default function RootLayout() {
  const [user, setUser]       = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router   = useRouter()
  const segments = useSegments()

  const [fontsLoaded] = useFonts({
    'Nunito-Regular':   Nunito_400Regular,
    'Nunito-Bold':      Nunito_700Bold,
    'Nunito-ExtraBold': Nunito_800ExtraBold,
    'Nunito-Black':     Nunito_900Black,
  })

  useEffect(() => {
    if (fontsLoaded) SplashScreen.hideAsync()
  }, [fontsLoaded])

  useEffect(() => {
    const unsubscribe = onAuthChange((firebaseUser) => {
      setUser(firebaseUser)
      setLoading(false)
    })
    return unsubscribe
  }, [])

  useEffect(() => {
    if (loading) return
    if (!fontsLoaded) return

    const inAuthGroup =
      segments[0] === '(auth)' ||
      segments[0] === 'welcome' ||
      segments[0] === 'login' ||
      segments[0] === 'signup'

    if (!user && !inAuthGroup) {
      router.replace('/(auth)/welcome')
    } else if (user && inAuthGroup) {
      router.replace('/(tabs)/home')
    }
  }, [user, loading, segments, fontsLoaded])

  if (!fontsLoaded || loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: UCLA.blue }}>
        <ActivityIndicator size="large" color={UCLA.gold} />
      </View>
    )
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(auth)/welcome" />
      <Stack.Screen name="(auth)/login" />
      <Stack.Screen name="(auth)/signup" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="match" />
      <Stack.Screen name="tracker" />
      <Stack.Screen name="chat/[id]" />
    </Stack>
  )
}