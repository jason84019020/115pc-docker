#!/bin/bash

APP_DIR=/usr/local/115Browser

cd "${APP_DIR}" || exit 1

export LD_LIBRARY_PATH="${APP_DIR}${LD_LIBRARY_PATH:+:$LD_LIBRARY_PATH}"

# 調用觸發恢復下載
node --no-deprecation "${HOME}/browser/tools/auto-resume-downloads.cjs" &

BROWSER_LANG=$(
  case "${LANG}" in
    zh_TW.UTF-8) echo "zh-TW" ;;
    zh_CN.UTF-8) echo "zh-CN" ;;
    en-US.UTF-8) echo "en-US" ;;
    *) echo "en-US" ;;
  esac
)

LOG_FILE="${HOME}/browser/logs/115Browser.log"

if [ "${BROWSER_LOG_HISTORY:-0}" = "1" ]; then
  HISTORY_LOG_FILE="${HOME}/browser/logs/115Browser-$(date '+%Y%m%d-%H%M%S').log"

  exec > >(tee "${LOG_FILE}" "${HISTORY_LOG_FILE}") 2>&1
else
  exec > "${LOG_FILE}" 2>&1
fi

exec ./115Browser \
  --test-type \
  --disable-backgrounding-occluded-windows \
  --user-data-dir="${HOME}/browser/user-data" \
  --load-extension="${HOME}/browser/extensions/cookie-sync" \
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
  --lang="${BROWSER_LANG}" \
  --disable-software-rasterizer \
  --remote-debugging-port=9222
