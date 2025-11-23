FROM node:25-bookworm-slim AS tool-build

WORKDIR /tools

COPY tools/auto-resume-downloads /tools/auto-resume-downloads

RUN cd auto-resume-downloads \
 && npm install \
 && npm run compile \
 && npm run esbuild -- build/src/index.js --bundle --platform=node --format=cjs --outfile=dist/bundle.js

FROM jlesage/baseimage-gui:debian-12-v4

ENV APP_NAME=115pc
ENV LANG=zh_TW.UTF-8
ENV TZ=Asia/Taipei
ENV HOME=/config
ENV LD_LIBRARY_PATH=/usr/local/115Browser:\$LD_LIBRARY_PATH

RUN mkdir -p ${HOME}/Desktop \
             ${HOME}/browser/downloads \
             ${HOME}/browser/user-data \
             ${HOME}/browser/extensions \
 && chmod -R 777 ${HOME} \
 && ln -sf ${HOME}/browser/downloads ${HOME}/Downloads

WORKDIR ${HOME}

RUN apt-get update \
 && apt-get install -y curl jq wget locales pcmanfm tint2 libdrm2 libgbm1 libasound2 libatomic1 \
 && sed -i 's|<decor>no</decor>|<decor>yes</decor>|g' /opt/base/etc/openbox/rc.xml.template \
 && sed -i 's|<maximized>true</maximized>|<maximized>false</maximized>|g' /opt/base/etc/openbox/rc.xml.template \
 && sed -i -e 's|^# en_US.UTF-8 UTF-8|en_US.UTF-8 UTF-8|' /etc/locale.gen \
 && sed -i -e 's|^# zh_TW.UTF-8 UTF-8|zh_TW.UTF-8 UTF-8|' /etc/locale.gen \
 && sed -i -e 's|^# zh_CN.UTF-8 UTF-8|zh_CN.UTF-8 UTF-8|' /etc/locale.gen \
 && locale-gen \
 && curl -s https://appversion.115.com/1/web/1.0/api/getMultiVer -o 115meta.json \
 && BROWSER_URL=$(jq -r '.data["Linux-115chrome"].version_url' 115meta.json) \
 && BROWSER_PACKAGE_NAME=$(basename ${BROWSER_URL}) \
 && wget -q -c ${BROWSER_URL} \
 && dpkg -i ${BROWSER_PACKAGE_NAME} \
 && cp /usr/share/applications/115Browser.desktop ${HOME}/Desktop \
 && install_app_icon.sh https://union.115.com/static/logo_b.png \
 && apt-get autoremove -y \
 && apt-get clean \
 && rm -rf /var/lib/apt/lists/* \
 && rm -f 115meta.json \
 && rm -f ${BROWSER_PACKAGE_NAME}

COPY --from=tool-build /usr/local/bin/node /usr/local/bin/node
COPY --from=tool-build /tools/auto-resume-downloads/dist/bundle.js /usr/local/115Browser/tools/auto-resume-downloads.js
COPY extensions/115pc-auto-cookie-loader ${HOME}/browser/extensions/115pc-auto-cookie-loader
COPY scripts/115.sh /usr/local/115Browser/115.sh
COPY scripts/startapp.sh /startapp.sh
COPY scripts/clean-singleton.sh /etc/cont-init.d/50-clean-singleton.sh

ARG IMAGE_BROWSER_VERSION
ARG IMAGE_CREATED

LABEL org.opencontainers.image.115browser-version="${IMAGE_BROWSER_VERSION}"
LABEL org.opencontainers.image.created="$IMAGE_CREATED"
