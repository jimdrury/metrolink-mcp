# TFGM Metrolink Server - Architecture

## Overview

This application follows clean architecture principles with clear separation of concerns between database access, domain logic, and presentation layers.

## Architecture Layers

```
┌─────────────────────────────────────────────────────────┐
│                   Presentation Layer                     │
│              (Next.js Pages & Components)                │
│                 src/app/*/page.tsx                       │
└─────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────┐
│                     Service Layer                        │
│                  src/lib/services/                       │
│       • Business logic with automatic caching            │
│       • Uses Next.js 16 "use cache" directive            │
│       • Composes repositories for complex operations     │
└─────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────┐
│                     Domain Layer                         │
│                  src/lib/domain/                         │
│  • Entities - Business objects (Station, ServiceRoute)   │
│  • Repositories - Data access interfaces                 │
│  • Mappers - Transform DB records to entities           │
└─────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────┐
│                  Infrastructure Layer                    │
│                    src/lib/db.ts                         │
│         • Database connection pool management            │
│         • Low-level query execution                      │
└─────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────┐
│                      PostgreSQL                          │
│              (Local or Neon Cloud Database)              │
└─────────────────────────────────────────────────────────┘
```

## Directory Structure

```
src/
├── app/                          # Next.js 16 App Router
│   ├── page.tsx                 # Home page - list all routes
│   ├── stats/                   # Statistics dashboard
│   │   └── page.tsx
│   ├── interchanges/            # Interchange stations
│   │   └── page.tsx
│   └── line/[lineName]/         
│       └── page.tsx             # Route detail page
├── lib/
│   ├── db.ts                    # Database infrastructure layer
│   ├── services/                # Service layer (with caching)
│   │   ├── station-service.ts   # Station business logic
│   │   ├── route-service.ts     # Route business logic
│   │   ├── index.ts
│   │   └── README.md
│   ├── domain/                  # Domain layer
│   │   ├── entities.ts          # Domain entities
│   │   ├── mappers.ts           # DB → Entity transformation
│   │   ├── repositories/        # Data access layer
│   │   │   ├── station-repository.ts
│   │   │   ├── service-route-repository.ts
│   │   │   └── index.ts
│   │   ├── README.md
│   │   └── index.ts
│   └── env.ts                   # Environment variable validation
└── ...
```

## Design Principles

Following the Unix Philosophy:

### 1. Rule of Modularity
- Clean interfaces between layers
- Each module has a single responsibility
- Easy to test and maintain

### 2. Rule of Separation
- **Policy (domain)** separated from **mechanism (database)**
- Business logic independent of data storage
- Can swap databases without changing domain code

### 3. Rule of Clarity
- Explicit, readable code over clever abstractions
- Clear naming conventions
- Self-documenting structure

### 4. Rule of Simplicity
- No unnecessary complexity
- Arrow functions throughout
- Type-safe with TypeScript

### 5. Rule of Transparency
- Easy to understand and debug
- Clear error messages
- Comprehensive type definitions

## Layer Details

### Presentation Layer (`src/app/`)

Next.js 16 server components that:
- Fetch data using service layer (automatically cached)
- Render HTML with React Server Components
- Follow Next.js conventions (page.tsx, layout.tsx)

**Example:**
```typescript
import { getAllRoutes } from '@/lib/services';

const Page = async () => {
  const routes = await getAllRoutes(); // Automatically cached!
  return <div>{/* render routes */}</div>;
};
```

### Service Layer (`src/lib/services/`)

Business logic with automatic caching using Next.js 16's `use cache` directive:
- All functions automatically cached
- Per-parameter cache keys (e.g., `getStationByCode("ALT")`)
- Cache invalidated on deployment
- Zero configuration required

**Features:**
- Business logic composition
- Statistics and analytics
- Complex queries (e.g., finding interchanges)
- Automatic performance optimization

### Domain Layer (`src/lib/domain/`)

#### Entities
Immutable data structures representing business concepts:
- `Station` - Metrolink station with facilities
- `ServiceRoute` - A tram service route
- `RouteStation` - Station on a route with position
- `StationFacilities` - Station amenities

#### Repositories
Data access functions following the repository pattern:
- `findAllStations()` - Get all stations
- `findStationByCode(code)` - Find specific station
- `findAllServiceRoutes()` - Get all routes
- `findServiceRouteWithStations(name)` - Get route with stations
- etc.

#### Mappers
Transform database records (snake_case) to domain entities (camelCase):
```typescript
// Database: station_code → Domain: code
// Database: created_at → Domain: createdAt
```

### Infrastructure Layer (`src/lib/db.ts`)

Low-level database operations:
- Connection pool management
- SSL configuration (auto-detected for localhost vs remote)
- Generic query execution
- Error handling

### Environment Configuration (`src/env.ts`)

Validated environment variables using Zod:
- Type-safe access to configuration
- Fails fast on startup if misconfigured
- No runtime environment variable access

## Database Connection

### Local Development
```
DATABASE_URL=postgresql://tfgm:tfgm_dev_password@localhost:5435/tfgm_metrolink
```
- Uses Docker PostgreSQL container
- No SSL required
- Port 5435 to avoid conflicts

### Production (Neon)
```
DATABASE_URL=postgresql://user:pass@host.neon.tech/db?sslmode=require
```
- Requires SSL connection
- Auto-detected by connection string
- May be blocked by corporate firewalls

## Key Features

### Type Safety
- Full TypeScript coverage
- Domain entities with strong types
- Validated environment variables

### Testability
- Repositories can be mocked
- Domain logic independent of infrastructure
- Clear boundaries for unit testing

### Maintainability
- Clear separation of concerns
- Self-documenting code structure
- Follows established patterns

### Flexibility
- Can swap database implementation
- Can add new repositories easily
- Domain entities stable across changes

## Adding New Features

### Add a new entity:
1. Define interface in `src/lib/domain/entities.ts`
2. Create mapper in `src/lib/domain/mappers.ts`
3. Create repository in `src/lib/domain/repositories/`
4. Export from `src/lib/domain/repositories/index.ts`
5. Use in pages via `import { ... } from '@/lib/domain'`

### Add a new query:
1. Add function to appropriate repository
2. Use domain entities for return types
3. Map database records using existing mappers

## Database Schema

Key tables:
- `stations` - Station master data
- `service_routes` - Tram routes
- `route_stations` - Junction table (route ↔ stations)
- `connections` - Network connections between stations
- `line_geometries` - Geographic line data

See `database/README.md` for complete schema documentation.

## Best Practices

1. **Always use domain repositories** - Don't query database directly from pages
2. **Use domain entities** - Return typed entities, not raw database records
3. **Arrow functions** - Consistent with project style
4. **Type annotations** - Explicit over inferred
5. **Validated env vars** - Use `env` from `@/env`, never `process.env`
6. **Barrel exports** - Clean import paths via index.ts files

## Migration Path

Old code using direct database access:
```typescript
// ❌ OLD
import { getServiceRoutes } from '@/lib/db';
const routes = await getServiceRoutes();
```

New code using domain repositories:
```typescript
// ✅ NEW
import { findAllServiceRoutes } from '@/lib/domain';
const routes = await findAllServiceRoutes();
```

The old functions in `db.ts` are deprecated but not removed for backwards compatibility.
