/**
 * Journey Repository
 * Handles data access for journey planning and route connections
 */

import { query } from "@/lib/db";

export interface StationConnection {
  fromStationId: number;
  fromStationCode: string;
  fromStationName: string;
  toStationId: number;
  toStationCode: string;
  toStationName: string;
  routeId: number;
  routeName: string;
  fromStopOrder: number;
  toStopOrder: number;
}

interface ConnectionRecord {
  from_station_id: number;
  from_station_code: string;
  from_station_name: string;
  to_station_id: number;
  to_station_code: string;
  to_station_name: string;
  route_id: number;
  route_name: string;
  from_stop_order: number;
  to_stop_order: number;
}

/**
 * Get all direct connections between adjacent stations on all routes
 * This includes connections in both directions
 */
export const findAllConnections = async (): Promise<StationConnection[]> => {
  const records = await query<ConnectionRecord>(
    `SELECT 
      rs1.station_id as from_station_id,
      s1.station_code as from_station_code,
      s1.station_name as from_station_name,
      rs2.station_id as to_station_id,
      s2.station_code as to_station_code,
      s2.station_name as to_station_name,
      rs1.route_id,
      sr.route_name,
      rs1.stop_order as from_stop_order,
      rs2.stop_order as to_stop_order
    FROM route_stations rs1
    JOIN route_stations rs2 ON rs1.route_id = rs2.route_id 
      AND rs2.stop_order = rs1.stop_order + 1
    JOIN stations s1 ON rs1.station_id = s1.id
    JOIN stations s2 ON rs2.station_id = s2.id
    JOIN service_routes sr ON rs1.route_id = sr.id
    ORDER BY rs1.route_id, rs1.stop_order`,
  );

  return records.map((record) => ({
    fromStationId: record.from_station_id,
    fromStationCode: record.from_station_code,
    fromStationName: record.from_station_name,
    toStationId: record.to_station_id,
    toStationCode: record.to_station_code,
    toStationName: record.to_station_name,
    routeId: record.route_id,
    routeName: record.route_name,
    fromStopOrder: record.from_stop_order,
    toStopOrder: record.to_stop_order,
  }));
};

/**
 * Get all routes that serve a specific station
 */
export const findRoutesAtStation = async (
  stationCode: string,
): Promise<
  Array<{
    routeId: number;
    routeName: string;
  }>
> => {
  const records = await query<{ route_id: number; route_name: string }>(
    `SELECT DISTINCT sr.id as route_id, sr.route_name
    FROM service_routes sr
    JOIN route_stations rs ON sr.id = rs.route_id
    JOIN stations s ON rs.station_id = s.id
    WHERE s.station_code = $1
    ORDER BY sr.route_name`,
    [stationCode],
  );

  return records.map((record) => ({
    routeId: record.route_id,
    routeName: record.route_name,
  }));
};
