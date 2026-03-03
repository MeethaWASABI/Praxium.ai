# Praxium Agentic System

Praxium is a sophisticated, multi-tenant educational platform designed for organizations (public and private) to manage courses, assessments, and placement profiles. It features an AI-driven "Organic Flow" design system, providing a premium and interactive user experience.

## 🚀 Key Features

- **Multi-Tenancy**: Complete data isolation between organizations with a strict Role-Based Access Control (RBAC) system.
- **Organic Flow UI**: A premium, glassmorphic interface with soft typography and smooth micro-animations.
- **Deep Course Management**: Hierarchical structure with Sections and Modules (10-15 modules per section).
- **AI-Powered Assessments**: Integrated AI for content generation and performance analytics.
- **Placement Portal**: Comprehensive tracking of student technical and communication scores for career readiness.
- **Integrated Communication**: Real-time chat and meeting management.

## 🛠 Tech Stack

- **Frontend**: React (Vite), Vanilla CSS (Design Tokens), Socket.io-client.
- **Backend**: Node.js (Express), Prisma ORM, Socket.io, JWT Authentication.
- **Database**: PostgreSQL (Production), SQLite (local dev support possible but configured for Postgres).
- **Security**: Helmet, Rate Limiting, RBAC Middleware, OTP Authentication.
- **AI Integration**: Google Gemini AI (2.0 Flash).

## 📂 Project Structure

```text
praxium.in/
├── prisma/             # Database schema and migrations
├── server/             # Express backend source code
│   ├── data/           # Legacy JSON persistent storage
│   ├── index.js        # Main entry point
│   └── seed.js         # Database seeding script
├── src/                # React frontend source code
│   ├── components/     # UI components and dashboards
│   ├── context/        # React context providers
│   ├── hooks/          # Custom hooks
│   └── services/       # API abstraction layer
└── docker-compose.yml  # Docker orchestration
```

## 📖 Related Documents

- [Setup Guide](praxium.in/setup.md) - Instructions for local development setup.
- [Database Schema](praxium.in/server/prisma/schema.prisma) - Prisma schema definition.

## 📜 License

Private Property of Praxium.in. All rights reserved.
