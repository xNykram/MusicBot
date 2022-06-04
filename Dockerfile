FROM node:17.8.0

COPY app /app

WORKDIR /app

RUN npm install

RUN npm install typescript@4.5.4 -g

RUN tsc
