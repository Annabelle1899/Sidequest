// app/(auth)/welcome.tsx
// PERSON 1 — Welcome / landing screen
// Shows UCLA branding, two buttons: Create Account & Log In

import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native'
import { useRouter } from 'expo-router'
import { UCLA, UI } from '../../constants/Colors'
import { LinearGradient } from 'expo-linear-gradient'
import { StatusBar } from 'expo-status-bar'

export default function WelcomeScreen() {
  const router = useRouter()

  return (
    <LinearGradient
      colors={[UCLA.blueDark, UCLA.blue, '#1a3d6b']}
      style={styles.container}
    >
      <StatusBar style="light" />

      {/* Logo */}
      <View style={styles.logoBox}>
        <Text style={styles.logoIcon}>🗺️</Text>
      </View>

      {/* Title */}
      <Text style={styles.title}>Sidequest</Text>

      {/* UCLA badge */}
      <View style={styles.badge}>
        <Text style={styles.badgeText}>🐻 UCLA Ride-Share</Text>
      </View>

      {/* Tagline */}
      <Text style={styles.sub}>
        Go anywhere together.{'\n'}Meet your Bruin community.
      </Text>

      {/* Buttons */}
      <View style={styles.buttons}>
        <TouchableOpacity
          style={styles.btnGold}
          onPress={() => router.push('/(auth)/signup')}
          activeOpacity={0.85}
        >
          <Text style={styles.btnGoldText}>✨  Create Account</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.btnOutline}
          onPress={() => router.push('/(auth)/login')}
          activeOpacity={0.85}
        >
          <Text style={styles.btnOutlineText}>Welcome back — Log In</Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 28 },
  logoBox: {
    width: 110, height: 110, borderRadius: 36,
    backgroundColor: UCLA.gold,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 24,
    shadowColor: UCLA.gold, shadowOpacity: 0.5,
    shadowRadius: 20, shadowOffset: { width: 0, height: 8 },
    elevation: 10,
  },
  logoIcon:    { fontSize: 52 },
  title:       { fontFamily: 'Nunito-Black', fontSize: 42, color: UI.white, marginBottom: 10 },
  badge: {
    backgroundColor: UCLA.gold, borderRadius: 20,
    paddingHorizontal: 16, paddingVertical: 5, marginBottom: 14,
  },
  badgeText:   { fontFamily: 'Nunito-Bold', fontSize: 13, color: UI.charcoal },
  sub: {
    fontSize: 16, color: 'rgba(255,255,255,0.72)',
    textAlign: 'center', lineHeight: 24, marginBottom: 48,
    fontFamily: 'NunitoSans-Regular',
  },
  buttons: { width: '100%', gap: 12 },
  btnGold: {
    backgroundColor: UCLA.gold, height: 54, borderRadius: 14,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: UCLA.gold, shadowOpacity: 0.5,
    shadowRadius: 12, shadowOffset: { width: 0, height: 4 }, elevation: 6,
  },
  btnGoldText: { fontFamily: 'Nunito-ExtraBold', fontSize: 16, color: UI.charcoal },
  btnOutline: {
    height: 54, borderRadius: 14, borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.35)',
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center', justifyContent: 'center',
  },
  btnOutlineText: { fontFamily: 'Nunito-Bold', fontSize: 16, color: UI.white },
})
