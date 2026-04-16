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

## Project Structure

- `src/App.tsx` - main dashboard layout
- `src/components` - reusable UI components
- `src/data/sampleAudios.ts` - starter audio sample metadata
- `src/App.css` - responsive styling for mobile and desktop

## Notes

This starter app is built with Vite and React using TypeScript.
Saved audio links now sync through Firebase Auth + Firestore once your env vars are configured.
