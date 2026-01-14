/**
 * Service Route Repository
 * Handles data access for service routes and their stations
 */

import { query } from "@/lib/db";
import type { ServiceRoute, ServiceRouteWithStations, RouteStation, Station } from "../entities";
import { mapServiceRouteRecord, mapStationRecord } from "../mappers";

interface ServiceRouteRecord {
  id: number;
  route_name: string;
  description: string | null;
  color: string | null;
  station_count: number;
  created_at: Date;
  updated_at: Date;
}

interface RouteStationWithDetailsRecord {
  route_id: number;
  station_id: number;
  stop_order: number;
  id: number;
  station_code: string;
  station_name: string;
  latitude: string | null;
  longitude: string | null;
  zones: number[];
  address: string | null;
  lifts: boolean | null;
  ramps: boolean | null;
  cycle_provision: boolean | null;
  car_parking: boolean | null;
  park_and_ride: boolean | null;
  cycle_lockers: number | null;
  cycle_stands: number | null;
  total_parking_spaces: number | null;
  blue_badge_spaces: number | null;
  created_at: Date;
  updated_at: Date;
}

export const findAllServiceRoutes = async (): Promise<ServiceRoute[]> => {
  const records = await query<ServiceRouteRecord>(
    `SELECT id, route_name, description, color, station_count, created_at, updated_at
    FROM service_routes
    ORDER BY route_name`,
  );

  return records.map(mapServiceRouteRecord);
};

export const findServiceRouteByName = async (name: string): Promise<ServiceRoute | null> => {
  const records = await query<ServiceRouteRecord>(
    `SELECT id, route_name, description, color, station_count, created_at, updated_at
    FROM service_routes
    WHERE route_name = $1`,
    [name],
  );

  return records.length > 0 ? mapServiceRouteRecord(records[0]) : null;
};

export const findServiceRouteById = async (id: number): Promise<ServiceRoute | null> => {
  const records = await query<ServiceRouteRecord>(
    `SELECT id, route_name, description, color, station_count, created_at, updated_at
    FROM service_routes
    WHERE id = $1`,
    [id],
  );

  return records.length > 0 ? mapServiceRouteRecord(records[0]) : null;
};

export const findServiceRouteWithStations = async (name: string): Promise<ServiceRouteWithStations | null> => {
  // Get the route
  const route = await findServiceRouteByName(name);
  if (!route) return null;

  // Get stations for the route
  const stationRecords = await query<RouteStationWithDetailsRecord>(
    `SELECT 
      rs.route_id, rs.station_id, rs.stop_order,
      s.id, s.station_code, s.station_name, s.latitude, s.longitude, s.zones,
      s.address, s.lifts, s.ramps, s.cycle_provision, s.car_parking, s.park_and_ride,
      s.cycle_lockers, s.cycle_stands, s.total_parking_spaces, s.blue_badge_spaces,
      s.created_at, s.updated_at
    FROM route_stations rs
    JOIN service_routes sr ON sr.id = rs.route_id
    JOIN stations s ON s.id = rs.station_id
    WHERE sr.route_name = $1
    ORDER BY rs.stop_order`,
    [name],
  );

  const stations: RouteStation[] = stationRecords.map((record) => ({
    routeId: record.route_id,
    stationId: record.station_id,
    stopOrder: record.stop_order,
    station: mapStationRecord({
      id: record.id,
      station_code: record.station_code,
      station_name: record.station_name,
      latitude: record.latitude,
      longitude: record.longitude,
      zones: record.zones,
      address: record.address,
      lifts: record.lifts,
      ramps: record.ramps,
      cycle_provision: record.cycle_provision,
      car_parking: record.car_parking,
      park_and_ride: record.park_and_ride,
      cycle_lockers: record.cycle_lockers,
      cycle_stands: record.cycle_stands,
      total_parking_spaces: record.total_parking_spaces,
      blue_badge_spaces: record.blue_badge_spaces,
      created_at: record.created_at,
      updated_at: record.updated_at,
    }),
  }));

  return {
    ...route,
    stations,
  };
};

export const findRoutesServingStation = async (stationCode: string): Promise<ServiceRoute[]> => {
  const records = await query<ServiceRouteRecord>(
    `SELECT DISTINCT sr.id, sr.route_name, sr.description, sr.color, sr.station_count, sr.created_at, sr.updated_at
    FROM service_routes sr
    JOIN route_stations rs ON sr.id = rs.route_id
    JOIN stations s ON rs.station_id = s.id
    WHERE s.station_code = $1
    ORDER BY sr.route_name`,
    [stationCode],
  );

  return records.map(mapServiceRouteRecord);
};
