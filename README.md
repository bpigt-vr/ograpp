# Overgrowth Renaissance — mobile app

A cross-platform iOS/Android app for **OGR-Scintilla / Overgrowth Renaissance**:
music, merch, a private journal, memberships, a moderated community and a
loyalty programme in one branded experience.

> “Be the greatest you can be.”

Built with **Expo SDK 58 (React Native 0.88, React 19, TypeScript)**, expo-router
and a local-first data layer. The native Android project is committed in
`android/`, so it opens directly in **Android Studio**.

---

## Highlights

| Section | What works today |
| --- | --- |
| **Home** | Brand hero, featured track, daily quote, journal shortcut, rewards progress, release, artist announcement, poll, membership and merch rails |
| **Music** | Official Wix player embedded live; native library with queue, seek, volume, favourites, background audio, lock-screen controls, offline downloads (Top 0.1% tier) and a persistent mini player |
| **Journal** | Daily prompt + quote, encrypted entries (AES-256-GCM), mood, reflections, gratitude, goals, streaks with rest days, calendar/history, optional local reminder, JSON export/delete |
| **Store** | Official merch store embedded live with checkout on the site; native catalogue/cart/product flow on a clearly labelled sample catalogue |
| **Community** | Artist announcements, discussions, polls, remix ideas, challenges; word filter (leet/stretched/spaced obfuscation, spam, floods, duplicates, rate limits), report/block, guidelines, **passphrase-protected moderator dashboard** |
| **Rewards** | Points ledger with daily caps + idempotency, badges, levels, six downloadable **wallpapers**, fair-play rules |
| **Membership** | Free / Top 1% ($4.99 CAD) / Top 0.1% ($14.99 CAD) mirrored from the site, with confirmed vs “coming soon” perks and honest billing handoff |
| **Profile & settings** | Account, saved music, privacy, notifications, appearance, data export, account deletion |

---

## Run it

```bash
npm install
npx expo start          # Expo Go works for UI, but native audio/downloads need a dev build
npx expo run:android    # local dev build (or open android/ in Android Studio)
```

Checks:

```bash
npm run typecheck       # tsc --noEmit
npx jest                # 35 unit tests: moderation, rewards, streaks, cart, crypto
npm run lint            # eslint-config-expo
```

---

## Moderator dashboard

The community can be moderated from **Profile → Moderator tools** (or
`/moderation`). It is locked by a passphrase.

- Default first-run passphrase: **`Nekkcity1`** (provisioned as a PBKDF2 hash;
the literal is never stored).
- Change it immediately in **Moderator tools → Security**, or set
  `EXPO_PUBLIC_MODERATION_PASSWORD` when building.
- Five failed attempts trigger a 60-second lockout; sessions expire after 30
  minutes.
- The dashboard can remove/restore posts and comments, review reports, add/remove
  filter words, switch block ↔ mask mode, mute/ban members, read the audit log and
  reset community data.

> A client-side gate is a shared-device lock, not real authorisation. Before a
> public launch, enforce the moderator role server-side too — see
> `docs/INTEGRATIONS.md`.

---

## Project map

```
src/
  app/                     expo-router routes (tabs + stack screens)
    (tabs)/                Home · Music · Journal · Store · Community · Profile
    album/[id]             release detail + downloads
    player                 full-screen player modal
    journal/               write · history · goals
    store/                 product · cart
    community/             thread · new post · guidelines
    moderation/            passphrase-gated dashboard
    settings/              app · privacy · notifications · account
  components/              design-system primitives (text, buttons, cards, states…)
  features/                domain modules (music, journal, community, rewards, store, auth, moderation)
  data/                    curated content: tracks, prompts, quotes, plans, badges, products, wallpapers
  lib/                     crypto/vault, storage, clock, notifications, export, site links
  theme/                   brand tokens + theme provider
plugins/
  withAndroidReleaseSigning.js   keeps release signing across prebuild
android/                  committed native project (Android Studio)
docs/
  ANDROID_RELEASE.md       build, sign, publish (Play), CI
  INTEGRATIONS.md          exactly what is live vs. dependent on artist credentials
```

---

## Android release

```bash
# 1. one-time upload key
KEYSTORE_PASSWORD='…' ./scripts/android-release.sh init-key
# 2. Play Store bundle
./scripts/android-release.sh aab
# 3. installable APK for testers
./scripts/android-release.sh apk --arm64-only
```

Artifacts land in `dist/android/`. Full instructions (Android Studio UI, Play
Console setup, data-safety answers, CI secrets) are in
[docs/ANDROID_RELEASE.md](docs/ANDROID_RELEASE.md). CI:
`.github/workflows/android-release.yml` builds on tags/manual dispatch and
attaches signed artifacts when keystore secrets exist.

---

## Content & licensing

- **Brand assets** (`assets/images/*`, wallpapers) are derived from the artist's
official logo/poster on overgrowthrenaissance.com.
- **Bundled audio is original preview material** generated for this build so
playback, downloads and background audio can be tested end to end. It is labelled
“Preview audio” in the UI. Replace it with the artist's authorised masters before
shipping (see `docs/INTEGRATIONS.md`).
- **Daily quotes and journal prompts** are written in-house; swap them for the
artist's voice whenever they want.
- **Merch products** shown natively are labelled samples because the live Wix
store currently has no products listed.

---

## What still needs artist/backend input

1. Licensed masters + download rights for the real music catalogue.
2. Wix Storefront API access (or keep the embedded store) for native merch data.
3. App Store / Play Billing entitlement service for memberships.
4. Backend for cloud sync, password reset, server-side moderation and audit logs.

Nothing above is faked in the UI: every dependency is either clearly labelled in
the app or documented in `docs/INTEGRATIONS.md`.
