#!/bin/bash
set -e

VERSION=$1

if [ -z "$VERSION" ]; then
  echo "Usage: hotfix.sh <version>"
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

echo "=== Building Android bundle ==="
npx react-native bundle \
  --platform android --dev false \
  --entry-file $ENTRY_FILE \
  --bundle-output ota/index.android.bundle \
  --assets-dest ota/assets || {
    echo "❌ Android bundle failed"
    exit 1
}

echo "=== Building iOS bundle ==="
npx react-native bundle \
  --platform ios --dev false \
  --entry-file $ENTRY_FILE \
  --bundle-output ota/main.jsbundle \
  --assets-dest ota/assets || {
    echo "❌ iOS bundle failed"
    exit 1
}

echo "=== Validating bundles ==="

if [ ! -f ota/index.android.bundle ]; then
  echo "❌ Android bundle missing"
  exit 1
fi

if [ ! -f ota/main.jsbundle ]; then
  echo "❌ iOS bundle missing"
  exit 1
fi

echo "=== Zipping ==="

if command -v zip >/dev/null 2>&1; then
  cd ota
  zip -r android.zip index.android.bundle assets
  zip -r ios.zip main.jsbundle assets
  cd ..
else
  cd ota
  powershell Compress-Archive -Path "index.android.bundle","assets" -DestinationPath "android.zip" -Force
  powershell Compress-Archive -Path "main.jsbundle","assets" -DestinationPath "ios.zip" -Force
  cd ..
fi

echo "=== Validate zip ==="

if [ ! -f ota/android.zip ]; then
  echo "❌ android.zip not found"
  exit 1
fi

if [ ! -f ota/ios.zip ]; then
  echo "❌ ios.zip not found"
  exit 1
fi

echo "=== Uploading to GitHub Releases ==="

gh release create ota-v$TAG_VERSION \
  ota/android.zip \
  ota/ios.zip \
  --repo $GITHUB_REPO \
  --title "OTA v$VERSION" \
  --notes "Hotfix v$VERSION" || echo "⚠️ Release may already exist"

echo "=== Updating update.json ==="

IFS='.' read -r MAJOR MINOR PATCH <<< "$VERSION"
VERSION_CODE=$((MAJOR * 10000 + MINOR * 100 + PATCH))

SHA_RESPONSE=$(curl -s \
  -H "Authorization: token $GITHUB_TOKEN" \
  "https://api.github.com/repos/$GITHUB_REPO/contents/update.json")

SHA=$(echo $SHA_RESPONSE | node -pe "try { JSON.parse(require('fs').readFileSync(0)).sha } catch(e) { '' }" 2>/dev/null || echo "")

JSON_CONTENT="{
  \"version\": \"$VERSION\",
  \"versionCode\": $VERSION_CODE,
  \"downloadAndroidUrl\": \"https://github.com/$GITHUB_REPO/releases/download/ota-v$TAG_VERSION/android.zip\",
  \"downloadIosUrl\": \"https://github.com/$GITHUB_REPO/releases/download/ota-v$TAG_VERSION/ios.zip\"
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
echo "=== ✅ OTA v$VERSION deployed successfully ==="