import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

/**
 * Registers a static resource providing guidance on park and ride facilities
 * This resource explains how to interpret parking capacity and availability
 */
export const registerParkAndRideGuidance = (server: McpServer) => {
  server.registerResource(
    "park-and-ride-guidance",
    "tfgm://guidance/park-and-ride",
    {
      title: "Park and Ride Guidance",
      description:
        "Guidance on using Park and Ride facilities at Manchester Metrolink stations, including how to interpret parking capacity and availability patterns",
      mimeType: "text/markdown",
    },
    async () => {
      const guidance = `# Park and Ride Guidance for Manchester Metrolink

## Understanding Parking Capacity

When choosing a Park and Ride station, parking capacity is a critical factor in ensuring you can find a space when you arrive.

### Key Principles

1. **Stations with fewer parking spaces fill up earlier**
   - Smaller car parks (typically under 100 spaces) often reach capacity during peak commuting hours
   - These stations are best suited for off-peak travel or if you can arrive early (before 7:30 AM on weekdays)
   - High demand at smaller facilities means less flexibility in arrival times

2. **Stations with more parking spaces are generally preferred**
   - Larger car parks (200+ spaces) provide more flexibility and availability
   - These stations typically maintain availability until mid-morning (8:30-9:00 AM) on weekdays
   - Better suited for commuters with variable schedules
   - Reduced stress and uncertainty about finding a parking space

### Capacity Guidelines

**Small Capacity (< 100 spaces)**
- Expect to fill by 7:30-8:00 AM on weekdays
- Best for: Regular early commuters, off-peak travelers
- Consider arriving before 7:30 AM or having a backup plan

**Medium Capacity (100-200 spaces)**
- Typically fill by 8:30 AM on weekdays
- Best for: Most regular commuters
- Reasonable flexibility for arrival times before 8:30 AM

**Large Capacity (200+ spaces)**
- Usually maintain availability until 9:00 AM or later on weekdays
- Best for: Flexible schedules, occasional users, those who prefer guaranteed availability
- Most reliable option for finding parking

### Additional Considerations

- **Blue Badge Spaces**: Stations with designated accessible parking spaces provide priority parking for blue badge holders
- **Alternative Options**: If your preferred station is full, use the stations tool to find nearby alternatives with similar line connections
- **Weekend Travel**: Parking availability is generally much better on weekends at all stations
- **Special Events**: Major events in Manchester city centre can affect parking availability even outside typical peak hours

### Recommendations

For the most reliable Park and Ride experience:
1. Choose stations with 200+ parking spaces when possible
2. Arrive before 8:00 AM on weekdays for medium-sized car parks
3. Have a backup station identified on the same line
4. Use the stations tool with the 'park-and-ride' feature filter to find suitable options

---

**Note**: Actual parking availability can vary based on local events, seasonal patterns, and ongoing construction or maintenance. The guidance above reflects typical patterns but should be used in conjunction with real-time information when available.
`;

      return {
        contents: [
          {
            uri: "tfgm://guidance/park-and-ride",
            mimeType: "text/markdown",
            text: guidance,
          },
        ],
      };
    },
  );
};
