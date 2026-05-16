import { useState, useEffect, useRef } from 'react'
import {
  View, Text, TextInput, TouchableOpacity, FlatList,
  StyleSheet, KeyboardAvoidingView, Platform, Alert,
} from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { getAuth } from 'firebase/auth'
import { listenToMessages, sendMessage, getUserById, Message } from '../../services/firestore'
import { UCLA, UI } from '../../constants/Colors'

export default function ChatScreen() {
  const { id: chatId, destination } = useLocalSearchParams<{ id: string; destination: string }>()
  const router  = useRouter()
  const user    = getAuth().currentUser!
  const listRef = useRef<FlatList>(null)

  const [messages, setMessages] = useState<Message[]>([])
  const [inputText, setInput]   = useState('')

  useEffect(() => {
    if (!chatId) return
    const unsub = listenToMessages(chatId, (msgs) => {
      setMessages(msgs)
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100)
    })
    return unsub
  }, [chatId])

  async function handleSend() {
    const text = inputText.trim()
    if (!text || !chatId) return
    setInput('')
    await sendMessage(chatId, {
      text,
      senderId:   user.uid,
      senderName: user.displayName || 'You',
      read:       false,
    })
  }

  async function handleSharePhone() {
    const profile = await getUserById(user.uid)
    const phone = profile?.phone
    if (!phone) {
      Alert.alert('No phone number', 'Go to your Profile and add a phone number first!')
      return
    }
    await sendMessage(chatId, {
      text: `📱 My phone number: ${phone}`,
      senderId:   user.uid,
      senderName: user.displayName || 'You',
      read:       false,
    })
  }

  function renderMessage({ item }: { item: Message }) {
    const isMe = item.senderId === user.uid
    return (
      <View style={[styles.msgRow, isMe ? styles.msgRowMe : styles.msgRowThem]}>
        <View style={[styles.bubble, isMe ? styles.bubbleMe : styles.bubbleThem]}>
          <Text style={[styles.bubbleText, isMe && { color: UI.white }]}>{item.text}</Text>
        </View>
        <Text style={[styles.msgTime, isMe && { textAlign: 'right' }]}>
          {item.createdAt?.toDate
            ? item.createdAt.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            : '...'}
        </Text>
      </View>
    )
  }

  const chatTitle = destination ? `Trip to ${destination}` : 'Trip Chat'

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <View style={styles.header}>
        <TouchableOpacity style={styles.back} onPress={() => router.back()}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.peerName}>{chatTitle}</Text>
          <Text style={styles.peerStatus}>● Online</Text>
        </View>
        <View style={styles.peerAva}><Text style={{ fontSize: 18 }}>🧑</Text></View>
      </View>

      <FlatList
        ref={listRef}
        data={messages}
        keyExtractor={m => m.id || Math.random().toString()}
        renderItem={renderMessage}
        contentContainerStyle={styles.msgList}
        onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: false })}
        ListEmptyComponent={
          <View style={{ alignItems: 'center', padding: 40 }}>
            <Text style={{ fontSize: 32 }}>💬</Text>
            <Text style={{ color: UI.soft, marginTop: 8 }}>No messages yet. Say hi!</Text>
          </View>
        }
      />

      <View style={styles.inputRow}>
        <TouchableOpacity style={styles.shareBtn} onPress={handleSharePhone}>
          <Text style={{ fontSize: 20 }}>📱</Text>
        </TouchableOpacity>
        <TextInput
          style={styles.chatInput}
          value={inputText}
          onChangeText={setInput}
          placeholder="Type a message..."
          onSubmitEditing={handleSend}
          returnKeyType="send"
          multiline
        />
        <TouchableOpacity style={styles.sendBtn} onPress={handleSend}>
          <Text style={{ color: UI.white, fontSize: 18 }}>➤</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container:  { flex: 1, backgroundColor: UI.bg },
  header:     { backgroundColor: UCLA.blue, flexDirection: 'row', alignItems: 'center', padding: 14, paddingTop: 52, gap: 12 },
  back:       { width: 38, height: 38, borderRadius: 19, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center' },
  backText:   { color: UI.white, fontSize: 18 },
  peerName:   { fontSize: 17, fontWeight: '800', color: UI.white },
  peerStatus: { fontSize: 12, color: UCLA.gold },
  peerAva:    { width: 38, height: 38, borderRadius: 19, backgroundColor: UCLA.gold, alignItems: 'center', justifyContent: 'center' },
  msgList:    { padding: 16, gap: 10 },
  msgRow:     { maxWidth: '76%', gap: 4 },
  msgRowMe:   { alignSelf: 'flex-end' },
  msgRowThem: { alignSelf: 'flex-start' },
  bubble:     { borderRadius: 18, padding: 10 },
  bubbleThem: { backgroundColor: UI.white, borderWidth: 1.5, borderColor: UI.border, borderBottomLeftRadius: 4 },
  bubbleMe:   { backgroundColor: UCLA.blue, borderBottomRightRadius: 4 },
  bubbleText: { fontSize: 14, lineHeight: 20, color: UI.charcoal },
  msgTime:    { fontSize: 10, color: UI.soft },
  inputRow:   { backgroundColor: UI.white, borderTopWidth: 1, borderTopColor: UI.border, flexDirection: 'row', alignItems: 'center', padding: 11, gap: 8 },
  shareBtn:   { width: 46, height: 46, borderRadius: 23, backgroundColor: UCLA.goldPale, borderWidth: 2, borderColor: UCLA.goldLight, alignItems: 'center', justifyContent: 'center' },
  chatInput:  { flex: 1, minHeight: 46, maxHeight: 120, borderRadius: 23, borderWidth: 2, borderColor: UI.border, paddingHorizontal: 18, paddingVertical: 12, fontSize: 14, color: UI.charcoal, backgroundColor: UI.bg },
  sendBtn:    { width: 46, height: 46, borderRadius: 23, backgroundColor: UCLA.blue, alignItems: 'center', justifyContent: 'center' },
})
