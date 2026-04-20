// app/(auth)/signup.tsx
// PERSON 1 — Create Account screen
// Calls signUp() from services/auth.ts

import { useState } from 'react'
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ScrollView, Alert, ActivityIndicator, KeyboardAvoidingView, Platform,
} from 'react-native'
import { useRouter } from 'expo-router'
import { signUp } from '../../services/auth'
import { UCLA, UI } from '../../constants/Colors'

export default function SignupScreen() {
  const router = useRouter()

  // Form state
  const [username, setUsername]           = useState('')
  const [email, setEmail]                 = useState('')
  const [password, setPassword]           = useState('')
  const [confirmPassword, setConfirm]     = useState('')
  const [loading, setLoading]             = useState(false)

  async function handleSignUp() {
    // Basic validation
    if (!username || !email || !password || !confirmPassword) {
      return Alert.alert('Missing Fields', 'Please fill in all fields.')
    }
    if (password !== confirmPassword) {
      return Alert.alert('Password Mismatch', 'Passwords do not match.')
    }
    if (password.length < 6) {
      return Alert.alert('Weak Password', 'Password must be at least 6 characters.')
    }

    setLoading(true)
    try {
      await signUp(email.trim(), password, username.trim())
      // _layout.tsx will automatically redirect to home after login
    } catch (err: any) {
      Alert.alert('Sign Up Failed', err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.back} onPress={() => router.back()}>
            <Text style={styles.backText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Create your{'\n'}account 🎓</Text>
          <Text style={styles.sub}>Join the UCLA Sidequest community</Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          <Field label="Username" value={username} onChangeText={setUsername} placeholder="e.g. bruinjane" />
          <Field label="UCLA Email" value={email} onChangeText={setEmail} placeholder="username@g.ucla.edu" keyboardType="email-address" autoCapitalize="none" />
          <Field label="Password" value={password} onChangeText={setPassword} placeholder="Create a password" secureTextEntry />
          <Field label="Confirm Password" value={confirmPassword} onChangeText={setConfirm} placeholder="Repeat your password" secureTextEntry />

          <TouchableOpacity
            style={[styles.btn, loading && { opacity: 0.7 }]}
            onPress={handleSignUp}
            disabled={loading}
          >
            {loading
              ? <ActivityIndicator color={UI.charcoal} />
              : <Text style={styles.btnText}>Create Account →</Text>}
          </TouchableOpacity>

          <View style={styles.divider}>
            <View style={styles.line} /><Text style={styles.orText}>or</Text><View style={styles.line} />
          </View>

          <TouchableOpacity onPress={() => router.replace('/(auth)/login')}>
            <Text style={styles.footer}>Already have an account? <Text style={styles.link}>Log In</Text></Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

// Reusable input field component
function Field({ label, ...props }: any) {
  return (
    <View style={{ marginBottom: 14 }}>
      <Text style={styles.label}>{label}</Text>
      <TextInput style={styles.input} {...props} />
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: UI.white },
  header: { backgroundColor: UCLA.blue, padding: 24, paddingTop: 60, paddingBottom: 32 },
  back: { width: 38, height: 38, borderRadius: 19, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center', marginBottom: 18 },
  backText: { color: UI.white, fontSize: 18, fontFamily: 'Nunito-Bold' },
  title: { fontFamily: 'Nunito-Black', fontSize: 30, color: UI.white, lineHeight: 36 },
  sub: { fontFamily: 'NunitoSans-Regular', fontSize: 14, color: 'rgba(255,255,255,0.65)', marginTop: 5 },
  form: { padding: 24 },
  label: { fontFamily: 'Nunito-ExtraBold', fontSize: 13, color: UI.mid, marginBottom: 7 },
  input: {
    height: 52, borderRadius: 12, borderWidth: 2, borderColor: UCLA.goldLight,
    backgroundColor: UCLA.goldPale, paddingHorizontal: 16,
    fontFamily: 'NunitoSans-Regular', fontSize: 15, color: UI.charcoal,
  },
  btn: {
    height: 54, borderRadius: 14, backgroundColor: UCLA.gold,
    alignItems: 'center', justifyContent: 'center', marginTop: 6,
    shadowColor: UCLA.gold, shadowOpacity: 0.4, shadowRadius: 10, shadowOffset: { width: 0, height: 4 }, elevation: 5,
  },
  btnText: { fontFamily: 'Nunito-ExtraBold', fontSize: 16, color: UI.charcoal },
  divider: { flexDirection: 'row', alignItems: 'center', marginVertical: 18, gap: 12 },
  line: { flex: 1, height: 1, backgroundColor: UI.border },
  orText: { fontFamily: 'Nunito-SemiBold', fontSize: 12, color: UI.soft },
  footer: { textAlign: 'center', fontFamily: 'NunitoSans-Regular', fontSize: 14, color: UI.soft },
  link: { color: UCLA.blue, fontFamily: 'Nunito-Bold' },
})
