FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY tsconfig.json ./
COPY src ./src
RUN npm run build

FROM node:22-alpine
RUN apk add --no-cache ffmpeg
WORKDIR /app
ENV NODE_ENV=production
COPY package*.json ./
RUN npm install --omit=dev
COPY --from=build /app/dist ./dist
RUN mkdir -p storage/uploads storage/downloads temp
EXPOSE 5000
CMD ["node", "dist/server.js"]
