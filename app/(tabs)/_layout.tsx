import { useState, useEffect, useRef } from 'react'
import { Tabs } from 'expo-router'
import { UCLA, UI } from '../../constants/Colors'
import { Text, View, Animated, TouchableOpacity } from 'react-native'
import { getAuth } from 'firebase/auth'
import { collection, query, where, onSnapshot } from 'firebase/firestore'
import { db } from '../../firebase.config'
import { useRouter } from 'expo-router'

function MessageIcon({ color, unread }: { color: string; unread: boolean }) {
  return (
    <View>
      <Text style={{ fontSize: 22, color }}>💬</Text>
      {unread && (
        <View style={{
          position: 'absolute', top: -2, right: -4,
          width: 10, height: 10, borderRadius: 5,
          backgroundColor: '#EF4444',
          borderWidth: 1.5, borderColor: UCLA.blue,
        }} />
      )}
    </View>
  )
}

function Toast({ message, chatId, onDismiss }: { message: string; chatId: string; onDismiss: () => void }) {
  const slideY = useRef(new Animated.Value(-100)).current
  const router = useRouter()

  useEffect(() => {
    Animated.spring(slideY, { toValue: 0, useNativeDriver: true, tension: 80 }).start()
    const timer = setTimeout(() => {
      Animated.timing(slideY, { toValue: -100, duration: 300, useNativeDriver: true }).start(onDismiss)
    }, 4000)
    return () => clearTimeout(timer)
  }, [])

  return (
    <Animated.View style={{
      position: 'absolute', top: 52, left: 16, right: 16, zIndex: 999,
      transform: [{ translateY: slideY }],
      backgroundColor: UI.white,
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
        <Text style={{ fontSize: 13, color: UI.charcoal }} numberOfLines={1}>{message}</Text>
      </View>
      <TouchableOpacity
        onPress={() => {
          onDismiss()
          router.push({ pathname: '/chat/[id]', params: { id: chatId } })
        }}
        style={{ backgroundColor: UCLA.blue, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5 }}
      >
        <Text style={{ fontSize: 12, fontWeight: '800', color: UI.white }}>View</Text>
      </TouchableOpacity>
    </Animated.View>
  )
}

export default function TabsLayout() {
  const [hasUnread, setHasUnread] = useState(false)
  const [toast, setToast] = useState<{ message: string; chatId: string } | null>(null)
  const user = getAuth().currentUser

  useEffect(() => {
    if (!user) return
    const q = query(
      collection(db, 'chats'),
      where('participants', 'array-contains', user.uid),
    )
    const unsub = onSnapshot(q, snap => {
      for (const change of snap.docChanges()) {
        if (change.type === 'modified') {
          const chat = change.doc.data()
          if (chat.lastSenderId && chat.lastSenderId !== user.uid && chat.lastMessage) {
            setHasUnread(true)
            setToast({ message: chat.lastMessage, chatId: change.doc.id })
          }
        }
      }
    })
    return unsub
  }, [user])

  return (
    <View style={{ flex: 1 }}>
      {toast && (
        <Toast
          message={toast.message}
          chatId={toast.chatId}
          onDismiss={() => { setToast(null); setHasUnread(false) }}
        />
      )}
      <Tabs
        screenOptions={{
          headerShown:    false,
          tabBarStyle:    {
            backgroundColor:  UCLA.blue,
            borderTopWidth:   0,
            height:           76,
            paddingBottom:    10,
            shadowColor:      UCLA.blue,
            shadowOpacity:    0.3,
            shadowRadius:     12,
            elevation:        10,
          },
          tabBarActiveTintColor:   UCLA.gold,
          tabBarInactiveTintColor: 'rgba(255,255,255,0.55)',
          tabBarLabelStyle:        { fontSize: 10 },
          tabBarIconStyle:         { marginTop: 2 },
        }}
      >
        <Tabs.Screen name="home"     options={{ title: 'Home',      tabBarIcon: ({ color }) => <Text style={{ fontSize: 22, color }}>🏠</Text> }} />
        <Tabs.Screen name="plan"     options={{ title: 'Plan Trip', tabBarIcon: ({ color }) => <Text style={{ fontSize: 22, color }}>🗺️</Text> }} />
        <Tabs.Screen name="active"   options={{ title: 'Active',    tabBarIcon: ({ color }) => <Text style={{ fontSize: 22, color }}>⭐</Text> }} />
        <Tabs.Screen name="messages" options={{
          title: 'Messages',
          tabBarIcon: ({ color }) => <MessageIcon color={color} unread={hasUnread} />,
        }} />
        <Tabs.Screen name="profile"  options={{ title: 'Profile',   tabBarIcon: ({ color }) => <Text style={{ fontSize: 22, color }}>👤</Text> }} />
      </Tabs>
    </View>
  )
}
