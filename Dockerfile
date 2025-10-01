FROM golang:bookworm AS tool-build

WORKDIR /tools

COPY tools/clicker.go clicker.go

# 建立 go.mod 並安裝 chromedp，tidy 清理依賴
RUN go mod init clicker \
    && go get github.com/chromedp/chromedp \
    && go mod tidy

# 編譯成二進位檔，輸出成 clicker
RUN go build -o clicker clicker.go

FROM jlesage/baseimage-gui:debian-12-v4 AS app

FROM app AS build

WORKDIR /installer

# 安裝相依套件
RUN apt update && apt install -y curl jq wget 

# 安裝 115Browser
RUN export BROWSER_URL=$(curl -s https://appversion.115.com/1/web/1.0/api/getMultiVer | jq -r '.data."Linux-115chrome".version_url') \
    && export BROWSER_PACKAGE_NAME=$(basename ${BROWSER_URL}) \
    && wget -q -c ${BROWSER_URL} \
    && apt install -y ./${BROWSER_PACKAGE_NAME}

FROM app

ENV APP_NAME=115pc
ENV LANG=zh_TW.UTF-8
ENV TZ=Asia/Taipei
ENV HOME=/config
ENV LD_LIBRARY_PATH=/usr/local/115Browser:\$LD_LIBRARY_PATH

WORKDIR ${HOME}

# 安裝系統套件 & 設定語系
RUN apt update \
    && apt install -y locales locales-all pcmanfm tint2 \
    libdrm2 libgbm1 libasound2 \
    && locale-gen ${LANG} \
    && update-locale LANG=${LANG} \
    && apt autoremove -y \
    && rm -rf /var/lib/apt/lists/*

# 建立資料夾 & 權限
RUN mkdir -p /config/Desktop \
    && mkdir -p /config/Downloads \
    && mkdir -p /config/BrowserUserData \
    && chmod 777 -R /config \
    && chmod 777 -R /config/Desktop \
    && chmod 777 -R /config/Downloads \
    && chmod 777 -R /config/BrowserUserData

# 配置icon & 設置桌面相關配置
RUN install_app_icon.sh https://union.115.com/static/logo_b.png \
    && sed -i 's/<decor>no<\/decor>/<decor>yes<\/decor>/g' /opt/base/etc/openbox/rc.xml.template \
    && sed -i 's/<maximized>true<\/maximized>/<maximized>false<\/maximized>/g' /opt/base/etc/openbox/rc.xml.template

COPY --from=build /usr/share/applications/115Browser.desktop /config/Desktop/115Browser.desktop
COPY --from=build /usr/local/115Browser /usr/local/115Browser
COPY --from=tool-build /tools/clicker /usr/local/115Browser/clicker
COPY scripts/startapp.sh /startapp.sh
COPY scripts/115.sh /usr/local/115Browser/115.sh
