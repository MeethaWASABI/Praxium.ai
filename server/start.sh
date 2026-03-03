#!/bin/sh

# Start Prisma Studio in the background
echo "Starting Prisma Studio..."
./node_modules/.bin/prisma studio --browser none --port 5555 --address 0.0.0.0 > /app/studio.log 2>&1 &

# Start the Express server
echo "Starting Backend Server..."
node index.js
