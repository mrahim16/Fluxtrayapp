# Dockerfile for building and serving the Vue + Vite frontend in a container.
# This is a production-ready static container. It does not build the Tauri desktop bundle.

# Stage 1: build the app
FROM node:20-bullseye AS builder

WORKDIR /app

# Install dependencies first so Docker can cache this layer.
COPY package*.json tsconfig.json tsconfig.node.json vite.config.ts postcss.config.js tailwind.config.js index.html ./
RUN npm install

# Copy source files and build the application.
COPY src ./src
COPY public ./public
RUN npm run build

# Stage 2: serve the built files with nginx
FROM nginx:stable-alpine AS production
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose the default web port
EXPOSE 80

# Start nginx in the foreground.
CMD ["nginx", "-g", "daemon off;"]
