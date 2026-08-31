FROM node:bookworm-slim

ARG USER_ID=1000
ARG GROUP_ID=1000

RUN npm install -g npm@latest \
 && groupadd --gid ${GROUP_ID} dev \
 && useradd --uid ${USER_ID}  --gid ${GROUP_ID} --create-home --shell /bin/bash dev

WORKDIR /app

RUN chown -R dev:dev /app

USER dev
