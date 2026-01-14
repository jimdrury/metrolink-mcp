import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { encode } from "@toon-format/toon";
import { findJourneys } from "@/lib/services";
import z from "zod";

export const registerJourneyPlannerTool = (server: McpServer) =>
  server.registerTool(
    "journey-planner",
    {
      title: "Journey Planner",
      description:
        "Plans journeys between two stations on the Manchester Metrolink network. Returns multiple route options sorted by shortest number of changes, then by shortest number of stops. Each journey shows the segments (legs) with route names, station names, and number of stops. Output is formatted in TOON format for token efficiency.",
      inputSchema: {
        from: z
          .string()
          .min(2)
          .max(10)
          .describe("Station code to travel from (e.g., 'ALT' for Altrincham, 'PIC' for Piccadilly)"),
        to: z
          .string()
          .min(2)
          .max(10)
          .describe("Station code to travel to (e.g., 'ALT' for Altrincham, 'PIC' for Piccadilly)"),
        max_results: z
          .number()
          .int()
          .min(1)
          .max(10)
          .optional()
          .default(3)
          .describe("Maximum number of journey options to return (default: 3, max: 10)"),
      },
    },
    async ({ from, to, max_results = 3 }) => {
      try {
        const journeys = await findJourneys(from.toUpperCase(), to.toUpperCase(), max_results);

        if (journeys.length === 0) {
          return {
            content: [
              {
                type: "text",
                text: `No journeys found between ${from.toUpperCase()} and ${to.toUpperCase()}. Please check the station codes are correct.`,
              },
            ],
          };
        }

        // Transform journeys to a flattened structure for TOON encoding
        const flattenedJourneys = journeys.map((journey, index) => ({
          journey_number: index + 1,
          from_station_code: journey.fromStationCode,
          from_station_name: journey.fromStationName,
          to_station_code: journey.toStationCode,
          to_station_name: journey.toStationName,
          total_stops: journey.totalStops,
          changes: journey.changes,
          segments: journey.segments.map((segment) => ({
            from_code: segment.fromStationCode,
            from_name: segment.fromStationName,
            to_code: segment.toStationCode,
            to_name: segment.toStationName,
            route: segment.routeName,
            stops: segment.stopsCount,
          })),
        }));

        const toonOutput = encode(flattenedJourneys);

        return {
          content: [
            {
              type: "text",
              text: `Found ${journeys.length} journey option(s) from ${journeys[0].fromStationName} to ${journeys[0].toStationName}:\n\n${toonOutput}`,
            },
          ],
        };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
        return {
          content: [
            {
              type: "text",
              text: `Error planning journey: ${errorMessage}`,
            },
          ],
          isError: true,
        };
      }
    },
  );
