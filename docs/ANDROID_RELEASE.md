# Android release guide (Overgrowth Renaissance)

This repo ships a **generated native Android project** in `android/`, so it opens
directly in Android Studio. It is produced by Expo Prebuild from `app.json` plus
the local config plugin `plugins/withAndroidReleaseSigning.js`.

- Application ID: `com.overgrowthrenaissance.app`
- Version: `1.0.0` (`versionCode` 1 — bump in `app.json` before every upload)
- Min SDK: from Expo SDK 58 (Android 7+), target SDK 36
- Bundle identifier/scheme: `ogr://`

---

## 1. Open the project in Android Studio

1. Install **Android Studio** (Koala or newer) with the bundled **JDK 17**.
2. `File → Open…` and select the `android/` folder of this repository.
3. Wait for the Gradle sync. Android Studio will install any missing SDK
   platform / build-tools / NDK if you accept the prompts.
4. If Gradle asks for an SDK path, point it at
   `$HOME/Android/Sdk` (default) or your own SDK location.

> The JS bundle is built by Gradle through Expo CLI, so `node_modules/` must be
> installed first: `npm install`.

Run on a device/emulator: select the `app` configuration → **Run**.
Release build: `Build → Generate Signed App Bundle / APK…` or use the CLI below.

---

## 2. Create the upload key (once)

Google Play requires every release to be signed with an upload key that you keep
forever. Generate it once and back it up:

```bash
cd /workspace
KEYSTORE_PASSWORD='choose-a-strong-password' ./scripts/android-release.sh init-key
```

This creates:

- `android/app/ogr-release.jks` — the upload keystore (git-ignored)
- `android/keystore.properties` — credentials consumed by Gradle (git-ignored)

Keep both in a password manager / secure vault. Losing them means you cannot
publish updates to the same listing (Play Console would require a key reset).

Without `keystore.properties`, release builds still succeed but are signed with
the **debug** key: installable for testing, **not uploadable to Google Play**.

---

## 3. Build the release

### 3a. Command line (recommended)

```bash
# AAB for Google Play
./scripts/android-release.sh aab

# Installable APK for testers (arm64 devices only = faster build)
./scripts/android-release.sh apk --arm64-only

# Both
./scripts/android-release.sh both
```

Outputs land in `dist/android/`:

```
dist/android/overgrowth-renaissance-1.0.0-1.apk
dist/android/overgrowth-renaissance-1.0.0-1.aab
```

Install the APK over USB:

```bash
adb install -r dist/android/overgrowth-renaissance-1.0.0-1.apk
```

### 3b. Android Studio UI

1. `Build → Generate Signed Bundle / APK…`
2. **Android App Bundle** for Play, **APK** for direct installs.
3. Choose `android/app/ogr-release.jks`, enter the alias/passwords.
4. Variant: **release** → **Create**.

The signed artifact appears under `android/app/release/`.

---

## 4. Publish to Google Play

1. Play Console → **Create app** → *Overgrowth Renaissance*.
2. Upload the `.aab` to **Internal testing** first, then promote.
3. Complete **App content**:
   - Privacy policy URL (required — journal, account, community data).
   - Data safety: see the table in `docs/INTEGRATIONS.md`.
   - Content rating questionnaire (user-generated content → yes; moderation → yes).
   - Target audience (13+ recommended; UGC is not child-directed).
   - Ads: none.
   - News app: no.
4. Store listing assets: icon (already in `assets/images/icon.png`),
   feature graphic, 2+ phone screenshots, short + full description.
5. Bump `version` / `android.versionCode` in `app.json` before each upload, then
   regenerate the native project (see §6) or edit `android/app/build.gradle`.

---

## 5. CI build (no local SDK required)

`.github/workflows/android-release.yml` builds an APK and an AAB on every tag
(`v*`) and on manual dispatch, then uploads them as workflow artifacts.

Add these repository secrets to produce a Play-ready, properly signed AAB:

| Secret | Value |
| --- | --- |
| `ANDROID_KEYSTORE_BASE64` | `base64 -w0 android/app/ogr-release.jks` |
| `ANDROID_KEYSTORE_PASSWORD` | keystore password |
| `ANDROID_KEY_ALIAS` | `ogr` (or your alias) |
| `ANDROID_KEY_PASSWORD` | key password |

Without the secrets the workflow still produces a debug-signed preview APK.

---

## 6. Regenerating the native project

The `android/` folder is generated. After changing `app.json`, plugins, app
icons, permissions or adding a native module:

```bash
npx expo prebuild --platform android --clean --no-install
```

The release-signing plugin runs automatically, so signing is not lost. Do not
hand-edit generated files other than through config plugins.

---

## 7. What is configured for this app

- **Background audio**: `expo-audio` plugin sets `enableBackgroundPlayback`.
  Manifest contains the `AudioControlsService` media session service plus
  `FOREGROUND_SERVICE` / `FOREGROUND_SERVICE_MEDIA_PLAYBACK` permissions, so the
  mini player and lock-screen controls keep playing when the app is backgrounded.
- **Notifications**: `POST_NOTIFICATIONS` + the `daily-reflection` channel for the
  optional local journal reminder.
- **Wallpaper saving**: `READ_MEDIA_IMAGES` (media library) — images are written
  with `Asset.create()`; no broad storage permission is requested on Android 13+.
- **Removed permissions**: `RECORD_AUDIO` and `SYSTEM_ALERT_WINDOW` are blocked in
  `app.json` because the app never records audio and never draws over other apps.
- **Cleartext HTTP**: not enabled — all content is HTTPS.
- **R8/minify**: enabled for release (`android.enableMinifyInReleaseBuilds`); keep
  rules live in `android/app/proguard-rules.pro`.

---

## 8. Release checklist

- [ ] `npm run typecheck` and `npx jest` pass
- [ ] `npm run lint` passes
- [ ] `version` + `android.versionCode` bumped in `app.json` and native project regenerated
- [ ] Upload key backed up; `keystore.properties` present on the build machine
- [ ] Tested: music playback + background audio, downloads (Top 0.1% tier),
      journal encryption/save/export, community posting + filter + moderator gate,
      rewards/wallpaper save, store cart handoff
- [ ] Privacy policy live and linked in Play Console
- [ ] Data safety form matches `docs/INTEGRATIONS.md`
- [ ] Internal testing track install verified on a physical device

---

## 9. Troubleshooting

| Symptom | Fix |
| --- | --- |
| `SDK location not found` | Create `android/local.properties` with `sdk.dir=/path/to/Android/Sdk` |
| `Unsupported class file major version` | Use JDK 17 (`JAVA_HOME`), not 21+ or 11 |
| `PKIX path building failed` behind a corporate proxy | Import the proxy CA into a truststore and pass `-Djavax.net.ssl.trustStore=…` via `GRADLE_OPTS` |
| Build runs out of memory | Keep `org.gradle.jvmargs=-Xmx2048m`, add `--no-daemon`, build one ABI with `--arm64-only` |
| APK installs but shows old JS | `./gradlew clean` then rebuild; verify `versionCode` changed |
| Play rejects the AAB | It was debug-signed: add `android/keystore.properties` and rebuild |
