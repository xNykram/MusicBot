FROM nikolaik/python-nodejs:python3.10-nodejs16

MAINTAINER WebSoftDevs

RUN apt-get install python -y

COPY app .

WORKDIR /app

RUN npm install

RUN npm install -g typescript

RUN tsc
