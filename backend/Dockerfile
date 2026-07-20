FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --omit=dev --no-audit --no-fund

COPY . .

RUN mkdir -p logs uploads

EXPOSE 5000

CMD ["node", "server.js"]
