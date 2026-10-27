# Overgrowth Renaissance 1.0.0 — release notes

First release of the OGR-Scintilla app: one place for the music, the merch, the
journal, the Hoser Gang and the community.

## New

- **Brand-first design** built around the official maple-leaf artwork, ember
  palette, Anton/Inter/Fraunces type system, light + dark themes.
- **Music**
  - Native player: play/pause, skip, seek, volume, queue, full-screen player and a
    persistent mini player that follows you between tabs.
  - Background playback with Android media-session/lock-screen controls.
  - Favourites, recently played and offline downloads (Top 0.1% tier).
  - The official Wix stream embedded in-app, one tap away.
- **Journal**
  - Daily prompt + rotating inspiration, six growth themes.
  - Private entries encrypted with AES-256-GCM; the key never leaves the device.
  - Mood, reflection, gratitude, goals with progress, calendar/history.
  - Streaks that forgive a missed day (rest days), optional local reminder.
  - JSON export and one-tap deletion.
- **Rewards**
  - Points with daily caps, idempotent actions and purchase verification.
  - Levels (Seed → Greatest), eight badges, activity ledger.
  - **Six collectible wallpapers** rendered from the OGR mark, saved to your
    photo library in an “Overgrowth Renaissance” album.
- **Community**
  - Artist announcements, discussions, polls, remix ideas and challenges.
  - Word filter that understands leetspeak, stretched and spaced-out letters,
    zero-width characters and blocked phrases; blocks link spam, shouting,
    floods, duplicates and rapid posting.
  - Report, block, community guidelines, optional participation.
  - **Moderator dashboard** with reports queue, remove/restore, mute/ban, filter
    management, policy controls, audit log and passphrase rotation.
- **Membership**
  - Free, Top 1% ($4.99 CAD/month) and Top 0.1% ($14.99 CAD/month) mirroring the
    live website plans, with confirmed perks clearly separated from “coming soon”.
- **Store**
  - Official Wix merch store embedded with secure on-site checkout.
  - Native product/variant/cart flow on a clearly labelled sample catalogue.
- **Accounts & privacy**
  - Guest mode everywhere; optional device account.
  - Data export, account deletion, opt-in analytics (off by default), no trackers.

## Known limitations (documented, not hidden)

- Bundled music is preview audio until the artist supplies licensed masters.
- Merch browsed natively is sample data until the Wix Storefront API is wired;
  the live store is embedded for real shopping and checkout.
- Memberships require StoreKit / Play Billing (or an approved external purchase
  entitlement) plus server-side entitlement checks before public release.
- Community, accounts and moderation are local-first until a backend is added.

## Android

- `com.overgrowthrenaissance.app`, versionCode 1, target SDK 36.
- Release signing via `android/keystore.properties`; CI workflow builds APK + AAB.
