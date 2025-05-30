# Stage 1: Build the React application
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package.json and package-lock.json (or yarn.lock)
COPY package.json ./
# If you use yarn.lock, copy that instead and use yarn install
COPY package-lock.json ./ 

# Install dependencies
# Using npm ci for cleaner installs if package-lock.json is present and up-to-date
RUN npm ci

# Copy the rest of the application source code
COPY . .

# Build the application
# This command should match the build script in your package.json
RUN npm run build

# Stage 2: Serve the application using Nginx
FROM nginx:1.25-alpine

# Copy the build output from the builder stage to Nginx's web server directory
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy the Nginx configuration file
# This file should be created in your frontend directory (e.g., frontend/nginx.conf)
# and configured to serve a single-page application (SPA) correctly.
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80 (default HTTP port for Nginx)
EXPOSE 80

# Command to start Nginx
CMD ["nginx", "-g", "daemon off;"]
