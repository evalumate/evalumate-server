# Build Stage
FROM node:10-alpine as builder

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Deployment stage
FROM node:10-alpine as app

WORKDIR /usr/src/app
ENV NODE_ENV=production

# Installing production dependencies only (NODE_ENV)
COPY package*.json ./
RUN npm ci

COPY --from=builder dist dist
COPY config config
# Copy Next.js config
COPY src/frontend/next.config.js src/frontend/next.config.js

USER node

VOLUME [ "/usr/src/app/logs", "/usr/src/app/sqlite"  ]
CMD [ "npm", "run", "serve" ]