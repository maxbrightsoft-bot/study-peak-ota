#!/bin/bash
set -e

VERSION=$1
PLATFORM=$2 # android or ios (optional)

if [ -z "$VERSION" ]; then
  echo "Usage: hotfix.sh <version> [android|ios]"
  exit 1
fi

if [ -n "$PLATFORM" ] && [ "$PLATFORM" != "android" ] && [ "$PLATFORM" != "ios" ]; then
  echo "❌ Platform must be 'android' or 'ios' (hoặc để trống để chạy cả hai)"
  exit 1
fi

CURRENT_IN_CODE=$(grep -o '"[0-9]\+\.[0-9]\+\.[0-9]\+"' app/index.tsx | head -1 | tr -d '"')

if [ "$CURRENT_IN_CODE" != "$VERSION" ]; then
  echo "❌ CURRENT_BUNDLE_VERSION trong app/index.tsx là '$CURRENT_IN_CODE', chưa cập nhật thành '$VERSION'"
  echo "   Hãy sửa trước rồi chạy lại script"
  exit 1
fi

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
source "$SCRIPT_DIR/.env"

TAG_VERSION=$(echo $VERSION | tr '.' '-')

echo "=== Cleaning ==="
rm -rf ota
mkdir -p ota

ENTRY_FILE="node_modules/expo-router/entry.js"

# --- Building ---
if [ -z "$PLATFORM" ] || [ "$PLATFORM" == "android" ]; then
  echo "=== Building Android bundle ==="
  npx expo export:embed \
    --platform android --dev false \
    --entry-file $ENTRY_FILE \
    --bundle-output ota/index.android.bundle \
    --assets-dest ota || {
      echo "❌ Android bundle failed"
      exit 1
  }
fi

if [ -z "$PLATFORM" ] || [ "$PLATFORM" == "ios" ]; then
  echo "=== Building iOS bundle ==="
  npx expo export:embed \
    --platform ios --dev false \
    --entry-file $ENTRY_FILE \
    --bundle-output ota/main.jsbundle \
    --assets-dest ota || {
      echo "❌ iOS bundle failed"
      exit 1
  }
fi

# --- Zipping ---
echo "=== Zipping ==="
if command -v zip >/dev/null 2>&1; then
  cd ota
  if [ -z "$PLATFORM" ] || [ "$PLATFORM" == "android" ]; then
    zip -r android.zip . --exclude "*.zip"
  fi
  if [ -z "$PLATFORM" ] || [ "$PLATFORM" == "ios" ]; then
    zip -r ios.zip . --exclude "*.zip"
  fi
  cd ..
else
  cd ota
  if [ -z "$PLATFORM" ] || [ "$PLATFORM" == "android" ]; then
    powershell -Command "Get-ChildItem -Exclude @('android.zip','ios.zip') | Compress-Archive -DestinationPath android.zip -Force"
  fi
  if [ -z "$PLATFORM" ] || [ "$PLATFORM" == "ios" ]; then
    powershell -Command "Get-ChildItem -Exclude @('android.zip','ios.zip') | Compress-Archive -DestinationPath ios.zip -Force"
  fi
  cd ..
fi

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