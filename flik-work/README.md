# Flik V1

Flik is a React Native + Expo campus-first social app for Android and iOS.

## Requirements

- Node.js LTS
- npm
- Expo CLI via the project scripts
- EAS CLI for cloud builds
- A Supabase project

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create `.env` from `.env.example` and set:

```text
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Never commit `.env` or service-role credentials.

3. Run the Expo app:

```bash
npm start
```

## Validation

```bash
npm run typecheck
npm run doctor
```

## Android preview APK

Authenticate with your Expo/EAS account, then run:

```bash
eas login
npm run build:android:preview
```

The `preview` profile uses internal distribution and is intended for tester installation. EAS will provide the build artifact when the cloud build completes.

## Android production

```bash
npm run build:android:production
```

This produces an Android production artifact suitable for release workflows (normally an AAB).

## iOS

Preview/TestFlight-style builds require an Apple Developer account and appropriate signing credentials:

```bash
npm run build:ios:preview
npm run build:ios:production
```

## Supabase

The mobile app uses the public Supabase URL and anon/publishable key only. Database migrations, RLS, storage policies and server-side authorization remain in Supabase. Never place a service-role key in the mobile app.

## Build note

The Expo project lives under `flik-work/`, so run all commands from that directory.
