"use cache";

/**
 * Route Service Layer
 * Business logic for service routes with automatic caching via Next.js 16 'use cache'
 *
 * Cache Configuration:
 * - All functions are automatically cached by Next.js
 * - Cache is invalidated on deployment
 * - Suitable for data that doesn't change frequently
 */

import type { ServiceRoute, ServiceRouteWithStations, Station } from "../domain/entities";
import {
  findAllServiceRoutes,
  findServiceRouteByName,
  findServiceRouteById,
  findServiceRouteWithStations,
  findRoutesServingStation,
} from "../domain/repositories";

/**
 * Get all service routes ordered by name
 * @cached Automatically cached by Next.js
 */
export const getAllRoutes = async (): Promise<ServiceRoute[]> => {
  return findAllServiceRoutes();
};

/**
 * Get a specific route by name
 * @cached Automatically cached by Next.js per route name
 */
export const getRouteByName = async (name: string): Promise<ServiceRoute | null> => {
  return findServiceRouteByName(name);
};

/**
 * Get a specific route by ID
 * @cached Automatically cached by Next.js per id
 */
export const getRouteById = async (id: number): Promise<ServiceRoute | null> => {
  return findServiceRouteById(id);
};

/**
 * Get a route with all its stations
 * @cached Automatically cached by Next.js per route name
 */
export const getRouteWithStations = async (name: string): Promise<ServiceRouteWithStations | null> => {
  return findServiceRouteWithStations(name);
};

/**
 * Get all routes that serve a specific station
 * @cached Automatically cached by Next.js per station code
 */
export const getRoutesForStation = async (stationCode: string): Promise<ServiceRoute[]> => {
  return findRoutesServingStation(stationCode);
};

/**
 * Business logic: Get route summary statistics
 * @cached Automatically cached by Next.js
 */
export const getRouteStatistics = async () => {
  const routes = await findAllServiceRoutes();

  const totalStations = routes.reduce((sum, route) => sum + route.stationCount, 0);
  const avgStations = routes.length > 0 ? totalStations / routes.length : 0;

  return {
    totalRoutes: routes.length,
    totalStations,
    averageStationsPerRoute: Math.round(avgStations * 10) / 10,
    longestRoute: routes.reduce((max, route) => (route.stationCount > max.stationCount ? route : max), routes[0]),
    shortestRoute: routes.reduce((min, route) => (route.stationCount < min.stationCount ? route : min), routes[0]),
  };
};

/**
 * Business logic: Get route with accessibility information
 * Returns route with stations grouped by accessibility features
 * @cached Automatically cached by Next.js per route name
 */
export const getRouteAccessibilityInfo = async (routeName: string) => {
  const route = await findServiceRouteWithStations(routeName);

  if (!route) return null;

  const accessible = route.stations.filter((rs) => rs.station.facilities.lifts || rs.station.facilities.ramps);

  const fullyAccessible = route.stations.filter((rs) => rs.station.facilities.lifts && rs.station.facilities.ramps);

  const withParkAndRide = route.stations.filter((rs) => rs.station.facilities.parkAndRide);

  return {
    route: {
      id: route.id,
      name: route.name,
      stationCount: route.stationCount,
    },
    accessibility: {
      total: route.stationCount,
      accessible: accessible.length,
      fullyAccessible: fullyAccessible.length,
      withParkAndRide: withParkAndRide.length,
      accessibilityPercentage: Math.round((accessible.length / route.stationCount) * 100),
    },
    stations: {
      all: route.stations,
      accessible: accessible,
      fullyAccessible: fullyAccessible,
      withParkAndRide: withParkAndRide,
    },
  };
};

/**
 * Business logic: Find routes connecting two stations
 * Returns routes that serve both stations
 * @cached Automatically cached by Next.js per station pair
 */
export const findConnectingRoutes = async (fromStationCode: string, toStationCode: string): Promise<ServiceRoute[]> => {
  const routesFrom = await findRoutesServingStation(fromStationCode);
  const routesTo = await findRoutesServingStation(toStationCode);

  // Find intersection of routes
  return routesFrom.filter((routeFrom) => routesTo.some((routeTo) => routeTo.id === routeFrom.id));
};

/**
 * Business logic: Get stations common to multiple routes
 * Useful for finding interchange stations
 * @cached Automatically cached by Next.js
 */
export const getInterchangeStations = async (): Promise<
  Array<{
    station: Station;
    routes: ServiceRoute[];
    routeCount: number;
  }>
> => {
  const routes = await findAllServiceRoutes();
  const stationRouteMap = new Map<number, { station: Station; routes: ServiceRoute[] }>();

  // Build map of stations to routes
  for (const route of routes) {
    const routeWithStations = await findServiceRouteWithStations(route.name);
    if (!routeWithStations) continue;

    for (const { station } of routeWithStations.stations) {
      const existing = stationRouteMap.get(station.id);
      if (existing) {
        existing.routes.push(route);
      } else {
        stationRouteMap.set(station.id, { station, routes: [route] });
      }
    }
  }

  // Filter to only stations served by 2+ routes (interchanges)
  return Array.from(stationRouteMap.values())
    .filter(({ routes }) => routes.length >= 2)
    .map(({ station, routes }) => ({
      station,
      routes,
      routeCount: routes.length,
    }))
    .sort((a, b) => b.routeCount - a.routeCount);
};
