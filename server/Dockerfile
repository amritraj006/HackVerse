# ==========================================
# HackVerse Backend Dockerfile
# Multi-stage production container
# ==========================================

FROM node:20-alpine AS base

# Install dumb-init for proper signal handling and PID 1 init
RUN apk add --no-cache dumb-init

WORKDIR /app

# Copy dependency specifications
COPY package*.json ./

# Install production dependencies only
RUN npm ci --omit=dev

# Copy application source code
COPY . .

# Create uploads directory and assign ownership
RUN mkdir -p /app/uploads && chown -R node:node /app

# Switch to unprivileged user for security
USER node

# Expose backend HTTP port
EXPOSE 8341

# Define environment defaults
ENV NODE_ENV=production \
    PORT=8341

# Launch with dumb-init
ENTRYPOINT ["/usr/bin/dumb-init", "--"]
CMD ["node", "server.js"]
