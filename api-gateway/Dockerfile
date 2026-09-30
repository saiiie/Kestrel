FROM node:22-alpine
WORKDIR /app
COPY api-gateway/package*.json ./
RUN npm ci --omit=dev
COPY api-gateway/server.js ./
USER node
CMD ["node", "server.js"]
