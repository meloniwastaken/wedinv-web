# ===========================================
# WEDINV Frontend - Multi-stage Dockerfile
# ===========================================

# Stage 1: Build Angular app
FROM node:20-alpine AS build
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build argument for API URL
ARG API_URL=http://localhost:8080/api

# Replace API URL in environment file before build
RUN sed -i "s|http://localhost:8080/api|${API_URL}|g" src/environments/environment.ts && \
    sed -i "s|http://localhost:8080/api|${API_URL}|g" src/environments/environment.prod.ts

# Build for production
RUN npm run build -- --configuration=production

# Stage 2: Serve with Nginx
FROM nginx:alpine
WORKDIR /usr/share/nginx/html

# Remove default nginx content
RUN rm -rf ./*

# Copy built Angular app
COPY --from=build /app/dist/wedinv-web/browser .

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose ports
EXPOSE 80 443

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
