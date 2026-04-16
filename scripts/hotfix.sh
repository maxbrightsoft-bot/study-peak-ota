#!/bin/bash
VERSION=$1

if [ -z "$VERSION" ]; then
  echo "Usage: ./scripts/hotfix.sh <version>"
  exit 1
fi

source .env

TAG_VERSION=$(echo $VERSION | tr '.' '-')

echo "=== Building bundles ==="
mkdir -p ota

# Android
npx react-native bundle \
  --platform android --dev false \
  --entry-file index.js \
  --bundle-output ota/index.android.bundle \
  --assets-dest ota/assets
cd ota && zip -r android.zip index.android.bundle assets/ && cd ..

# iOS
npx react-native bundle \
  --platform ios --dev false \
  --entry-file index.js \
  --bundle-output ota/main.jsbundle \
  --assets-dest ota/assets
cd ota && zip -r ios.zip main.jsbundle assets/ && cd ..

echo "=== Uploading to GitHub Releases ==="
gh release create ota-v$TAG_VERSION \
  ota/android.zip \
  ota/ios.zip \
  --repo $GITHUB_REPO \
  --title "OTA v$VERSION" \
  --notes "Hotfix v$VERSION"

echo "=== Updating update.json via API ==="

SHA=$(curl -s \
  -H "Authorization: token $GITHUB_TOKEN" \
  "https://api.github.com/repos/$GITHUB_REPO/contents/update.json" \
  | python3 -c "import sys,json; print(json.load(sys.stdin)['sha'])")

CONTENT=$(echo "{
  \"version\": \"$VERSION\",
  \"downloadAndroidUrl\": \"https://github.com/$GITHUB_REPO/releases/download/ota-v$TAG_VERSION/android.zip\",
  \"downloadIosUrl\": \"https://github.com/$GITHUB_REPO/releases/download/ota-v$TAG_VERSION/ios.zip\"
}" | base64)

curl -s -X PUT \
  -H "Authorization: token $GITHUB_TOKEN" \
  -H "Content-Type: application/json" \
  "https://api.github.com/repos/$GITHUB_REPO/contents/update.json" \
  -d "{
    \"message\": \"OTA v$VERSION\",
    \"content\": \"$CONTENT\",
    \"sha\": \"$SHA\"
  }"

echo "=== Done! OTA v$VERSION deployed ==="