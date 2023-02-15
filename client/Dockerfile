FROM node:19-alpine
RUN mkdir /frontend
WORKDIR /frontend
COPY package.json /frontend/package.json

RUN npm install --global serve
RUN npm install
