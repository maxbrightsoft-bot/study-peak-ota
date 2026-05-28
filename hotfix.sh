#!/bin/bash
set -e

VERSION=$1
PLATFORM=$2 # android or ios (optional)
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

if [ -z "$VERSION" ]; then
  echo "Usage: hotfix.sh <version> [android|ios]"
  exit 1
fi

if [ -n "$PLATFORM" ] && [ "$PLATFORM" != "android" ] && [ "$PLATFORM" != "ios" ]; then
  echo "❌ Platform must be 'android' or 'ios' (hoặc để trống để chạy cả hai)"
  exit 1
fi

set -a
source "$SCRIPT_DIR/.env"
set +a

CURRENT_IN_CODE=${EXPO_PUBLIC_CURRENT_BUNDLE_VERSION:-}

if [ "$CURRENT_IN_CODE" != "$VERSION" ]; then
  echo "EXPO_PUBLIC_CURRENT_BUNDLE_VERSION is '$CURRENT_IN_CODE', expected '$VERSION'"
  echo "Please update .env first, then rerun this script"
  exit 1
fi

TAG_VERSION=$(echo $VERSION | tr '.' '-')

echo "=== Cleaning ==="
rm -rf ota
mkdir -p ota

ENTRY_FILE="node_modules/expo-router/entry.js"

# --- Building ---
if [ -z "$PLATFORM" ] || [ "$PLATFORM" == "android" ]; then
  echo "=== Building Android bundle ==="
  mkdir -p ota/android_bundle/bundle
  npx expo export:embed \
    --platform android --dev false \
    --entry-file $ENTRY_FILE \
    --bundle-output ota/android_bundle/bundle/index.android.bundle \
    --assets-dest ota/android_bundle/bundle || {
      echo "❌ Android bundle failed"
      exit 1
  }

  # Compile to Hermes bytecode (required because Android uses Hermes engine)
  echo "=== Compiling Android bundle to Hermes bytecode ==="
  HERMESC_PATH="node_modules/react-native/sdks/hermesc/osx-bin/hermesc"
  if [ ! -f "$HERMESC_PATH" ]; then
    HERMESC_PATH="node_modules/react-native/sdks/hermesc/linux64-bin/hermesc"
  fi
  if [ ! -f "$HERMESC_PATH" ]; then
    HERMESC_PATH="node_modules/react-native/sdks/hermesc/win64-bin/hermesc.exe"
  fi
  if [ -f "$HERMESC_PATH" ]; then
    mv ota/android_bundle/bundle/index.android.bundle ota/android_bundle/bundle/index.android.bundle.js
    "$HERMESC_PATH" \
      -emit-binary \
      -out ota/android_bundle/bundle/index.android.bundle \
      ota/android_bundle/bundle/index.android.bundle.js && \
    rm ota/android_bundle/bundle/index.android.bundle.js || {
      echo "⚠️  Hermes compile failed, using plain JS bundle"
      mv ota/android_bundle/bundle/index.android.bundle.js ota/android_bundle/bundle/index.android.bundle
    }
    echo "✅ Hermes bytecode compiled"
  else
    echo "⚠️  hermesc not found, using plain JS bundle (may not work with Hermes)"
  fi
fi

if [ -z "$PLATFORM" ] || [ "$PLATFORM" == "ios" ]; then
  echo "=== Building iOS bundle ==="
  mkdir -p ota/ios_bundle/bundle
  npx expo export:embed \
    --platform ios --dev false \
    --entry-file $ENTRY_FILE \
    --bundle-output ota/ios_bundle/bundle/main.jsbundle \
    --assets-dest ota/ios_bundle/bundle || {
      echo "❌ iOS bundle failed"
      exit 1
  }
fi

