import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { encode } from "@toon-format/toon";
import { getAllRoutes, getRoutesForStation } from "@/lib/services";
import z from "zod";

export const registerLinesTool = (server: McpServer) =>
  server.registerTool(
    "lines",
    {
      title: "Lines",
      description:
        "Returns a list of all Metrolink tram lines in the Manchester network. Optionally filter by station code to show only lines that serve a specific station. Output is formatted in TOON format for token efficiency.",
      inputSchema: {
        station_code: z
          .string()
          .length(3)
          .toUpperCase()
          .optional()
          .describe(
            "Optional 3-letter station code (e.g., 'ALT' for Altrincham, 'VIC' for Victoria). When provided, returns only lines that serve this station",
          ),
      },
    },
    async ({ station_code }) => {
      // Get routes - either all or filtered by station
      const routes = station_code 
        ? await getRoutesForStation(station_code)
        : await getAllRoutes();

      // Transform to a simple flat structure with snake_case keys
      const lines = routes.map((route) => ({
        line_id: route.id,
        line_name: route.name,
        station_count: route.stationCount,
        color: route.color,
      }));

      // Encode to TOON format
      const toonOutput = encode(lines);

      const message = station_code
        ? `Found ${lines.length} line(s) serving station ${station_code}:\n\n${toonOutput}`
        : `Found ${lines.length} tram line(s):\n\n${toonOutput}`;

      return {
        content: [
          {
            type: "text",
            text: message,
          },
        ],
      };
    },
  );
