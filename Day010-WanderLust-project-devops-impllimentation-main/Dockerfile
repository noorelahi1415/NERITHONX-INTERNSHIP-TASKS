# Use the official Node.js Alpine image
FROM node:24-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy dependency files first
COPY package.json package-lock.json ./

# Install exact dependencies from package-lock.json
RUN npm ci --omit=dev --legacy-peer-deps

# Copy application source code
COPY --chown=node:node . .

# Set the default application port
ENV PORT=8080

# Document the port used by the application
EXPOSE 8080

# Run the application as the non-root node user
USER node

# Check whether the application is healthy
HEALTHCHECK --interval=30s \
    --timeout=5s \
    --start-period=30s \
    --retries=3 \
    CMD wget -qO- http://127.0.0.1:8080/health || exit 1

# Start the application
CMD ["npm", "start"]
