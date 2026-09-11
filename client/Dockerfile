# ==========================================
# HackVerse Frontend Dockerfile
# Multi-stage production build (Vite -> Nginx)
# ==========================================

# Stage 1: Build production assets
FROM node:20-alpine AS builder

WORKDIR /app

# Copy dependency manifests
COPY package*.json ./

# Install all dependencies including devDependencies for build
RUN npm ci

# Copy client source code
COPY . .

# Build argument for API base URL (defaults to relative /api/v1 for reverse proxy)
ARG VITE_API_BASE_URL=/api/v1
ARG VITE_APP_NAME=HackVerse
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL \
    VITE_APP_NAME=$VITE_APP_NAME

# Build production bundle into /app/dist
RUN npm run build

# Stage 2: Serve production bundle with Nginx
FROM nginx:alpine AS runner

# Remove default nginx static assets
RUN rm -rf /usr/share/nginx/html/*

# Copy compiled static assets from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose HTTP port
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
