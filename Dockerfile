# Base image
FROM oven/bun:1.1 AS base
WORKDIR /app

# Install dependencies
FROM base AS install
# Copy lockfile and package.json for dependency caching
COPY package.json ./
COPY bun.lockb* ./
# Use --no-frozen-lockfile to handle missing/outdated lockfile gracefully
RUN bun install

# Development stage - used by docker-compose.yml
FROM base AS dev
COPY --from=install /app/node_modules node_modules
COPY . .
ENV NODE_ENV=development
EXPOSE 5173
ENTRYPOINT [ "bun", "run", "dev", "--host", "0.0.0.0" ]

# Build stage for production
FROM base AS build
COPY --from=install /app/node_modules node_modules
COPY . .
RUN bun run build

# Production release (served by Nginx)
FROM nginx:1.27-alpine AS release
COPY --from=build /app/dist /usr/share/nginx/html
# SPA routing: all paths serve index.html
RUN printf 'server {\n  listen 80;\n  root /usr/share/nginx/html;\n  index index.html;\n  location / {\n    try_files $uri $uri/ /index.html;\n  }\n}\n' > /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
