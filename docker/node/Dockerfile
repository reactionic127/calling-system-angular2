FROM node:latest

RUN npm install -g --silent yo gulp tslint
RUN apt update && apt install sudo
RUN npm install -g --silent eslint webpack webpack-dev-server

ENV TERM xterm-256color
ENV TZ=Europe/Bucharest
RUN adduser --disabled-password --gecos "" strangehat && \
  echo "strangehat ALL=(ALL) NOPASSWD:ALL" >> /etc/sudoers

RUN mkdir /app && chown strangehat:strangehat /app

ENV HOST="0.0.0.0"

USER strangehat

CMD ["npm", "start"]
