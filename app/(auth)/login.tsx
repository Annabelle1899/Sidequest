// app/(auth)/login.tsx
// PERSON 1 — Log In screen

import { useState } from 'react'
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Alert, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native'
import { useRouter } from 'expo-router'
import { logIn } from '../../services/auth'
import { UCLA, UI } from '../../constants/Colors'

export default function LoginScreen() {
  const router = useRouter()
  const [email, setEmail]     = useState('')
  const [password, setPass]   = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLogin() {
    if (!email || !password) {
      return Alert.alert('Missing Fields', 'Please enter your email and password.')
    }
    setLoading(true)
    try {
      await logIn(email.trim(), password)
    } catch (err: any) {
      console.log('Login error:', err.code, err.message)
      Alert.alert('Login Failed', err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <TouchableOpacity style={styles.back} onPress={() => router.back()}>
            <Text style={styles.backText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Welcome{'\n'}back, Bruin! 👋</Text>
          <Text style={styles.sub}>Sign in to your Sidequest account</Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.label}>UCLA Email or Username</Text>
          <TextInput
            style={[styles.input, styles.inputGold]}
            value={email} onChangeText={setEmail}
            placeholder="username@g.ucla.edu"
            keyboardType="email-address" autoCapitalize="none"
          />

          <Text style={[styles.label, { marginTop: 14 }]}>Password</Text>
          <TextInput
            style={[styles.input, styles.inputBlue]}
            value={password} onChangeText={setPass}
            placeholder="Your password" secureTextEntry
          />

          <TouchableOpacity style={{ alignSelf: 'flex-end', marginTop: 8, marginBottom: 20 }}>
            <Text style={styles.forgot}>Forgot password?</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.btn, loading && { opacity: 0.7 }]}
            onPress={handleLogin} disabled={loading}
          >
            {loading
              ? <ActivityIndicator color={UI.white} />
              : <Text style={styles.btnText}>Log In →</Text>}
          </TouchableOpacity>

          <View style={styles.divider}>
            <View style={styles.line} /><Text style={styles.orText}>or</Text><View style={styles.line} />
          </View>

          <TouchableOpacity onPress={() => router.replace('/(auth)/signup')}>
            <Text style={styles.footer}>New to Sidequest? <Text style={styles.link}>Create Account</Text></Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container:  { flex: 1, backgroundColor: UI.white },
  header:     { backgroundColor: UCLA.blue, padding: 24, paddingTop: 60, paddingBottom: 32 },
  back:       { width: 38, height: 38, borderRadius: 19, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center', marginBottom: 18 },
  backText:   { color: UI.white, fontSize: 18, fontFamily: 'Nunito-Bold' },
  title:      { fontFamily: 'Nunito-Black', fontSize: 30, color: UI.white, lineHeight: 36 },
  sub:        { fontFamily: 'NunitoSans-Regular', fontSize: 14, color: 'rgba(255,255,255,0.65)', marginTop: 5 },
  form:       { padding: 24 },
  label:      { fontFamily: 'Nunito-ExtraBold', fontSize: 13, color: UI.mid, marginBottom: 7 },
  input:      { height: 52, borderRadius: 12, borderWidth: 2, paddingHorizontal: 16, fontFamily: 'NunitoSans-Regular', fontSize: 15, color: UI.charcoal },
  inputGold:  { backgroundColor: UCLA.goldPale, borderColor: UCLA.goldLight },
  inputBlue:  { backgroundColor: UCLA.bluePale, borderColor: UCLA.blueLight },
  forgot:     { fontFamily: 'Nunito-Bold', fontSize: 13, color: UCLA.blue },
  btn:        { height: 54, borderRadius: 14, backgroundColor: UCLA.blue, alignItems: 'center', justifyContent: 'center', shadowColor: UCLA.blue, shadowOpacity: 0.4, shadowRadius: 10, shadowOffset: { width: 0, height: 4 }, elevation: 5 },
  btnText:    { fontFamily: 'Nunito-ExtraBold', fontSize: 16, color: UI.white },
  divider:    { flexDirection: 'row', alignItems: 'center', marginVertical: 18, gap: 12 },
  line:       { flex: 1, height: 1, backgroundColor: UI.border },
  orText:     { fontFamily: 'Nunito-SemiBold', fontSize: 12, color: UI.soft },
  footer:     { textAlign: 'center', fontFamily: 'NunitoSans-Regular', fontSize: 14, color: UI.soft },
  link:       { color: UCLA.blue, fontFamily: 'Nunito-Bold' },
})
