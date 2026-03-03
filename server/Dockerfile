FROM node:20

WORKDIR /app

# Copy dependency files
COPY package.json package-lock.json ./

# Install dependencies (including devDependencies for Prisma CLI)
RUN npm install

# Copy prisma schema
COPY prisma ./prisma/

# Generate Prisma Client
RUN npx prisma generate

# Copy the rest of the backend source code
COPY . .

EXPOSE 3000

# Start the Express server
CMD ["node", "index.js"]
