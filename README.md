# 🗺️ Sidequest — UCLA Rideshare App

> Go anywhere together. Meet your Bruin community.

A UCLA-exclusive rideshare platform built by Bruins, for Bruins. Sidequest connects verified UCLA students as drivers and passengers for safe, affordable, and community-driven rides around LA.

---

## 👥 Team — Group 3

| Name | Role | Responsibilities |
|------|------|-----------------|
| Annabelle Wang | Person 1 | Firebase setup, Authentication, Navigation, Real-time matching notifications, Message toast alerts, Calendar date picker, Profile enhancements, Bug fixes & QA |
| Yumi Ko | Person 2 | Home screen, Search, Nearby Bruins |
| Ananya Rai | Person 3 | Trip planning, Matching algorithm |
| Bettina Wu | Person 4 | Profile, Chat, Live tracker |

---

## ✨ Features

- 🔐 **UCLA-verified login** — Only @g.ucla.edu and @ucla.edu emails allowed
- 🤝 **Smart matching** — Algorithm matches passengers and drivers by destination, date, time, and gender preference
- 🔔 **Real-time match notifications** — Driver is automatically redirected to the match screen when a passenger matches them
- 💬 **Real-time chat** — Built-in messaging between matched Bruins, with destination-labeled conversations
- 📱 **Phone number sharing** — Share your phone number directly in chat with one tap
- 📍 **Live tracker** — See your driver or passenger's name and destination in real time
- 👤 **Bruin profile** — Editable profile with photo prompts, Class of year, bio, major, and interests
- 🔔 **Toast notifications** — Real-time message alerts that appear on any screen when you receive a new message
- 🗓️ **Built-in date picker** — Native calendar for selecting trip dates, restricted to today and future dates only
- 🗺️ **Destination search** — Search any LA destination using OpenStreetMap (free, no API key needed)
- ⭐ **Active plans** — Real-time trip list that updates automatically when your status changes
- 🔑 **Forgot password** — Firebase email reset sent to your UCLA inbox

---

## 🛠️ Tech Stack

- **React Native + Expo** — Cross-platform mobile app (web mode for demo)
- **Firebase Auth** — UCLA email verification and login
- **Firebase Firestore** — Real-time database for trips, chats, and users
- **Firebase Storage** — Profile photo and photo prompt uploads
- **OpenStreetMap / Nominatim** — Free place search API
- **GitHub** — Version control and team collaboration

---

## 🚀 Getting Started

### Prerequisites
- Node.js installed
- npm or yarn

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

> ⚠️ Use Chrome for both accounts (use separate Chrome Profiles). Safari has known issues with Firebase Firestore WebChannel connections.

---

## 📁 Project Structure

```
ACM_Group_3/
├── app/
│   ├── _layout.tsx           # Root navigation, auth redirect, global toast notifications
│   ├── (auth)/
│   │   ├── welcome.tsx       # Welcome screen
│   │   ├── login.tsx         # Login with forgot password
│   │   └── signup.tsx        # UCLA email validation
│   ├── (tabs)/
│   │   ├── _layout.tsx       # Bottom tab navigation with unread message indicator
│   │   ├── home.tsx          # Home screen with destination search
│   │   ├── plan.tsx          # Plan a trip with date picker and matching
│   │   ├── active.tsx        # Real-time active plans with auto-match redirect
│   │   ├── messages.tsx      # Chat inbox with unread indicators
│   │   └── profile.tsx       # User profile with photo prompts and phone number
│   ├── match.tsx             # Match result screen with profile popup
│   ├── tracker.tsx           # Live location tracker with match profile popup
│   └── chat/[id].tsx         # Real-time chat with phone sharing button
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

## 🧪 Testing Matching

For matching to work correctly:
1. **Driver posts first** — select Driver role, pick destination, date, and No preference for gender
2. **Passenger posts second** — same destination and date, No preference for gender
3. Both sides are automatically redirected to the match screen
4. Driver can also access the tracker from Active Plans

> Use two separate Chrome Profiles to test with two accounts simultaneously.

---

## 🐻 Go Bruins!

Built with 💙💛 at UCLA — 2026
