import { registerStationsTool } from "@/tools/stations";
import { registerLinesTool } from "@/tools/lines";
import { registerStationTool } from "@/tools/station";
import { registerJourneyPlannerTool } from "@/tools/journey-planner";
import { registerParkAndRideGuidance } from "@/resources";
import { createMcpHandler } from "mcp-handler";

const handler = createMcpHandler(
  (server) => {
    // Register tools
    registerLinesTool(server);
    registerStationsTool(server);
    registerStationTool(server);
    registerJourneyPlannerTool(server);

    // Register resources
    registerParkAndRideGuidance(server);
  },
  {},
  {
    basePath: "/", // must match where [transport] is located
    maxDuration: 60,
    verboseLogs: true,
  },
);

export { handler as GET, handler as POST };
