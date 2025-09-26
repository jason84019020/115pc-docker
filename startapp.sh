#!/bin/bash

# 啟動桌面環境
pcmanfm --desktop &

# 啟動 115Browser
/usr/local/115Browser/115.sh &

# 等待 115Browser 啟動
sleep 5

# 點擊開始下載
/usr/local/115Browser/click115

# 啟動 tint2 面板
tint2
