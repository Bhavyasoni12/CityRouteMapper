import React, { useState, useEffect, useRef } from "react";
import { City, Route, Step, dijkstra, formatDistance } from "../utils/dijkstra";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { MapPin, Navigation } from "lucide-react";

interface CityGraphProps {
  cities: City[];
  routes: Route[];
  sourceCity: string | null;
  destinationCity: string | null;
  isRunning: boolean;
  onComplete: (path: string[], distance: number) => void;
  onReset: () => void;
}

const CityGraph: React.FC<CityGraphProps> = ({
  cities,
  routes,
  sourceCity,
  destinationCity,
  isRunning,
  onComplete,
  onReset,
}) => {
  const [visitedNodes, setVisitedNodes] = useState<string[]>([]);
  const [currentPath, setCurrentPath] = useState<string[]>([]);
  const [currentStep, setCurrentStep] = useState<Step | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [pathIndicatorPos, setPathIndicatorPos] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const [currentPathIndex, setCurrentPathIndex] = useState(0);
  const animationRef = useRef<NodeJS.Timeout | null>(null);
  const pathAnimationRef = useRef<NodeJS.Timeout | null>(null);

  // Clear animation state on reset
  useEffect(() => {
    if (!isRunning) {
      setVisitedNodes([]);
      setCurrentPath([]);
      setCurrentStep(null);
      setIsAnimating(false);
      setPathIndicatorPos(null);
      setCurrentPathIndex(0);

      if (animationRef.current) {
        clearTimeout(animationRef.current);
        animationRef.current = null;
      }

      if (pathAnimationRef.current) {
        clearTimeout(pathAnimationRef.current);
        pathAnimationRef.current = null;
      }
    }
  }, [isRunning]);

  // Run Dijkstra's algorithm when triggered
  useEffect(() => {
    if (isRunning && sourceCity && destinationCity) {
      setIsAnimating(true);

      // Reset state
      setVisitedNodes([]);
      setCurrentPath([]);
      setCurrentStep(null);
      setPathIndicatorPos(null);
      setCurrentPathIndex(0);

      // Create an array to store all steps
      const allSteps: Step[] = [];

      // Run the algorithm and collect all steps
      const result = dijkstra(
        { cities, routes },
        sourceCity,
        destinationCity,
        (step) => {
          allSteps.push(step);
        }
      );

      // Now animate through the steps with delays
      let stepIndex = 0;

      const animateNextStep = () => {
        if (stepIndex < allSteps.length) {
          const step = allSteps[stepIndex];
          setVisitedNodes(step.visitedNodes);
          setCurrentStep(step);

          // If we've reached the final step
          if (stepIndex === allSteps.length - 1) {
            setCurrentPath(result.path);
            animatePathIndicator(result.path);
            onComplete(result.path, result.distance);
          } else {
            // Schedule the next step
            animationRef.current = setTimeout(animateNextStep, 800);
          }

          stepIndex++;
        }
      };

      // Start the animation
      animateNextStep();
    }

    return () => {
      if (animationRef.current) {
        clearTimeout(animationRef.current);
      }
      if (pathAnimationRef.current) {
        clearTimeout(pathAnimationRef.current);
      }
    };
  }, [isRunning, sourceCity, destinationCity, cities, routes, onComplete]);

  // Animate path indicator moving along the path
  const animatePathIndicator = (path: string[]) => {
    if (path.length < 2) {
      setIsAnimating(false);
      return;
    }

    let pathIndex = 0;

    const animateNextSegment = () => {
      if (pathIndex < path.length - 1) {
        const fromCityId = path[pathIndex];
        const toCityId = path[pathIndex + 1];

        const fromCity = cities.find((c) => c.id === fromCityId);
        const toCity = cities.find((c) => c.id === toCityId);

        if (fromCity && toCity) {
          // Set the initial position
          setPathIndicatorPos({
            x: fromCity.position.x,
            y: fromCity.position.y,
          });

          setCurrentPathIndex(pathIndex);

          // Schedule the next segment
          pathAnimationRef.current = setTimeout(() => {
            pathIndex++;
            animateNextSegment();
          }, 1500);
        }
      } else {
        // Animation complete
        setIsAnimating(false);
      }
    };

    // Start the path animation
    animateNextSegment();
  };

  // Helper function to determine if a route is in the current path
  const isRouteInPath = (source: string, target: string) => {
    if (currentPath.length < 2) return false;

    for (let i = 0; i < currentPath.length - 1; i++) {
      if (
        (currentPath[i] === source && currentPath[i + 1] === target) ||
        (currentPath[i] === target && currentPath[i + 1] === source)
      ) {
        return true;
      }
    }

    return false;
  };

  // Expand the map by adjusting the view box and adding more padding
  const minX = Math.min(...cities.map((city) => city.position.x)) - 100;
  const minY = Math.min(...cities.map((city) => city.position.y)) - 100;
  const maxX = Math.max(...cities.map((city) => city.position.x)) + 150;
  const maxY = Math.max(...cities.map((city) => city.position.y)) + 150;

  return (
    <div className="w-full h-full flex flex-col">
      <div className="relative overflow-hidden flex-1 bg-secondary/10 rounded-lg backdrop-blur-sm shadow-inner">
        <svg
          width="100%"
          height="100%"
          viewBox={`${minX} ${minY} ${maxX - minX} ${maxY - minY}`}
          className="overflow-visible"
        >
          {/* Draw routes */}
          {routes.map((route) => {
            const sourceCity = cities.find((c) => c.id === route.source);
            const targetCity = cities.find((c) => c.id === route.target);

            if (!sourceCity || !targetCity) return null;

            const isActive = isRouteInPath(route.source, route.target);
            const midX = (sourceCity.position.x + targetCity.position.x) / 2;
            const midY = (sourceCity.position.y + targetCity.position.y) / 2;

            return (
              <g key={`${route.source}-${route.target}`}>
                <line
                  x1={sourceCity.position.x}
                  y1={sourceCity.position.y}
                  x2={targetCity.position.x}
                  y2={targetCity.position.y}
                  className={cn("edge", { active: isActive })}
                  style={
                    isActive
                      ? { strokeDasharray: 1000, strokeDashoffset: 1000 }
                      : {}
                  }
                />

                {/* Distance label with improved background */}
                <rect
                  x={midX - 35}
                  y={midY - 15}
                  width="70"
                  height="25"
                  rx="8"
                  className={`${
                    isActive
                      ? "fill-primary/20 stroke-primary/30"
                      : "fill-white/95 stroke-border"
                  } stroke-1`}
                />
                <text
                  x={midX}
                  y={midY + 2}
                  className="edge-label"
                  textAnchor="middle"
                  dominantBaseline="middle"
                >
                  <tspan className="distance-label">{route.distance}</tspan> km
                </text>
              </g>
            );
          })}

          {/* Draw cities */}
          {cities.map((city) => {
            const isVisited = visitedNodes.includes(city.id);
            const isSource = city.id === sourceCity;
            const isDestination = city.id === destinationCity;
            const isPath = currentPath.includes(city.id);

            // Calculate distance if step information is available
            let distance = currentStep?.distances[city.id];

            return (
              <g
                key={city.id}
                transform={`translate(${city.position.x}, ${city.position.y})`}
              >
                <motion.g
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{
                    type: "spring",
                    stiffness: 500,
                    damping: 30,
                    delay: 0.1 * cities.indexOf(city),
                  }}
                >
                  <foreignObject
                    width="120"
                    height="120"
                    x="-60"
                    y="-60"
                    className="overflow-visible pointer-events-none"
                  >
                    <div
                      className={cn("city-node", {
                        source: isSource,
                        destination: isDestination,
                        visited:
                          isVisited && !isPath && !isSource && !isDestination,
                        path: isPath && !isSource && !isDestination,
                      })}
                    >
                      <MapPin className="h-8 w-8 text-foreground" />
                      <span className="city-node-label">{city.name}</span>

                      {/* Show the current distance estimate if visited */}
                      {isVisited &&
                        distance != null &&
                        distance !== Infinity && (
                          <span className="absolute top-24 left-1/2 -translate-x-1/2 text-xs font-bold py-1.5 px-3 bg-white/90 rounded-md shadow-sm border border-primary/30">
                            {formatDistance(distance)}
                          </span>
                        )}
                    </div>
                  </foreignObject>
                </motion.g>
              </g>
            );
          })}

          {/* Path indicator */}
          <AnimatePresence>
            {pathIndicatorPos && currentPath.length > 1 && (
              <motion.g
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0 }}
                transition={{ duration: 0.3 }}
              >
                <circle
                  cx={pathIndicatorPos.x}
                  cy={pathIndicatorPos.y}
                  r="8"
                  className="fill-primary"
                />
                <motion.circle
                  cx={pathIndicatorPos.x}
                  cy={pathIndicatorPos.y}
                  r="12"
                  className="fill-primary/30 stroke-primary stroke-1"
                  animate={{ r: [12, 18, 12] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
                <motion.g
                  animate={{
                    y: [0, -10, 0],
                    x: [0, 0, 0],
                  }}
                  transition={{
                    duration: 1,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >
                  <Navigation
                    x={pathIndicatorPos.x - 6}
                    y={pathIndicatorPos.y - 26}
                    size={12}
                    className="text-white fill-primary"
                  />
                </motion.g>
              </motion.g>
            )}
          </AnimatePresence>
        </svg>
      </div>
    </div>
  );
};

export default CityGraph;
