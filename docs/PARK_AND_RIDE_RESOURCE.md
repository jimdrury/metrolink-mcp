# Park and Ride Guidance Resource

## Overview

A new MCP resource has been created to provide comprehensive guidance on using Park and Ride facilities at Manchester Metrolink stations. This resource helps AI assistants understand parking capacity patterns and provide better recommendations to users.

## Resource Details

**Resource Name**: `park-and-ride-guidance`  
**URI**: `tfgm://guidance/park-and-ride`  
**Type**: Static Resource  
**Format**: Markdown  
**Location**: `src/resources/park-and-ride-guidance.ts`

## Key Guidance Provided

The resource explains:

1. **Capacity Impact on Availability**
   - Stations with fewer parking spaces (< 100) fill up earlier, typically by 7:30-8:00 AM on weekdays
   - Stations with more parking spaces (200+) provide better availability, typically until 9:00 AM or later
   - Medium capacity stations (100-200) offer reasonable flexibility with availability until 8:30 AM

2. **Why Larger Capacity is Preferred**
   - More flexibility in arrival times
   - Reduced stress and uncertainty
   - Better suited for commuters with variable schedules
   - More reliable for finding parking

3. **Capacity Guidelines**
   - Small capacity (< 100 spaces): Best for early commuters and off-peak travel
   - Medium capacity (100-200 spaces): Suitable for most regular commuters
   - Large capacity (200+ spaces): Most reliable for flexible schedules and occasional users

4. **Additional Considerations**
   - Blue badge spaces availability
   - Alternative station options
   - Weekend vs weekday patterns
   - Special event impacts

5. **Recommendations**
   - Prioritize stations with 200+ spaces when possible
   - Arrive before 8:00 AM for medium-sized car parks
   - Have backup stations identified
   - Use the stations tool to find suitable options

## How to Use

### For AI Assistants

When users ask about Park and Ride options, the AI can:

1. Read this resource to understand capacity patterns
2. Use the `stations` tool with the `park-and-ride` feature filter to find suitable stations
3. Provide informed recommendations based on:
   - The user's schedule flexibility
   - Parking capacity at available stations
   - The user's preferred line or destination

### Testing the Resource

1. **Using MCP Inspector**:
   ```bash
   yarn inspect
   ```
   Then navigate to the Resources tab and look for "Park and Ride Guidance"

2. **In Claude Desktop or Cursor**:
   - Configure the MCP server connection
   - Ask questions like:
     - "What should I know about Park and Ride at Metrolink stations?"
     - "Which Park and Ride stations are most reliable?"
     - "What time should I arrive at a Park and Ride station?"

3. **Direct Resource Access**:
   The resource can be read directly via the MCP protocol:
   ```
   URI: tfgm://guidance/park-and-ride
   Method: resources/read
   ```

## Implementation Details

### Files Created

1. **Resource Handler**: `src/resources/park-and-ride-guidance.ts`
   - Registers the resource with the MCP server
   - Returns markdown-formatted guidance

2. **Resource Index**: `src/resources/index.ts`
   - Exports all resources for easy importing

3. **Resource Documentation**: `src/resources/README.md`
   - Explains what resources are and how to create them

### Registration

The resource is registered in `src/app/[transport]/route.ts`:

```typescript
import { registerParkAndRideGuidance } from "@/resources";

const handler = createMcpHandler(
  (server) => {
    // ... register tools ...
    
    // Register resources
    registerParkAndRideGuidance(server);
  },
  // ... config ...
);
```

## Benefits

1. **Consistent Information**: AI assistants have access to standardized guidance about parking capacity
2. **Better User Experience**: Users receive informed recommendations about which stations to use
3. **Context Awareness**: AI can combine this guidance with real-time station data from tools
4. **Maintainable**: Guidance is centralized and easy to update as patterns change

## Future Enhancements

Potential improvements:

1. Add real-time parking availability data (requires integration with live data source)
2. Create dynamic resources for specific stations with their historical fill-up patterns
3. Add seasonal variations (e.g., summer holidays, special events)
4. Include pricing information if available
5. Add images or maps showing car park locations

## Related Tools

This resource works well with:

- **stations tool**: Filter stations by park-and-ride facilities
- **station tool**: Get detailed information about a specific station's parking capacity
- **journey-planner tool**: Find routes that include Park and Ride options
