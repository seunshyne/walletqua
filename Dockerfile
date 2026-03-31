# Stage 1 — Build the Vue/Quasar app
FROM node:20-alpine AS build

WORKDIR /app

# Copy everything first (IMPORTANT for Quasar)
COPY . .

# Install Quasar CLI
RUN npm install -g @quasar/cli

# Install dependencies
RUN npm install

# Build app
RUN npm run build

# Stage 2 — Serve with Nginx
FROM nginx:alpine

COPY --from=build /app/dist/spa /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80