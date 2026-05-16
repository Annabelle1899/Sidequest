import { useState, useEffect } from 'react'
import { Tabs } from 'expo-router'
import { UCLA, UI } from '../../constants/Colors'
import { Text, View } from 'react-native'
import { getAuth } from 'firebase/auth'
import { collection, query, where, onSnapshot } from 'firebase/firestore'
import { db } from '../../firebase.config'

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

export default function TabsLayout() {
  const [hasUnread, setHasUnread] = useState(false)
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
          if (chat.lastSenderId && chat.lastSenderId !== user.uid) {
            setHasUnread(true)
            return
          }
        }
      }
    })
    return unsub
  }, [user])

  return (
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
  )
}
