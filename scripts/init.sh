#!/bin/sh
set -e

# 定義初始化旗標檔
INIT_FLAG="${HOME}/browser/.initialized"

if [ ! -f "${INIT_FLAG}" ]; then
    echo "[Init] 第一次初始化，清理 Browser Singleton 檔案..."
    rm -f "${HOME}/browser/user-data/SingletonLock" \
          "${HOME}/browser/user-data/SingletonCookie" \
          "${HOME}/browser/user-data/SingletonSocket"

    # 建立旗標檔
    touch "${INIT_FLAG}"
    echo "[Init] 初始化完成，已建立旗標檔：${INIT_FLAG}"
else
    echo "[Init] 已經初始化過，跳過清理。"
fi
