# 115pc-docker

[![GitHub Stars](https://img.shields.io/github/stars/jason84019020/115pc-docker.svg?style=flat-square&label=Stars&logo=github)](https://github.com/jason84019020/115pc-docker/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/jason84019020/115pc-docker.svg?style=flat-square&label=Forks&logo=github)](https://github.com/jason84019020/115pc-docker/fork)
[![Docker Stars](https://img.shields.io/docker/stars/jason84019020/115pc-docker.svg?style=flat-square&label=Stars&logo=docker)](https://hub.docker.com/r/jason84019020/115pc-docker)
[![Docker Pulls](https://img.shields.io/docker/pulls/jason84019020/115pc-docker.svg?style=flat-square&label=Pulls&logo=docker&color=orange)](https://hub.docker.com/r/jason84019020/115pc-docker)

## 功能
* 整合 [dream10201/115Docker](https://github.com/dream10201/115Docker) 與 [jlesage/docker-baseimage-gui](https://github.com/jlesage/docker-baseimage-gui) 的功能
* 透過 VNC 遠程控制 GUI 界面
* 可自定義環境變數
* /config/Downloads 目錄用於下載和存儲管理
* 輕量級且易於部署的 Docker 映像
* 支援通過端口 5800 和 5900 訪問 GUI

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
    -v <PATH>:/config/Downloads \
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
      - ./downloads:/config/Downloads
    ports:
      - 5900:5900
      - 5800:5800
```

#### 訪問容器
- 可以通過 VNC 訪問容器的 GUI，端口 5800（HTTP）或 5900（VNC）。
    > 確保防火牆允許開放端口 5800 和 5900。

## 參數

| 參數 | 功能 |
| --- | --- |
| `-e LANG=<LANG>` | 設置系統語言（例如：en_US.UTF-8、zh_TW.UTF-8）。 |
| `-e TZ=<TZ>` | 設置時區（例如：Asia/Taipei）。 |
| `-p 5800:5800` | 綁定 GUI 訪問端口（HTTP）用於 VNC。 |
| `-p 5900:5900` | 綁定 GUI 訪問端口（VNC）。 |
| `-v <PATH>:/config/Downloads` | 設置下載存儲的路徑。|

## 高級用法

若需更多信息或自定義配置，請參考原始映像：

- [dream10201/115Docker](https://github.com/dream10201/115Docker)
- [jlesage/docker-baseimage-gui](https://github.com/jlesage/docker-baseimage-gui)