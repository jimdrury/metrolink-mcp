import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { encode } from "@toon-format/toon";
import { getStationWithRoutes } from "@/lib/services";

const inputSchema = z.object({
  station_code: z
    .string()
    .length(3)
    .toUpperCase()
    .describe("The 3-letter station code (e.g., 'ALT' for Altrincham, 'VIC' for Victoria)"),
});

export const registerStationTool = (server: McpServer) =>
  server.registerTool(
    "station",
    {
      title: "Station",
      description:
        "Get details for a specific Metrolink station by its 3-letter code. Returns the station information and all service routes (lines) that serve this station. Output is formatted in TOON format for token efficiency.",
      inputSchema: {
        station_code: z
          .string()
          .length(3)
          .toUpperCase()
          .describe(
            "The 3-letter station code (e.g., 'ALT' for Altrincham, 'VIC' for Victoria)",
          ),
      },
    },
    async (input) => {
      const { station_code } = inputSchema.parse(input);

      const result = await getStationWithRoutes(station_code);

      if (!result) {
        return {
          content: [
            {
              type: "text",
              text: `Station with code '${station_code}' not found.`,
            },
          ],
          isError: true,
        };
      }

      const { station, routes } = result;

      // Format station data with flattened structure for TOON output
      const stationData = {
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
        serving_lines: routes.map((r) => r.name),
        line_count: routes.length,
      };

      const toonOutput = encode(stationData);

      return {
        content: [
          {
            type: "text",
            text: `Station: ${station.name} (${station.code})\nZone${station.zones.length > 1 ? "s" : ""}: ${station.zones.join("/")}\nServed by ${routes.length} line(s)\n\n${toonOutput}`,
          },
        ],
      };
    },
  );
