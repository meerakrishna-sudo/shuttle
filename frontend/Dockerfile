# Stage 1: build the React app
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
# VITE_API_URL tells the frontend where the backend lives (injected at build time)
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL
RUN npm run build

# Stage 2: serve with nginx (much lighter than node for serving static files)
FROM nginx:alpine AS runner
COPY --from=builder /app/dist /usr/share/nginx/html

# nginx config: redirect all routes to index.html (needed for React Router)
RUN echo 'server { \
  listen 80; \
  location / { \
    root /usr/share/nginx/html; \
    try_files $uri $uri/ /index.html; \
  } \
}' > /etc/nginx/conf.d/default.conf

EXPOSE 80
