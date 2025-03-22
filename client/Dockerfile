FROM node:20-alpine as build

WORKDIR /app

COPY ./package.json ./package-lock.json ./
RUN npm install

COPY . .

RUN npm run build  

CMD [ "npm","run", "preview" ]