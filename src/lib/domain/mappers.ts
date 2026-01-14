/**
 * Mappers transform database records into domain entities
 * Follows Rule of Separation: separate data representation from domain model
 */

import type { Station, StationFacilities, ServiceRoute, RouteStation } from "./entities";

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

interface ServiceRouteRecord {
  id: number;
  route_name: string;
  description: string | null;
  color: string | null;
  station_count: number;
  created_at: Date;
  updated_at: Date;
}

interface RouteStationRecord {
  route_id: number;
  station_id: number;
  stop_order: number;
  station_code: string;
  station_name: string;
  zones: number[];
}

export const mapStationRecord = (record: StationRecord): Station => {
  const facilities: StationFacilities = {
    lifts: record.lifts ?? false,
    ramps: record.ramps ?? false,
    cycleProvision: record.cycle_provision ?? false,
    carParking: record.car_parking ?? false,
    parkAndRide: record.park_and_ride ?? false,
    cycleLockers: record.cycle_lockers,
    cycleStands: record.cycle_stands,
    totalParkingSpaces: record.total_parking_spaces,
    blueBadgeSpaces: record.blue_badge_spaces,
  };

  return {
    id: record.id,
    code: record.station_code,
    name: record.station_name,
    coordinates:
      record.latitude && record.longitude
        ? {
            latitude: Number.parseFloat(record.latitude),
            longitude: Number.parseFloat(record.longitude),
          }
        : null,
    zones: record.zones,
    address: record.address,
    facilities,
    createdAt: record.created_at,
    updatedAt: record.updated_at,
  };
};

export const mapServiceRouteRecord = (record: ServiceRouteRecord): ServiceRoute => ({
  id: record.id,
  name: record.route_name,
  description: record.description,
  color: record.color,
  stationCount: record.station_count,
  createdAt: record.created_at,
  updatedAt: record.updated_at,
});

export const mapRouteStationRecord = (record: RouteStationRecord): Omit<RouteStation, "station"> => ({
  routeId: record.route_id,
  stationId: record.station_id,
  stopOrder: record.stop_order,
});
