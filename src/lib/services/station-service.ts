"use cache";

/**
 * Station Service Layer
 * Business logic for stations with automatic caching via Next.js 16 'use cache'
 *
 * Cache Configuration:
 * - All functions are automatically cached by Next.js
 * - Cache is invalidated on deployment
 * - Suitable for data that doesn't change frequently
 */

import type { Station } from "../domain/entities";
import {
  findAllStations,
  findStationByCode,
  findStationById,
  findStationsByZone,
  findStationsWithParkAndRide,
  findStationsWithAccessibility,
  findStationsWithFilters,
} from "../domain/repositories";

/**
 * Get all stations ordered by name
 * @cached Automatically cached by Next.js
 */
export const getAllStations = async (): Promise<Station[]> => {
  return findAllStations();
};

/**
 * Get a specific station by its code (e.g., "ALT" for Altrincham)
 * @cached Automatically cached by Next.js per code
 */
export const getStationByCode = async (code: string): Promise<Station | null> => {
  return findStationByCode(code);
};

/**
 * Get a specific station by its ID
 * @cached Automatically cached by Next.js per id
 */
export const getStationById = async (id: number): Promise<Station | null> => {
  return findStationById(id);
};

/**
 * Get all stations in a specific zone
 * @cached Automatically cached by Next.js per zone
 */
export const getStationsByZone = async (zone: number): Promise<Station[]> => {
  return findStationsByZone(zone);
};

/**
 * Get all stations with Park & Ride facilities
 * @cached Automatically cached by Next.js
 */
export const getParkAndRideStations = async (): Promise<Station[]> => {
  return findStationsWithParkAndRide();
};

/**
 * Get all stations with accessibility features (lifts or ramps)
 * @cached Automatically cached by Next.js
 */
export const getAccessibleStations = async (): Promise<Station[]> => {
  return findStationsWithAccessibility();
};

/**
 * Business logic: Get stations with full parking information
 * Returns only stations with parking, sorted by available spaces
 * @cached Automatically cached by Next.js
 */
export const getStationsWithParking = async (): Promise<Station[]> => {
  const allStations = await findAllStations();

  return allStations
    .filter((station) => station.facilities.carParking && station.facilities.totalParkingSpaces)
    .sort((a, b) => {
      const spacesA = a.facilities.totalParkingSpaces ?? 0;
      const spacesB = b.facilities.totalParkingSpaces ?? 0;
      return spacesB - spacesA; // Descending order
    });
};

/**
 * Business logic: Get stations with cycle facilities
 * Returns stations with either cycle lockers or stands
 * @cached Automatically cached by Next.js
 */
export const getStationsWithCycleFacilities = async (): Promise<Station[]> => {
  const allStations = await findAllStations();

  return allStations.filter(
    (station) =>
      station.facilities.cycleProvision &&
      (station.facilities.cycleLockers || station.facilities.cycleStands),
  );
};

/**
 * Business logic: Get comprehensive station statistics
 * @cached Automatically cached by Next.js
 */
export const getStationStatistics = async () => {
  const allStations = await findAllStations();

  return {
    total: allStations.length,
    withLifts: allStations.filter((s) => s.facilities.lifts).length,
    withRamps: allStations.filter((s) => s.facilities.ramps).length,
    withParkAndRide: allStations.filter((s) => s.facilities.parkAndRide).length,
    withCarParking: allStations.filter((s) => s.facilities.carParking).length,
    withCycleFacilities: allStations.filter((s) => s.facilities.cycleProvision).length,
    fullyAccessible: allStations.filter((s) => s.facilities.lifts && s.facilities.ramps).length,
    zones: [...new Set(allStations.flatMap((s) => s.zones))].sort((a, b) => a - b),
  };
};

type FeatureFilter =
  | "park-and-ride"
  | "car-parking"
  | "bicycle-lockers"
  | "bicycle-stands"
  | "accessible-parking"
  | "accessible-ramp"
  | "accessible-lift";

/**
 * Get stations filtered by features and/or line name
 * Both parameters are optional, allowing various filtering combinations:
 * - No filters: returns all stations
 * - Features only: returns stations with ALL specified features (AND logic)
 * - Line only: returns all stations on the specified line
 * - Both: returns stations on the line that have ALL specified features
 * @cached Automatically cached by Next.js per filter combination
 */
export const getStationsWithFilters = async (options?: {
  features?: FeatureFilter[];
  lineName?: string;
}): Promise<Station[]> => {
  return findStationsWithFilters(options);
};

/**
 * Get a station by code with its service routes
 * Returns the station details and all routes that serve it
 * @cached Automatically cached by Next.js per code
 */
export const getStationWithRoutes = async (code: string): Promise<{
  station: Station;
  routes: Array<{ id: number; name: string; stationCount: number }>;
} | null> => {
  const station = await getStationByCode(code);
  if (!station) return null;

  // Import here to avoid circular dependency
  const { findRoutesByStationCode } = await import("../domain/repositories/route-repository");
  const routes = await findRoutesByStationCode(code);

  return {
    station,
    routes: routes.map(r => ({
      id: r.id,
      name: r.name,
      stationCount: r.stationCount
    }))
  };
};
