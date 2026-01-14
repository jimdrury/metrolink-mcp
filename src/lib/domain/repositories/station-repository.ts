/**
 * Station Repository
 * Handles data access for stations following Repository pattern
 */

import { query } from "@/lib/db";
import type { Station } from "../entities";
import { mapStationRecord } from "../mappers";

interface StationRecord {
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

export const findAllStations = async (): Promise<Station[]> => {
  const records = await query<StationRecord>(
    `SELECT 
      id, station_code, station_name, latitude, longitude, zones, address,
      lifts, ramps, cycle_provision, car_parking, park_and_ride,
      cycle_lockers, cycle_stands, total_parking_spaces, blue_badge_spaces,
      created_at, updated_at
    FROM stations
    ORDER BY station_name`,
  );

  return records.map(mapStationRecord);
};

export const findStationByCode = async (code: string): Promise<Station | null> => {
  const records = await query<StationRecord>(
    `SELECT 
      id, station_code, station_name, latitude, longitude, zones, address,
      lifts, ramps, cycle_provision, car_parking, park_and_ride,
      cycle_lockers, cycle_stands, total_parking_spaces, blue_badge_spaces,
      created_at, updated_at
    FROM stations
    WHERE station_code = $1`,
    [code],
  );

  return records.length > 0 ? mapStationRecord(records[0]) : null;
};

export const findStationById = async (id: number): Promise<Station | null> => {
  const records = await query<StationRecord>(
    `SELECT 
      id, station_code, station_name, latitude, longitude, zones, address,
      lifts, ramps, cycle_provision, car_parking, park_and_ride,
      cycle_lockers, cycle_stands, total_parking_spaces, blue_badge_spaces,
      created_at, updated_at
    FROM stations
    WHERE id = $1`,
    [id],
  );

  return records.length > 0 ? mapStationRecord(records[0]) : null;
};

export const findStationsByZone = async (zone: number): Promise<Station[]> => {
  const records = await query<StationRecord>(
    `SELECT 
      id, station_code, station_name, latitude, longitude, zones, address,
      lifts, ramps, cycle_provision, car_parking, park_and_ride,
      cycle_lockers, cycle_stands, total_parking_spaces, blue_badge_spaces,
      created_at, updated_at
    FROM stations
    WHERE $1 = ANY(zones)
    ORDER BY station_name`,
    [zone],
  );

  return records.map(mapStationRecord);
};

export const findStationsWithParkAndRide = async (): Promise<Station[]> => {
  const records = await query<StationRecord>(
    `SELECT 
      id, station_code, station_name, latitude, longitude, zones, address,
      lifts, ramps, cycle_provision, car_parking, park_and_ride,
      cycle_lockers, cycle_stands, total_parking_spaces, blue_badge_spaces,
      created_at, updated_at
    FROM stations
    WHERE park_and_ride = true
    ORDER BY station_name`,
  );

  return records.map(mapStationRecord);
};

export const findStationsWithAccessibility = async (): Promise<Station[]> => {
  const records = await query<StationRecord>(
    `SELECT 
      id, station_code, station_name, latitude, longitude, zones, address,
      lifts, ramps, cycle_provision, car_parking, park_and_ride,
      cycle_lockers, cycle_stands, total_parking_spaces, blue_badge_spaces,
      created_at, updated_at
    FROM stations
    WHERE lifts = true OR ramps = true
    ORDER BY station_name`,
  );

  return records.map(mapStationRecord);
};

type FeatureFilter =
  | "park-and-ride"
  | "car-parking"
  | "bicycle-lockers"
  | "bicycle-stands"
  | "accessible-parking"
  | "accessible-ramp"
  | "accessible-lift";

export const findStationsWithFilters = async (options?: {
  features?: FeatureFilter[];
  lineName?: string;
}): Promise<Station[]> => {
  const { features, lineName } = options ?? {};

  // Build the WHERE conditions for features (AND logic - all features must match)
  const conditions: string[] = [];
  const params: (string | number)[] = [];
  let paramIndex = 1;

  if (features && features.length > 0) {
    for (const feature of features) {
      switch (feature) {
        case "park-and-ride":
          conditions.push("s.park_and_ride = true");
          break;
        case "car-parking":
          conditions.push("s.car_parking = true");
          break;
        case "bicycle-lockers":
          conditions.push("s.cycle_lockers > 0");
          break;
        case "bicycle-stands":
          conditions.push("s.cycle_stands > 0");
          break;
        case "accessible-parking":
          conditions.push("s.blue_badge_spaces > 0");
          break;
        case "accessible-ramp":
          conditions.push("s.ramps = true");
          break;
        case "accessible-lift":
          conditions.push("s.lifts = true");
          break;
      }
    }
  }

  // Build query based on whether we need to join with routes
  let sql: string;
  if (lineName) {
    // Join with route_stations and service_routes when filtering by line
    sql = `
      SELECT DISTINCT
        s.id, s.station_code, s.station_name, s.latitude, s.longitude, s.zones, s.address,
        s.lifts, s.ramps, s.cycle_provision, s.car_parking, s.park_and_ride,
        s.cycle_lockers, s.cycle_stands, s.total_parking_spaces, s.blue_badge_spaces,
        s.created_at, s.updated_at
      FROM stations s
      JOIN route_stations rs ON s.id = rs.station_id
      JOIN service_routes sr ON rs.route_id = sr.id
      WHERE sr.route_name = $${paramIndex}
    `;
    params.push(lineName);
    paramIndex++;

    if (conditions.length > 0) {
      sql += ` AND ${conditions.join(" AND ")}`;
    }
  } else {
    // Simple query without joins when no line filter
    sql = `
      SELECT 
        id, station_code, station_name, latitude, longitude, zones, address,
        lifts, ramps, cycle_provision, car_parking, park_and_ride,
        cycle_lockers, cycle_stands, total_parking_spaces, blue_badge_spaces,
        created_at, updated_at
      FROM stations s
    `;

    if (conditions.length > 0) {
      sql += ` WHERE ${conditions.join(" AND ")}`;
    }
  }

  sql += " ORDER BY s.station_name";

  const records = await query<StationRecord>(sql, params);
  return records.map(mapStationRecord);
};
