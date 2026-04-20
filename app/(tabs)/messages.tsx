// app/(tabs)/messages.tsx
// PERSON 4 — Messages list screen
// Shows all chat conversations the user is part of

import { useState, useEffect } from 'react'
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native'
import { useRouter } from 'expo-router'
import { getAuth } from 'firebase/auth'
import { getUserChats } from '../../services/firestore'
import { UCLA, UI } from '../../constants/Colors'

export default function MessagesScreen() {
  const router = useRouter()
  const user   = getAuth().currentUser!
  const [chats, setChats] = useState<any[]>([])

  useEffect(() => {
    getUserChats(user.uid).then(setChats)
  }, [])

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Messages 💬</Text>
        <Text style={styles.sub}>Your trip conversations</Text>
      </View>

      <FlatList
        data={chats}
        keyExtractor={c => c.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={{ fontSize: 40 }}>💬</Text>
            <Text style={styles.emptyText}>No messages yet</Text>
            <Text style={styles.emptySub}>Match with someone to start chatting!</Text>
          </View>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.chatRow}
            onPress={() => router.push({ pathname: '/chat/[id]', params: { id: item.id } })}
          >
            <View style={styles.ava}><Text style={{ fontSize: 22 }}>🧑</Text></View>
            <View style={styles.chatInfo}>
              <Text style={styles.chatName}>Trip Chat</Text>
              <Text style={styles.chatLast} numberOfLines={1}>
                {item.lastMessage || 'No messages yet'}
              </Text>
            </View>
            <Text style={styles.chatTime}>
              {item.lastMessageAt?.toDate
                ? item.lastMessageAt.toDate().toLocaleDateString()
                : ''}
            </Text>
          </TouchableOpacity>
        )}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: UI.bg },
  header:    { backgroundColor: UCLA.blue, padding: 20, paddingTop: 56 },
  title:     { fontFamily: 'Nunito-Black', fontSize: 26, color: UI.white },
  sub:       { fontFamily: 'NunitoSans-Regular', fontSize: 14, color: 'rgba(255,255,255,0.65)', marginTop: 3 },
  list:      { padding: 20, gap: 10 },
  empty:     { alignItems: 'center', paddingVertical: 60, gap: 8 },
  emptyText: { fontFamily: 'Nunito-Bold', fontSize: 18, color: UI.mid },
  emptySub:  { fontFamily: 'NunitoSans-Regular', fontSize: 14, color: UI.soft },
  chatRow:   { backgroundColor: UI.white, borderRadius: 16, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 12, shadowColor: UCLA.blue, shadowOpacity: 0.06, shadowRadius: 6, elevation: 2 },
  ava:       { width: 48, height: 48, borderRadius: 24, backgroundColor: UCLA.gold, alignItems: 'center', justifyContent: 'center' },
  chatInfo:  { flex: 1 },
  chatName:  { fontFamily: 'Nunito-ExtraBold', fontSize: 15, color: UI.charcoal },
  chatLast:  { fontFamily: 'NunitoSans-Regular', fontSize: 13, color: UI.soft, marginTop: 2 },
  chatTime:  { fontFamily: 'Nunito-SemiBold', fontSize: 11, color: UI.soft },
})
