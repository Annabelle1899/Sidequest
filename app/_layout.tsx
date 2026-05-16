import { useEffect, useState, useRef } from 'react'
import { Stack } from 'expo-router'
import { View, ActivityIndicator, Text, Animated, TouchableOpacity } from 'react-native'
import { onAuthChange } from '../services/auth'
import { useRouter, useSegments } from 'expo-router'
import type { User } from 'firebase/auth'
import { getAuth } from 'firebase/auth'
import { collection, query, where, onSnapshot } from 'firebase/firestore'
import { db } from '../firebase.config'
import { UCLA } from '../constants/Colors'
import { useFonts, Nunito_400Regular, Nunito_700Bold, Nunito_800ExtraBold, Nunito_900Black } from '@expo-google-fonts/nunito'
import * as SplashScreen from 'expo-splash-screen'

SplashScreen.preventAutoHideAsync()

function Toast({ message, chatId, onDismiss }: { message: string; chatId: string; onDismiss: () => void }) {
  const slideY = useRef(new Animated.Value(-120)).current
  const router = useRouter()

  useEffect(() => {
    Animated.spring(slideY, { toValue: 0, useNativeDriver: true, tension: 80 }).start()
    const timer = setTimeout(() => {
      Animated.timing(slideY, { toValue: -120, duration: 300, useNativeDriver: true }).start(onDismiss)
    }, 4000)
    return () => clearTimeout(timer)
  }, [])

  return (
    <Animated.View style={{
      position: 'absolute', top: 52, left: 16, right: 16, zIndex: 9999,
      transform: [{ translateY: slideY }],
      backgroundColor: '#fff',
      borderRadius: 16,
      padding: 14,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      shadowColor: '#000',
      shadowOpacity: 0.15,
      shadowRadius: 10,
      elevation: 8,
      borderLeftWidth: 4,
      borderLeftColor: UCLA.blue,
    }}>
      <Text style={{ fontSize: 24 }}>💬</Text>
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 13, fontWeight: '800', color: UCLA.blue }}>New Message</Text>
        <Text style={{ fontSize: 13, color: '#1E293B' }} numberOfLines={1}>{message}</Text>
      </View>
      <TouchableOpacity
        onPress={() => {
          onDismiss()
          router.push({ pathname: '/chat/[id]', params: { id: chatId } })
        }}
        style={{ backgroundColor: UCLA.blue, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5 }}
      >
        <Text style={{ fontSize: 12, fontWeight: '800', color: '#fff' }}>View</Text>
      </TouchableOpacity>
    </Animated.View>
  )
}

export default function RootLayout() {
  const [user, setUser]       = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [toast, setToast]     = useState<{ message: string; chatId: string } | null>(null)
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

  // Global message listener
  useEffect(() => {
    const currentUser = getAuth().currentUser
    if (!currentUser) return
    const q = query(
      collection(db, 'chats'),
      where('participants', 'array-contains', currentUser.uid),
    )
    const unsub = onSnapshot(q, snap => {
      for (const change of snap.docChanges()) {
        if (change.type === 'modified') {
          const chat = change.doc.data()
          if (chat.lastSenderId && chat.lastSenderId !== currentUser.uid && chat.lastMessage) {
            setToast({ message: chat.lastMessage, chatId: change.doc.id })
          }
        }
      }
    })
    return unsub
  }, [user])

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
    <View style={{ flex: 1 }}>
      {toast && (
        <Toast
          message={toast.message}
          chatId={toast.chatId}
          onDismiss={() => setToast(null)}
        />
      )}
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)/welcome" />
        <Stack.Screen name="(auth)/login" />
        <Stack.Screen name="(auth)/signup" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="match" />
        <Stack.Screen name="tracker" />
        <Stack.Screen name="chat/[id]" />
      </Stack>
    </View>
  )
}
