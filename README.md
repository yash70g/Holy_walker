# Territory Walk Game
[Video Gameplay](https://drive.google.com/file/d/1CkYFzyi_MPxi9FkP8N48zAr7m6IYzTZS/view?usp=sharing)

A location-based multiplayer territory capture game built with React Native and Expo. Compete with other teams to claim territories, collect gifts, and dominate the map in this Christmas-themed mobile game.


## Overview

Territory Walk Game is a real-world GPS-based mobile game where players walk around to capture territories and compete against other teams. Choose your team - **Santa**, **Elf**, or **Snowman** - and start claiming areas on the map.

## Features

- **Real-time Territory Capture**: Walk around to capture and claim territories on a live map
- **Three Teams**: Choose from Santa (RED), Elf (GREEN), or Snowman (BLUE)
- **Collectible Gift Boxes**: Find and collect random gift boxes that spawn on the map
- **Christmas Trees**: Special bonus items that appear periodically
- **Point System**: Earn territory points and coins for your team
- **Live Leaderboard**: Track your team's performance in real-time
- **Team Switching**: Change teams anytime using the switch team button
- **Persistent Progress**: Your team selection and progress are saved locally

## Teams

### Team RED - Santa
<img src="https://i.ibb.co/6cTgQpjf/Santa-Sprite.png" alt="Santa Team" width="150"/>

**Team Label:**
<img src="https://i.ibb.co/Tq8WMcQ0/Red-Team.png" alt="Red Team Label" width="100"/>

### Team GREEN - Elf
<img src="https://i.ibb.co/0p2DnHtH/Elf-Sprite.png" alt="Elf Team" width="150"/>

**Team Label:**
<img src="https://i.ibb.co/bMM01d27/Green-Team.png" alt="Green Team Label" width="100"/>

### Team BLUE - Snowman
<img src="https://i.ibb.co/FkzRdQNS/Snwmn-Sprite.png" alt="Snowman Team" width="150"/>

**Team Label:**
<img src="https://i.ibb.co/d0zDhxkD/Blue-Team.png" alt="Blue Team Label" width="100"/>

---

### Switch Teams
<img src="https://i.ibb.co/Z6HNGK9F/Switch-Team.png" alt="Switch Team Button" width="150"/>

## Technologies

- **React Native** - Cross-platform mobile development
- **Expo** - Development platform and tooling
- **Firebase** - Real-time database and authentication
- **Firestore** - Cloud database for storing regions and team data
- **Expo Location** - GPS tracking and location services
- **Turf.js** - Geospatial analysis for territory calculations
- **AsyncStorage** - Local data persistence
- **React Native WebView** - Map rendering

## Prerequisites

Before you begin, ensure you have the following installed:

- [Node.js](https://nodejs.org/) (v14 or higher)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
- [Expo CLI](https://docs.expo.dev/get-started/installation/)
- [Android Studio](https://developer.android.com/studio) (for Android development)
- [Expo Go app](https://expo.dev/client) (for testing on physical devices)

## Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/territory-walk-game.git
   cd territory-walk-game
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Set up Firebase**
   - Create a new Firebase project at [Firebase Console](https://console.firebase.google.com/)
   - Enable Firestore Database
   - Enable Anonymous Authentication
   - Copy your Firebase configuration
   - Update `src/firebase/config.js` with your Firebase credentials:
   
   ```javascript
   import { initializeApp } from 'firebase/app';
   import { getFirestore } from 'firebase/firestore';
   import { getAuth } from 'firebase/auth';

   const firebaseConfig = {
     apiKey: "YOUR_API_KEY",
     authDomain: "YOUR_AUTH_DOMAIN",
     projectId: "YOUR_PROJECT_ID",
     storageBucket: "YOUR_STORAGE_BUCKET",
     messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
     appId: "YOUR_APP_ID"
   };

   const app = initializeApp(firebaseConfig);
   export const db = getFirestore(app);
   export const auth = getAuth(app);
   ```

4. **Configure your territory area** (Optional)
   - Update `collegeArea.geojson` with your desired game boundary coordinates
   - Adjust spawn points in `src/config/territory.js`

## Running the App

### Development Mode

```bash
# Start the Expo development server
npm start
# or
expo start
```

### Run on Android

```bash
npm run android
# or
expo run:android
```

### Run on Web (Preview)

```bash
npm run web
```

## How to Play

1. **Select Your Team**: When you first launch the app, choose between Santa (RED), Elf (GREEN), or Snowman (BLUE)

2. **Start Walking**: The game uses your real GPS location. Walk around to start capturing territories

3. **Capture Territories**: 
   - Walk continuously to create a path
   - Complete your path to form a closed polygon
   - The enclosed area becomes your team's territory

4. **Collect Bonuses**:
   - **Gift Boxes**: Walk near them to collect bonus points
   - **Christmas Trees**: Special items that give extra rewards

5. **Compete**: 
   - Capture territories to earn points for your team
   - Watch the leaderboard to see which team is winning
   - Switch teams if you want to help another side

6. **Switch Teams**: Tap the switch team button to change your allegiance at any time

## Project Structure

```
territory-walk-game/
├── src/
│   ├── components/
│   │   ├── HUD.js              # Heads-up display for game stats
│   │   └── MapView.js          # Main map rendering component
│   ├── config/
│   │   └── territory.js        # Territory configuration
│   ├── firebase/
│   │   └── config.js           # Firebase initialization
│   ├── screens/
│   │   ├── MapGame.js          # Main game screen
│   │   └── TeamSelect.js       # Team selection screen
│   └── utils/
│       ├── captureLogic.js     # Territory capture algorithms
│       ├── christmasTreeManager.js  # Christmas tree spawning
│       ├── geo.js              # Geospatial utilities
│       ├── giftBoxManager.js   # Gift box spawning
│       ├── location.js         # Location tracking
│       └── regionManager.js    # Region management
├── App.js                      # Main app entry point
├── collegeArea.geojson         # Game boundary definition
└── package.json
```

## Game Assets

All team sprites and UI elements are hosted externally:

- Santa Sprite: `https://i.ibb.co/6cTgQpjf/Santa-Sprite.png`
- Elf Sprite: `https://i.ibb.co/0p2DnHtH/Elf-Sprite.png`
- Snowman Sprite: `https://i.ibb.co/FkzRdQNS/Snwmn-Sprite.png`
- Switch Team Button: `https://i.ibb.co/Z6HNGK9F/Switch-Team.png`
- Team Labels: Red, Green, and Blue variants

## Configuration

### Spawn Intervals

You can adjust the spawn rates in the respective manager files:

- **Gift Boxes**: `GIFT_BOX_SPAWN_INTERVAL` in `src/utils/giftBoxManager.js`
- **Christmas Trees**: `CHRISTMAS_TREE_SPAWN_INTERVAL` in `src/utils/christmasTreeManager.js`

### Territory Boundaries

Edit `collegeArea.geojson` to define the playable area boundaries for your specific location.

## Permissions

The app requires the following permissions:

- **Location Services**: Required for GPS tracking and territory capture
- **Internet**: Required for Firebase real-time updates

## Troubleshooting

### Location not updating
- Ensure location permissions are granted
- Check that GPS is enabled on your device
- Try running outdoors for better GPS signal
