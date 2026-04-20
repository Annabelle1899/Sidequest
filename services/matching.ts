// services/matching.ts
// PERSON 3 — passenger/driver matching algorithm

import { Trip, getOpenTrips, updateTripStatus, updateUserProfile } from './firestore'
import { doc, updateDoc } from 'firebase/firestore'
import { db } from '../firebase.config'

// ─────────────────────────────────────────
// FIND BEST MATCH for a given trip
// ─────────────────────────────────────────
export async function findMatch(myTrip: Trip): Promise<Trip | null> {
  // Fetch all open trips going to same destination with opposite role
  const candidates = await getOpenTrips(myTrip.role, myTrip.destination)

  if (candidates.length === 0) return null

  // Score each candidate and pick the best
  const scored = candidates
    .filter(c => c.userId !== myTrip.userId) // exclude self
    .map(c => ({ trip: c, score: scoreMatch(myTrip, c) }))
    .sort((a, b) => b.score - a.score)

  return scored.length > 0 ? scored[0].trip : null
}

// ─────────────────────────────────────────
// SCORING: higher = better match
// ─────────────────────────────────────────
function scoreMatch(mine: Trip, theirs: Trip): number {
  let score = 0

  // Same date: +50
  if (mine.date === theirs.date) score += 50

  // Similar pickup time: up to +30
  const myMinutes  = timeToMinutes(mine.pickupTime)
  const thrMinutes = timeToMinutes(theirs.pickupTime)
  const diff = Math.abs(myMinutes - thrMinutes)
  if (diff <= 15)  score += 30
  else if (diff <= 30) score += 20
  else if (diff <= 60) score += 10

  // Gender preference compatible: +20
  const genderOk =
    mine.genderPref   === 'no_pref' ||
    theirs.genderPref === 'no_pref'
  if (genderOk) score += 20

  // Duration match: +10
  if (mine.duration === theirs.duration) score += 10

  return score
}

function timeToMinutes(time: string): number {
  // Parse "10:00 AM" → minutes since midnight
  const [t, period] = time.split(' ')
  const [h, m] = t.split(':').map(Number)
  let hours = h
  if (period === 'PM' && h !== 12) hours += 12
  if (period === 'AM' && h === 12) hours = 0
  return hours * 60 + m
}

// ─────────────────────────────────────────
// CONFIRM MATCH — updates both trip records
// ─────────────────────────────────────────
export async function confirmMatch(
  myTripId: string,
  theirTripId: string,
  myUid: string,
  theirUid: string,
  chatId: string
) {
  // Mark both trips as matched
  await updateDoc(doc(db, 'trips', myTripId), {
    status: 'matched',
    matchedWith: theirUid,
    chatId,
  })
  await updateDoc(doc(db, 'trips', theirTripId), {
    status: 'matched',
    matchedWith: myUid,
    chatId,
  })
}
