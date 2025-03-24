FROM node:20

WORKDIR /app

COPY package*.json ./

RUN npm i

COPY prisma ./prisma

RUN npx prisma generate
RUN ls -la /app/node_modules/.prisma/client

COPY . .

RUN npm run build

EXPOSE 3000

CMD ["npm", "run" , "start"]
