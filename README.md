# 🗺️ Sidequest — UCLA Ride-Share App

A community ride-share app for UCLA students, built with React Native + Expo + Firebase.

---

## 👥 Team Task Division

| Person | Files to Work On | Feature |
|--------|-----------------|---------|
| **Person 1** | `firebase.config.ts`, `services/auth.ts`, `app/_layout.tsx`, `app/(auth)/welcome.tsx`, `app/(auth)/signup.tsx`, `app/(auth)/login.tsx`, `app/(tabs)/_layout.tsx` | Firebase setup, Login, Signup, Navigation |
| **Person 2** | `services/location.ts`, `app/(tabs)/home.tsx` | Home screen, GPS location, Search, Nearby users |
| **Person 3** | `services/matching.ts`, `app/(tabs)/plan.tsx`, `app/(tabs)/active.tsx`, `app/match.tsx` | Plan Trip form, Matching algorithm, Active Plans |
| **Person 4** | `app/chat/[id].tsx`, `app/tracker.tsx`, `app/(tabs)/messages.tsx`, `app/(tabs)/profile.tsx` | Real-time chat, Location tracker, Profile |

**Shared files (everyone reads, nobody edits without telling the team):**
- `constants/Colors.ts` — UCLA color palette
- `services/firestore.ts` — all database functions

---

## 🚀 First-Time Setup (Everyone does this once)

### Step 1 — Install tools
```bash
# Install Node.js from https://nodejs.org (LTS version)
# Then install Expo CLI:
npm install -g expo-cli

# Install the Expo Go app on your phone:
# iPhone: https://apps.apple.com/app/expo-go/id982107779
# Android: https://play.google.com/store/apps/details?id=host.exp.exponent
```

### Step 2 — Clone the repo
```bash
git clone https://github.com/YOUR_TEAM/sidequest.git
cd sidequest
npm install
```

### Step 3 — Firebase Setup (Person 1 does this, shares config with team)
1. Go to https://firebase.google.com → Sign in with Google
2. Click **"Add project"** → Name it `sidequest-ucla`
3. Once created, click **"Web"** icon (`</>`) → Register app as `sidequest`
4. Copy the `firebaseConfig` object
5. Open `firebase.config.ts` and replace the placeholder values
6. In Firebase Console:
   - Go to **Authentication** → **Sign-in method** → Enable **Email/Password**
   - Go to **Firestore Database** → **Create database** → Start in **test mode**
   - Go to **Storage** → **Get started** → Start in **test mode**
7. Share the filled-in `firebase.config.ts` with teammates via a **private** Discord/Slack message (never commit the real keys to GitHub!)

### Step 4 — Google Maps API Key (Person 2 does this)
1. Go to https://console.cloud.google.com
2. Create a new project → Enable these APIs:
   - **Maps SDK for Android**
   - **Maps SDK for iOS**
   - **Places API**
3. Go to **Credentials** → **Create API Key**
4. Add the key to `app.json` under `android.config.googleMaps.apiKey` and `ios.config.googleMapsApiKey`
5. Also add it as `GOOGLE_MAPS_API_KEY` constant in `services/location.ts`

### Step 5 — Run the app
```bash
npx expo start
```
Scan the QR code with your phone's camera (iPhone) or the Expo Go app (Android).

---

## 📁 File Structure Explained

```
sidequest/
├── app.json                    ← Expo configuration (app name, permissions)
├── package.json                ← All dependencies
├── firebase.config.ts          ← 🔴 Firebase credentials (keep private!)
│
├── constants/
│   └── Colors.ts               ← UCLA Blue #2774AE and Gold #FFD100
│
├── services/                   ← All backend logic (no UI here)
│   ├── auth.ts                 ← signUp(), logIn(), logOut()
│   ├── firestore.ts            ← All database read/write functions
│   ├── location.ts             ← GPS functions
│   └── matching.ts             ← Passenger-driver matching algorithm
│
└── app/                        ← All screens (UI)
    ├── _layout.tsx             ← Root: handles auth redirect
    ├── (auth)/                 ← Screens before login
    │   ├── welcome.tsx         ← Landing page
    │   ├── login.tsx           ← Login form
    │   └── signup.tsx          ← Create account form
    ├── (tabs)/                 ← Main app screens (bottom tab bar)
    │   ├── _layout.tsx         ← Tab bar configuration
    │   ├── home.tsx            ← Home + search + nearby users
    │   ├── plan.tsx            ← Plan a trip form
    │   ├── active.tsx          ← My active/past trips
    │   ├── messages.tsx        ← List of chat conversations
    │   └── profile.tsx         ← User profile + edit
    ├── match.tsx               ← Match result screen
    ├── tracker.tsx             ← Live location tracker map
    └── chat/[id].tsx           ← Real-time chat screen
```

---

## 🔄 Git Workflow (Important!)

```bash
# Before starting work each day:
git pull origin main

# Create your own branch:
git checkout -b person1-auth      # or person2-home, person3-trips, person4-chat

# After making changes:
git add .
git commit -m "Add login screen with Firebase auth"
git push origin person1-auth

# When your feature is done → open a Pull Request on GitHub
# → Ask a teammate to review → Merge into main
```

**⚠️ NEVER commit `firebase.config.ts` with real credentials to GitHub.**
Add it to `.gitignore`:
```
firebase.config.ts
.env
```

---

## 🗄️ Firestore Database Structure

```
users/
  {uid}/
    uid, username, email, year, major
    bio, interests, photoURL
    rating, totalTrips
    location: { latitude, longitude }

trips/
  {tripId}/
    userId, username, role (passenger/driver)
    destination, date, pickupTime, duration
    genderPref, peopleCount
    status: open | matched | completed
    matchedWith (uid), chatId
    driverLat, driverLng   ← updated live during trip

chats/
  {chatId}/
    participants: [uid1, uid2]
    tripId, lastMessage, lastMessageAt
    messages/
      {msgId}/
        text, senderId, senderName, createdAt, read
```

---

## 📦 Key Dependencies Explained

| Package | What it does |
|---------|-------------|
| `expo-router` | File-based navigation (like Next.js but for mobile) |
| `firebase` | Auth + Firestore database + Storage |
| `expo-location` | Access phone's GPS |
| `react-native-maps` | Show Google Maps inside the app |
| `expo-linear-gradient` | Gradient backgrounds (used on Welcome screen) |
| `react-native-google-places-autocomplete` | Search box that suggests real places |

---

## ✅ Testing Checklist

Before submitting, make sure each feature works:

- [ ] Can create a new account with UCLA email
- [ ] Can log in and log out
- [ ] Home screen shows current location
- [ ] Search bar suggests real destinations
- [ ] Can submit Plan Trip as passenger
- [ ] Can submit Plan Trip as driver
- [ ] Matching works between two accounts
- [ ] Chat messages send and receive in real time
- [ ] Location tracker shows driver pin moving on map
- [ ] Profile saves edits to Firestore
- [ ] App redirects to login when logged out

---

## ❓ Common Issues

**"Cannot find module firebase"**
```bash
npm install   # reinstall all packages
```

**"Location permission denied"**
→ Go to phone Settings → Apps → Expo Go → Permissions → Enable Location

**"Firebase: Error (auth/invalid-api-key)"**
→ Check `firebase.config.ts` — make sure you pasted the real credentials

**Map not showing**
→ Make sure Google Maps API key is added to `app.json`

---

## 📞 Team Contacts
- Person 1 (Auth):     _______________
- Person 2 (Home):     _______________
- Person 3 (Trips):    _______________
- Person 4 (Social):   _______________

**Go Bruins! 🐻💙💛**
