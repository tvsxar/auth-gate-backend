FROM node:20-alpine AS build
WORKDIR /app
ENV NODE_ENV=production

COPY package*.json ./
RUN npm ci --only=production
COPY . .

EXPOSE 1110
CMD ["node", "server.js"]