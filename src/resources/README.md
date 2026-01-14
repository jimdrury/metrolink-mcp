# MCP Resources

This directory contains static resources that provide reference information and guidance to MCP clients. Unlike tools (which are callable functions), resources are read-only documents that clients can access for context and information.

## What are MCP Resources?

Resources in the Model Context Protocol are static or semi-static content that can be:
- Documentation and guides
- Reference materials
- Best practices
- System information
- Context that helps AI assistants better understand the domain

## Available Resources

### Park and Ride Guidance

**URI**: `tfgm://guidance/park-and-ride`  
**File**: `park-and-ride-guidance.ts`  
**Type**: Static Markdown Document

Provides comprehensive guidance on using Park and Ride facilities at Manchester Metrolink stations, including:

- How to interpret parking capacity at different stations
- Why stations with more parking spaces are generally preferred
- When stations with fewer spaces typically fill up
- Recommendations for choosing the best Park and Ride station
- Additional considerations for special circumstances

This resource helps AI assistants provide better advice when users ask about parking at Metrolink stations, ensuring they understand capacity patterns and can make informed recommendations.

## Creating New Resources

To create a new resource:

1. Create a new file in this directory (e.g., `my-resource.ts`)
2. Export a registration function that takes a `McpServer` instance
3. Call `server.registerResource()` with:
   - Resource name
   - URI (following the `tfgm://` scheme)
   - Metadata (title, description, mimeType)
   - Read callback that returns the resource content
4. Export the function from `index.ts`
5. Register it in `src/app/[transport]/route.ts`

### Example

```typescript
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

export const registerMyResource = (server: McpServer) => {
  server.registerResource(
    "my-resource",
    "tfgm://guidance/my-resource",
    {
      title: "My Resource Title",
      description: "Description of what this resource provides",
      mimeType: "text/markdown",
    },
    async () => {
      return {
        contents: [
          {
            uri: "tfgm://guidance/my-resource",
            mimeType: "text/markdown",
            text: "# Resource Content\n\nYour content here...",
          },
        ],
      };
    },
  );
};
```

## Best Practices

- **Use Markdown for text content**: Markdown is well-understood by AI assistants and easy to read
- **Keep content focused**: Each resource should address a specific topic or concern
- **Update regularly**: Ensure guidance reflects current system state and best practices
- **Use clear URIs**: Follow the `tfgm://category/resource-name` pattern for consistency
- **Provide context**: Include information that helps AI assistants understand when and how to use the resource

## Resources vs Tools

- **Resources**: Static content for reference and context (read-only)
- **Tools**: Executable functions that perform actions or retrieve dynamic data

Use resources for:
- Documentation and guides
- Static reference information
- Best practices and recommendations
- Context that doesn't change frequently

Use tools for:
- Querying dynamic data (station lists, journey planning)
- Performing actions or calculations
- Data that changes frequently or depends on parameters
