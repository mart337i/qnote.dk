# syntax=docker/dockerfile:1

ARG NODE_VERSION=18.19.1

################################################################################
# Base stage with Node.js
FROM node:${NODE_VERSION}-alpine as base

# Install security updates and dumb-init for proper signal handling
RUN apk update && apk upgrade && apk add --no-cache dumb-init

# Set working directory
WORKDIR /usr/src/app

# Create non-root user
ARG UID=10001
RUN adduser \
    --disabled-password \
    --gecos "" \
    --home "/nonexistent" \
    --shell "/sbin/nologin" \
    --no-create-home \
    --uid "${UID}" \
    appuser

################################################################################
# Dependencies stage
FROM base as deps

# Copy package files
COPY package.json package-lock.json* ./

# Install production dependencies
RUN --mount=type=cache,target=/root/.npm \
    npm ci --only=production

################################################################################
# Build stage
FROM base as build

# Copy package files
COPY package.json package-lock.json* ./

# Install all dependencies (including dev dependencies)
RUN --mount=type=cache,target=/root/.npm \
    npm ci

# Copy source code
COPY . .

# Build the application
RUN npm run build

################################################################################
# Production stage
FROM base as final

# Set production environment
ENV NODE_ENV=production

# Change ownership of the working directory to appuser
RUN chown -R appuser:appuser /usr/src/app
USER appuser

# Copy package.json for npm commands
COPY --chown=appuser:appuser package.json ./

# Copy production dependencies
COPY --from=deps --chown=appuser:appuser /usr/src/app/node_modules ./node_modules

# Copy built application (assuming build outputs to dist/)
COPY --from=build --chown=appuser:appuser /usr/src/app/dist ./dist

# Copy index.html (needed for Vite apps)
COPY --from=build --chown=appuser:appuser /usr/src/app/index.html ./index.html

# Expose the port
EXPOSE 4321

# Use dumb-init for proper signal handling
ENTRYPOINT ["dumb-init", "--"]

# Start the application
CMD ["npm", "start", "--", "--host"]