# --- Copy baseline assets to other densities to prevent missing image bugs on Android ---
if [ -z "$PLATFORM" ] || [ "$PLATFORM" == "android" ]; then
  echo "=== Copying baseline assets to all densities ==="
  for density in hdpi xhdpi xxhdpi xxxhdpi; do
    mkdir -p ota/android_bundle/bundle/drawable-$density
    cp -n ota/android_bundle/bundle/drawable-mdpi/* ota/android_bundle/bundle/drawable-$density/ 2>/dev/null || true
  done
fi

# --- Zipping ---
echo "=== Zipping ==="
if command -v zip >/dev/null 2>&1; then
  if [ -z "$PLATFORM" ] || [ "$PLATFORM" == "android" ]; then
    cd ota/android_bundle
    zip -r ../android.zip bundle -x "*/index.android.bundle"
    zip -g ../android.zip bundle/index.android.bundle
    cd ../..
  fi
  if [ -z "$PLATFORM" ] || [ "$PLATFORM" == "ios" ]; then
    cd ota/ios_bundle
    zip -r ../ios.zip bundle -x "*/main.jsbundle"
    zip -g ../ios.zip bundle/main.jsbundle
    cd ../..
  fi
else
  if [ -z "$PLATFORM" ] || [ "$PLATFORM" == "android" ]; then
    powershell -Command "
      Add-Type -AssemblyName System.IO.Compression;
      Add-Type -AssemblyName System.IO.Compression.FileSystem;
      \$archivePath = Join-Path (Get-Location).Path 'ota/android.zip';
      if (Test-Path \$archivePath) { Remove-Item \$archivePath -Force };
      \$zip = [System.IO.Compression.ZipFile]::Open(\$archivePath, [System.IO.Compression.ZipArchiveMode]::Create);
      \$bundleDir = Join-Path (Get-Location).Path 'ota/android_bundle/bundle';
      if (Test-Path \$bundleDir) {
        \$files = Get-ChildItem -Path \$bundleDir -Recurse -File;
        foreach (\$file in \$files) {
          if (\$file.Name -ne 'index.android.bundle') {
            \$entryName = \$file.FullName.Substring(\$bundleDir.Length + 1).Replace('\\', '/');
            \$null = [System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile(\$zip, \$file.FullName, 'bundle/' + \$entryName);
          }
        }
        foreach (\$file in \$files) {
          if (\$file.Name -eq 'index.android.bundle') {
            \$entryName = \$file.FullName.Substring(\$bundleDir.Length + 1).Replace('\\', '/');
            \$null = [System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile(\$zip, \$file.FullName, 'bundle/' + \$entryName);
          }
        }
      }
      \$zip.Dispose();
    "
  fi
  if [ -z "$PLATFORM" ] || [ "$PLATFORM" == "ios" ]; then
    powershell -Command "
      Add-Type -AssemblyName System.IO.Compression;
      Add-Type -AssemblyName System.IO.Compression.FileSystem;
      \$archivePath = Join-Path (Get-Location).Path 'ota/ios.zip';
      if (Test-Path \$archivePath) { Remove-Item \$archivePath -Force };
      \$zip = [System.IO.Compression.ZipFile]::Open(\$archivePath, [System.IO.Compression.ZipArchiveMode]::Create);
      \$bundleDir = Join-Path (Get-Location).Path 'ota/ios_bundle/bundle';
      if (Test-Path \$bundleDir) {
        \$files = Get-ChildItem -Path \$bundleDir -Recurse -File;
        foreach (\$file in \$files) {
          if (\$file.Name -ne 'main.jsbundle') {
            \$entryName = \$file.FullName.Substring(\$bundleDir.Length + 1).Replace('\\', '/');
            \$null = [System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile(\$zip, \$file.FullName, 'bundle/' + \$entryName);
          }
        }
        foreach (\$file in \$files) {
          if (\$file.Name -eq 'main.jsbundle') {
            \$entryName = \$file.FullName.Substring(\$bundleDir.Length + 1).Replace('\\', '/');
            \$null = [System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile(\$zip, \$file.FullName, 'bundle/' + \$entryName);
          }
        }
      }
      \$zip.Dispose();
    "
  fi
fi

# --- Cleanup temp folders ---
rm -rf ota/android_bundle
rm -rf ota/ios_bundle

# --- Uploading ---
echo "=== Uploading to GitHub Releases ==="

FILES_TO_UPLOAD=""
if [ -z "$PLATFORM" ] || [ "$PLATFORM" == "android" ]; then
  FILES_TO_UPLOAD="$FILES_TO_UPLOAD ota/android.zip"
fi
if [ -z "$PLATFORM" ] || [ "$PLATFORM" == "ios" ]; then
  FILES_TO_UPLOAD="$FILES_TO_UPLOAD ota/ios.zip"
fi

if gh release create ota-v$TAG_VERSION \
  $FILES_TO_UPLOAD \
  --repo $GITHUB_REPO \
  --title "OTA v$VERSION" \
  --notes "Hotfix v$VERSION ($([[ -z "$PLATFORM" ]] && echo "All" || echo "$PLATFORM"))"; then
  echo "Release created successfully."
else
  echo "⚠️ Release already exists, uploading files to existing release..."
  gh release upload ota-v$TAG_VERSION $FILES_TO_UPLOAD --repo $GITHUB_REPO --clobber
fi

# --- Update update.json ---
echo "=== Updating update.json ==="

IFS='.' read -r MAJOR MINOR PATCH <<< "$VERSION"
VERSION_CODE=$((MAJOR * 10000 + MINOR * 100 + PATCH))

SHA_RESPONSE=$(curl -s \
  -H "Authorization: token $GITHUB_TOKEN" \
  "https://api.github.com/repos/$GITHUB_REPO/contents/update.json")

SHA=$(echo $SHA_RESPONSE | node -pe "try { JSON.parse(require('fs').readFileSync(0)).sha } catch(e) { '' }" 2>/dev/null || echo "")

# Fetch current JSON to keep URLs if platform skipped
CURRENT_DATA_BASE64=$(echo $SHA_RESPONSE | node -pe "try { JSON.parse(require('fs').readFileSync(0)).content } catch(e) { '' }")
if [ -n "$CURRENT_DATA_BASE64" ]; then
  CURRENT_JSON=$(echo "$CURRENT_DATA_BASE64" | base64 -d)
else
  CURRENT_JSON="{}"
fi

PREV_ANDROID_URL=$(echo "$CURRENT_JSON" | node -pe "try { JSON.parse(require('fs').readFileSync(0)).downloadAndroidUrl } catch(e) { '' }")
PREV_IOS_URL=$(echo "$CURRENT_JSON" | node -pe "try { JSON.parse(require('fs').readFileSync(0)).downloadIosUrl } catch(e) { '' }")

NEW_ANDROID_URL="https://github.com/$GITHUB_REPO/releases/download/ota-v$TAG_VERSION/android.zip"
NEW_IOS_URL="https://github.com/$GITHUB_REPO/releases/download/ota-v$TAG_VERSION/ios.zip"

if [ "$PLATFORM" == "ios" ]; then
  NEW_ANDROID_URL=$PREV_ANDROID_URL
fi
if [ "$PLATFORM" == "android" ]; then
  NEW_IOS_URL=$PREV_IOS_URL
fi

JSON_CONTENT="{
  \"version\": \"$VERSION\",
  \"versionCode\": $VERSION_CODE,
  \"downloadAndroidUrl\": \"$NEW_ANDROID_URL\",
  \"downloadIosUrl\": \"$NEW_IOS_URL\"
}"

if [[ "$OSTYPE" == "linux-gnu"* ]]; then
  CONTENT=$(echo "$JSON_CONTENT" | base64 -w 0)
else
  CONTENT=$(echo "$JSON_CONTENT" | base64 | tr -d '\n')
fi

if [ -z "$SHA" ] || [ "$SHA" = "undefined" ] || [ "$SHA" = "null" ]; then
  SHA_FIELD=""
else
  SHA_FIELD=", \"sha\": \"$SHA\""
fi

curl -s -X PUT \
  -H "Authorization: token $GITHUB_TOKEN" \
  -H "Content-Type: application/json" \
  "https://api.github.com/repos/$GITHUB_REPO/contents/update.json" \
  -d "{
    \"message\": \"OTA v$VERSION\",
    \"content\": \"$CONTENT\"
    $SHA_FIELD
  }"

echo ""
echo "=== ✅ OTA v$VERSION ($( [[ -z "$PLATFORM" ]] && echo "Both" || echo "$PLATFORM" )) deployed successfully ==="
