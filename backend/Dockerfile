# Stage 1: Build & Dependencies
FROM node:20-alpine AS builder
WORKDIR /app
RUN apk add --no-cache make gcc g++ python3
COPY package*.json ./
RUN npm ci --only=production

# Stage 2: Production Runtime Environment
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# Copy production node_modules & application source
COPY --from=builder /app/node_modules ./node_modules
COPY package*.json ./
COPY . .

# Run as non-root unprivileged node user for security
USER node

EXPOSE 5000

CMD ["node", "--max-http-header-size=1000000", "src/server.js"]
