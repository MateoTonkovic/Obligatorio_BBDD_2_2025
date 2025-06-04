FROM node:18-alpine as builder

WORKDIR /usr/src/app

COPY package.json package-lock.json ./
RUN npm install

COPY . .

FROM node:18-alpine

WORKDIR /usr/src/app

COPY package.json package-lock.json ./
RUN npm install

COPY . .

EXPOSE 3000

CMD ["npm", "start"]
