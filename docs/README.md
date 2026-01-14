# Documentation

This folder contains comprehensive documentation for the TFGM Metrolink project.

## Contents

### [ARCHITECTURE.md](./ARCHITECTURE.md)
Complete system architecture documentation covering:
- Layer architecture (Presentation → Service → Domain → Infrastructure)
- Directory structure
- Design principles (Unix Philosophy)
- Database connection strategy
- Usage examples and best practices

### [IMPLEMENTATION_GUIDE.md](./IMPLEMENTATION_GUIDE.md)
Detailed implementation guide for the service layer:
- How Next.js 16 `use cache` works
- Service layer features and functions
- Example implementations
- Performance benefits
- Adding new service functions
- Testing strategies

### [CHANGELOG.md](./CHANGELOG.md)
Version history and changes:
- Database connection fixes
- Domain model implementation
- Service layer with caching
- Migration notes

## Quick Links

### Core Documentation
- [Main README](../README.md) - Project overview and setup
- [Domain Layer](../src/lib/domain/README.md) - Domain entities and repositories
- [Service Layer](../src/lib/services/README.md) - Business logic with caching

### Technical Details
- **Architecture Pattern**: Clean Architecture with Service Layer
- **Caching**: Next.js 16 automatic caching with `use cache`
- **Database**: PostgreSQL with PostGIS
- **Framework**: Next.js 16 with React 19

## Getting Started

1. Read [ARCHITECTURE.md](./ARCHITECTURE.md) to understand the system structure
2. Review [IMPLEMENTATION_GUIDE.md](./IMPLEMENTATION_GUIDE.md) for service layer usage
3. Check [CHANGELOG.md](./CHANGELOG.md) for recent changes
4. Explore code examples in the guide documents

## For Developers

### Adding New Features
1. Define entities in `src/lib/domain/entities.ts`
2. Create repository functions in `src/lib/domain/repositories/`
3. Add service layer functions in `src/lib/services/` with `"use cache"`
4. Use services in pages for automatic caching

### Documentation Standards
- Clear, concise explanations
- Code examples for all concepts
- Reference Unix Philosophy principles
- Include migration paths for breaking changes

## Contributing

When adding documentation:
- Place general docs in this folder (`docs/`)
- Place layer-specific docs in their respective folders
- Update this README with new document descriptions
- Follow existing documentation style
