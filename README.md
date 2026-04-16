# Mucals

A React starter app for mobile and desktop that helps you move away from music and toward beautiful nasheeds and Quran recitations.

## Features

- Google sign-in with Firebase Auth
- Firestore-backed saved audio links
- Dashboard with audio playback cards
- Hijri calendar history for each day
- Location-based support for tracking the user's place
- Distraction-free notes panel with local persistence

## Getting Started

1. Install dependencies:

```bash
npm install
```

2. Run the development server:

```bash
npm run dev
```

3. Open the local URL shown in the terminal.

## Firebase Setup

1. Create a Firebase project and a Web app in the Firebase console.
2. Enable Google sign-in in `Authentication`.
3. Create a Firestore database.
4. Copy `.env.example` to `.env.local`.
5. Fill in your Firebase web config values in `.env.local`.
6. Add the rules from `firestore.rules` in the Firebase console or deploy them with Firebase CLI.

Example:

```bash
cp .env.example .env.local
```

Your `.env.local` should contain:

```bash
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```

## Firestore Shape

Collection: `savedAudios`

Each document stores:

- `userId`
- `title`
- `type`
- `category`
- `artist`
- `description`
- `sourceUrl`
- `provider`
- `playbackMode`
- `playableUrl`
- `savedAt`

## Console Steps

1. Firebase Console:
   Create project -> Add web app -> copy config.
2. Authentication:
   Enable `Google` provider.
3. Firestore Database:
   Create database in production mode or test mode, then apply `firestore.rules`.
4. Authorized domains:
   Add your deployed app domain if you deploy beyond localhost.

## Optional CLI Setup

If you want to deploy Firestore rules from the terminal later:

```bash
cp .firebaserc.example .firebaserc
```

Then replace the placeholder project id in `.firebaserc`.

## Project Structure

- `src/App.tsx` - main dashboard layout
- `src/components` - reusable UI components
- `src/data/sampleAudios.ts` - starter audio sample metadata
- `src/App.css` - responsive styling for mobile and desktop

## Notes

This starter app is built with Vite and React using TypeScript.
Saved audio links now sync through Firebase Auth + Firestore once your env vars are configured.
