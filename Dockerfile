# Build stage
FROM node:20-alpine AS build

WORKDIR /app

# Copy dependency files
COPY package.json package-lock.json ./

# Install dependencies
RUN npm ci

# Copy the rest of the source code
COPY . .

# Build the Vite application
RUN npm run build

# Serve stage
FROM node:20-alpine AS serve

WORKDIR /app

# Install 'serve' package globally to serve static files
RUN npm install -g serve

# Copy built assets from build stage
COPY --from=build /app/dist ./dist

EXPOSE 3000

# Start static server
CMD ["serve", "-s", "dist", "-l", "3000"]
