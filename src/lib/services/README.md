# Service Layer

This directory contains the service layer for the TFGM Metrolink system, providing business logic with automatic caching via Next.js 16's `use cache` directive.

## Architecture

```
Presentation → Services → Repositories → Database
  (Pages)      (Cached)    (Domain)      (PostgreSQL)
```

## How It Works

### Automatic Caching with `use cache`

All service functions are automatically cached by Next.js 16 using the `"use cache"` directive at the file level:

```typescript
"use cache";

export const getAllStations = async () => {
  return findAllStations(); // Cached automatically
};
```

**Cache Behavior:**
- ✅ Automatically caches function results
- ✅ Per-parameter caching (e.g., `getStationByCode("ALT")` cached separately)
- ✅ Cache invalidated on deployment
- ✅ No manual cache management needed
- ✅ Works in Server Components and Server Actions

## Files

```
src/lib/services/
├── station-service.ts      # Station business logic
├── route-service.ts        # Route business logic
├── index.ts               # Barrel export
└── README.md              # This file
```

## Station Service

### Basic Queries (Cached)
```typescript
import { 
  getAllStations,
  getStationByCode,
  getParkAndRideStations,
  getAccessibleStations 
} from '@/lib/services';

const stations = await getAllStations();
const altrincham = await getStationByCode('ALT');
const parkRide = await getParkAndRideStations();
```

### Business Logic Functions
```typescript
// Get stations with parking, sorted by capacity
const parking = await getStationsWithParking();

// Get stations with cycle facilities
const cycling = await getStationsWithCycleFacilities();

// Get comprehensive statistics
const stats = await getStationStatistics();
// {
//   total: 99,
//   withLifts: 45,
//   withParkAndRide: 12,
//   zones: [1, 2, 3, 4]
// }
```

## Route Service

### Basic Queries (Cached)
```typescript
import {
  getAllRoutes,
  getRouteByName,
  getRouteWithStations,
  getRoutesForStation
} from '@/lib/services';

const routes = await getAllRoutes();
const route = await getRouteWithStations('Altrincham - Bury');
const stationRoutes = await getRoutesForStation('ALT');
```

### Business Logic Functions
```typescript
// Get route statistics
const stats = await getRouteStatistics();
// {
//   totalRoutes: 8,
//   averageStationsPerRoute: 15.3,
//   longestRoute: { name: "...", stationCount: 27 }
// }

// Get accessibility information for a route
const accessInfo = await getRouteAccessibilityInfo('Altrincham - Bury');
// {
//   accessibility: {
//     accessible: 12,
//     fullyAccessible: 8,
//     accessibilityPercentage: 85
//   },
//   stations: { ... }
// }

// Find routes connecting two stations
const connecting = await findConnectingRoutes('ALT', 'PIC');

// Find interchange stations (served by multiple routes)
const interchanges = await getInterchangeStations();
// [{
//   station: { name: "Piccadilly", ... },
//   routes: [...],
//   routeCount: 6
// }]
```

## Usage in Pages

### Before (Without Service Layer)
```typescript
// page.tsx
import { findAllServiceRoutes } from '@/lib/domain';

const Page = async () => {
  const routes = await findAllServiceRoutes(); // Not cached
  return <div>...</div>;
};
```

### After (With Service Layer)
```typescript
// page.tsx
import { getAllRoutes } from '@/lib/services';

const Page = async () => {
  const routes = await getAllRoutes(); // Automatically cached!
  return <div>...</div>;
};
```

## Benefits

### 1. Automatic Caching
- Zero configuration required
- Per-parameter cache keys
- Optimal performance

### 2. Business Logic Separation
- Repository layer: Raw data access
- Service layer: Business logic + caching
- Clean separation of concerns

### 3. Type Safety
- Full TypeScript support
- Strongly typed return values
- Compile-time error checking

### 4. Reusability
- Business logic in one place
- Shared across pages/components
- Easy to test

### 5. Performance
- Reduced database queries
- Fast response times
- Scalable architecture

## Cache Invalidation

Cache is automatically invalidated:
- ✅ On deployment (new build)
- ✅ On server restart
- ✅ Based on Next.js cache policies

For dynamic revalidation, use Next.js `revalidatePath()` or `revalidateTag()` in Server Actions.

## When to Use Service vs Repository

### Use Services (Cached)
- ✅ In page components
- ✅ For user-facing data
- ✅ When performance matters
- ✅ When adding business logic

### Use Repositories Directly
- ✅ In Server Actions (mutations)
- ✅ For real-time data
- ✅ When cache would be stale
- ✅ For data that changes frequently

## Examples

### Page with Statistics
```typescript
import { getStationStatistics, getRouteStatistics } from '@/lib/services';

const DashboardPage = async () => {
  const [stationStats, routeStats] = await Promise.all([
    getStationStatistics(),
    getRouteStatistics(),
  ]);

  return (
    <div>
      <h1>Metrolink Dashboard</h1>
      <div>Total Stations: {stationStats.total}</div>
      <div>Total Routes: {routeStats.totalRoutes}</div>
    </div>
  );
};
```

### Station Detail Page
```typescript
import { getStationByCode, getRoutesForStation } from '@/lib/services';

const StationPage = async ({ params }) => {
  const { code } = await params;
  
  const [station, routes] = await Promise.all([
    getStationByCode(code),
    getRoutesForStation(code),
  ]);

  if (!station) notFound();

  return (
    <div>
      <h1>{station.name}</h1>
      <p>Served by {routes.length} routes</p>
    </div>
  );
};
```

### Interchange Finder
```typescript
import { getInterchangeStations } from '@/lib/services';

const InterchangePage = async () => {
  const interchanges = await getInterchangeStations();

  return (
    <div>
      <h1>Interchange Stations</h1>
      {interchanges.map(({ station, routeCount }) => (
        <div key={station.id}>
          {station.name} - {routeCount} routes
        </div>
      ))}
    </div>
  );
};
```

## Testing

Services can be easily mocked for testing:

```typescript
import { vi } from 'vitest';
import * as services from '@/lib/services';

vi.mock('@/lib/services', () => ({
  getAllStations: vi.fn().mockResolvedValue([mockStation]),
  getStationByCode: vi.fn().mockResolvedValue(mockStation),
}));
```

## Performance Considerations

- **First request**: Fetches from database
- **Subsequent requests**: Served from cache (fast!)
- **Build time**: Cache warmed during static generation
- **Runtime**: Automatic cache management by Next.js

## Design Principles

Follows Unix Philosophy:
- **Rule of Modularity**: Clean interfaces
- **Rule of Separation**: Business logic ↔ Data access
- **Rule of Simplicity**: No manual cache management
- **Rule of Transparency**: Clear what's cached
- **Rule of Robustness**: Automatic cache invalidation
