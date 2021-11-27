#!/usr/bin/env bash

set -e

version="$1"
if [ -z "$version" ]; then
  >&2 echo "missing version"
  exit 1
fi

lowercase () {
  tr '[:upper:]' '[:lower:]'
}

arch="$(uname -m | lowercase)"
if [ "$arch" == "x86_64" ]; then
  arch="amd64"
fi

platform="$(uname | lowercase)"
if [ "$platform" == "darwin" ]; then
  platform="macos"
elif [ "$platform" == "linux" ]; then
  platform="static-linux"
elif [ "$platform" == "windows" ]; then
  platform="windows.exe"
fi

url="https://github.com/ethereum/solidity/releases/download/v${version}/solc-${platform}"
curl -fL# "$url"
