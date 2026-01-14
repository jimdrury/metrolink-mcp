/**
 * Domain entities representing the Metrolink system
 * These are immutable data structures that represent business concepts
 */

export interface Station {
  id: number;
  code: string;
  name: string;
  coordinates: {
    latitude: number;
    longitude: number;
  } | null;
  zones: number[];
  address: string | null;
  facilities: StationFacilities;
  createdAt: Date;
  updatedAt: Date;
}

export interface StationFacilities {
  lifts: boolean;
  ramps: boolean;
  cycleProvision: boolean;
  carParking: boolean;
  parkAndRide: boolean;
  cycleLockers: number | null;
  cycleStands: number | null;
  totalParkingSpaces: number | null;
  blueBadgeSpaces: number | null;
}

export interface ServiceRoute {
  id: number;
  name: string;
  description: string | null;
  color: string | null;
  stationCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface RouteStation {
  routeId: number;
  stationId: number;
  stopOrder: number;
  station: Station;
}

export interface Connection {
  id: number;
  routeId: number;
  fromStationId: number;
  toStationId: number;
  distance: number | null;
  travelTime: number | null;
}

export interface ServiceRouteWithStations extends ServiceRoute {
  stations: RouteStation[];
}
