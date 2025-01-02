FROM jlesage/baseimage-gui:debian-12-v4

ENV APP_NAME=115pc
ENV LANG=zh_TW.UTF-8
ENV TZ=Asia/Taipei
ENV HOME=/config
ENV LD_LIBRARY_PATH=/usr/local/115Browser:\$LD_LIBRARY_PATH

RUN apt update \
    && apt install -y curl \
    jq wget locales locales-all pcmanfm tint2 \
    libglib2.0-0 libnss3 libdbus-1-3 libatk1.0-0 \
    libatk-bridge2.0-0 libcups2 libdrm2 libxcomposite1 \
    libxfixes3 libxrandr2 libgbm1 libxkbcommon0 libpango1.0-0 \
    libasound2 libxdamage1 \
    && locale-gen ${LANG} \
    && update-locale LANG=${LANG} \
    && export BROWSER_URL=$(curl -s https://appversion.115.com/1/web/1.0/api/getMultiVer | jq -r '.data."Linux-115chrome".version_url') \
    && export BROWSER_PACKAGE_NAME=$(basename ${BROWSER_URL}) \
    && wget -q -c ${BROWSER_URL} \
    && apt install -y ./${BROWSER_PACKAGE_NAME} \
    && install_app_icon.sh https://union.115.com/static/logo_b.png \
    && mkdir -p /config/Desktop \
    && mkdir -p /config/Downloads \
    && mkdir -p /config/BrowserUserData \
    && chmod 777 -R /config \
    && chmod 777 -R /config/Desktop \
    && chmod 777 -R /config/Downloads \
    && chmod 777 -R /config/BrowserUserData \
    && cp /usr/share/applications/115Browser.desktop /config/Desktop \
    && sed -i 's/<decor>no<\/decor>/<decor>yes<\/decor>/g' /opt/base/etc/openbox/rc.xml.template \
    && rm ./${BROWSER_PACKAGE_NAME} \
    && rm -rf /var/lib/apt/lists/*

COPY startapp.sh /startapp.sh
COPY 115.sh /usr/local/115Browser/115.sh
