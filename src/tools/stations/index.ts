import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { encode } from "@toon-format/toon";
import { getStationsWithFilters } from "@/lib/services";
import z from "zod";

const METROLINK_LINES = [
  "Altrincham - Bury",
  "Altrincham - Piccadilly/Etihad Campus",
  "Ashton-under-Lyne - Eccles",
  "Bury - Piccadilly",
  "East Didsbury - Rochdale Town Centre",
  "East Didsbury - Shaw and Crompton",
  "Etihad Campus - MediaCityUK",
  "Manchester Airport - Victoria",
  "The Trafford Centre - Deansgate-Castlefield",
] as const;

const FEATURE_TYPES = [
  "park-and-ride",
  "car-parking",
  "bicycle-lockers",
  "bicycle-stands",
  "accessible-parking",
  "accessible-ramp",
  "accessible-lift",
] as const;

export const registerStationsTool = (server: McpServer) =>
  server.registerTool(
    "stations",
    {
      title: "Stations",
      description:
        "Returns a list of stations in the Manchester Metrolink network, optionally filtered by features (must have ALL) and/or line name. Output is formatted in TOON format for token efficiency.",
      inputSchema: {
        features: z
          .array(z.enum(FEATURE_TYPES))
          .optional()
          .describe(
            "Filter stations by facilities. Returns only stations that have ALL specified features (AND logic). Available features: park-and-ride, car-parking, bicycle-lockers, bicycle-stands, accessible-parking, accessible-ramp, accessible-lift",
          ),
        line: z
          .enum(METROLINK_LINES)
          .optional()
          .describe("Filter stations by line name. Returns only stations that are on the specified Metrolink line"),
      },
    },
    async ({ features, line }) => {
      const stations = await getStationsWithFilters({
        features,
        lineName: line,
      });

      // Transform stations to a flattened structure for TOON encoding
      const flattenedStations = stations.map((station) => ({
        station_id: station.id,
        station_code: station.code,
        station_name: station.name,
        latitude: station.coordinates?.latitude,
        longitude: station.coordinates?.longitude,
        zones: station.zones,
        address: station.address,
        has_lifts: station.facilities.lifts,
        has_ramps: station.facilities.ramps,
        has_cycle_provision: station.facilities.cycleProvision,
        has_car_parking: station.facilities.carParking,
        has_park_and_ride: station.facilities.parkAndRide,
        cycle_lockers: station.facilities.cycleLockers,
        cycle_stands: station.facilities.cycleStands,
        total_parking_spaces: station.facilities.totalParkingSpaces,
        blue_badge_spaces: station.facilities.blueBadgeSpaces,
      }));

      const toonOutput = encode(flattenedStations);

      return {
        content: [
          {
            type: "text",
            text: `Found ${stations.length} station(s):\n\n${toonOutput}`,
          },
        ],
      };
    },
  );
