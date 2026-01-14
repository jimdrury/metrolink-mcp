/**
 * Route Repository
 * Handles data access for service routes
 */

import { query } from "@/lib/db";
import type { ServiceRoute } from "../entities";

interface RouteRecord {
  id: number;
  route_name: string;
  description: string | null;
  color: string | null;
  station_count: number;
  created_at: Date;
  updated_at: Date;
}

/**
 * Find all routes that serve a specific station
 */
export const findRoutesByStationCode = async (stationCode: string): Promise<ServiceRoute[]> => {
  const records = await query<RouteRecord>(
    `SELECT DISTINCT sr.id, sr.route_name, sr.description, sr.color, sr.station_count, sr.created_at, sr.updated_at
     FROM service_routes sr
     JOIN route_stations rs ON sr.id = rs.route_id
     JOIN stations s ON rs.station_id = s.id
     WHERE s.station_code = $1
     ORDER BY sr.route_name`,
    [stationCode]
  );

  return records.map(record => ({
    id: record.id,
    name: record.route_name,
    description: record.description,
    color: record.color,
    stationCount: record.station_count,
    createdAt: record.created_at,
    updatedAt: record.updated_at
  }));
};
