"use cache";

/**
 * Journey Service Layer
 * Business logic for journey planning with automatic caching via Next.js 16 'use cache'
 *
 * Cache Configuration:
 * - All functions are automatically cached by Next.js
 * - Cache is invalidated on deployment
 * - Suitable for route planning data that doesn't change frequently
 */

import { findAllConnections, type StationConnection } from "../domain/repositories/journey-repository";
import { findStationByCode } from "../domain/repositories/station-repository";

export interface JourneySegment {
  fromStationCode: string;
  fromStationName: string;
  toStationCode: string;
  toStationName: string;
  routeName: string;
  stopsCount: number;
}

export interface Journey {
  fromStationCode: string;
  fromStationName: string;
  toStationCode: string;
  toStationName: string;
  segments: JourneySegment[];
  totalStops: number;
  changes: number;
}

interface PathNode {
  stationCode: string;
  stationName: string;
  routeName: string | null;
  depth: number;
  parent: PathNode | null;
}

/**
 * Build an adjacency list for efficient pathfinding
 */
const buildConnectionGraph = (
  connections: StationConnection[],
): Map<
  string,
  Array<{
    toStationCode: string;
    toStationName: string;
    routeName: string;
    routeId: number;
  }>
> => {
  const graph = new Map<
    string,
    Array<{
      toStationCode: string;
      toStationName: string;
      routeName: string;
      routeId: number;
    }>
  >();

  for (const connection of connections) {
    // Add forward connection
    if (!graph.has(connection.fromStationCode)) {
      graph.set(connection.fromStationCode, []);
    }
    const forwardConnections = graph.get(connection.fromStationCode);
    if (forwardConnections) {
      forwardConnections.push({
        toStationCode: connection.toStationCode,
        toStationName: connection.toStationName,
        routeName: connection.routeName,
        routeId: connection.routeId,
      });
    }

    // Add backward connection (bidirectional)
    if (!graph.has(connection.toStationCode)) {
      graph.set(connection.toStationCode, []);
    }
    const backwardConnections = graph.get(connection.toStationCode);
    if (backwardConnections) {
      backwardConnections.push({
        toStationCode: connection.fromStationCode,
        toStationName: connection.fromStationName,
        routeName: connection.routeName,
        routeId: connection.routeId,
      });
    }
  }

  return graph;
};

/**
 * Reconstruct path from BFS result
 */
const reconstructPath = (node: PathNode): JourneySegment[] => {
  const segments: JourneySegment[] = [];
  let current = node;

  while (current.parent) {
    if (current.routeName) {
      // Check if we can merge with the previous segment (same route)
      if (segments.length > 0 && segments[0].routeName === current.routeName) {
        segments[0].fromStationCode = current.parent.stationCode;
        segments[0].fromStationName = current.parent.stationName;
        segments[0].stopsCount++;
      } else {
        segments.unshift({
          fromStationCode: current.parent.stationCode,
          fromStationName: current.parent.stationName,
          toStationCode: current.stationCode,
          toStationName: current.stationName,
          routeName: current.routeName,
          stopsCount: 1,
        });
      }
    }
    current = current.parent;
  }

  return segments;
};

/**
 * Find all possible journeys between two stations using BFS
 * Returns journeys sorted by number of changes, then by number of stops
 * @cached Automatically cached by Next.js per from/to combination
 */
export const findJourneys = async (fromCode: string, toCode: string, maxResults = 3): Promise<Journey[]> => {
  // Validate stations exist
  const [fromStation, toStation] = await Promise.all([
    findStationByCode(fromCode.toUpperCase()),
    findStationByCode(toCode.toUpperCase()),
  ]);

  if (!fromStation) {
    throw new Error(`Station not found: ${fromCode}`);
  }
  if (!toStation) {
    throw new Error(`Station not found: ${toCode}`);
  }

  if (fromStation.code === toStation.code) {
    return [];
  }

  // Get all connections and build graph
  const connections = await findAllConnections();
  const graph = buildConnectionGraph(connections);
  if (!graph.has(fromStation.code)) {
    throw new Error(`No connections found from station: ${fromStation.code}`);
  }

  // BFS to find all paths up to a reasonable depth
  const foundJourneys: Journey[] = [];
  const queue: PathNode[] = [
    {
      stationCode: fromStation.code,
      stationName: fromStation.name,
      routeName: null,
      depth: 0,
      parent: null,
    },
  ];

  // Track visited states: stationCode + routeName combination
  // This allows finding multiple paths while avoiding infinite loops
  const visited = new Map<string, number>(); // key -> minimum depth seen
  const maxDepth = 15; // Reasonable limit for Manchester Metrolink
  const maxIterations = 10000; // Hard limit to prevent infinite loops
  let iterations = 0;

  while (queue.length > 0 && foundJourneys.length < maxResults * 5) {
    iterations++;
    if (iterations > maxIterations) {
      break;
    }

    const current = queue.shift();
    if (!current) {
      break;
    }

    if (current.depth > maxDepth) {
      continue;
    }

    // Found destination
    if (current.stationCode === toStation.code) {
      const segments = reconstructPath(current);
      if (segments.length > 0) {
        foundJourneys.push({
          fromStationCode: fromStation.code,
          fromStationName: fromStation.name,
          toStationCode: toStation.code,
          toStationName: toStation.name,
          segments,
          totalStops: segments.reduce((sum, seg) => sum + seg.stopsCount, 0),
          changes: segments.length - 1,
        });
      }
      continue;
    }

    // Explore neighbors
    const neighbors = graph.get(current.stationCode) || [];

    for (const neighbor of neighbors) {
      const stateKey = `${neighbor.toStationCode}:${neighbor.routeName}`;
      const existingDepth = visited.get(stateKey);

      // Only visit if we haven't been here before at this depth or shallower
      // This prevents the exponential queue explosion while still finding multiple paths
      if (!existingDepth || current.depth + 1 < existingDepth) {
        visited.set(stateKey, current.depth + 1);

        queue.push({
          stationCode: neighbor.toStationCode,
          stationName: neighbor.toStationName,
          routeName: neighbor.routeName,
          depth: current.depth + 1,
          parent: current,
        });
      }
    }
  }

  // Sort by changes (ascending), then by total stops (ascending)
  foundJourneys.sort((a, b) => {
    if (a.changes !== b.changes) {
      return a.changes - b.changes;
    }
    return a.totalStops - b.totalStops;
  });

  // Return top N results
  return foundJourneys.slice(0, maxResults);
};
