# Architecture Overview

## Separation of Concerns

1. **Presentation Layer (`app/`, `components/`)**:
   - Next.js App Router for layout and routing.
   - Client components interact with Redux dispatchers and API routes.

2. **State Management (`store/`, `features/`)**:
   - Redux Toolkit slices handle UI preferences, active filters, cached entity items, and optimistic updates.

3. **API & Route Handlers (`app/api/`)**:
   - Server-side REST endpoints validate input via Zod schemas.

4. **Domain Services (`services/`)**:
   - Encapsulate business logic, calculations, and data transactions.

5. **Data Access (`prisma/`, `lib/prisma.ts`)**:
   - Prisma Client handles type-safe querying and relations to Neon PostgreSQL.
