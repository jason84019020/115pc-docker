#!/bin/sh

lang=$(
  case "${LANG}" in
    zh_TW.UTF-8) echo "zh-TW" ;;
    zh_CN.UTF-8) echo "zh-CN" ;;
    en-US.UTF-8) echo "en-US" ;;
    *) echo "en-US" ;;
  esac
)

cd /usr/local/115Browser

# 調用觸發工具(點擊下載 - 全部開始)
./clicker &

./115Browser --test-type \
    --disable-backgrounding-occluded-windows \
    --user-data-dir=${HOME}/browser/user-data \
    --load-extension=${HOME}/browser/extensions/115pc-auto-cookie-loader \
    --disable-cache \
    --disable-wav-audio \
    --disable-logging \
    --disable-notifications \
    --no-default-browser-check \
    --disable-background-networking \
    --enable-features=ParallelDownloading \
    --start-maximized \
    --no-sandbox \
    --disable-vulkan \
    --disable-gpu \
    --ignore-certificate-errors \
    --disable-bundled-plugins \
    --disable-dev-shm-usage \
    --reduce-user-agent-sniffing \
    --no-first-run \
    --disable-breakpad \
    --disable-gpu-process-crash-limit \
    --enable-low-res-tiling \
    --disable-heap-profiling \
    --disable-features=IsolateOrigins,site-per-process \
    --disable-smooth-scrolling \
    --lang=${lang} \
    --disable-software-rasterizer \
    --remote-debugging-port=9222 \
    --remote-allow-origins=*
