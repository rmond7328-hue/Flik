# Flik Phase 7 — UI/UX Redesign

Phase 7 establishes the new Flik visual system and applies it to the highest-traffic product surfaces without replacing the existing Supabase/business logic.

## Visual system
- Light theme with white canvas and black text
- Flik blue accent: `#60A5FA` / stronger interactive blue `#3B82F6`
- Syne for brand/display headings
- DM Sans for interface/body copy
- Lucide React Native icons
- 8-point spacing scale
- Rounded cards and controls
- Minimal borders/shadows

## Implemented in this pass
- Global font loading
- Shared design tokens in `constants/theme.ts`
- Refreshed bottom navigation
- Home shell and For You / Following / Discover tabs
- Card-based Home feed with tall 13:20-style media treatment
- Post card interaction layout and media action rail
- Create composer
- Community list/create sheet
- Discover search surface
- Chat list
- Profile
- Notifications
- Shared empty state

## Preserved
The existing Supabase queries, services, hooks, stores and Expo Router architecture remain the data/logic foundation.

## Asset note
The supplied Flik logo/icon artwork is not stored as a binary asset in the GitHub repository yet. Phase 7 therefore uses the branded text treatment in the UI. The supplied logo should be added as PNG assets before the production icon/splash configuration is finalized in the release phase.

## Next
Phase 8 will replace the current authentication presentation/flow with passwordless Supabase magic-link authentication and production deep-link return into the native Flik app.
