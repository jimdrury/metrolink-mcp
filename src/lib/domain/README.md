# Domain Layer

This directory contains the domain model for the TFGM Metrolink system, following clean architecture principles and the Rule of Separation.

## Architecture

```
src/lib/domain/
├── entities.ts              # Domain entities (immutable data structures)
├── mappers.ts              # Transform database records to entities
├── repositories/           # Data access layer
│   ├── station-repository.ts
│   ├── service-route-repository.ts
│   └── index.ts           # Barrel export
└── index.ts               # Main barrel export
```

## Layers

### 1. Entities (`entities.ts`)

Immutable data structures representing business concepts:
- `Station` - A Metrolink station with facilities and location
- `ServiceRoute` - A service route (e.g., "Altrincham - Bury")
- `RouteStation` - A station along a route with its position
- `Connection` - Connection between two stations
- `StationFacilities` - Station amenities (lifts, parking, etc.)

### 2. Mappers (`mappers.ts`)

Transform database records (snake_case) into domain entities (camelCase).
Follows **Rule of Separation**: separate data representation from domain model.

### 3. Repositories (`repositories/`)

Data access layer following the Repository pattern:
- Encapsulate database queries
- Return domain entities (not raw database records)
- Provide semantic query methods (e.g., `findStationsWithParkAndRide`)

## Usage

```typescript
// Import from domain layer
import { findAllServiceRoutes, findServiceRouteWithStations } from '@/lib/domain';

// Get all routes
const routes = await findAllServiceRoutes();

// Get route with stations
const routeWithStations = await findServiceRouteWithStations('Altrincham - Bury');

// Access typed domain entities
routeWithStations.stations.forEach(({ station, stopOrder }) => {
  console.log(`${stopOrder}. ${station.name} (${station.code})`);
  if (station.facilities.parkAndRide) {
    console.log(`  Park & Ride: ${station.facilities.totalParkingSpaces} spaces`);
  }
});
```

## Design Principles

This layer follows the Unix Philosophy rules:

1. **Rule of Modularity**: Simple parts with clean interfaces
2. **Rule of Clarity**: Clear, readable code over clever abstractions
3. **Rule of Separation**: Policy (domain) separated from mechanism (database)
4. **Rule of Simplicity**: No unnecessary complexity
5. **Rule of Transparency**: Easy to understand and debug
6. **Rule of Robustness**: Robust through simplicity and transparency

## Benefits

- **Type Safety**: Full TypeScript support with proper interfaces
- **Testability**: Repositories can be mocked for testing
- **Maintainability**: Business logic separated from data access
- **Flexibility**: Can swap database without changing domain logic
- **Clarity**: Domain entities reflect business concepts
