FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

RUN npm i

# Copy Prisma schema and generate client
COPY prisma ./prisma

RUN npx prisma generate

COPY . .

# Compile TypeScript to JavaScript
RUN npm run build

EXPOSE 3000

CMD ["node", "dist/server.js"]
