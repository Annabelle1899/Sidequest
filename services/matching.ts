// services/matching.ts
import { Trip, getOpenTrips } from './firestore'
import { doc, updateDoc } from 'firebase/firestore'
import { db } from '../firebase.config'

export async function findMatch(myTrip: Trip): Promise<Trip | null> {
  console.log('Finding match for:', myTrip.destination, myTrip.role)
  
  const candidates = await getOpenTrips(myTrip.role, myTrip.destination)
  console.log('Candidates found:', candidates.length)

  if (candidates.length === 0) return null

  const scored = candidates
    .filter(c => c.userId !== myTrip.userId)
    .map(c => ({ trip: c, score: scoreMatch(myTrip, c) }))
    .sort((a, b) => b.score - a.score)

  return scored.length > 0 ? scored[0].trip : null
}

function scoreMatch(mine: Trip, theirs: Trip): number {
  let score = 0

  if (mine.date === theirs.date) score += 50

  const myMinutes  = timeToMinutes(mine.pickupTime)
  const thrMinutes = timeToMinutes(theirs.pickupTime)
  const diff = Math.abs(myMinutes - thrMinutes)
  if (diff <= 15)       score += 30
  else if (diff <= 30)  score += 20
  else if (diff <= 60)  score += 10

  const genderOk =
    mine.genderPref === 'no_pref' ||
    theirs.genderPref === 'no_pref'
  if (genderOk) score += 20

  if (mine.duration === theirs.duration) score += 10

  return score
}

function timeToMinutes(time: string): number {
  const [t, period] = time.split(' ')
  const [h, m] = t.split(':').map(Number)
  let hours = h
  if (period === 'PM' && h !== 12) hours += 12
  if (period === 'AM' && h === 12) hours = 0
  return hours * 60 + m
}

export async function confirmMatch(
  myTripId: string,
  theirTripId: string,
  myUid: string,
  theirUid: string,
  chatId: string
) {
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