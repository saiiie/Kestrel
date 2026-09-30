FROM node:22-alpine
WORKDIR /app
COPY alert-dispatcher/package*.json ./
RUN npm ci --omit=dev
COPY alert-dispatcher/index.js alert-dispatcher/delivery.js ./
USER node
CMD ["node", "index.js"]
