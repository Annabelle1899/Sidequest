// app/(tabs)/plan.tsx
import { useState, useEffect } from 'react'
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  TextInput, Alert, ActivityIndicator, KeyboardAvoidingView, Platform,
} from 'react-native'
import { useRouter, useLocalSearchParams } from 'expo-router'
import { getAuth } from 'firebase/auth'
import { createTrip, createChat } from '../../services/firestore'
import { findMatch, confirmMatch } from '../../services/matching'
import { UCLA, UI } from '../../constants/Colors'

type Role       = 'passenger' | 'driver'
type GenderPref = 'girls' | 'guys' | 'no_pref'

export default function PlanTripScreen() {
  const router = useRouter()
  const params = useLocalSearchParams()
  const auth   = getAuth()
  const user   = auth.currentUser!

  const [role, setRole]             = useState<Role>('passenger')
  const [destination, setDest]      = useState((params.destination as string) || '')
  const [date, setDate]             = useState('')
  const [pickupTime, setPickupTime] = useState('10:00 AM')
  const [duration, setDuration]     = useState('Half-day')
  const [genderPref, setGenderPref] = useState<GenderPref>('no_pref')
  const [peopleCount, setPeople]    = useState('1')
  const [carCapacity, setCapacity]  = useState('4')
  const [freeSpots, setFreeSpots]   = useState('2')
  const [loading, setLoading]       = useState(false)

  useEffect(() => {
    if (params.destination) {
      setDest(params.destination as string)
    }
  }, [params.destination])

  const TIMES     = ['8:00 AM','9:00 AM','10:00 AM','11:00 AM','12:00 PM','2:00 PM','4:00 PM','6:00 PM']
  const DURATIONS = ['A few hours', 'Half-day', 'Full-day']

  async function handleMatch() {
    if (!destination || !date) {
      return Alert.alert('Missing Info', 'Please fill in destination and date.')
    }
    setLoading(true)
    try {
      const tripData = {
        userId:       user.uid,
        username:     user.displayName || '',
        userPhotoURL: user.photoURL,
        role, destination, date, pickupTime, duration, genderPref,
        peopleCount:  parseInt(peopleCount) || 1,
        carCapacity:  role === 'driver' ? parseInt(carCapacity) : null,
        freeSpots:    role === 'driver' ? parseInt(freeSpots) : n
