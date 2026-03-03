# Non-Functional Requirements — Praxium

## 1. Performance

| Metric | Target | Notes |
|--------|--------|-------|
| Concurrent users | 10,000 | Under normal operating conditions |
| API response time | < 300ms | Excluding AI generation endpoints |
| AI content generation | < 5 seconds | Question generation, suggestions, analytics |
| Database query time | < 50ms | With proper indexing |
| Frontend initial load | < 3 seconds | Including code splitting & lazy loading |
| WebSocket latency | < 100ms | For real-time chat and notifications |

### Implementation Strategy
- **Connection pooling** via PgBouncer for PostgreSQL
- **Redis caching** for frequently accessed data (user sessions, course catalogs)
- **CDN** for static assets (images, fonts, CSS/JS bundles)
- **Database indexing** on all foreign keys and common query patterns
- **Query optimization** with Prisma's `select` and `include` to avoid over-fetching
- **Lazy loading** React components with `React.lazy()` and `Suspense`

---

## 2. Security

### Authentication & Authorization
- **JWT-based authentication** with short-lived access tokens (15 min) and long-lived refresh tokens (7 days)
- **Role-based access control (RBAC)** — Student, Teacher, Admin with middleware enforcement
- **Password hashing** using bcrypt with salt rounds ≥ 12
- **Account lockout** after 5 failed login attempts (15-minute cooldown)

### Transport Security
- **HTTPS only** — enforce via HSTS headers with `max-age=31536000`
- **TLS 1.2+** minimum on all connections
- **Secure cookies** with `HttpOnly`, `Secure`, `SameSite=Strict` flags

### Input Protection
- **SQL injection prevention** — Prisma ORM parameterized queries (no raw SQL)
- **XSS protection** — React's built-in escaping + Content-Security-Policy headers
- **CSRF tokens** on all state-changing requests
- **Input validation** on both client and server using Zod/Joi schemas

### Rate Limiting
| Endpoint | Limit |
|----------|-------|
| Login | 5 requests/minute/IP |
| API (general) | 100 requests/minute/user |
| AI generation | 10 requests/minute/user |
| File upload | 5 requests/minute/user |

### Anti-Cheat (Test Environment)
- Tab switch detection via `visibilitychange` API
- Right-click and copy/paste disabled during tests
- Fullscreen enforcement
- Violation logging with auto-submit after 3 violations

---

## 3. Scalability

### Architecture Principles
- **Stateless backend** — no server-side sessions; all state in JWT + database
- **Horizontal scaling** — deploy multiple API instances behind a load balancer
- **Microservice-ready** — AI service separated from main API
- **Database read replicas** for scaling read-heavy operations

### Infrastructure
| Component | Scaling Strategy |
|-----------|-----------------|
| API Server | Horizontal via container orchestration (Docker/K8s) |
| PostgreSQL | Vertical + read replicas |
| Redis | Cluster mode for distributed caching |
| AI Service | Independent horizontal scaling |
| File Storage | Object storage (S3/GCS) |

### Monitoring & Observability
- **Health check endpoints** (`/health`, `/ready`)
- **Structured logging** with correlation IDs
- **APM integration** for performance tracking
- **Error tracking** with alerting on error rate spikes
- **Database connection pool monitoring**

---

## 4. Reliability

- **Target uptime**: 99.9% (< 8.76 hours downtime/year)
- **Automated database backups**: Daily with 30-day retention
- **Graceful degradation**: AI features fail silently with fallback responses
- **Circuit breakers** on external service calls (AI APIs, email, etc.)
- **Zero-downtime deployments** via rolling updates

---

## 5. Maintainability

- **TypeScript** for type safety across the stack
- **ESLint + Prettier** enforced via CI/CD
- **Git branching** — trunk-based development with feature flags
- **API versioning** — path-based (`/api/v1/...`)
- **Database migrations** — Prisma Migrate with version control
- **Code coverage** — minimum 80% on critical paths
