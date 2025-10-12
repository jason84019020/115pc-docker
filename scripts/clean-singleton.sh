#!/bin/sh

echo "[Clean Singleton] 清理 Browser Singleton 檔案..."

rm -f "${HOME}/browser/user-data/SingletonLock" \
      "${HOME}/browser/user-data/SingletonCookie" \
      "${HOME}/browser/user-data/SingletonSocket"

echo "[Clean Singleton] 清理完成。"
