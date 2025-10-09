# 115pc-docker

[![GitHub Stars](https://img.shields.io/github/stars/jason84019020/115pc-docker.svg?style=flat-square&label=Stars&logo=github)](https://github.com/jason84019020/115pc-docker/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/jason84019020/115pc-docker.svg?style=flat-square&label=Forks&logo=github)](https://github.com/jason84019020/115pc-docker/fork)
[![Docker Stars](https://img.shields.io/docker/stars/jason84019020/115pc-docker.svg?style=flat-square&label=Stars&logo=docker)](https://hub.docker.com/r/jason84019020/115pc-docker)
[![Docker Pulls](https://img.shields.io/docker/pulls/jason84019020/115pc-docker.svg?style=flat-square&label=Pulls&logo=docker&color=orange)](https://hub.docker.com/r/jason84019020/115pc-docker)

## 專案簡介

該專案是基於 [dream10201/115Docker](https://github.com/dream10201/115Docker) 與 [jlesage/docker-baseimage-gui](https://github.com/jlesage/docker-baseimage-gui) 整合、優化後的版本。

## 功能

- 可透過 VNC 或瀏覽器 (5800/5900 port) 操作完整圖形介面
- 支援多語系與時區設定
- /config/Downloads 目錄用於下載和存儲管理
- 基於 jlesage/docker-baseimage-gui，提供完整桌面環境
- 適用於伺服器、NAS 或雲端平台，輕鬆遠端管理下載任務
- <span style="color:red">**(new)**</span> 啟動後自動開啟瀏覽器並開始下載
- <span style="color:red">**(new)**</span> 支援 Cookie 登入

## 使用方法

### Docker CLI

- 使用以下命令啟動容器（請替換 `<LANG>` 、 `<TZ>` 、 `<PATH>` 為相應的值）：

```
docker run -d \
    --name 115pc \
    --restart unless-stopped \
    -e LANG=<LANG> \
    -e TZ=<TZ> \
    -p 5800:5800 \
    -p 5900:5900 \
    -v <PATH>:/config/browser/downloads \
    -v <PATH>:/config/browser/user-data \
    -v <PATH>:/config/browser/extensions/115pc-auto-cookie-loader/cookie.json \
    jason84019020/115pc-docker:latest
```

### Docker Compose

```
services:
  115pc:
    container_name: 115pc
    image: jason84019020/115pc-docker:latest
    restart: unless-stopped
    volumes:
      - ./downloads:/config/browser/downloads
      - ./user-data:/config/browser/user-data
      - ./cookie.json:/config/browser/extensions/115pc-auto-cookie-loader/cookie.json
    ports:
      - 5900:5900
      - 5800:5800
```

#### 訪問容器

- 可以通過 VNC 訪問容器的 GUI，端口 5800（HTTP）或 5900（VNC）。
  > 確保防火牆允許開放端口 5800 和 5900。

## 參數

| 參數                                                                        | 功能                                             |
| --------------------------------------------------------------------------- | ------------------------------------------------ |
| `-e LANG=<LANG>`                                                            | 設置系統語言（例如：en_US.UTF-8、zh_TW.UTF-8）。 |
| `-e TZ=<TZ>`                                                                | 設置時區（例如：Asia/Taipei）。                  |
| `-p 5800:5800`                                                              | 綁定 GUI 訪問端口（HTTP）用於 VNC。              |
| `-p 5900:5900`                                                              | 綁定 GUI 訪問端口（VNC）。                       |
| `-v <PATH>:/config/browser/downloads`                                       | 下載存放路徑。                                   |
| `-v <PATH>:/config/browser/user-data`                                       | 瀏覽器使用者資料（cookies、登入紀錄等）。        |
| `-v <PATH>:/config/browser/extensions/115pc-auto-cookie-loader/cookie.json` | Cookie 自動載入設定檔。                          |

## 高級說明

若需了解原始結構與延伸功能，可參考：

- [dream10201/115Docker](https://github.com/dream10201/115Docker) — 原始 115 PC 環境設定
- [jlesage/docker-baseimage-gui](https://github.com/jlesage/docker-baseimage-gui) — 基礎 GUI Docker 映像

本專案在其基礎上進行整合與優化，主要改進如下：

- 改良啟動腳本與容器行為（更穩定）
- 調整配置結構，使掛載路徑更直覺
- 更新桌面環境設定以改善顯示效果
- 預設支援繁體中文與多語系介面
