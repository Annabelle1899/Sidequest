import { useState, useEffect } from 'react'
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native'
import { useRouter } from 'expo-router'
import { getAuth } from 'firebase/auth'
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore'
import { db } from '../../firebase.config'
import { UCLA, UI } from '../../constants/Colors'

export default function MessagesScreen() {
  const router = useRouter()
  const user   = getAuth().currentUser!
  const [chats, setChats] = useState<any[]>([])
  const [unread, setUnread] = useState<Set<string>>(new Set())

  useEffect(() => {
    const q = query(
      collection(db, 'chats'),
      where('participants', 'array-contains', user.uid),
      orderBy('lastMessageAt', 'desc')
    )
    const unsub = onSnapshot(q, snap => {
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() }))
      setChats(data)

      // Check for unread messages
      const newUnread = new Set<string>()
      for (const change of snap.docChanges()) {
        if (change.type === 'modified') {
          const chat = change.doc.data()
          const lastMsg = chat.lastMessage || ''
          if (lastMsg && chat.lastSenderId !== user.uid) {
            newUnread.add(change.doc.id)
          }
        }
      }
      if (newUnread.size > 0) {
        setUnread(prev => new Set([...prev, ...newUnread]))
      }
    })
    return unsub
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
        renderItem={({ item }) => {
          const hasUnread = unread.has(item.id)
          return (
            <TouchableOpacity
              style={[styles.chatRow, hasUnread && styles.chatRowUnread]}
              onPress={() => {
                setUnread(prev => { const s = new Set(prev); s.delete(item.id); return s })
                router.push({ pathname: '/chat/[id]', params: { id: item.id, destination: item.destination || '' } })
              }}
            >
              <View style={styles.avaWrap}>
                <View style={styles.ava}><Text style={{ fontSize: 22 }}>🧑</Text></View>
                {hasUnread && <View style={styles.dot} />}
              </View>
              <View style={styles.chatInfo}>
                <Text style={[styles.chatName, hasUnread && { color: UCLA.blue }]}>
                  {item.destination ? `Trip to ${item.destination}` : 'Trip Chat'}
                </Text>
                <Text style={[styles.chatLast, hasUnread && { fontWeight: '700', color: UI.charcoal }]} numberOfLines={1}>
                  {item.lastMessage || 'No messages yet'}
                </Text>
              </View>
              <View style={{ alignItems: 'flex-end', gap: 6 }}>
                <Text style={styles.chatTime}>
                  {item.lastMessageAt?.toDate
                    ? item.lastMessageAt.toDate().toLocaleDateString()
                    : ''}
                </Text>
                {hasUnread && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>New</Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          )
        }}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container:     { flex: 1, backgroundColor: UI.bg },
  header:        { backgroundColor: UCLA.blue, padding: 20, paddingTop: 56 },
  title:         { fontSize: 26, fontWeight: '900', color: UI.white },
  sub:           { fontSize: 14, color: 'rgba(255,255,255,0.65)', marginTop: 3 },
  list:          { padding: 20, gap: 10 },
  empty:         { alignItems: 'center', paddingVertical: 60, gap: 8 },
  emptyText:     { fontSize: 18, color: UI.mid },
  emptySub:      { fontSize: 14, color: UI.soft },
  chatRow:       { backgroundColor: UI.white, borderRadius: 16, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 12 },
  chatRowUnread: { borderWidth: 1.5, borderColor: UCLA.blueLight, backgroundColor: UCLA.bluePale },
  avaWrap:       { position: 'relative' },
  ava:           { width: 48, height: 48, borderRadius: 24, backgroundColor: UCLA.gold, alignItems: 'center', justifyContent: 'center' },
  dot:           { position: 'absolute', top: 0, right: 0, width: 12, height: 12, borderRadius: 6, backgroundColor: '#EF4444', borderWidth: 2, borderColor: UI.white },
  chatInfo:      { flex: 1 },
  chatName:      { fontSize: 15, fontWeight: '800', color: UI.charcoal },
  chatLast:      { fontSize: 13, color: UI.soft, marginTop: 2 },
  chatTime:      { fontSize: 11, color: UI.soft },
  badge:         { backgroundColor: UCLA.blue, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 2 },
  badgeText:     { fontSize: 10, fontWeight: '800', color: UI.white },
})
