# 🗺️ Sidequest — UCLA Rideshare App

> Go anywhere together. Meet your Bruin community.

A UCLA-exclusive rideshare platform built by Bruins, for Bruins. Sidequest connects verified UCLA students as drivers and passengers for safe, affordable, and community-driven rides around LA.

---

## 👥 Team — Group 3

| Name | Role | Responsibilities |
|------|------|-----------------|
| Annabelle Wang | Person 1 | Firebase setup, Authentication, Navigation |
| Yumi Ko | Person 2 | Home screen, Search, Nearby Bruins |
| Ananya Rai | Person 3 | Trip planning, Matching algorithm |
| Bettina Wu | Person 4 | Profile, Chat, Live tracker |

---

## ✨ Features

- 🔐 **UCLA-verified login** — Only @g.ucla.edu and @ucla.edu emails allowed
- 🤝 **Smart matching** — Algorithm matches passengers and drivers by destination, time, and preferences
- 💬 **Real-time chat** — Built-in messaging between matched Bruins
- 📍 **Live tracker** — See your driver's location in real time
- 👤 **Bruin profile** — Editable profile with photo prompts and Class of year
- 🗺️ **Destination search** — Search any LA destination using OpenStreetMap (free, no API key needed)
- 🔑 **Forgot password** — Firebase email reset sent to your UCLA inbox

---

## 🛠️ Tech Stack

- **React Native + Expo** — Cross-platform mobile app
- **Firebase Auth** — UCLA email verification and login
- **Firebase Firestore** — Real-time database for trips, chats, and users
- **Firebase Storage** — Profile photo and photo prompt uploads
- **OpenStreetMap / Nominatim** — Free place search API
- **GitHub** — Version control and team collaboration

---

## 🚀 Getting Started

### Prerequisites
- Node.js installed
- Expo CLI (`npm install -g expo-cli`)

### Installation

```bash
git clone https://github.com/Annabelle1899/ACM_Group_3.git
cd ACM_Group_3
npm install --legacy-peer-deps
```

### Add Firebase Config

The `firebase.config.ts` file is not included in the repo for security reasons. Ask a team member for the file and place it in the root of the project.

```
ACM_Group_3/
├── firebase.config.ts   ← add this file (ask a teammate)
├── app/
├── services/
└── ...
```

### Run the App

```bash
npx expo start --web
```

Then open your browser and go to:
```
http://localhost:8081/(auth)/welcome
```

---

## 📱 Demo with iPhone Frame

To run the demo with an iPhone frame, open **two terminal windows**:

**Terminal 1 — Start the app:**
```bash
npx expo start --web
```

**Terminal 2 — Start the demo server:**
```bash
npx serve . -p 3000
```

Then open your browser and go to:
```
http://localhost:3000/demo.html
```

> ⚠️ Both terminals must stay open the whole time.

---

## 📁 Project Structure

```
ACM_Group_3/
├── app/
│   ├── _layout.tsx           # Root navigation + auth redirect
│   ├── (auth)/
│   │   ├── welcome.tsx       # Welcome screen
│   │   ├── login.tsx         # Login screen
│   │   └── signup.tsx        # Sign up screen
│   ├── (tabs)/
│   │   ├── _layout.tsx       # Bottom tab navigation
│   │   ├── home.tsx          # Home screen with search
│   │   ├── plan.tsx          # Plan a trip screen
│   │   ├── active.tsx        # Active plans screen
│   │   ├── messages.tsx      # Chat inbox
│   │   └── profile.tsx       # User profile screen
│   ├── match.tsx             # Match result screen
│   ├── tracker.tsx           # Live location tracker
│   └── chat/[id].tsx         # Real-time chat screen
├── services/
│   ├── auth.ts               # Firebase auth functions
│   ├── firestore.ts          # Firestore database functions
│   ├── matching.ts           # Passenger-driver matching algorithm
│   └── location.ts           # GPS location functions
├── constants/
│   └── Colors.ts             # UCLA Blue + Gold color palette
├── firebase.config.ts        # Firebase config (not in repo)
└── demo.html                 # iPhone frame demo wrapper
```

---

## 🔥 Firebase Setup

The app uses the following Firebase services:
- **Authentication** — Email/password with UCLA email validation
- **Firestore** — Collections: `users`, `trips`, `chats`
- **Storage** — Profile avatars and photo prompts

### Required Firestore Indexes

If you see an index error in the console, click the link in the error message to create the required index in Firebase Console.

---

## 🐻 Go Bruins!

Built with 💙💛 at UCLA — 2025
