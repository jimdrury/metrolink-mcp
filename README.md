# Transport for Greater Manchester MCP Server

**I'm going to start off with a disclaimer - this project is unapologetically vibe coded**

## The Project

An MCP (Model Context Protocol) Server that wraps the APIs provided by [Transport for Greater Manchester (TfGM)](https://tfgm.com/), enabling AI assistants to access real-time public transport information for the Greater Manchester area.

## About

This server exposes TfGM's public transport data through the Model Context Protocol, allowing AI assistants like Claude to retrieve information about:

- Real-time bus arrivals and departures
- Tram (Metrolink) schedules and live updates
- Train services
- Service disruptions and alerts
- Route planning and journey information

## Installation

This project uses Yarn as the package manager. To get started:

```bash
# Install dependencies
yarn install
```

## Available Commands

| Command | Description |
|---------|-------------|
| `yarn dev` | Starts the Next.js development server on http://localhost:3000 |
| `yarn build` | Creates an optimized production build of the application |
| `yarn start` | Runs the production server (requires `yarn build` first) |
| `yarn lint` | Runs Biome to check code quality and style issues |
| `yarn format` | Formats code using Biome with automatic fixes |
| `yarn inspect` | Launches the MCP Inspector tool for testing and debugging |

## Development

Start the development server:

```bash
yarn dev
```

The server will be available at http://localhost:3000

## Testing with MCP Inspector

The MCP Inspector is a tool for testing and debugging your MCP server. To use it with this server:

1. Start the development server:
   ```bash
   yarn dev
   ```

2. In a separate terminal, launch the inspector:
   ```bash
   yarn inspect
   ```

3. Configure the inspector with the following settings:
   - **Transport Type**: Select **"Streamable HTTP"**
   - **Server URL**: `http://localhost:3000/mcp`

4. Click "Connect" to start interacting with your MCP server

The inspector provides:
- A visual interface to test available tools
- Request/response debugging
- Schema validation
- Real-time connection monitoring

## Architecture

This project is built with:

- **[Next.js 16](https://nextjs.org/)** - React framework with automatic caching
- **[PostgreSQL](https://www.postgresql.org/)** - Database with PostGIS for geographic data
- **[mcp-handler](https://www.npmjs.com/package/mcp-handler)** - Simplifies MCP server implementation in Next.js
- **[Zod](https://zod.dev/)** - Runtime type validation for tool inputs and environment variables
- **TypeScript** - Type-safe development

The application follows clean architecture principles with clear separation between:
- **Presentation Layer** (Next.js pages)
- **Service Layer** (Business logic with automatic caching)
- **Domain Layer** (Repositories and entities)
- **Infrastructure Layer** (Database access)

See [Architecture Documentation](docs/ARCHITECTURE.md) for detailed information.

## Project Structure

```
tfgm-mcp-server/
├── src/
│   ├── app/                   # Next.js App Router
│   │   ├── page.tsx           # Home page - route list
│   │   ├── stats/             # Statistics dashboard
│   │   ├── interchanges/      # Interchange stations
│   │   ├── line/[lineName]/   # Route details
│   │   └── [transport]/       # MCP server endpoint
│   └── lib/
│       ├── services/          # Business logic (with caching)
│       ├── domain/            # Domain layer (entities, repositories)
│       ├── db.ts              # Database connection
│       └── env.ts             # Environment validation
├── database/                  # Database setup scripts
├── docs/                      # Documentation
│   ├── ARCHITECTURE.md        # Architecture overview
│   ├── IMPLEMENTATION_GUIDE.md # Implementation details
│   └── CHANGELOG.md           # Change history
├── package.json               # Dependencies and scripts
└── README.md                  # This file
```

## Contributing

Contributions are welcome! Please ensure:
- Code passes linting: `yarn lint`
- Code is properly formatted: `yarn format`
- All changes are tested with the MCP Inspector

## License

This project is private and intended for personal/internal use.

## Documentation

- **[Architecture](docs/ARCHITECTURE.md)** - System architecture and design principles
- **[Implementation Guide](docs/IMPLEMENTATION_GUIDE.md)** - Service layer and caching implementation
- **[Changelog](docs/CHANGELOG.md)** - Version history and changes
- **[Domain Layer](src/lib/domain/README.md)** - Domain model documentation
- **[Service Layer](src/lib/services/README.md)** - Service layer with caching

## Resources

- [TfGM Open Data](https://tfgm.com/open-data) - Official TfGM API documentation
- [Model Context Protocol](https://modelcontextprotocol.io/) - MCP specification
- [MCP Inspector](https://github.com/modelcontextprotocol/inspector) - Testing tool
- [Next.js 16](https://nextjs.org/docs) - Framework documentation
