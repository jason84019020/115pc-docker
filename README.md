# 115pc-docker

[![GitHub Stars](https://img.shields.io/github/stars/jason84019020/115pc-docker.svg?style=flat-square&label=Stars&logo=github)](https://github.com/jason84019020/115pc-docker/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/jason84019020/115pc-docker.svg?style=flat-square&label=Forks&logo=github)](https://github.com/jason84019020/115pc-docker/fork)
[![Docker Stars](https://img.shields.io/docker/stars/jason84019020/115pc-docker.svg?style=flat-square&label=Stars&logo=docker)](https://hub.docker.com/r/jason84019020/115pc-docker)
[![Docker Pulls](https://img.shields.io/docker/pulls/jason84019020/115pc-docker.svg?style=flat-square&label=Pulls&logo=docker&color=orange)](https://hub.docker.com/r/jason84019020/115pc-docker)

本專案提供一個高度優化的 **115 電腦版客戶端** Docker 映像檔，讓您能在 NAS、伺服器或任何支援 Docker 的平台上，透過瀏覽器遠端管理 115 下載任務。

## ✨ 核心特色

- 🖥️ **完整圖形介面**：支援透過網頁 (HTTP/HTTPS 5800) 或 VNC (5900) 操作。
- 🚀 **自動化啟動**：容器啟動即自動開啟下載任務，無需手動介入。
- 🔑 **Cookie 登入**：支援免密碼透過 `cookie.json` 快速登入。
- 🌐 **語系支援**：預設優化繁體中文 (zh_TW) 與時區設定。
- 📋 **剪貼簿同步**：支援宿主機與容器間的雙向剪貼簿同步（需開啟 HTTPS）。
- 🏗️ **基礎升級**：基於 Debian 13 (Trixie) 構建，提供更現代的執行環境。

## 🚀 快速開始

### Docker Compose (建議)

建立 `docker-compose.yaml` 並執行 `docker-compose up -d`：

```yaml
services:
  115pc:
    container_name: 115pc
    image: jason84019020/115pc-docker:latest
    restart: unless-stopped
    ports:
      - 5800:5800
      - 5900:5900
    environment:
      - SECURE_CONNECTION=1 # 若要使用 HTTPS/剪貼簿同步，請設為 1
      # - LANG=en_US.UTF-8  # 預設為 zh_TW.UTF-8，可依需求修改
      # - TZ=Asia/Singapore # 預設為 Asia/Taipei，可依需求修改
    volumes:
      - ./certs:/config/certs # 剪貼簿同步必備：掛載憑證目錄
      - ./downloads:/config/browser/downloads
      - ./user-data:/config/browser/user-data
      - ./cookie.json:/config/browser/extensions/115pc-auto-cookie-loader/cookie.json
```

### 訪問方式

- Web 介面：http://<IP>:5800 (或使用 HTTPS 以啟用完整功能)

- VNC 客戶端：<IP>:5900

## 📋 剪貼簿同步與 HTTPS 功能

為了在瀏覽器中使用剪貼簿同步，現代瀏覽器安全規範要求必須在 HTTPS 模式下執行。

1. 產生憑證：請使用 [internal-cert-tool](https://github.com/jason84019020/internal-cert-tool) 產生憑證。

2. 配置與更名：將工具產出的檔案放入 ./certs 資料夾，並依照下表重新命名：
   | 工具產出原始檔名 | 容器識別檔名 (請更名為) | 說明 |
   | -------------- | ---------------------- | --- |
   | bundle.pem | vnc-server.pem | VNC 服務端憑證 |
   | fullchain.pem | web-fullchain.pem | Web 介面完整鏈憑證 |
   | privkey.pem | web-privkey.pem | Web 介面私鑰 |

3. 啟用設定：確保環境變數 SECURE_CONNECTION=1 已設定。

4. 重啟容器：重啟後即可透過 https://<IP>:5800 開啟支援剪貼簿同步的圖形介面。

## ⚙️ 配置參數

| 參數                                                              | 必填 | 預設值        | 說明                                                             |
| ----------------------------------------------------------------- | ---- | ------------- | ---------------------------------------------------------------- |
| `LANG`                                                            | ✘    | `zh_TW.UTF-8` | 設置系統語言（支援 `en_US.UTF-8`, `zh_CN.UTF-8`, `zh_TW.UTF-8`） |
| `TZ`                                                              | ✘    | `Asia/Taipei` | 設置時區（例如：`Asia/Singapore`）                               |
| `SECURE_CONNECTION`                                               | ✘    | 0             | 是否啟用 HTTPS 加密連線 (0: 關閉 / 1: 開啟)                      |
| `/config/certs`                                                   | ✘    | (掛載)        | 啟用 HTTPS 時需掛載憑證                                          |
| `/config/browser/downloads`                                       | ✔    | (掛載)        | 115 下載檔案存放路徑                                             |
| `/config/browser/user-data`                                       | ✔    | (掛載)        | 儲存瀏覽器設定                                                   |
| `/config/browser/extensions/115pc-auto-cookie-loader/cookie.json` | ✘    | (掛載)        | 自動登入用的 Cookie 檔案                                         |

### Cookie.json 範例

```json
{
  "CID": "YOUR_CID",
  "SEID": "YOUR_SEID",
  "UID": "YOUR_UID",
  "KID": "YOUR_KID"
}
```

## 🛠️ 開發與致謝

本專案基於以下優秀專案進行整合、優化與 Bug 修正：

- [dream10201/115Docker](https://github.com/dream10201/115Docker) - 原始 115 PC Linux 環境設定
- [jlesage/docker-baseimage-gui](https://github.com/jlesage/docker-baseimage-gui) - 提供強大的 Docker GUI 基礎底層

**本版本主要改進**：

- 重構啟動腳本
- 優化 LD_LIBRARY_PATH 加載邏輯
- 升級基礎系統至 Debian 13 (Trixie)
- 支援自定義 SSL 憑證以開啟剪貼簿同步功能
