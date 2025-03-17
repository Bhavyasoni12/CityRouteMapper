
// Type definitions for our graph
export interface City {
  id: string;
  name: string;
  position: { x: number; y: number };
}

export interface Route {
  source: string;
  target: string;
  distance: number;
}

export interface Graph {
  cities: City[];
  routes: Route[];
}

export interface Step {
  visitedNodes: string[];
  distances: Record<string, number>;
  previousNodes: Record<string, string | null>;
  currentNode?: string;
}

// Dijkstra's algorithm implementation
export function dijkstra(
  graph: Graph, 
  startCityId: string, 
  endCityId: string,
  onStep?: (step: Step) => void
): { path: string[]; distance: number; steps: Step[] } {
  // Initialize data structures
  const distances: Record<string, number> = {};
  const previousNodes: Record<string, string | null> = {};
  const unvisitedNodes: Set<string> = new Set();
  const visitedNodes: string[] = [];
  const steps: Step[] = [];

  // Initialize all distances to Infinity except for the start node
  graph.cities.forEach((city) => {
    distances[city.id] = city.id === startCityId ? 0 : Infinity;
    previousNodes[city.id] = null;
    unvisitedNodes.add(city.id);
  });

  // Process nodes until all are visited or the end node is reached
  while (unvisitedNodes.size > 0) {
    // Find the unvisited node with the smallest distance
    let currentNode: string | null = null;
    let smallestDistance = Infinity;

    unvisitedNodes.forEach((nodeId) => {
      if (distances[nodeId] < smallestDistance) {
        smallestDistance = distances[nodeId];
        currentNode = nodeId;
      }
    });

    // If we can't find a node or the smallest distance is Infinity, 
    // all remaining nodes are inaccessible
    if (currentNode === null || smallestDistance === Infinity) {
      break;
    }

    // If we've reached the end node, we can stop
    if (currentNode === endCityId) {
      visitedNodes.push(currentNode);
      unvisitedNodes.delete(currentNode);
      
      // Record this step
      steps.push({
        visitedNodes: [...visitedNodes],
        distances: { ...distances },
        previousNodes: { ...previousNodes },
        currentNode
      });
      
      if (onStep) {
        onStep({
          visitedNodes: [...visitedNodes],
          distances: { ...distances },
          previousNodes: { ...previousNodes },
          currentNode
        });
      }
      
      break;
    }

    // Update distances to neighboring nodes
    const neighbors = graph.routes
      .filter((route) => route.source === currentNode || route.target === currentNode)
      .map((route) => {
        const neighborId = route.source === currentNode ? route.target : route.source;
        return {
          id: neighborId,
          distance: route.distance
        };
      });

    neighbors.forEach(({ id: neighborId, distance }) => {
      if (visitedNodes.includes(neighborId)) return;

      const tentativeDistance = distances[currentNode!] + distance;
      if (tentativeDistance < distances[neighborId]) {
        distances[neighborId] = tentativeDistance;
        previousNodes[neighborId] = currentNode;
      }
    });

    // Mark current node as visited
    visitedNodes.push(currentNode);
    unvisitedNodes.delete(currentNode);

    // Record this step
    steps.push({
      visitedNodes: [...visitedNodes],
      distances: { ...distances },
      previousNodes: { ...previousNodes },
      currentNode
    });
    
    if (onStep) {
      onStep({
        visitedNodes: [...visitedNodes],
        distances: { ...distances },
        previousNodes: { ...previousNodes },
        currentNode
      });
    }
  }

  // Reconstruct the path
  const path: string[] = [];
  let current: string | null = endCityId;

  while (current !== null) {
    path.unshift(current);
    current = previousNodes[current];
  }

  return {
    path: path.length > 1 ? path : [], // Return empty array if no path found
    distance: distances[endCityId],
    steps
  };
}

// Utility function to get the route between two cities
export function getRoute(graph: Graph, sourceId: string, targetId: string): Route | undefined {
  return graph.routes.find(
    (route) => 
      (route.source === sourceId && route.target === targetId) || 
      (route.source === targetId && route.target === sourceId)
  );
}

// Utility function to format distance
export function formatDistance(distance: number): string {
  if (distance === Infinity) {
    return "No path";
  }
  return `${distance.toLocaleString()} km`;
}
