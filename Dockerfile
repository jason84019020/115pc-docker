FROM node:trixie-slim AS node-base


FROM node-base AS cookie-sync

WORKDIR /extensions/cookie-sync

COPY extensions/cookie-sync/package*.json ./
RUN npm ci

COPY extensions/cookie-sync ./
RUN npm run compile


FROM node-base AS auto-resume-downloads

WORKDIR /tools/auto-resume-downloads

COPY tools/auto-resume-downloads/package*.json ./
RUN npm ci

COPY tools/auto-resume-downloads ./
RUN npm run build


FROM jlesage/baseimage-gui:debian-13-v4 AS base

ARG IMAGE_BROWSER_VERSION
ARG IMAGE_CREATED

LABEL org.opencontainers.image.115browser-version="${IMAGE_BROWSER_VERSION}"
LABEL org.opencontainers.image.created="${IMAGE_CREATED}"

ENV APP_NAME=115pc
ENV LANG=zh_TW.UTF-8
ENV TZ=Asia/Taipei
ENV HOME=/config

RUN mkdir -p ${HOME}/Desktop \
             ${HOME}/log \
             ${HOME}/var/tmp \
             ${HOME}/browser/downloads \
             ${HOME}/browser/user-data \
             ${HOME}/browser/extensions \
             ${HOME}/browser/tools \
             ${HOME}/browser/logs \
             ${HOME}/system/scripts \
             ${HOME}/certs \
  && ln -sf ${HOME}/browser/downloads ${HOME}/Downloads

WORKDIR ${HOME}

COPY --from=cookie-sync /extensions/cookie-sync/build/src ${HOME}/browser/extensions/cookie-sync
COPY --from=auto-resume-downloads /usr/local/bin/node /usr/local/bin/node
COPY --from=auto-resume-downloads /tools/auto-resume-downloads/dist/auto-resume-downloads.cjs ${HOME}/browser/tools/auto-resume-downloads.cjs
COPY scripts/115.sh ${HOME}/browser/115.sh
COPY scripts/startapp.sh /startapp.sh
COPY scripts/clean-singleton.sh /etc/cont-init.d/50-clean-singleton.sh

RUN export LANG=C.UTF-8 \
  && apt-get update \
  && apt-get install --no-install-recommends -y systemd wget locales ca-certificates fonts-noto-cjk pcmanfm tint2 \
  && BROWSER_URL="https://down.115.com/client/115pc/lin/115br_v${IMAGE_BROWSER_VERSION}.deb" \
  && BROWSER_PACKAGE_NAME="115br_v${IMAGE_BROWSER_VERSION}.deb" \
  && wget -q -O "${BROWSER_PACKAGE_NAME}" "${BROWSER_URL}" \
  && apt-get install --no-install-recommends -y "./${BROWSER_PACKAGE_NAME}" \
  && sed -i 's|<decor>no</decor>|<decor>yes</decor>|g' /opt/base/etc/openbox/rc.xml.template \
  && sed -i 's|<maximized>true</maximized>|<maximized>false</maximized>|g' /opt/base/etc/openbox/rc.xml.template \
  && sed -i 's|^# en_US.UTF-8 UTF-8|en_US.UTF-8 UTF-8|' /etc/locale.gen \
  && sed -i 's|^# zh_TW.UTF-8 UTF-8|zh_TW.UTF-8 UTF-8|' /etc/locale.gen \
  && sed -i 's|^# zh_CN.UTF-8 UTF-8|zh_CN.UTF-8 UTF-8|' /etc/locale.gen \
  && sed -i "s|Exec=.*|Exec=${HOME}/browser/115.sh|" /usr/share/applications/115Browser.desktop \
  && cp /usr/share/applications/115Browser.desktop ${HOME}/Desktop/115Browser.desktop \
  && mv ${HOME}/browser/extensions/cookie-sync/cookie.json ${HOME}/browser/cookie.json \
  && ln -s ${HOME}/browser/cookie.json ${HOME}/browser/extensions/cookie-sync/cookie.json \
  && chmod +x ${HOME}/browser/115.sh \
  && chmod +x /startapp.sh \
  && chmod +x /etc/cont-init.d/50-clean-singleton.sh \
  && install_app_icon.sh "https://union.115.com/static/logo_b.png" \
  && locale-gen \
  && fc-cache -f \
  && rm -rf /var/lib/apt/lists/* \
  && rm -f ${BROWSER_PACKAGE_NAME}


FROM base AS dev

COPY scripts/restore-groups-and-users.sh ${HOME}/system/scripts/restore-groups-and-users.sh

RUN chmod +x ${HOME}/system/scripts/restore-groups-and-users.sh \
 && ${HOME}/system/scripts/restore-groups-and-users.sh


FROM base AS prod
