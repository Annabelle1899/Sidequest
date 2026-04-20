// app/(tabs)/_layout.tsx
// PERSON 1 — Bottom navigation bar layout

import { Tabs } from 'expo-router'
import { UCLA, UI } from '../../constants/Colors'
import { Text } from 'react-native'

export default function TabsLayout() {
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
        tabBarLabelStyle:        { fontFamily: 'Nunito-Bold', fontSize: 10 },
        tabBarIconStyle:         { marginTop: 2 },
      }}
    >
      <Tabs.Screen name="home"     options={{ title: 'Home',      tabBarIcon: ({ color }) => <Text style={{ fontSize: 22, color }}>🏠</Text> }} />
      <Tabs.Screen name="plan"     options={{ title: 'Plan Trip', tabBarIcon: ({ color }) => <Text style={{ fontSize: 22, color }}>🗺️</Text> }} />
      <Tabs.Screen name="active"   options={{ title: 'Active',    tabBarIcon: ({ color }) => <Text style={{ fontSize: 22, color }}>⭐</Text> }} />
      <Tabs.Screen name="messages" options={{ title: 'Messages',  tabBarIcon: ({ color }) => <Text style={{ fontSize: 22, color }}>💬</Text> }} />
      <Tabs.Screen name="profile"  options={{ title: 'Profile',   tabBarIcon: ({ color }) => <Text style={{ fontSize: 22, color }}>👤</Text> }} />
    </Tabs>
  )
}
