#!/bin/sh

set -e

# Change to repo root
cd "$(dirname "$0")/../"

OS=$(uname -s)

# Determine output binary name
case "$OS" in
  *CYGWIN*|*MINGW*|*MSYS*)
    OUTPUT="./build/memos.exe"
    ;;
  *)
    OUTPUT="./build/memos"
    ;;
esac

echo "Building for $OS..."

# Ensure build directories exist and configure a writable Go build cache
mkdir -p ./build/.gocache ./build/.gomodcache
export GOCACHE="$(pwd)/build/.gocache"
export GOMODCACHE="$(pwd)/build/.gomodcache"

# Read version from version.txt
VERSION=$(cat version.txt 2>/dev/null || echo "0.0.0-dev")

# Build the executable
go build \
  -ldflags="-X github.com/usememos/memos/internal/version.Version=${VERSION}" \
  -o "$OUTPUT" \
  ./cmd/memos

echo "Build successful!"
echo "To run the application, execute the following command:"
echo "$OUTPUT"
