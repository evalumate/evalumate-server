# Build Stage
FROM node:12-alpine as builder

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Deployment stage
FROM node:12-alpine as app

WORKDIR /usr/src/app
ENV NODE_ENV=production

# Installing production dependencies only (NODE_ENV)
COPY package*.json ./
RUN npm ci

# Copy built files
COPY --from=builder dist dist

# Copy configs and static files
COPY config config
COPY src/frontend/next.config.js src/frontend/next.config.js
COPY src/frontend/public src/frontend/public

# Configure volumes
RUN mkdir sqlite && chown node:node sqlite
RUN mkdir logs && chown node:node logs
VOLUME [ "/usr/src/app/logs", "/usr/src/app/sqlite"  ]

USER node
EXPOSE 3000
CMD [ "npm", "run", "serve" ]