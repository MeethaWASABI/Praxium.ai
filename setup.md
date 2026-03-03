# 🛠 Local Setup Guide

Follow these steps to set up the Praxium development environment on your local machine.

## 📋 Prerequisites

Ensure you have the following installed:
- **Node.js**: v18.x or later
- **PostgreSQL**: v14.x or later (or Docker Desktop)
- **Git**
- **npm** or **yarn**

## ⚙️ Environment Configuration

1. Create a `.env` file in the root directory:
   ```bash
   cp .env.example .env
   ```
2. Configure the following variables in `.env`:
   - `DATABASE_URL`: Your PostgreSQL connection string (e.g., `postgresql://user:pass@localhost:5432/praxium`)
   - `GEMINI_API_KEY`: Your Google Gemini API Key
   - `PORT`: Backend server port (defaults to 3000)
   - `JWT_SECRET`: A secure string for authentication tokens

## 📦 Installation

Install dependencies for both the frontend and backend:

```bash
# Install root (frontend) dependencies
npm install

# Install backend dependencies
cd server
npm install
```

## 🗄 Database Setup

Initialize the database using Prisma:

```bash
# From the root directory
cd server

# Apply database schema
npx prisma db push

# (Optional) Seed the database with initial data
npm run db:seed
```

## 🚀 Running the Application

You can run both the frontend and backend concurrently from the root directory:

```bash
# Start development environment
npm run dev
```

The application will be available at:
- **Frontend**: `http://localhost:5173`
- **Backend API**: `http://localhost:3000/api`

## 🛠 Useful Commands

- `npm run studio`: Open Prisma Studio to explore/edit the database (run inside `server` directory).
- `npm run build`: Build the frontend for production.
- `npm run lint`: Run ESLint to check for code quality issues.
