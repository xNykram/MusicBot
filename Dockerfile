FROM nikolaik/python-nodejs:python3.10-nodejs16

MAINTAINER WebSoftDevs

RUN apt-get install python -y

WORKDIR /app

COPY ["package.json", "package-lock.json*", "./"]

RUN npm install

RUN npm install -g typescript

COPY app /app

RUN tsc