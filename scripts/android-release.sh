#!/usr/bin/env bash
# Build a signed Android release from the native project in ./android.
#
# Usage:
#   ./scripts/android-release.sh apk       # installable release APK
#   ./scripts/android-release.sh aab       # Play Store app bundle
#   ./scripts/android-release.sh both
#   ./scripts/android-release.sh apk --arm64-only   # faster, smaller (physical devices)
#   KEYSTORE_PASSWORD='...' ./scripts/android-release.sh init-key
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
MODE="${1:-apk}"
shift || true

ARM_ONLY=0
for arg in "$@"; do
  case "$arg" in
    --arm64-only) ARM_ONLY=1 ;;
    *) echo "Unknown option: $arg" >&2; exit 1 ;;
  esac
done

cd "$ROOT/android"

if [[ "$MODE" == "init-key" ]]; then
  KEY_ALIAS="${KEY_ALIAS:-ogr}"
  KEYSTORE_PASSWORD="${KEYSTORE_PASSWORD:-}"
  if [[ -z "$KEYSTORE_PASSWORD" ]]; then
    echo "Set KEYSTORE_PASSWORD before creating the upload key." >&2
    exit 1
  fi
  if [[ -f app/ogr-release.jks ]]; then
    echo "app/ogr-release.jks already exists — refusing to overwrite." >&2
    exit 1
  fi
  keytool -genkeypair -v \
    -storetype PKCS12 \
    -keystore app/ogr-release.jks \
    -alias "$KEY_ALIAS" \
    -keyalg RSA -keysize 4096 -validity 10000 \
    -storepass "$KEYSTORE_PASSWORD" -keypass "$KEYSTORE_PASSWORD" \
    -dname "CN=Overgrowth Renaissance, OU=Mobile, O=OGR, L=Edmonton, ST=Alberta, C=CA"
  printf 'storeFile=ogr-release.jks\nstorePassword=%s\nkeyAlias=%s\nkeyPassword=%s\n' \
    "$KEYSTORE_PASSWORD" "$KEY_ALIAS" "$KEYSTORE_PASSWORD" > keystore.properties
  chmod 600 keystore.properties app/ogr-release.jks
  echo "Created app/ogr-release.jks + keystore.properties."
  echo "Back both up: without the same key you cannot ship updates to an existing listing."
  exit 0
fi

if ! command -v java >/dev/null 2>&1 && [[ -z "${JAVA_HOME:-}" ]]; then
  echo "Java 17 is required. Install Android Studio (bundled JDK) or set JAVA_HOME." >&2
  exit 1
fi

mkdir -p "$ROOT/dist/android"

if [[ ! -f keystore.properties ]]; then
  echo "WARNING: android/keystore.properties is missing."
  echo "         This build will be debug-signed: installable for testing, not uploadable to Google Play."
  echo
fi

GRADLE_ARGS=(--no-daemon)
if [[ "$ARM_ONLY" == "1" ]]; then
  GRADLE_ARGS+=("-PreactNativeArchitectures=arm64-v8a")
fi

VERSION=$(node -p "require('../app.json').expo.version")
CODE=$(node -p "require('../app.json').expo.android.versionCode")

case "$MODE" in
  apk)  ./gradlew assembleRelease "${GRADLE_ARGS[@]}" ;;
  aab)  ./gradlew bundleRelease "${GRADLE_ARGS[@]}" ;;
  both) ./gradlew assembleRelease bundleRelease "${GRADLE_ARGS[@]}" ;;
  *) echo "Usage: $0 [apk|aab|both|init-key] [--arm64-only]" >&2; exit 1 ;;
esac

if [[ "$MODE" == "apk" || "$MODE" == "both" ]]; then
  cp app/build/outputs/apk/release/app-release.apk \
    "$ROOT/dist/android/overgrowth-renaissance-$VERSION-$CODE.apk"
fi
if [[ "$MODE" == "aab" || "$MODE" == "both" ]]; then
  cp app/build/outputs/bundle/release/app-release.aab \
    "$ROOT/dist/android/overgrowth-renaissance-$VERSION-$CODE.aab"
fi

ls -lh "$ROOT/dist/android"
if [[ "$MODE" == "apk" || "$MODE" == "both" ]]; then
  echo
  echo "Install: adb install -r dist/android/overgrowth-renaissance-$VERSION-$CODE.apk"
fi
