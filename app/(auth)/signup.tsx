// app/(auth)/signup.tsx
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
  const [username, setUsername]       = useState('')
  const [email, setEmail]             = useState('')
  const [password, setPassword]       = useState('')
  const [confirmPassword, setConfirm] = useState('')
  const [loading, setLoading]         = useState(false)

  async function handleSignUp() {
    if (!username || !email || !password || !confirmPassword) {
      return Alert.alert('Missing Fields', 'Please fill in all fields.')
    }
    if (!email.endsWith('@g.ucla.edu') && !email.endsWith('@ucla.edu')) {
      return Alert.alert('UCLA Email Required', 'Please use your UCLA email (@g.ucla.edu or @ucla.edu)')
    }
    if (password.length < 6) {
      return Alert.alert('Password Too Short', 'Password must be at least 6 characters.')
    }
    if (password !== confirmPassword) {
      return Alert.alert('Password Mismatch', 'Passwords do not match.')
    }
    setLoading(true)
    try {
      await signUp(email.trim(), password, username.trim())
    } catch (err: any) {
      Alert.alert('Sign Up Failed', err.message)
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
          <Text style={styles.title}>Create your{'\n'}account 🎓</Text>
          <Text style={styles.sub}>Join the UCLA Sidequest community</Text>
        </View>

        <View style={styles.form}>
          {/* Username */}
          <View style={styles.fieldWrap}>
            <Text style={styles.label}>Username</Text>
            <TextInput style={styles.input} value={username} onChangeText={setUsername} placeholder="e.g. bruinjane" />
          </View>

          {/* UCLA Email */}
          <View style={styles.fieldWrap}>
            <Text style={styles.label}>UCLA Email</Text>
            <TextInput style={styles.input} value={email} onChangeText={setEmail} placeholder="username@g.ucla.edu" keyboardType="email-address" autoCapitalize="none" />
            <Text style={styles.hint}>⚠️ Must be a UCLA email (@g.ucla.edu or @ucla.edu)</Text>
          </View>

          {/* Password */}
          <View style={styles.fieldWrap}>
            <Text style={styles.label}>Password</Text>
            <TextInput style={styles.input} value={password} onChangeText={setPassword} placeholder="Create a password" secureTextEntry />
            <Text style={styles.hint}>⚠️ Must be at least 6 characters</Text>
          </View>

          {/* Confirm Password */}
          <View style={styles.fieldWrap}>
            <Text style={styles.label}>Confirm Password</Text>
            <TextInput style={styles.input} value={confirmPassword} onChangeText={setConfirm} placeholder="Repeat your password" secureTextEntry />
          </View>

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

const styles = StyleSheet.create({
  container:  { flex: 1, backgroundColor: UI.white },
  header:     { backgroundColor: UCLA.blue, padding: 24, paddingTop: 60, paddingBottom: 32 },
  back:       { width: 38, height: 38, borderRadius: 19, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center', marginBottom: 18 },
  backText:   { color: UI.white, fontSize: 18 },
  title:      { fontSize: 30, fontWeight: '900', color: UI.white, lineHeight: 36 },
  sub:        { fontSize: 14, color: 'rgba(255,255,255,0.65)', marginTop: 5 },
  form:       { padding: 24 },
  fieldWrap:  { marginBottom: 16 },
  label:      { fontSize: 13, fontWeight: '700', color: UI.mid, marginBottom: 7 },
  input:      { height: 52, borderRadius: 12, borderWidth: 2, borderColor: UCLA.goldLight, backgroundColor: UCLA.goldPale, paddingHorizontal: 16, fontSize: 15, color: UI.charcoal },
  hint:       { fontSize: 12, color: UI.soft, marginTop: 5 },
  btn:        { height: 54, borderRadius: 14, backgroundColor: UCLA.gold, alignItems: 'center', justifyContent: 'center', marginTop: 6 },
  btnText:    { fontSize: 16, fontWeight: '800', color: UI.charcoal },
  divider:    { flexDirection: 'row', alignItems: 'center', marginVertical: 18, gap: 12 },
  line:       { flex: 1, height: 1, backgroundColor: UI.border },
  orText:     { fontSize: 12, color: UI.soft },
  footer:     { textAlign: 'center', fontSize: 14, color: UI.soft },
  link:       { color: UCLA.blue, fontWeight: '700' },
})