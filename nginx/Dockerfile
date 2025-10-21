# Use official Node.js slim image
FROM node:23-slim AS build

# Set working directory
WORKDIR /app

# Enable corepack (comes bundled with Node 16.9+)
RUN corepack enable

# Copy package.json and lockfile first (for better layer caching)
COPY ../frontend/package.json ../frontend/pnpm-lock.yaml* ./

# Install dependencies (pnpm version is read from package.json -> packageManager field)
RUN pnpm install --frozen-lockfile

# Copy the rest of the source code
COPY ../frontend .

# Start Vite in dev mode (accessible from Docker host)
CMD ["pnpm", "dev", "--host"]
# Change to build

FROM nginx:1.28.0-alpine AS dev

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY manager.sh /manager.sh

COPY --from=build /app/dist /usr/share/nginx/html

RUN chmod +x  /manager.sh && \
    # Review
    mkdir -p /vol/proxy && \
    chmod -R 755 /vol/proxy && \
    # end review
    mkdir -p /var/cache/nginx && \
    mkdir -p /run

# Start Nginx server
# CMD ["/manager.sh"]
CMD ["nginx", "-g", "daemon off;"]
