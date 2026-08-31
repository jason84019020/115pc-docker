#!/bin/bash

# 啟動桌面環境
pcmanfm --desktop &

# 啟動 tint2 面板
tint2 &

# 啟動 115Browser
"${HOME}/browser/115.sh" &

sleep infinity
