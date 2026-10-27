# Integration status & data map

Everything in the app runs today. Some features are intentionally **local-first**
because the source of truth lives on the artist's Wix site, and a few depend on
credentials that only the artist can provide. This file is the honest contract.

---

## Source website

| Page | URL | How the app uses it |
| --- | --- | --- |
| Music | <https://www.overgrowthrenaissance.com/music> | Embedded live in a native WebView (Music → Official). The Wix Music player is an iframe app with no public stream API. |
| Merch | <https://www.overgrowthrenaissance.com/merch> | Embedded live in a native WebView (Store → Official shop). Checkout stays on the site. |
| Memberships | <https://www.overgrowthrenaissance.com/pricing-plans/jointhehosergang> | Prices/benefits mirrored in-app; purchase links open the site. |
| Account | <https://www.overgrowthrenaissance.com/account/my-account> | Linked for billing, cancellation and receipts. |

**Embedding notes.** Wix pages cannot be framed in a browser tab
(`X-Frame-Options`/CSP), but a native WebView loads them as top-level navigation,
so iOS/Android get the real player and store. The web preview shows an “open in
browser” fallback instead of pretending to embed.

---

## Music

| Piece | Status |
| --- | --- |
| Native player (play/pause, seek, volume, queue, mini player, full-screen player, background audio, lock-screen controls) | **Working** — `expo-audio` |
| Catalogue source | **Preview audio** bundled with the build (original loops generated for this project). Replace with the artist's licensed masters. |
| Downloads / offline playback | **Working** — `expo-file-system`, gated to the Top 0.1% tier (matches the site: “Download all my music for free”) |
| Favourites | **Working** — persisted locally |
| Official Wix stream | **Working via WebView** (no mini player/background control inside a web view) |

**To go live with real masters:** host the authorised files (Wix Music files or a
CDN with signed URLs) and point `src/data/tracks.ts` at them (or add a remote
catalogue loader using the same `Track` shape). Download rights must match the
licensing the artist has for each recording. Never bundle masters the artist has
not cleared for download.

---

## Merch

| Piece | Status |
| --- | --- |
| Live store browsing + secure checkout | **Working** — embedded official Wix store |
| Native product pages, sizes, colours, cart, totals, shipping threshold | **Working on a clearly labelled *sample* catalogue** (the Wix store currently lists no products — it returns “We don't have any products to show here right now”) |
| Payments | **Not in the app.** Checkout hands off to the Wix store so inventory, tax and card handling stay authoritative. |
| Order history | On the website’s account pages (linked from Profile). |

The sample catalogue can be hidden in Settings. When the artist wants native
product data, add a Wix **Storefront API** proxy (server-side key) and swap the
provider in `src/data/products.ts` — the UI already renders any `StoreProduct`.

---

## Membership & billing

| Plan (CAD / month) | In-app |
| --- | --- |
| Casual Listener — $0 | Unlimited streaming, exclusive content (per site) |
| Top 1% Listener — $4.99 | Unreleased streaming, unlimited streaming, exclusive content |
| Top 0.1% Listener — $14.99 | Everything above + free catalogue downloads + personal thank-you video |

- Prices and confirmed perks mirror the live Wix pricing plan.
- Perks the artist has not confirmed (remix suggestions, member polls, early
  access, merch offers, member rooms) are labelled **Coming soon** and are never
  presented as included.
- **Billing is not implemented in-app.** The app links to the site, where Wix
  handles the subscription. “Preview unlock” is a local, clearly labelled test
  switch — it charges nothing and grants no real entitlement.
- **Before shipping on iOS/Android:** Apple 3.1.1 and Google Play require digital
  memberships to be sold through StoreKit / Play Billing, or through an approved
  external-purchase-link entitlement. The production step is to route purchases
  through RevenueCat (or native IAP) and verify entitlements server-side before
  calling `setMembership(tier, 'website')`.

---

## Accounts, journal and privacy

| Piece | Status |
| --- | --- |
| Guest browsing | **Working** — music, journal, rewards, store, community reading |
| Account | **Device-local** — email + PBKDF2-HMAC-SHA256 (150k iterations) hash; no server |
| Journal | **Encrypted at rest** — AES-256-GCM, key in iOS Keychain / Android Keystore (`expo-secure-store`); ciphertext in AsyncStorage |
| Journal export / delete | **Working** (JSON share sheet, per-entry and bulk delete) |
| Account deletion | **Working** — wipes account, journal, library, rewards, cart and community posts |
| Cloud sync / password reset / website SSO | **Not implemented** — needs a backend (Supabase/Custom auth) and the artist's Wix member API access |
| Analytics | **Opt-in, off by default.** No provider is wired; only screen names would be sent. |

**Production hardening for accounts:** add a server (Supabase or a small API)
with email verification, rate limiting, refresh tokens, and server-enforced
moderator roles. The local account is deliberately honest about being
device-scoped.

---

## Community & moderation

| Piece | Status |
| --- | --- |
| Announcements (artist), discussions, polls, remix ideas, challenges | **Working**, persisted locally |
| Word filter | **Working** — leetspeak, stretched/spaced letters, zero-width characters, phrases; block or mask modes |
| Abuse guards | Link limits, shouting, character floods, duplicate posts, 3 posts/min & 5 replies/min, daily reward caps |
| Report / block / guidelines | **Working** |
| Moderator dashboard | **Working** — passphrase gate (`Nekkcity1` provisioned by default), reports queue, remove/restore, mute/ban, filter words, policy, audit log, passphrase change, 5-attempt/60s lockout |
| Server enforcement | **Not implemented** — moderation is client-side + local persistence |

**Security boundary:** the passphrase gate is a shared-device lock, not
authorisation. In production the moderator role must be enforced by the backend
(Row Level Security / role checks) and every moderation action written to a
server audit log. Change the default passphrase from Settings → Moderator tools →
Security before shipping, or provision `EXPO_PUBLIC_MODERATION_PASSWORD` at build
time.

---

## Data collected (Play Console / App Store data-safety)

| Data | Where it lives | Shared? |
| --- | --- | --- |
| Journal text | Encrypted on device only | No |
| Email + password hash | On device only | No |
| Community posts | On device (local persistence) | No (until a backend is added) |
| Favourites, play counts, points | On device | No |
| Photos | Written only when the user saves a wallpaper | No |
| Analytics | Opt-in, off by default, not wired | No |

No advertising SDKs, no trackers, no third-party analytics.

---

## Environment variables

| Variable | Purpose |
| --- | --- |
| `EXPO_PUBLIC_MODERATION_PASSWORD` | First-run moderator passphrase (defaults to `Nekkcity1`) |
| `EXPO_PUBLIC_MUSIC_CATALOG_URL` | Reserved for a remote licensed music catalogue |
| `EXPO_PUBLIC_STORE_CATALOG_URL` | Reserved for a Wix Storefront API proxy |

Secrets that must **never** ship in the app bundle: Wix API keys, Play service
account JSON, keystore passwords. Keep those server-side / in CI secrets.
