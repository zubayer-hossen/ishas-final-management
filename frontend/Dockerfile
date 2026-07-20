# -------- Build Stage --------
FROM node:18-alpine AS build

WORKDIR /app

# Build-time API/Socket URLs — override via `docker compose build --build-arg` or docker-compose.yml args.
# Defaults work out of the box behind the bundled nginx reverse proxy (same-origin).
ARG VITE_API_BASE_URL=/api/v1
ARG VITE_SOCKET_URL=
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ENV VITE_SOCKET_URL=$VITE_SOCKET_URL

COPY package*.json ./
RUN npm install --no-audit --no-fund

COPY . .
RUN npm run build

# -------- Production Stage (static serve via nginx) --------
FROM nginx:alpine

COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
