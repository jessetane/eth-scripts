#!/usr/bin/env bash

set -e

version="$1"
if [ -z "$version" ]; then
  >&2 echo "missing version"
  exit 1
fi

url="https://api.github.com/repos/ethereum/go-ethereum/commits/v${version}"
commit="$(curl -f "$url" 2>/dev/null | grep -m 1 'sha' | tail -c +11 | head -c 8)"

lowercase () {
  tr '[:upper:]' '[:lower:]'
}

arch="$(uname -m | lowercase)"
if [ "$arch" == "x86_64" ]; then
  arch="amd64"
fi

platform="$(uname | lowercase)"
if [ "$platform" == "windows" ]; then
  url="https://gethstore.blob.core.windows.net/builds/geth-${platform}-${arch}-${version}-${commit}.exe"
  curl -fL# "$url"
else
  url="https://gethstore.blob.core.windows.net/builds/geth-${platform}-${arch}-${version}-${commit}.tar.gz"
  curl -fL# "$url" | 2>/dev/null tar xvzO geth-${platform}-${arch}-${version}-${commit}/geth
fi
