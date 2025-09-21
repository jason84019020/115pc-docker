#!/bin/bash

# 啟動桌面環境
pcmanfm --desktop &

# 啟動 115Browser
/usr/local/115Browser/115.sh &

# 等待 115Browser 視窗出現，最多 30 秒
WIN_ID=""
for i in $(seq 1 30); do
    WIN_ID=$(wmctrl -l | grep "Chromium" | awk '{print $1}')
    if [ -n "$WIN_ID" ]; then
        echo "找到 115Browser 視窗: $WIN_ID"
        break
    fi
    echo "等待 115Browser 啟動中... ($i/30)"
    sleep 1
done

if [ -z "$WIN_ID" ]; then
    echo "❌ 在 30 秒內沒有找到 115Browser 視窗"
    exit 1
fi

# 聚焦視窗
xdotool windowactivate "$WIN_ID"

# 打開下載管理 (Ctrl+J)
xdotool key --window "$WIN_ID" ctrl+j
sleep 1

# 點擊 Resume 按鈕 (假設座標 115,48)
xdotool mousemove 115 48 click 1
sleep 1

# 點擊關閉視窗 (假設座標 2040,10)
xdotool mousemove 2040 10 click 1

# 啟動 tint2 面板
tint2
